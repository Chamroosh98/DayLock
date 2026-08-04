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
