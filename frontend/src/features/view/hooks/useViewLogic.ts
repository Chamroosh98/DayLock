import { useState, useEffect, useCallback, useRef } from 'react';
import { ViewTabProps } from '../types';
import { getWasm, b64url_decode } from '../../../utils/wasmLoader';
import { b64toBlob, getFileBase64, b64toUint8Array, uint8ArrayToB64, parseSecfPayload } from '../../../utils/fileHelpers';
import { e2eDecrypt, e2eEncrypt, e2eDecryptMessageList, e2ePrepareOutboundMessage } from '../../../utils/e2eCrypto';
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

  const e2eKeyPairRef = useRef(e2eKeyPair);
  e2eKeyPairRef.current = e2eKeyPair;
  const tRef = useRef(t);
  tRef.current = t;
  const languageRef = useRef(language);
  languageRef.current = language;

  const handleRefreshE2EMessages = useCallback(async (channelId: string) => {
    if (!channelId) return;
    try {
      const res = await fetch(`/api/paste/${channelId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load channel messages.");
      }
      const channelData = await res.json();
      const decrypted = await e2eDecryptMessageList(
        channelData.e2e_messages,
        e2eKeyPairRef.current,
        tRef.current,
        languageRef.current
      );
      setE2EActiveMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(decrypted)) {
          return prev;
        }
        return decrypted;
      });
    } catch (err: any) {
      console.error("Failed to refresh E2E messages:", err);
    }
  }, []);

  const handleSendE2EMessage = async (channelId: string, recipientPubKey: string) => {
    if (!e2eMessageText.trim()) return;
    try {
      const encPayload = await e2ePrepareOutboundMessage(
        recipientPubKey.trim(),
        e2eMessageText.trim(),
        e2eKeyPair?.publicKey
      );
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

  // Auto-polling for active E2E channel in ViewTab
  useEffect(() => {
    const channelId = viewData?.id;
    if (!viewData?.is_e2e_channel || !channelId) return;
    handleRefreshE2EMessages(channelId);
    const interval = setInterval(() => {
      handleRefreshE2EMessages(channelId);
    }, 2500);
    return () => clearInterval(interval);
  }, [viewData?.is_e2e_channel, viewData?.id, handleRefreshE2EMessages]);

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
        
        if (res.status === 403) {
          const payload = data.data || data;
          if (payload.your_asn || payload.blocked_asns || payload.allowed_asns) {
            setViewError({ type: 'asn', data: payload });
          } else {
            setViewError({ type: 'geo', data: payload });
          }
          return;
        }
        if (res.status === 423) {
          setViewError({ type: 'time', data: data.data || data });
          return;
        }
        if (res.status === 410) {
          setViewError({ type: data.dead_mans ? 'dms' : 'expired', data: data.data || data });
          return;
        }
        if (res.status === 404) {
          setViewError({ type: 'burned', data: data.data || data });
          return;
        }
        if (!res.ok) {
          setViewError({ type: 'generic', data: { error: data.error || 'Access restricted.' } });
          return;
        }
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
      
      if (res.status === 403) {
        const payload = data.data || data;
        if (payload.your_asn || payload.blocked_asns || payload.allowed_asns) {
          setViewError({ type: 'asn', data: payload });
        } else {
          setViewError({ type: 'geo', data: payload });
        }
        return;
      }
      if (res.status === 423) {
        setViewError({ type: 'time', data: data.data || data });
        return;
      }
      if (res.status === 410) {
        if (data.dead_mans || (data.data && data.data.dead_mans)) {
          setViewError({ type: 'dms', data: data.data || data });
        } else {
          setViewError({ type: 'expired', data: data.data || data });
        }
        return;
      }
      if (res.status === 404) {
        setViewError({ type: 'burned', data: data.data || data });
        return;
      }
      if (res.status === 429) {
        setViewError({ type: 'rate_limit', data: data.data || data });
        return;
      }
      
      if (!res.ok) {
        setViewError({ type: 'generic', data: { error: data.error || 'Access restricted or link unavailable.' } });
        return;
      }
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
                const secf = parseSecfPayload(plainBytes);
                if (secf) {
                  const blob = new Blob([secf.data], { type: secf.mime_type });
                  const url = URL.createObjectURL(blob);
                  const resolvedKind = secf.kind === 1 ? 'voice' : (secf.kind === 2 ? 'image' : (data.kind || 'file'));
                  setDecryptedContent({
                    url,
                    name: secf.filename,
                    type: secf.mime_type,
                    kind: resolvedKind,
                    stegoText: '',
                    base64: uint8ArrayToB64(secf.data)
                  });
                } else {
                  const text = new TextDecoder().decode(plainBytes);
                  setDecryptedContent(text);
                }
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

  const handleStegoExtract = async (overrideKey?: string) => {
    if (!stegoExtractFile) return;
    setIsStegoExtracting(true);
    setStatus(null);
    const activePassword = overrideKey !== undefined ? overrideKey : stegoExtractPassword;
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
          extractedText = W.audio_stego_extract(fileBytes, activePassword || '');
        } else {
          extractedText = await audioStegoExtract(fileBytes, activePassword || '');
        }
      } else if (isImage) {
        if (W && typeof W.stego_extract === 'function') {
          const plainBytes = W.stego_extract(fileBytes, activePassword || '');
          extractedText = new TextDecoder().decode(plainBytes);
        } else {
          const imgB64 = await getFileBase64(stegoExtractFile);
          const cleanB64 = imgB64.includes(',') ? imgB64.split(',')[1] : imgB64;
          const res = await fetch('/api/stego/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: cleanB64, password: activePassword })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          extractedText = data.message;
        }
      } else {
        // Generic Binary File / .enc / .bin / archive decrypted via WASM Argon2id + AES-GCM parser
        if (W && fileBytes.length >= 48) {
          // Check for salt (32 bytes) + IV (12 bytes) + ciphertext format
          const salt = fileBytes.slice(0, 32);
          const iv = fileBytes.slice(32, 44);
          const ciphertext = fileBytes.slice(44);

          let res: any = null;
          // Check if password is a base64url random key (from Shamir)
          const pwdTrim = (activePassword || '').trim();
          if (pwdTrim.length === 43 || pwdTrim.length === 44) {
            try {
              const rawKey = b64url_decode(pwdTrim);
              if (rawKey.length === 32 && typeof W.decrypt_file_with_key === 'function') {
                res = W.decrypt_file_with_key(ciphertext, iv, rawKey);
              }
            } catch (_) {}
          }

          if (!res && typeof W.decrypt_file_with_password === 'function') {
            res = W.decrypt_file_with_password(ciphertext, iv, salt, activePassword || '');
          }

          if (res && res.data) {
            extractedFilePayload = {
              data: new Uint8Array(res.data),
              filename: res.filename || 'decrypted_file',
              mime_type: res.mime_type || 'application/octet-stream',
              kind: res.kind ?? 0
            };
          } else {
            throw new Error(t.invalidPassword || "Invalid decryption key or password.");
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
            const saltBytes = data.salt ? b64toUint8Array(data.salt) : new Uint8Array(0);
            
            let plainBytes: Uint8Array;
            let isHoney = false;
            
            if (data.has_shamir) {
              const rawKey = b64url_decode(keyOrPwd);
              plainBytes = W.decrypt_with_key(cipherBytes, ivBytes, rawKey);
            } else if (data.has_honey && data.honey_data && data.honey_salt && data.honey_iv) {
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
            
            // Check if decrypted plainBytes contains SECF binary container
            const secf = parseSecfPayload(plainBytes);
            if (secf) {
              const blob = new Blob([secf.data], { type: secf.mime_type });
              const url = URL.createObjectURL(blob);
              const resolvedKind = secf.kind === 1 ? 'voice' : (secf.kind === 2 ? 'image' : (data.kind || 'file'));
              setDecryptedContent({
                url,
                name: secf.filename,
                type: secf.mime_type,
                kind: resolvedKind,
                stegoText: '',
                base64: uint8ArrayToB64(secf.data)
              });
            } else {
              const isText = !data.kind || data.kind === 'text';
              if (!isText && !isHoney) {
                let plain: any;
                if (data.has_shamir) {
                  const rawKey = b64url_decode(keyOrPwd);
                  if (typeof W.decrypt_file_with_key === 'function') {
                    plain = W.decrypt_file_with_key(cipherBytes, ivBytes, rawKey);
                  } else {
                    const dec = W.decrypt_with_key(cipherBytes, ivBytes, rawKey);
                    plain = { data: dec, filename: data.original_name || 'decrypted_file', mime_type: data.mime_type || 'application/octet-stream', kind: 0 };
                  }
                } else {
                  plain = W.decrypt_file_with_password(cipherBytes, ivBytes, saltBytes, keyOrPwd);
                }
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
            }
            
            if (isHoney) {
              setStatus(null);
            } else {
              setStatus({ type: 'ok', msg: t.decryptedSuccess });
            }
          } catch (decErr) {
            console.error("Local WASM decryption failed:", decErr);
            throw new Error(t.invalidPassword);
          }
        } else {
          throw new Error("WASM module is required to decrypt this client-side encrypted paste.");
        }
      } else {
        // Standard server-decrypted path
        const param = data.has_shamir ? `key=${encodeURIComponent(keyOrPwd)}` : `password=${encodeURIComponent(keyOrPwd)}`;
        const res = await fetch(`/api/paste/${data.id}?${param}`);
        const resData = await res.json();
        if (!res.ok) {
          if (res.status === 403) {
            const payload = resData.data || resData;
            setViewError({ type: payload.your_asn ? 'asn' : 'geo', data: payload });
            return;
          }
          if (res.status === 423) {
            setViewError({ type: 'time', data: resData.data || resData });
            return;
          }
          if (res.status === 410) {
            setViewError({ type: resData.dead_mans ? 'dms' : 'expired', data: resData.data || resData });
            return;
          }
          if (res.status === 404) {
            setViewError({ type: 'burned', data: resData.data || resData });
            return;
          }
          throw new Error(resData.error || t.invalidPassword);
        }

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
          // Check if string contains base64 encoded SECF
          const rawBytes = b64toUint8Array(resData.data);
          const secf = parseSecfPayload(rawBytes);
          if (secf) {
            const blob = new Blob([secf.data], { type: secf.mime_type });
            const url = URL.createObjectURL(blob);
            const resolvedKind = secf.kind === 1 ? 'voice' : (secf.kind === 2 ? 'image' : 'file');
            setDecryptedContent({
              url,
              name: secf.filename,
              type: secf.mime_type,
              kind: resolvedKind,
              stegoText: '',
              base64: uint8ArrayToB64(secf.data)
            });
          } else {
            setDecryptedContent(resData.data);
          }
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
