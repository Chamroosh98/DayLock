import { useState, useEffect } from 'react';
import { Language } from '../types';
import { getWasm, b64url_decode, b64toUint8Array, uint8ArrayToB64 } from '../utils/wasmLoader';
import { getFileBase64, b64toBlob } from '../utils/fileHelpers';
import { isBiometricsSupported, registerBiometrics, verifyBiometrics } from '../utils/webAuthn';
import { forceClearClipboard } from '../utils/clipboardManager';

export interface UseViewPayloadProps {
  t: any;
  language: Language;
  isDarkMode: boolean;
  setStatus: (status: any) => void;
  handleRefreshE2EMessages: (channelId: string) => Promise<void>;
  triggerShatterExplosion: (colors: string[]) => void;
}

export const useViewPayload = ({
  t,
  language,
  isDarkMode,
  setStatus,
  handleRefreshE2EMessages,
  triggerShatterExplosion,
}: UseViewPayloadProps) => {
  const [viewInput, setViewInput] = useState('');
  const [viewData, setViewData] = useState<any>(null);
  const [viewPassword, setViewPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [isHoneyView, setIsHoneyView] = useState(false);
  const [viewError, setViewError] = useState<{ type: 'geo' | 'time' | 'dms' | 'generic'; data: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Stego Extraction state
  const [stegoExtractFile, setStegoExtractFile] = useState<File | null>(null);
  const [stegoExtractPassword, setStegoExtractPassword] = useState('');
  const [stegoExtractResult, setStegoExtractResult] = useState<string | null>(null);
  const [isStegoExtracting, setIsStegoExtracting] = useState(false);

  // Biometric state
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [rememberWithBiometrics, setRememberWithBiometrics] = useState(false);
  const [hasBiometricsForCurrent, setHasBiometricsForCurrent] = useState(false);

  // Self Destruct view counters
  const [isSelfDestructed, setIsSelfDestructed] = useState(false);
  const [hidesCount, setHidesCount] = useState(0);

  useEffect(() => {
    isBiometricsSupported().then((supported) => {
      setBiometricsSupported(supported);
    });
  }, []);

  useEffect(() => {
    if (viewData?.id) {
      const hasCred = !!localStorage.getItem(`biometric_cred_${viewData.id}`);
      setHasBiometricsForCurrent(hasCred);
    } else {
      setHasBiometricsForCurrent(false);
    }
  }, [viewData]);

  // Self Destruct Event Listeners
  useEffect(() => {
    if (viewData?.self_destruct_hides && !isSelfDestructed) {
      const triggers = viewData.self_destruct_triggers?.split(',') || ['tab'];

      const triggerDestruct = async () => {
        setHidesCount((prev) => {
          const next = prev + 1;
          if (next >= viewData.self_destruct_hides) {
            triggerShatterExplosion(['#ef4444', '#dc2626', '#f87171', '#7f1d1d', isDarkMode ? '#ffffff' : '#1e293b']);
            setIsSelfDestructed(true);
            fetch(`/api/paste/${viewData.id}`, { method: 'DELETE' }).catch(console.error);
          }
          return next;
        });
      };

      const handleVisibility = () => {
        if (document.hidden && triggers.includes('tab')) {
          triggerDestruct();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen' && triggers.includes('print')) {
          forceClearClipboard();
          triggerDestruct();
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);
      document.addEventListener('keyup', handleKeyUp);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [viewData, isSelfDestructed, isDarkMode, triggerShatterExplosion]);

  const handleView = async () => {
    if (!viewInput) return;
    setIsLoading(true);
    setStatus(null);
    setViewError(null);
    setDecryptedContent(null);

    try {
      const inputStr = viewInput.trim();
      const isUrl = (inputStr.startsWith('http://') || inputStr.startsWith('https://') || (inputStr.includes('.') && !inputStr.includes('#') && !inputStr.includes(':'))) && !inputStr.includes('#');

      if (isUrl) {
        let cleanUrl = inputStr;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        const res = await fetch('/api/stego/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not extract data from the image URL");

        const blob = b64toBlob(data.image, 'image/png');
        const url = URL.createObjectURL(blob);

        let name = 'extracted_image.png';
        try {
          const urlObj = new URL(cleanUrl);
          const pathname = urlObj.pathname;
          const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
          if (filename && filename.includes('.')) {
            name = filename;
          }
        } catch (_) {}

        setViewData({
          id: 'extracted-url',
          kind: 'stego',
          original_name: name,
          mime_type: 'image/png',
          size: blob.size,
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          max_views: null,
          views: 1,
          has_password: false,
        });

        setDecryptedContent({
          url,
          name,
          type: 'image/png',
          kind: 'stego',
          stegoText: data.message,
        });

        setStatus({ type: 'ok', msg: t.decryptedSuccess });
        return;
      }

      const hash = (viewInput.includes('#') ? viewInput.split('#')[1] : viewInput).trim();
      if (!hash || hash === 'undefined') {
        setStatus({ type: 'err', msg: language === 'fa' ? 'لطفاً شناسه یا لینک معتبر وارد کنید' : 'Please enter a valid link or paste ID' });
        return;
      }

      if (hash.startsWith('e2e-')) {
        const id = hash.replace('e2e-', '').trim();
        if (!id || id === 'undefined') {
          setStatus({ type: 'err', msg: language === 'fa' ? 'شناسه کانال معتبر نیست' : 'Invalid channel ID' });
          return;
        }
        const res = await fetch(`/api/paste/${id}`);
        const data = await res.json();

        if (res.status === 403 && data.blocked) {
          setViewError({ type: 'geo', data });
          return;
        }

        if (!res.ok) throw new Error(data.error);
        setViewData({ ...data, id, is_e2e_channel: true, isFile: false });
        setStatus({ type: 'ok', msg: "E2E Channel Connected!" });

        setTimeout(() => handleRefreshE2EMessages(id), 50);
        return;
      }

      const [idPart, keyPart] = hash.split(':');
      let id = idPart ? idPart.trim() : '';
      let isFile = false;
      if (id.startsWith('file-')) {
        id = id.replace('file-', '');
        isFile = true;
      }
      if (!id || id === 'undefined') {
        setStatus({ type: 'err', msg: language === 'fa' ? 'شناسه پاست معتبر نیست' : 'Invalid paste ID' });
        return;
      }
      const res = await fetch(`/api/paste/${id}?key=${keyPart || ''}`);
      const data = await res.json();

      if (res.status === 403 && data.blocked) {
        setViewError({ type: 'geo', data });
        return;
      }
      if (res.status === 423 && data.time_locked) {
        setViewError({ type: 'time', data });
        return;
      }
      if (res.status === 410 && data.dead_mans) {
        setViewError({ type: 'dms', data });
        return;
      }

      if (!res.ok) throw new Error(data.error);
      setViewData({ ...data, id, keyPart, isFile });

      if (data.self_destruct_hides) {
        setHidesCount(0);
      }

      if (!data.has_password) {
        setIsHoneyView(data.is_honey);
        if (data.is_pre_encrypted || (data.data && data.iv)) {
          const W = getWasm();
          if (W && typeof W.decrypt_with_key === 'function' && keyPart) {
            try {
              const rawKey = b64url_decode(keyPart);
              const cipherBytes = b64toUint8Array(data.data);
              const ivBytes = b64toUint8Array(data.iv);

              const isText = !data.kind || data.kind === 'text';
              if (isText) {
                const plainBytes = W.decrypt_with_key(cipherBytes, ivBytes, rawKey);
                const text = new TextDecoder().decode(plainBytes);
                setDecryptedContent(text);
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
                    console.warn("WASM stego extraction failed on view:", stegoErr);
                  }
                }

                setDecryptedContent({
                  url,
                  name: plain.filename,
                  type: plain.mime_type,
                  kind: data.kind,
                  stegoText,
                  base64: uint8ArrayToB64(plain.data),
                });
              }
              setStatus({ type: 'ok', msg: t.decryptedSuccess });
            } catch (decErr: any) {
              console.error("Local WASM decryption failed:", decErr);
              throw new Error("Failed to decrypt payload locally using WASM. Key might be invalid or corrupted.");
            }
          } else {
            throw new Error("WASM module is required to decrypt this client-side encrypted paste.");
          }
        } else {
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

            setDecryptedContent({ url, name: data.original_name, type: data.mime_type, kind: data.kind, stegoText, base64: data.data });
          } else {
            setDecryptedContent(data.data);
          }
          if (data.is_honey) {
            setStatus(null);
          } else {
            setStatus({ type: 'ok', msg: t.decryptedSuccess });
          }
        }
      }
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const performDecryption = async (data: any, keyOrPwd: string, isFile: boolean) => {
    setIsDecrypting(true);
    setStatus(null);
    try {
      if (data.is_pre_encrypted || (data.data && data.iv)) {
        const W = getWasm();
        if (W) {
          try {
            const cipherBytes = b64toUint8Array(data.data);
            const ivBytes = b64toUint8Array(data.iv);
            const saltBytes = b64toUint8Array(data.salt);

            let plainBytes: Uint8Array;
            let isHoney = false;

            if (data.has_honey && data.honey_data && data.honey_salt && data.honey_iv) {
              try {
                const hCipherBytes = b64toUint8Array(data.honey_data);
                const hIvBytes = b64toUint8Array(data.honey_iv);
                const hSaltBytes = b64toUint8Array(data.honey_salt);

                plainBytes = W.decrypt_with_password(hCipherBytes, hIvBytes, hSaltBytes, keyOrPwd);
                isHoney = true;
              } catch (honeyErr) {
                plainBytes = W.decrypt_with_password(cipherBytes, ivBytes, saltBytes, keyOrPwd);
              }
            } else {
              plainBytes = W.decrypt_with_password(cipherBytes, ivBytes, saltBytes, keyOrPwd);
            }

            setIsHoneyView(isHoney);

            const isText = !data.kind || data.kind === 'text';
            if (!isText && !isHoney) {
              const plain = W.decrypt_file_with_password(cipherBytes, ivBytes, saltBytes, keyOrPwd);
              const blob = new Blob([plain.data], { type: plain.mime_type });
              const url = URL.createObjectURL(blob);

              let stegoText = '';
              if (data.kind === 'stego' && typeof W.stego_extract === 'function') {
                try {
                  const plainStegoBytes = W.stego_extract(plain.data, '');
                  stegoText = new TextDecoder().decode(plainStegoBytes);
                } catch (stegoErr) {
                  console.warn("WASM stego extraction failed on view:", stegoErr);
                }
              }

              setDecryptedContent({ url, name: plain.filename, type: plain.mime_type, kind: data.kind, stegoText, base64: uint8ArrayToB64(plain.data) });
            } else {
              const text = new TextDecoder().decode(plainBytes);
              setDecryptedContent(text);
            }

            if (isHoney) {
              setStatus(null);
            } else {
              setStatus({ type: 'ok', msg: t.decryptedSuccess });
            }
          } catch (decErr) {
            console.error("Local WASM password decryption failed:", decErr);
            throw new Error(t.invalidPassword);
          }
        } else {
          throw new Error("WASM module is required to decrypt this client-side encrypted paste.");
        }
      } else {
        const res = await fetch(`/api/paste/${data.id}?password=${encodeURIComponent(keyOrPwd)}`);
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error);

        setIsHoneyView(resData.is_honey);
        const isText = !resData.kind || resData.kind === 'text';
        if (!isText) {
          const blob = b64toBlob(resData.data, resData.mime_type);
          const url = URL.createObjectURL(blob);

          let stegoText = '';
          if (resData.kind === 'stego') {
            try {
              const extractRes = await fetch('/api/stego/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: resData.data }),
              });
              if (extractRes.ok) {
                const extractJson = await extractRes.json();
                stegoText = extractJson.message;
              }
            } catch (e) {
              console.error("Auto stego extraction failed:", e);
            }
          }

          setDecryptedContent({ url, name: resData.original_name, type: resData.mime_type, kind: resData.kind, stegoText, base64: resData.data });
        } else {
          setDecryptedContent(resData.data);
        }
        if (resData.is_honey) {
          setStatus(null);
        } else {
          setStatus({ type: 'ok', msg: t.decryptedSuccess });
        }
      }

      if (rememberWithBiometrics) {
        try {
          const credId = await registerBiometrics(data.id);
          if (credId) {
            localStorage.setItem(`biometric_cred_${data.id}`, credId);
            localStorage.setItem(`biometric_pwd_${data.id}`, keyOrPwd);
            setHasBiometricsForCurrent(true);
            setStatus({ type: 'ok', msg: t.biometricRegisterSuccess });
          }
        } catch (biometricErr) {
          console.warn("Could not register biometrics:", biometricErr);
        }
      }
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message || t.invalidPassword });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleStegoExtract = async () => {
    if (!stegoExtractFile) return;
    setIsStegoExtracting(true);
    setStatus(null);
    try {
      const imgB64 = await getFileBase64(stegoExtractFile);
      const cleanB64 = imgB64.includes(',') ? imgB64.split(',')[1] : imgB64;
      const res = await fetch('/api/stego/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: cleanB64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const blob = b64toBlob(cleanB64, 'image/png');
      const url = URL.createObjectURL(blob);

      setViewData({
        id: 'uploaded-stego',
        kind: 'stego',
        original_name: stegoExtractFile.name,
        mime_type: stegoExtractFile.type || 'image/png',
        size: stegoExtractFile.size,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        max_views: null,
        views: 1,
        has_password: false,
      });

      setDecryptedContent({
        url,
        name: stegoExtractFile.name,
        type: stegoExtractFile.type || 'image/png',
        kind: 'stego',
        stegoText: data.message,
      });

      setStatus({ type: 'ok', msg: t.decryptedSuccess });
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message || t.invalidPassword });
    } finally {
      setIsStegoExtracting(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!viewData?.id) return;
    setStatus(null);
    const credId = localStorage.getItem(`biometric_cred_${viewData.id}`);
    const savedPwd = localStorage.getItem(`biometric_pwd_${viewData.id}`);
    if (!credId || !savedPwd) {
      setStatus({ type: 'err', msg: t.biometricFailed });
      return;
    }

    try {
      const verified = await verifyBiometrics(credId);
      if (verified) {
        setStatus({ type: 'ok', msg: t.biometricVerifySuccess });
        performDecryption(viewData, savedPwd, viewData.isFile);
      } else {
        setStatus({ type: 'err', msg: t.biometricFailed });
      }
    } catch (err) {
      setStatus({ type: 'err', msg: t.biometricFailed });
    }
  };

  const resetViewPayload = () => {
    setViewInput('');
    setViewData(null);
    setViewPassword('');
    setDecryptedContent(null);
    setViewError(null);
    setStegoExtractFile(null);
    setStegoExtractResult(null);
    setIsStegoExtracting(false);
  };

  return {
    viewInput, setViewInput,
    viewData, setViewData,
    viewPassword, setViewPassword,
    decryptedContent, setDecryptedContent,
    isHoneyView, setIsHoneyView,
    viewError, setViewError,
    isLoading,
    isDecrypting,
    stegoExtractFile, setStegoExtractFile,
    stegoExtractPassword, setStegoExtractPassword,
    stegoExtractResult, setStegoExtractResult,
    isStegoExtracting,
    biometricsSupported,
    rememberWithBiometrics, setRememberWithBiometrics,
    hasBiometricsForCurrent,
    isSelfDestructed, setIsSelfDestructed,
    hidesCount, setHidesCount,

    handleView,
    performDecryption,
    handleStegoExtract,
    handleBiometricUnlock,
    resetViewPayload,
  };
};
