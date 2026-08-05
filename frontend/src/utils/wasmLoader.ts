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
export function b64url_decode(str: string): Uint8Array {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const binary = atob(s);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

// Helper to decode standard base64 string to Uint8Array
export function b64toUint8Array(input: any): Uint8Array {
  if (!input) return new Uint8Array(0);
  if (input instanceof Uint8Array) return input;
  if (Array.isArray(input)) return new Uint8Array(input);
  if (typeof input !== 'string') {
    return new Uint8Array(input);
  }
  const binary = atob(input.includes(',') ? input.split(',')[1] : input);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
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
