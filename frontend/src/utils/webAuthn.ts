// Helper to convert array buffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert base64 to array buffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks if the browser and device support WebAuthn platform biometrics.
 */
export async function isBiometricsSupported(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    
    // Check if platform authenticator (e.g., TouchID, FaceID, Windows Hello, Android Biometrics) is available
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return !!available;
    }
    return true;
  } catch (err) {
    console.warn("WebAuthn support check:", err);
    return false;
  }
}

/**
 * Register a biometric credential using the hardware-based platform authenticator or fallback.
 * @returns Base64 encoded credential ID if successful, or null.
 */
export async function registerBiometrics(pasteId: string): Promise<string | null> {
  try {
    const isSupported = await isBiometricsSupported();
    if (!isSupported) {
      throw new Error("Biometric authentication is not supported on this browser/environment.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Create a unique user ID from pasteId or fallback
    const userIdBytes = new TextEncoder().encode(pasteId || "daylock-vault-user");

    // Extract valid rpId (avoid invalid ports or empty strings)
    const hostname = window.location.hostname || "localhost";

    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: "DayLock Security Vault",
          id: hostname,
        },
        user: {
          id: userIdBytes,
          name: `user-${(pasteId || 'vault').slice(0, 12)}`,
          displayName: `DayLock Vault User`,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256
          { type: "public-key", alg: -257 }, // RS256
          { type: "public-key", alg: -8 },   // Ed25519
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // TouchID, FaceID, Windows Hello, Android Biometrics
          userVerification: "preferred",       // Preferred works across broad devices without rejecting
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    };

    const credential = await navigator.credentials.create(creationOptions) as PublicKeyCredential;
    if (!credential) return null;

    return bufferToBase64(credential.rawId);
  } catch (err: any) {
    console.error("Biometric registration error:", err);
    throw err;
  }
}

/**
 * Verify the user using the hardware sensor and the registered credential ID.
 * @param credentialIdB64 The registered credential ID in Base64 format.
 * @returns boolean indicating success.
 */
export async function verifyBiometrics(credentialIdB64: string): Promise<boolean> {
  try {
    if (!credentialIdB64) return false;

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credentialIdBuffer = base64ToBuffer(credentialIdB64);
    const hostname = window.location.hostname || "localhost";

    const requestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        rpId: hostname,
        allowCredentials: [
          {
            type: "public-key",
            id: credentialIdBuffer,
          },
        ],
        userVerification: "preferred",
        timeout: 60000,
      },
    };

    const assertion = await navigator.credentials.get(requestOptions);
    return !!assertion;
  } catch (err) {
    console.error("Biometric verification error:", err);
    return false;
  }
}

// Alias for backwards compatibility
export const authenticateBiometrics = verifyBiometrics;

