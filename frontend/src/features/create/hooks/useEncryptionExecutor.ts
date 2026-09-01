import { getFileBase64 } from '../utils';
import { Language } from '../../../types';
import { getWasm, b64url_encode, b64toUint8Array } from '../../../utils/wasmLoader';
import { convertImageToPng, formatStegoSize } from '../../../utils/imageProcessor';
import { audioStegoEmbed } from '../../../utils/audioStego';

export interface ExecuteEncryptionParams {
  contentType: string;
  message: string;
  selectedFile: File | null;
  audioMode: 'record' | 'stego';
  audioBlob: Blob | null;
  audioWavBytes: Uint8Array | null;
  audioText: string;
  audioFilename: string;
  audioEmbedPassword: string;
  password: string;
  hasPassword: boolean;
  hasShamir?: boolean;
  shamirThreshold?: number;
  shamirTotal?: number;
  setShamirShares?: (shares: string[]) => void;
  stegoCapacity: number;
  expiresIn: number;
  burnAfterRead: boolean;
  maxViews: number | '';
  hasHoney: boolean;
  honeyPwd: string;
  honeyContent: string;
  hasGeoLock: boolean;
  allowedCountries: string[];
  hasDeadMans: boolean;
  deadMansInterval: number;
  hasCanary: boolean;
  canaryUrl: string;
  hasTimeLock: boolean;
  unlockAt: number | null;
  hasSelfDestruct: boolean;
  selfDestructHides: number;
  selfDestructTriggers: string[];
  hasAsnLock: boolean;
  asnMode: 'block' | 'allow';
  asnSelected: string;
  language: Language;
  t: Record<string, string>;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string }) => void;
  setIsLoading: (val: boolean) => void;
  setStegoResultFile: (file: { blob: Blob; url: string; filename: string } | null) => void;
  setResultUrl: (url: string | null) => void;
  setShowContentWarning: (val: boolean) => void;
  setShowPasswordWarning: (val: boolean) => void;
  validateConfiguration: () => string | null;
}

export const executeEncryption = async (params: ExecuteEncryptionParams) => {
  const {
    contentType,
    message,
    selectedFile,
    audioMode,
    audioBlob,
    audioWavBytes,
    audioText,
    audioFilename,
    audioEmbedPassword,
    password,
    hasPassword,
    hasShamir,
    shamirThreshold = 3,
    shamirTotal = 5,
    setShamirShares,
    stegoCapacity,
    expiresIn,
    burnAfterRead,
    maxViews,
    hasHoney,
    honeyPwd,
    honeyContent,
    hasGeoLock,
    allowedCountries,
    hasDeadMans,
    deadMansInterval,
    hasCanary,
    canaryUrl,
    hasTimeLock,
    unlockAt,
    hasSelfDestruct,
    selfDestructHides,
    selfDestructTriggers,
    hasAsnLock,
    asnMode,
    asnSelected,
    language,
    t,
    setStatus,
    setIsLoading,
    setStegoResultFile,
    setResultUrl,
    setShowContentWarning,
    setShowPasswordWarning,
    validateConfiguration
  } = params;

  const isContentMissing = 
    (contentType === 'text' && !message.trim()) ||
    (contentType === 'file' && !selectedFile) ||
    (contentType === 'image' && !selectedFile) ||
    (contentType === 'stego' && (!selectedFile || !message.trim())) ||
    (contentType === 'audio' && audioMode === 'record' && !audioBlob) ||
    (contentType === 'audio' && audioMode === 'stego' && (!audioWavBytes || !audioText.trim()));

  if (isContentMissing) {
    setShowContentWarning(true);
    if (contentType === 'stego') {
      if (!selectedFile) {
        setStatus({
          type: 'err',
          msg: t.stegoSelectCoverFirst || 'Please select or capture a cover image first.'
        });
      } else {
        setStatus({
          type: 'err',
          msg: t.stegoEnterMessageFirst || 'Please enter the secret message to hide.'
        });
      }
    }
    return;
  }

  if (contentType !== 'stego' && !hasShamir && hasPassword && !password) {
    setShowPasswordWarning(true);
    return;
  }

  const configError = validateConfiguration();
  if (configError) {
    setStatus({ type: 'err', msg: configError });
    return;
  }

  setIsLoading(true);
  setStatus({ type: 'warn', msg: t.encrypting });
  
  try {
    let payloadData = '';
    let originalName: string | null = null;
    let mimeType: string | null = null;
    let size = 0;

    const W = getWasm();
    const isE2e = contentType === 'e2e';

    // --- DIRECT CLIENT-SIDE STEGANOGRAPHY EMBEDDING (BYPASS PASTE CREATION) ---
    if (contentType === 'stego') {
      if (!selectedFile || !message.trim()) {
        throw new Error(t.stegoCoverAndMessageRequired || "Cover image and hidden message are required");
      }

      const encoder = new TextEncoder();
      const secretBytes = encoder.encode(message);

      // Stego capacity validation
      if (stegoCapacity > 0 && secretBytes.length > stegoCapacity) {
        const excess = secretBytes.length - stegoCapacity;
        const msgTemplate = t.stegoCapacityExceededShorten || "⚠️ Secret message ({0}) exceeds image capacity ({1})! Please shorten by {2}.";
        const msg = msgTemplate
          .replace('{0}', formatStegoSize(secretBytes.length, language))
          .replace('{1}', formatStegoSize(stegoCapacity, language))
          .replace('{2}', formatStegoSize(excess, language));
        setStatus({ type: 'err', msg });
        setIsLoading(false);
        return;
      }

      setStatus({ type: 'warn', msg: t.stegoEmbeddingPayload || 'Embedding hidden payload into image pixels ...' });

      // Ensure lossless PNG format
      const processed = await convertImageToPng(selectedFile, selectedFile.name);
      const coverBytes = processed.pngBytes;
      let outPngBytes: Uint8Array;

      if (W && typeof W.stego_hide === 'function') {
        try {
          outPngBytes = W.stego_hide(coverBytes, secretBytes, password || '');
        } catch (wasmErr: any) {
          console.warn("WASM stego_hide failed, trying server fallback:", wasmErr);
          const coverB64 = await getFileBase64(processed.pngFile);
          const hideRes = await fetch('/api/stego/hide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: coverB64, message })
          });
          const hideData = await hideRes.json();
          if (!hideRes.ok) throw new Error(hideData.error || "Steganography embedding failed on server");
          outPngBytes = b64toUint8Array(hideData.image);
        }
      } else {
        const coverB64 = await getFileBase64(processed.pngFile);
        const hideRes = await fetch('/api/stego/hide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: coverB64, message })
        });
        const hideData = await hideRes.json();
        if (!hideRes.ok) throw new Error(hideData.error || "Steganography embedding failed on server");
        outPngBytes = b64toUint8Array(hideData.image);
      }

      const blob = new Blob([outPngBytes], { type: 'image/png' });
      const baseName = selectedFile.name ? selectedFile.name.replace(/\.[^/.]+$/, "") : 'DayLock';
      const filename = `DayLock_${baseName}.png`;
      const url = URL.createObjectURL(blob);

      setStegoResultFile({ blob, url, filename });
      setStatus({ type: 'ok', msg: t.stegoEmbeddedSuccess || 'DayLock payload embedded successfully!' });
      return;
    }

    if (contentType === 'audio' && audioMode === 'stego') {
      if (!audioWavBytes) throw new Error(t.noWavCoverLoaded || "No WAV audio cover file loaded");
      if (!audioText.trim()) throw new Error(t.noAudioSecretMessage || "No secret message provided");
      const stegoPwd = audioEmbedPassword || password || '';

      let modifiedWav: Uint8Array;
      if (W && typeof W.audio_stego_embed === 'function') {
        modifiedWav = W.audio_stego_embed(audioWavBytes, audioText, stegoPwd);
      } else {
        modifiedWav = await audioStegoEmbed(audioWavBytes, audioText, stegoPwd);
      }

      const blob = new Blob([modifiedWav], { type: 'audio/wav' });
      const baseName = audioFilename ? audioFilename.replace(/\.[^/.]+$/, "").replace(/_stego$/i, "") : 'DayLock';
      const filename = `DayLock_${baseName}_stego.wav`;
      const url = URL.createObjectURL(blob);

      setStegoResultFile({ blob, url, filename });
      setStatus({ type: 'ok', msg: t.stegoEmbeddedSuccess || 'DayLock audio embedded successfully!' });
      return;
    }

    if (W && !isE2e) {
      // --- CLIENT-SIDE WASM ZERO-KNOWLEDGE ENCRYPTION ---
      const encoder = new TextEncoder();
      let mainEnc: any;

      if (contentType === 'text') {
        const rawBytes = encoder.encode(message);
        if (hasShamir) {
          mainEnc = W.encrypt_with_random_key(rawBytes);
        } else if (hasPassword) {
          mainEnc = W.encrypt_with_password(rawBytes, password);
        } else {
          mainEnc = W.encrypt_with_random_key(rawBytes);
        }
        size = rawBytes.length;
      } else if (contentType === 'file' || contentType === 'image') {
        if (!selectedFile) throw new Error(t.selectFileWarning || "No file selected");
        const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
        const kindNum = contentType === 'image' ? 2 : 0;
        if (hasShamir) {
          mainEnc = W.encrypt_file_with_random_key(fileBytes, selectedFile.name, selectedFile.type, kindNum);
        } else if (hasPassword) {
          mainEnc = W.encrypt_file_with_password(fileBytes, selectedFile.name, selectedFile.type, kindNum, password);
        } else {
          mainEnc = W.encrypt_file_with_random_key(fileBytes, selectedFile.name, selectedFile.type, kindNum);
        }
        originalName = selectedFile.name;
        mimeType = selectedFile.type;
        size = selectedFile.size;
      } else if (contentType === 'audio' && audioMode === 'record') {
        if (!audioBlob) throw new Error(t.noRecordingFound || "No recording found");
        const fileBytes = new Uint8Array(await audioBlob.arrayBuffer());
        const kindNum = 1; // Voice
        if (hasShamir) {
          mainEnc = W.encrypt_file_with_random_key(fileBytes, 'voice.webm', 'audio/webm', kindNum);
        } else if (hasPassword) {
          mainEnc = W.encrypt_file_with_password(fileBytes, 'voice.webm', 'audio/webm', kindNum, password);
        } else {
          mainEnc = W.encrypt_file_with_random_key(fileBytes, 'voice.webm', 'audio/webm', kindNum);
        }
        originalName = 'voice.webm';
        mimeType = 'audio/webm';
        size = audioBlob.size;
      }

      // If Shamir is enabled, split the master key
      if (hasShamir && mainEnc.key) {
        const keyB64 = b64url_encode(mainEnc.key);
        const splitRes = await fetch('/api/shamir/split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: keyB64,
            total: shamirTotal,
            threshold: shamirThreshold
          })
        });
        const splitData = await splitRes.json();
        if (!splitRes.ok) throw new Error(splitData.error || "Failed to split secret into Shamir shares");
        if (setShamirShares) {
          setShamirShares(splitData.shares);
        }
      }

      // HoneyPot Encryption with WASM
      let honeyPayload: any = {
        honey_data: null,
        honey_iv: null,
        honey_salt: null
      };
      if (hasHoney && honeyContent && honeyPwd) {
        const honeyBytes = encoder.encode(honeyContent);
        const hEnc = W.encrypt_with_password(honeyBytes, honeyPwd);
        honeyPayload = {
          honey_data: Array.from(hEnc.data),
          honey_iv: Array.from(hEnc.iv),
          honey_salt: Array.from(hEnc.salt)
        };
      }

      const payload = {
        is_pre_encrypted: true,
        data: Array.from(mainEnc.data),
        iv: Array.from(mainEnc.iv),
        salt: mainEnc.salt ? Array.from(mainEnc.salt) : null,
        expires_in: expiresIn,
        burn_after_read: burnAfterRead,
        max_views: maxViews === '' ? null : maxViews,
        has_password: hasPassword && !hasShamir,
        has_shamir: Boolean(hasShamir),
        shamir_threshold: hasShamir ? shamirThreshold : null,
        shamir_total: hasShamir ? shamirTotal : null,
        has_honey: hasHoney,
        ...honeyPayload,
        kind: contentType === 'audio' && audioMode === 'record' ? 'voice' : contentType,
        original_name: originalName,
        mime_type: mimeType,
        size: size,
        allowed_countries: hasGeoLock ? allowedCountries : null,
        dead_mans_interval: hasDeadMans ? deadMansInterval : null,
        canary_url: hasCanary ? canaryUrl : null,
        unlock_at: hasTimeLock ? unlockAt : null,
        self_destruct_hides: hasSelfDestruct ? selfDestructHides : null,
        self_destruct_triggers: hasSelfDestruct ? selfDestructTriggers.join(',') : null,
        block_asns: hasAsnLock && asnMode === 'block' && asnSelected ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
        allow_asns: hasAsnLock && asnMode === 'allow' && asnSelected ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
        has_decoy: false,
        decoy_content: null,
        is_e2e_channel: false,
        e2e_public_key: null
      };

      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const finalId = contentType === 'text' ? result.id : `file-${result.id}`;
      const finalKey = hasShamir ? 'shamir' : (hasPassword ? 'pwd' : b64url_encode(mainEnc.key));
      setResultUrl(`${window.location.origin}/#${finalId}:${finalKey}`);
      setStatus({ type: 'ok', msg: t.securelyStored });

    } else {
      // --- SERVER-SIDE FALLBACK ENCRYPTION ---
      if (contentType === 'text') {
        payloadData = message;
        size = new TextEncoder().encode(message).length;
      } else if (contentType === 'file' || contentType === 'image') {
        if (!selectedFile) throw new Error(t.selectFileWarning || "No file selected");
        payloadData = await getFileBase64(selectedFile);
        originalName = selectedFile.name;
        mimeType = selectedFile.type;
        size = selectedFile.size;
      } else if (contentType === 'audio' && audioMode === 'record') {
        if (!audioBlob) throw new Error(t.noRecordingFound || "No recording found");
        payloadData = await getFileBase64(audioBlob);
        originalName = 'voice.webm';
        mimeType = 'audio/webm';
        size = audioBlob.size;
      } else {
        throw new Error(t.invalidContentType || "Invalid content type");
      }

      const payload = {
        data: payloadData,
        password: hasPassword && !hasShamir ? password : null,
        expires_in: expiresIn,
        burn_after_read: burnAfterRead,
        max_views: maxViews === '' ? null : maxViews,
        has_password: hasPassword && !hasShamir,
        has_shamir: Boolean(hasShamir),
        shamir_threshold: hasShamir ? shamirThreshold : null,
        shamir_total: hasShamir ? shamirTotal : null,
        has_honey: hasHoney,
        honey_data: hasHoney ? honeyContent : null,
        honey_password: hasHoney ? honeyPwd : null,
        kind: contentType === 'audio' && audioMode === 'record' ? 'voice' : contentType,
        original_name: originalName,
        mime_type: mimeType,
        size: size,
        allowed_countries: hasGeoLock ? allowedCountries : null,
        dead_mans_interval: hasDeadMans ? deadMansInterval : null,
        canary_url: hasCanary ? canaryUrl : null,
        unlock_at: hasTimeLock ? unlockAt : null,
        self_destruct_hides: hasSelfDestruct ? selfDestructHides : null,
        self_destruct_triggers: hasSelfDestruct ? selfDestructTriggers.join(',') : null,
        block_asns: hasAsnLock && asnMode === 'block' && asnSelected ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
        allow_asns: hasAsnLock && asnMode === 'allow' && asnSelected ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null
      };

      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      if (hasShamir && result.key) {
        const splitRes = await fetch('/api/shamir/split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: result.key,
            total: shamirTotal,
            threshold: shamirThreshold
          })
        });
        const splitData = await splitRes.json();
        if (!splitRes.ok) throw new Error(splitData.error || "Failed to split secret into Shamir shares");
        if (setShamirShares) {
          setShamirShares(splitData.shares);
        }
      }

      const finalId = contentType === 'text' ? result.id : `file-${result.id}`;
      const finalKey = hasShamir ? 'shamir' : (hasPassword ? 'pwd' : result.key);
      setResultUrl(`${window.location.origin}/#${finalId}:${finalKey}`);
      setStatus({ type: 'ok', msg: t.securelyStored });
    }
    
  } catch (err: any) {
    setStatus({ type: 'err', msg: err.message });
  } finally {
    setIsLoading(false);
  }
};
