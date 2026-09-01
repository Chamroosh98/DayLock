// E2E Cryptography using standard Web Crypto API (P-256 ECDH + AES-GCM 256)
// This is completely local, zero-knowledge, and robust!

import { getWasm } from './wasmLoader';

export interface E2EKeypair {
  publicKey: string;  // Base64-encoded JWK
  privateKey: string; // Base64-encoded JWK
}

export interface E2EEncrypted {
  ciphertext: string;
  nonce: string;
  ephemeral_pub: string;
}

// Generate an ECDH P-256 keypair or WASM E2E keypair
export async function e2eGenKeypair(): Promise<E2EKeypair> {
  const W = getWasm();
  if (W && typeof W.e2e_gen_keypair === 'function') {
    const kp = W.e2e_gen_keypair();
    return {
      publicKey: kp.public_key,
      privateKey: kp.private_key
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  const pubJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: btoa(JSON.stringify(pubJwk)),
    privateKey: btoa(JSON.stringify(privJwk))
  };
}

export const e2eGenerateKeyPair = e2eGenKeypair;

// Encrypt a message using recipient's public key
export async function e2eEncrypt(recipientPubKeyStr: string, message: string): Promise<E2EEncrypted> {
  const W = getWasm();
  if (W && typeof W.e2e_encrypt === 'function') {
    const enc = W.e2e_encrypt(message, recipientPubKeyStr);
    return {
      ciphertext: enc.ciphertext,
      nonce: enc.nonce,
      ephemeral_pub: enc.ephemeral_pub
    };
  }

  // Import recipient's public key
  const recipientPubKey = await window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(atob(recipientPubKeyStr)),
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  // Generate ephemeral keypair
  const ephemeralKeyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  // Derive symmetric AES-GCM key
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientPubKey },
    ephemeralKeyPair.privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  // Encrypt
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuf = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    sharedKey,
    new TextEncoder().encode(message)
  );

  const ephPubJwk = await window.crypto.subtle.exportKey("jwk", ephemeralKeyPair.publicKey);

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuf))),
    nonce: btoa(String.fromCharCode(...nonce)),
    ephemeral_pub: btoa(JSON.stringify(ephPubJwk))
  };
}

// Decrypt a message using receiver's private key and sender's ephemeral public key
export async function e2eDecrypt(
  privateKeyStr: string,
  ephemeralPubStr: string,
  nonceB64: string,
  ciphertextB64: string
): Promise<string> {
  const W = getWasm();
  if (W && typeof W.e2e_decrypt === 'function') {
    return W.e2e_decrypt(ciphertextB64, nonceB64, ephemeralPubStr, privateKeyStr);
  }

  const ciphertext = new Uint8Array(
    atob(ciphertextB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  
  const nonce = new Uint8Array(
    atob(nonceB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  // Import private key
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(atob(privateKeyStr)),
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  // Import ephemeral public key
  const ephemeralPubKey = await window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(atob(ephemeralPubStr)),
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  // Derive shared key
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: ephemeralPubKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );

  // Decrypt
  const plaintextBuf = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    sharedKey,
    ciphertext
  );

  return new TextDecoder().decode(plaintextBuf);
}

// Prepare dual-encrypted outbound message payload (encrypted for recipient + sender)
export async function e2ePrepareOutboundMessage(
  recipientPubKeyStr: string,
  messageText: string,
  myPubKeyStr?: string | null
) {
  const encRecipient = await e2eEncrypt(recipientPubKeyStr, messageText);
  let encSender = null;
  
  if (myPubKeyStr && myPubKeyStr.trim()) {
    if (myPubKeyStr.trim() === recipientPubKeyStr.trim()) {
      encSender = encRecipient;
    } else {
      try {
        encSender = await e2eEncrypt(myPubKeyStr.trim(), messageText);
      } catch (err) {
        console.warn("Could not encrypt copy for sender:", err);
      }
    }
  }

  return {
    ciphertext: encRecipient.ciphertext,
    nonce: encRecipient.nonce,
    ephemeral_pub: encRecipient.ephemeral_pub,
    sender_pub: myPubKeyStr || null,
    sender_ciphertext: encSender ? encSender.ciphertext : encRecipient.ciphertext,
    sender_nonce: encSender ? encSender.nonce : encRecipient.nonce,
    sender_ephemeral_pub: encSender ? encSender.ephemeral_pub : encRecipient.ephemeral_pub,
    timestamp: Math.floor(Date.now() / 1000)
  };
}

// Decrypt array of E2E channel messages securely for the current user keypair
export async function e2eDecryptMessageList(
  messages: any[],
  e2eKeyPair: { publicKey: string; privateKey: string } | null,
  t?: Record<string, any>,
  language: string = 'en'
): Promise<Array<{ id: string | number; text: string; timestamp: number; isSelf?: boolean }>> {
  const fallbackFailed = t?.e2eDecryptionFailedKey || (language === 'fa' ? '[خطا در رمزگشایی: عدم تطابق کلید خصوصی]' : '[Decryption Failed: Private key mismatch]');
  const fallbackReq = t?.e2eEncryptedIdentityReq || (language === 'fa' ? '[رمزگذاری شده: برای رمزگشایی ابتدا هویت E2E بساز]' : '[Encrypted: Generate E2E identity to decrypt]');

  const decrypted: Array<{ id: string | number; text: string; timestamp: number; isSelf?: boolean }> = [];
  if (!Array.isArray(messages)) return decrypted;

  for (const msg of messages) {
    let text = fallbackFailed;
    let isSelf = false;

    if (e2eKeyPair && e2eKeyPair.privateKey) {
      // 1. Check if sent by me (using sender_ciphertext or sender_pub)
      if (msg.sender_ciphertext && msg.sender_ephemeral_pub && msg.sender_nonce) {
        try {
          const dec = await e2eDecrypt(
            e2eKeyPair.privateKey,
            msg.sender_ephemeral_pub,
            msg.sender_nonce,
            msg.sender_ciphertext
          );
          if (dec) {
            text = dec;
            isSelf = true;
          }
        } catch (_) {}
      }

      // 2. If not yet decrypted as sender, try decrypting as recipient
      if (!isSelf && msg.ciphertext && msg.ephemeral_pub && msg.nonce) {
        try {
          const dec = await e2eDecrypt(
            e2eKeyPair.privateKey,
            msg.ephemeral_pub,
            msg.nonce,
            msg.ciphertext
          );
          if (dec) {
            text = dec;
            isSelf = Boolean(msg.sender_pub && msg.sender_pub === e2eKeyPair.publicKey);
          }
        } catch (_) {}
      }
    } else {
      text = fallbackReq;
    }

    decrypted.push({
      id: msg.id,
      text,
      timestamp: msg.timestamp,
      isSelf
    });
  }

  return decrypted;
}
