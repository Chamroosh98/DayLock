import { useState, useEffect } from 'react';
import { ViewTabProps } from '../types';
import { getWasm, b64url_decode } from '../../../utils/wasmLoader';
import { b64toBlob, getFileBase64, b64toUint8Array, uint8ArrayToB64 } from '../../../utils/fileHelpers';
import { e2eDecrypt, e2eEncrypt } from '../../../utils/e2eCrypto';
import { registerBiometrics, verifyBiometrics } from '../../../utils/webAuthn';
import { forceClearClipboard } from '../../../utils/clipboardManager';
import { audioStegoExtract } from '../../../utils/audioStego';
import { triggerHapticFeedback } from '../../../utils/haptics';

export function useViewLogic(props: ViewTabProps) {
  const {
    viewInput,
    setViewInput,
    viewData,
    setViewData,
    setViewError,
    decryptedContent,
    setDecryptedContent,
    isSelfDestructed,
    setIsSelfDestructed,
    setHidesCount,
    setHasBiometricsForCurrent,
    setIsLoading,
    setStatus,
    language,
    t,
    e2eKeyPair,
    triggerShatterExplosion,
    isDarkMode,
  } = props;

  // View state
  const [viewPassword, setViewPassword] = useState('');
  const [showViewPwd, setShowViewPwd] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isHoneyView, setIsHoneyView] = useState(false);
  const [rememberWithBiometrics, setRememberWithBiometrics] = useState(false);

  // Stego Extract state
  const [stegoExtractFile, setStegoExtractFile] = useState<File | null>(null);
  const [stegoExtractPassword, setStegoExtractPassword] = useState('');
  const [showStegoExtractPwd, setShowStegoExtractPwd] = useState(false);
  const [stegoExtractResult, setStegoExtractResult] = useState<string | null>(null);
  const [isStegoExtracting, setIsStegoExtracting] = useState(false);
  const [contentType, setContentType] = useState<string>('text');

  // E2E Channel state
  const [e2eRecipientPubInput, setE2ERecipientPubInput] = useState('');
  const [e2eActiveMessages, setE2EActiveMessages] = useState<any[]>([]);
  const [e2eMessageText, setE2EMessageText] = useState('');
  const [e2eChannelDetails, setE2EChannelDetails] = useState<any | null>(null);

  // Clear all states when resetTrigger changes
  useEffect(() => {
    if (props.resetTrigger !== undefined && props.resetTrigger > 0) {
      setStegoExtractFile(null);
      setStegoExtractPassword('');
      setStegoExtractResult(null);
      setShowStegoExtractPwd(false);
      setViewPassword('');
      setShowViewPwd(false);
      setIsHoneyView(false);
      setE2ERecipientPubInput('');
      setE2EActiveMessages([]);
      setE2EMessageText('');
      setE2EChannelDetails(null);
      setContentType('text');
    }
  }, [props.resetTrigger]);

  const handleTerminateSession = () => {
    triggerShatterExplosion(['#10b981', '#059669', '#34d399', '#022c22', isDarkMode ? '#ffffff' : '#1e293b']);
    setViewInput('');
    setViewData(null);
    setViewPassword('');
    setDecryptedContent(null);
    setViewError(null);
    setStatus(null);
    setIsHoneyView(false);
    setStegoExtractFile(null);
    setStegoExtractPassword('');
    setStegoExtractResult(null);
    setShowStegoExtractPwd(false);
    setShowViewPwd(false);
    setE2ERecipientPubInput('');
    setE2EActiveMessages([]);
    setE2EMessageText('');
    setE2EChannelDetails(null);
    forceClearClipboard();
    try {
      (window as any).secureClearClipboard?.();
    } catch (_) {}
  };

  const handleRefreshE2EMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/paste/${channelId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load channel messages.");
      }
      const channelData = await res.json();
      
      const decryptedMsgs = [];
      if (channelData.e2e_messages && Array.isArray(channelData.e2e_messages)) {
        for (const msg of channelData.e2e_messages) {
          let text = t.e2eDecryptionFailedKey;
          if (e2eKeyPair) {
            try {
              text = await e2eDecrypt(
                e2eKeyPair.privateKey,
                msg.ephemeral_pub,
                msg.nonce,
                msg.ciphertext
              );
            } catch (cryptoErr) {
              // decryption failed, keep fallback text
            }
          } else {
            text = t.e2eEncryptedIdentityReq;
          }
          decryptedMsgs.push({
            id: msg.id,
            text,
            timestamp: msg.timestamp
          });
        }
      }
      setE2EActiveMessages(decryptedMsgs);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendE2EMessage = async (channelId: string, recipientPubKey: string) => {
    if (!e2eMessageText.trim()) return;
    try {
      const encPayload = await e2eEncrypt(recipientPubKey, e2eMessageText);
      const res = await fetch(`/api/paste/${channelId}/e2e`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e2e_message: encPayload })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to deliver message.");
      }
      setE2EMessageText('');
      await handleRefreshE2EMessages(channelId);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    }
  };

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
          body: JSON.stringify({ url: cleanUrl })
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
          has_password: false
        });

        setDecryptedContent({
          url,
          name,
          type: 'image/png',
          kind: 'stego',
          stegoText: data.message
        });

        setStatus({ type: 'ok', msg: t.decryptedSuccess });
        return;
      }

      const hash = (viewInput.includes('#') ? viewInput.split('#')[1] : viewInput).trim();
      if (!hash || hash === 'undefined') {
        setStatus({ type: 'err', msg: t.enterValidLinkOrId });
        return;
      }
      
      // Support for E2E Channels
      if (hash.startsWith('e2e-')) {
        const id = hash.replace('e2e-', '').trim();
        if (!id || id === 'undefined') {
          setStatus({ type: 'err', msg: t.invalidChannelId });
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
        
        // Trigger initial message decryption if private key exists
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
        setStatus({ type: 'err', msg: t.invalidPasteId });
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
                // It's a file
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
                  base64: uint8ArrayToB64(plain.data) 
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
                  body: JSON.stringify({ image: data.data })
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

  const handleStegoExtract = async () => {
    if (!stegoExtractFile) return;
    setIsStegoExtracting(true);
    setStatus(null);
    try {
      let extractedText = '';
      let extractedFilePayload: { data: Uint8Array; filename: string; mime_type: string; kind: number } | null = null;
      const W = getWasm();
      const fileBytes = new Uint8Array(await stegoExtractFile.arrayBuffer());
      const fileNameLower = stegoExtractFile.name.toLowerCase();
      const isAudio = stegoExtractFile.type.includes('audio') || fileNameLower.endsWith('.wav') || fileNameLower.endsWith('.mp3') || fileNameLower.endsWith('.ogg') || fileNameLower.endsWith('.flac');
      const isImage = stegoExtractFile.type.includes('image') || fileNameLower.endsWith('.png') || fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg') || fileNameLower.endsWith('.webp') || fileNameLower.endsWith('.bmp');

      if (isAudio) {
        if (W && typeof W.audio_stego_extract === 'function') {
          extractedText = W.audio_stego_extract(fileBytes, stegoExtractPassword || '');
        } else {
          extractedText = await audioStegoExtract(fileBytes, stegoExtractPassword || '');
        }
      } else if (isImage) {
        if (W && typeof W.stego_extract === 'function') {
          const plainBytes = W.stego_extract(fileBytes, stegoExtractPassword || '');
          extractedText = new TextDecoder().decode(plainBytes);
        } else {
          const imgB64 = await getFileBase64(stegoExtractFile);
          const cleanB64 = imgB64.includes(',') ? imgB64.split(',')[1] : imgB64;
          const res = await fetch('/api/stego/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: cleanB64, password: stegoExtractPassword })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          extractedText = data.message;
        }
      } else {
        // Generic Binary File / .enc / .bin / archive decrypted via WASM Argon2id + AES-GCM parser
        if (W && typeof W.decrypt_file_with_password === 'function' && fileBytes.length >= 48) {
          // Check for salt (32 bytes) + IV (12 bytes) + ciphertext format
          const salt = fileBytes.slice(0, 32);
          const iv = fileBytes.slice(32, 44);
          const ciphertext = fileBytes.slice(44);
          const res = W.decrypt_file_with_password(ciphertext, iv, salt, stegoExtractPassword || '');
          if (res && res.data) {
            extractedFilePayload = {
              data: new Uint8Array(res.data),
              filename: res.filename || 'decrypted_file',
              mime_type: res.mime_type || 'application/octet-stream',
              kind: res.kind ?? 0
            };
          }
        } else {
          throw new Error(t.invalidPassword || "Unsupported carrier format or invalid key");
        }
      }

      if (extractedFilePayload) {
        const blob = new Blob([extractedFilePayload.data], { type: extractedFilePayload.mime_type });
        const url = URL.createObjectURL(blob);
        const resolvedKind = extractedFilePayload.kind === 2 ? 'image' : (extractedFilePayload.kind === 1 ? 'voice' : 'file');

        setViewData({
          id: 'uploaded-binary',
          kind: resolvedKind,
          original_name: extractedFilePayload.filename,
          mime_type: extractedFilePayload.mime_type,
          size: extractedFilePayload.data.length,
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          max_views: null,
          views: 1,
          has_password: false,
          isFile: true
        });

        setDecryptedContent({
          url,
          name: extractedFilePayload.filename,
          type: extractedFilePayload.mime_type,
          kind: resolvedKind
        });
      } else {
        const url = URL.createObjectURL(stegoExtractFile);

        setViewData({
          id: 'uploaded-stego',
          kind: 'stego',
          original_name: stegoExtractFile.name,
          mime_type: stegoExtractFile.type || (isAudio ? 'audio/wav' : 'image/png'),
          size: stegoExtractFile.size,
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          max_views: null,
          views: 1,
          has_password: false
        });

        setDecryptedContent({
          url,
          name: stegoExtractFile.name,
          type: stegoExtractFile.type || (isAudio ? 'audio/wav' : 'image/png'),
          kind: 'stego',
          stegoText: extractedText
        });
      }

      setStegoExtractResult(extractedText || (extractedFilePayload ? `${extractedFilePayload.filename} (${(extractedFilePayload.data.length / 1024).toFixed(1)} KB)` : ''));
      setStatus({ type: 'ok', msg: t.decryptedSuccess });
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message || t.invalidPassword });
    } finally {
      setIsStegoExtracting(false);
    }
  };

  useEffect(() => {
    if (viewData?.self_destruct_hides && !isSelfDestructed) {
      const triggers = viewData.self_destruct_triggers?.split(',') || ['tab'];
      
      const triggerDestruct = async () => {
        setHidesCount(prev => {
          const next = prev + 1;
          if (next >= viewData.self_destruct_hides) {
            triggerShatterExplosion(['#ef4444', '#dc2626', '#f87171', '#7f1d1d', isDarkMode ? '#ffffff' : '#1e293b']);
            setIsSelfDestructed(true);
            // Delete from server
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
  }, [viewData, isSelfDestructed]);

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
            
            // Try honey decryption if honey parameters exist
            if (data.has_honey && data.honey_data && data.honey_salt && data.honey_iv) {
              try {
                const hCipherBytes = b64toUint8Array(data.honey_data);
                const hIvBytes = b64toUint8Array(data.honey_iv);
                const hSaltBytes = b64toUint8Array(data.honey_salt);
                
                plainBytes = W.decrypt_with_password(hCipherBytes, hIvBytes, hSaltBytes, keyOrPwd);
                isHoney = true;
              } catch (honeyErr) {
                // Honey decryption failed, try decrypting main secret
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
        // Standard server-decrypted path
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
                body: JSON.stringify({ image: resData.data })
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

  return {
    viewPassword,
    setViewPassword,
    showViewPwd,
    setShowViewPwd,
    isDecrypting,
    isHoneyView,
    setIsHoneyView,
    rememberWithBiometrics,
    setRememberWithBiometrics,
    stegoExtractFile,
    setStegoExtractFile,
    stegoExtractPassword,
    setStegoExtractPassword,
    showStegoExtractPwd,
    setShowStegoExtractPwd,
    stegoExtractResult,
    isStegoExtracting,
    contentType,
    setContentType,
    e2eRecipientPubInput,
    setE2ERecipientPubInput,
    e2eActiveMessages,
    setE2EActiveMessages,
    e2eMessageText,
    setE2EMessageText,
    e2eChannelDetails,
    setE2EChannelDetails,
    handleView,
    handleStegoExtract,
    performDecryption,
    handleBiometricUnlock,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    handleTerminateSession,
  };
}
