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
