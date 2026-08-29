export const getFileBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const base64 = resultString.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const b64toUint8Array = (input: any): Uint8Array => {
  if (!input) return new Uint8Array(0);
  if (input instanceof Uint8Array) return input;
  if (Array.isArray(input)) return new Uint8Array(input);
  if (typeof input !== 'string') {
    try {
      return new Uint8Array(input);
    } catch (_) {
      return new Uint8Array(0);
    }
  }
  let s = input.trim();
  if (s.includes(',')) {
    s = s.split(',')[1];
  }
  s = s.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  while (s.length % 4) {
    s += '=';
  }
  try {
    const binary = atob(s);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error("b64toUint8Array error on input:", s.slice(0, 40), err);
    return new Uint8Array(0);
  }
};

export const b64toBlob = (input: any, type: string) => {
  const byteArray = b64toUint8Array(input);
  return new Blob([byteArray], { type });
};

export const uint8ArrayToB64 = (uint8: Uint8Array): string => {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
};

export interface SecfPayload {
  data: Uint8Array;
  filename: string;
  mime_type: string;
  kind: number; // 0=file, 1=voice, 2=image
}

export function parseSecfPayload(bytes: Uint8Array): SecfPayload | null {
  if (!bytes || bytes.length < 9) return null;
  // Check 'SECF' magic header (0x53, 0x45, 0x43, 0x46)
  if (bytes[0] !== 0x53 || bytes[1] !== 0x45 || bytes[2] !== 0x43 || bytes[3] !== 0x46) {
    return null;
  }
  try {
    let idx = 4;
    const kind = bytes[idx++];
    const nameLen = (bytes[idx] << 8) | bytes[idx + 1];
    idx += 2;
    if (idx + nameLen > bytes.length) return null;
    const filename = new TextDecoder().decode(bytes.slice(idx, idx + nameLen));
    idx += nameLen;
    
    const mimeLen = (bytes[idx] << 8) | bytes[idx + 1];
    idx += 2;
    if (idx + mimeLen > bytes.length) return null;
    const mime_type = new TextDecoder().decode(bytes.slice(idx, idx + mimeLen));
    idx += mimeLen;
    
    if (idx + 4 > bytes.length) return null;
    const dataLen = ((bytes[idx] << 24) >>> 0) + (bytes[idx + 1] << 16) + (bytes[idx + 2] << 8) + bytes[idx + 3];
    idx += 4;
    const data = bytes.slice(idx, idx + dataLen);
    return { data, filename, mime_type, kind };
  } catch (e) {
    console.error("Failed to parse SECF payload:", e);
    return null;
  }
}
