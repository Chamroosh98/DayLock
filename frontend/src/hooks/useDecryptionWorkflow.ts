import { getWasm, b64url_decode } from '../utils/wasmLoader';
import { b64toUint8Array, uint8ArrayToB64, b64toBlob } from '../utils/fileHelpers';

export interface ParsedHash {
  hash: string;
  isE2E: boolean;
  e2eId?: string;
  id?: string;
  keyPart?: string;
  isFile?: boolean;
}

/**
 * Parses paste / vault hash strings (e.g. "#e2e-xyz", "file-123:abc", "123:abc")
 */
export function parseVaultHash(input: string): ParsedHash | null {
  if (!input) return null;
  const hash = (input.includes('#') ? input.split('#')[1] : input).trim();
  if (!hash || hash === 'undefined') return null;

  if (hash.startsWith('e2e-')) {
    const e2eId = hash.replace('e2e-', '').trim();
    if (!e2eId || e2eId === 'undefined') return null;
    return { hash, isE2E: true, e2eId };
  }

  const [idPart, keyPart] = hash.split(':');
  let id = idPart ? idPart.trim() : '';
  let isFile = false;
  if (id.startsWith('file-')) {
    id = id.replace('file-', '');
    isFile = true;
  }
  if (!id || id === 'undefined') return null;

  return {
    hash,
    isE2E: false,
    id,
    keyPart: keyPart || '',
    isFile,
  };
}

/**
 * Extracts payload data from decrypted raw bytes/WASM/API responses
 */
export async function extractPayloadData(data: any, keyPart?: string) {
  if (!data) return null;

  // WASM / Client-side pre-encrypted payload
  if (data.is_pre_encrypted || (data.data && data.iv)) {
    const W = getWasm();
    if (W && typeof W.decrypt_with_key === 'function' && keyPart) {
      const rawKey = b64url_decode(keyPart);
      const cipherBytes = b64toUint8Array(data.data);
      const ivBytes = b64toUint8Array(data.iv);

      const isText = !data.kind || data.kind === 'text';
      if (isText) {
        const plainBytes = W.decrypt_with_key(cipherBytes, ivBytes, rawKey);
        return new TextDecoder().decode(plainBytes);
      } else {
        const plain = W.decrypt_file_with_key(cipherBytes, ivBytes, rawKey);
        const blob = new Blob([plain.data], { type: plain.mime_type });
        const url = URL.createObjectURL(blob);

        let stegoText = '';
        if (data.kind === 'stego' && typeof W.stego_extract === 'function') {
          try {
            const plainStegoBytes = W.stego_extract(plain.data, '');
            stegoText = new TextDecoder().decode(plainStegoBytes);
          } catch (stegoErr) {
            console.warn("WASM stego extraction failed:", stegoErr);
          }
        }

        return {
          url,
          name: plain.filename,
          type: plain.mime_type,
          kind: data.kind,
          stegoText,
          base64: uint8ArrayToB64(plain.data),
        };
      }
    } else {
      throw new Error("WASM module is required to decrypt this client-side encrypted paste.");
    }
  }

  // Server-side / Plaintext payload
  const isText = !data.kind || data.kind === 'text';
  if (!isText) {
    const blob = b64toBlob(data.data, data.mime_type);
    const url = URL.createObjectURL(blob);

    let stegoText = '';
    if (data.kind === 'stego') {
      try {
        const extractRes = await fetch('/api/stego/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: data.data }),
        });
        if (extractRes.ok) {
          const extractJson = await extractRes.json();
          stegoText = extractJson.message;
        }
      } catch (e) {
        console.error("Auto stego extraction failed:", e);
      }
    }

    return {
      url,
      name: data.original_name,
      type: data.mime_type,
      kind: data.kind,
      stegoText,
      base64: data.data,
    };
  }

  return data.data;
}

/**
 * Custom Hook: useDecryptionWorkflow
 * Encapsulates hash parsing, key pair generation, payload extraction, and decryption error handling.
 */
export function useDecryptionWorkflow() {
  return {
    parseVaultHash,
    extractPayloadData,
  };
}
