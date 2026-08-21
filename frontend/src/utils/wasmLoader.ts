let W: any = null;
let isLoaded = false;

export async function loadWasm(): Promise<any> {
  if (isLoaded) return W;
  try {
    const pkgPath = '/pkg/wasm.js';
    // @ts-ignore
    const wasmModule = await import(/* @vite-ignore */ pkgPath);
    if (typeof wasmModule.default === 'function') {
      await wasmModule.default('/pkg/wasm_bg.wasm');
      W = wasmModule;
      isLoaded = true;
      console.log('[WASM] Initialized successfully!', W.version ? W.version() : '');
    }
  } catch (err) {
    console.warn('[WASM] Failed to load WASM module, using JS fallbacks:', err);
  }
  return W;
}

export function getWasm(): any {
  return W;
}

// Helper to encode Uint8Array to base64url string
export function b64url_encode(buf: Uint8Array): string {
  let binary = "";
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper to decode base64url string to Uint8Array
export function b64url_decode(str: any): Uint8Array {
  if (!str) return new Uint8Array(0);
  if (str instanceof Uint8Array) return str;
  if (Array.isArray(str)) return new Uint8Array(str);
  if (typeof str !== 'string') {
    try {
      return new Uint8Array(str);
    } catch (_) {
      return new Uint8Array(0);
    }
  }
  let s = str.trim().replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  while (s.length % 4) s += '=';
  try {
    const binary = atob(s);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch (err) {
    console.error("b64url_decode error on input:", str, err);
    return new Uint8Array(0);
  }
}

// Helper to decode standard base64 string to Uint8Array
export function b64toUint8Array(input: any): Uint8Array {
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
  while (s.length % 4) s += '=';
  try {
    const binary = atob(s);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch (err) {
    console.error("b64toUint8Array error on input:", input, err);
    return new Uint8Array(0);
  }
}

// Helper to convert Uint8Array to standard base64 string
export function uint8ArrayToB64(buf: Uint8Array): string {
  let binary = "";
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}
