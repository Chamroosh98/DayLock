// Client-side Audio Steganography & Waveform utilities
// Includes secure Web Crypto password-based encryption and Least Significant Bit (LSB) embedding for WAV files.

import { getWasm } from './wasmLoader';

const MAGIC_PREFIX = "ASTG"; // Audio Steganography Signature

// Derive a cryptographic key from a password and salt using Web Crypto API
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt payload using AES-GCM with PBKDF2 derived key
async function encryptPayload(text: string, passwordStr: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(passwordStr, salt);

  const ciphertextBuf = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(text)
  );

  const ciphertext = new Uint8Array(ciphertextBuf);
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);

  return combined;
}

// Decrypt payload using AES-GCM with PBKDF2 derived key
async function decryptPayload(combined: Uint8Array, passwordStr: string): Promise<string> {
  if (combined.length < 28) {
    throw new Error("Payload too short or invalid");
  }

  const salt = combined.subarray(0, 16);
  const iv = combined.subarray(16, 28);
  const ciphertext = combined.subarray(28);

  const key = await deriveKeyFromPassword(passwordStr, salt);

  const plaintextBuf = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintextBuf);
}

// Calculate the maximum steganography capacity of a WAV file in bytes
export function getWavCapacity(wavBytes: Uint8Array): number {
  const W = getWasm();
  if (W && typeof W.audio_stego_capacity === 'function') {
    return W.audio_stego_capacity(wavBytes);
  }

  if (wavBytes.length <= 44) return 0;
  // We have 1 bit per byte starting from index 44.
  // 8 bits make 1 byte of secret payload.
  const audioDataBytes = wavBytes.length - 44;
  const capacityBytes = Math.floor(audioDataBytes / 8);
  // Subtract space for MAGIC_PREFIX (4 bytes) and payload length header (4 bytes)
  return Math.max(0, capacityBytes - 8);
}

// Embed a secret message into a WAV file using LSB steganography
export async function audioStegoEmbed(
  wavBytes: Uint8Array,
  secretText: string,
  passwordStr: string
): Promise<Uint8Array> {
  const W = getWasm();
  if (W && typeof W.audio_stego_embed === 'function') {
    return W.audio_stego_embed(wavBytes, secretText, passwordStr);
  }

  const encryptedPayload = await encryptPayload(secretText, passwordStr);
  const payloadLen = encryptedPayload.length;
  const capacity = getWavCapacity(wavBytes);

  if (payloadLen > capacity) {
    throw new Error(`Secret payload is too large for the provided audio. Size: ${payloadLen} bytes, Capacity: ${capacity} bytes.`);
  }

  // Create our final payload structure: Magic (4 bytes) + Length (4 bytes) + Encrypted Payload
  const headerAndPayload = new Uint8Array(8 + payloadLen);
  const textEncoder = new TextEncoder();
  headerAndPayload.set(textEncoder.encode(MAGIC_PREFIX), 0);
  
  // Write length in big-endian
  const view = new DataView(headerAndPayload.buffer);
  view.setUint32(4, payloadLen, false);
  headerAndPayload.set(encryptedPayload, 8);

  // Copy the original WAV file
  const outWavBytes = new Uint8Array(wavBytes);

  // Embed bit by bit starting at byte index 44
  let byteIndex = 44;
  for (let i = 0; i < headerAndPayload.length; i++) {
    const currentByte = headerAndPayload[i];
    for (let bit = 0; i * 8 + bit < headerAndPayload.length * 8 && byteIndex < outWavBytes.length; bit++) {
      const bitValue = (currentByte >> (7 - bit)) & 1;
      // Overwrite the LSB of the audio byte
      outWavBytes[byteIndex] = (outWavBytes[byteIndex] & 0xFE) | bitValue;
      byteIndex++;
    }
  }

  return outWavBytes;
}

// Extract a secret message from a WAV file using LSB steganography
export async function audioStegoExtract(
  wavBytes: Uint8Array,
  passwordStr: string
): Promise<string> {
  const W = getWasm();
  if (W && typeof W.audio_stego_extract === 'function') {
    return W.audio_stego_extract(wavBytes, passwordStr);
  }

  if (wavBytes.length < 44 + 64) {
    throw new Error("WAV file is too small to contain stego payload");
  }

  // Helper to extract a single byte from 8 LSBs starting at a given index
  const extractByte = (startByteIdx: number): number => {
    let extractedVal = 0;
    for (let bit = 0; bit < 8; bit++) {
      const bitValue = wavBytes[startByteIdx + bit] & 1;
      extractedVal = (extractedVal << 1) | bitValue;
    }
    return extractedVal;
  };

  // 1. Extract and verify magic prefix (first 4 bytes -> 32 LSBs)
  const textDecoder = new TextDecoder();
  const extractedPrefixBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    extractedPrefixBytes[i] = extractByte(44 + i * 8);
  }
  const extractedPrefix = textDecoder.decode(extractedPrefixBytes);
  if (extractedPrefix !== MAGIC_PREFIX) {
    throw new Error("No hidden secure payload detected in this audio file.");
  }

  // 2. Extract payload length (next 4 bytes)
  const lengthBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    lengthBytes[i] = extractByte(44 + 32 + i * 8);
  }
  const view = new DataView(lengthBytes.buffer);
  const payloadLen = view.getUint32(0, false);

  if (payloadLen <= 0 || payloadLen > getWavCapacity(wavBytes)) {
    throw new Error("Detected payload size is corrupted or exceeds audio capacity.");
  }

  // 3. Extract the encrypted payload bytes
  const encryptedPayload = new Uint8Array(payloadLen);
  for (let i = 0; i < payloadLen; i++) {
    encryptedPayload[i] = extractByte(44 + 64 + i * 8);
  }

  // 4. Decrypt the payload
  return await decryptPayload(encryptedPayload, passwordStr);
}

// Decode WAV bytes into Float32 standard audio samples for visualization
export function wavToFloat32(bytes: Uint8Array) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let pos = 12;
  let bps = 16;
  let channels = 1;
  let sampleRate = 44100;

  while (pos + 8 <= bytes.length) {
    const id = String.fromCharCode(...bytes.slice(pos, pos + 4));
    const size = dv.getUint32(pos + 4, true);

    if (id === 'fmt ') {
      channels = dv.getUint16(pos + 10, true);
      sampleRate = dv.getUint32(pos + 12, true);
      bps = dv.getUint16(pos + 22, true);
    }

    if (id === 'data') {
      const start = pos + 8;
      const bytesPS = bps / 8;
      const frames = Math.floor(size / (bytesPS * channels));
      const out = new Float32Array(frames);

      for (let i = 0; i < frames; i++) {
        const off = start + i * bytesPS * channels;
        if (off >= bytes.length) break;

        let s = 0;
        if (bps === 16) {
          s = dv.getInt16(off, true) / 32768;
        } else if (bps === 8) {
          s = (dv.getUint8(off) - 128) / 128;
        } else if (bps === 32) {
          s = dv.getInt32(off, true) / 2147483648;
        }
        out[i] = s;
      }
      return { samples: out, sampleRate, channels, bps };
    }
    pos += 8 + size + (size & 1);
  }
  return null;
}

// Compile a PCM Float32 stream to a fully valid standard 16-bit Mono WAV file
export function buildWav(pcmFloat32: Float32Array, sampleRate: number): Uint8Array {
  const samples = new Int16Array(pcmFloat32.length);
  for (let i = 0; i < pcmFloat32.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmFloat32[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  const dataLen = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);
  
  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(off + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  
  view.setUint32(16, 16, true);   // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);    // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true);    // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);    // BlockAlign
  view.setUint16(34, 16, true);   // BitsPerSample (16 bits)
  
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);

  new Int16Array(buffer, 44).set(samples);
  return new Uint8Array(buffer);
}
