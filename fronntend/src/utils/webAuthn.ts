/**
 * WebAuthn (Fingerprint/FaceID) Utility for secure local biometric gating.
 * Since this is an anonymous, zero-knowledge paste tool, we perform
 * WebAuthn operations on the browser client-side, storing the registered
 * credential details in the user's secure local storage to guard decryptions.
 */

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
    if (!window.PublicKeyCredential) return false;
    
    // Check if platform authenticator (e.g., TouchID, FaceID, Windows Hello) is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return !!available;
  } catch (err) {
    console.warn("WebAuthn check failed:", err);
    return false;
  }
}

/**
 * Register a biometric credential using the hardware-based platform authenticator.
 * @returns Base64 encoded credential ID if successful, or null.
 */
export async function registerBiometrics(pasteId: string): Promise<string | null> {
  try {
    const isSupported = await isBiometricsSupported();
    if (!isSupported) {
      throw new Error("Biometric authentication is not supported or enabled on this device/browser.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Create a unique user ID from pasteId or fallback
    const userIdBytes = new TextEncoder().encode(pasteId || "daylock-default-user");

    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: "DayLock Security",
          id: window.location.hostname,
        },
        user: {
          id: userIdBytes,
          name: `user-${pasteId.slice(0, 8)}`,
          displayName: `DayLock Vault User`,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Enforce platform (fingerprint, FaceID, etc.)
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    };

    const credential = await navigator.credentials.create(creationOptions) as PublicKeyCredential;
    if (!credential) return null;

    // Convert the credential rawId to Base64 to save in localStorage
    return bufferToBase64(credential.rawId);
  } catch (err: any) {
    console.error("Biometric registration failed:", err);
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

    const requestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        allowCredentials: [
          {
            type: "public-key",
            id: credentialIdBuffer,
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    };

    const assertion = await navigator.credentials.get(requestOptions);
    return !!assertion;
  } catch (err) {
    console.error("Biometric verification failed:", err);
    return false;
  }
}

export const authenticateBiometrics = verifyBiometrics;
