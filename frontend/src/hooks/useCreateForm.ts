import React, { useState } from 'react';
import { ContentType, Language, StatusState, Country } from '../types';
import { getFileBase64, b64toBlob } from '../utils/fileHelpers';
import { audioStegoEmbed } from '../utils/audioStego';
import { getWasm, b64url_encode } from '../utils/wasmLoader';
import { isAsciiChar } from '../utils/formatters';
import { useVaultState } from './useVaultState';

interface UseCreateFormProps {
  language: Language;
  status: StatusState | null;
  setStatus: (status: StatusState | null) => void;
  audioBlob: Blob | null;
  audioWavBytes: Uint8Array | null;
  audioFilename: string;
  audioText: string;
  audioEmbedPassword: string;
  audioMode: 'record' | 'stego';
  t: Record<string, string>;
}

export function useCreateForm({
  language,
  setStatus,
  audioBlob,
  audioWavBytes,
  audioFilename,
  audioText,
  audioEmbedPassword,
  audioMode,
  t,
}: UseCreateFormProps) {
  const vault = useVaultState({ language, initialContentType: 'text' });

  const {
    contentType,
    setContentType,
    message,
    setMessage,
    password,
    setPassword,
    showMasterPwd,
    setShowMasterPwd,
    hasPassword,
    setHasPassword,
    burnAfterRead,
    setBurnAfterRead,
    maxViews,
    setMaxViews,
    expiresIn,
    setExpiresIn,
    hasHoney,
    setHasHoney,
    honeyPwd,
    setHoneyPwd,
    showHoneyPwd,
    setShowHoneyPwd,
    honeyContent,
    setHoneyContent,
    hasGeoLock,
    setHasGeoLock,
    allowedCountries,
    setAllowedCountries,
    hasDeadMans,
    setHasDeadMans,
    deadMansInterval,
    setDeadMansInterval,
    hasCanary,
    setHasCanary,
    canaryUrl,
    setCanaryUrl,
    hasTimeLock,
    setHasTimeLock,
    unlockAt,
    setUnlockAt,
    jYear,
    setJYear,
    jMonth,
    setJMonth,
    jDay,
    setJDay,
    jHour,
    setJHour,
    jMinute,
    setJMinute,
    hasSelfDestruct,
    setHasSelfDestruct,
    selfDestructHides,
    setSelfDestructHides,
    selfDestructTriggers,
    setSelfDestructTriggers,
    hasAsnLock,
    setHasAsnLock,
    asnMode,
    setAsnMode,
    asnSelected,
    setAsnSelected,
    selectedFile,
    setSelectedFile,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    setStegoCapacity,
    resetVaultState,
  } = vault;

  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [showKeyboardWarning, setShowKeyboardWarning] = useState(false);

  const [disabledInputs, setDisabledInputs] = useState<Record<string, boolean>>({});

  const triggerKeyboardWarning = (inputId: string) => {
    setShowKeyboardWarning(true);
    setDisabledInputs(prev => ({ ...prev, [inputId]: true }));
    setTimeout(() => {
      setDisabledInputs(prev => ({ ...prev, [inputId]: false }));
    }, 2000);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, inputId: string, onEnterKey?: () => void) => {
    if (disabledInputs[inputId]) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      if (onEnterKey) onEnterKey();
      return;
    }
    if (e.key.length === 1) {
      if (!isAsciiChar(e.key)) {
        e.preventDefault();
        triggerKeyboardWarning(inputId);
      }
    }
  };

  const handlePasswordChange = (
    value: string,
    setValue: (v: string) => void,
    inputId: string
  ) => {
    if (disabledInputs[inputId]) return;
    let hasNonAscii = false;
    let cleanValue = '';
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (isAsciiChar(char)) {
        cleanValue += char;
      } else {
        hasNonAscii = true;
      }
    }
    if (hasNonAscii) {
      setValue(cleanValue);
      triggerKeyboardWarning(inputId);
    } else {
      setValue(value);
    }
  };

  const handleFileChangeDirect = async (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const W = getWasm();
      if (W && typeof W.stego_capacity_png === 'function') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pngBytes = new Uint8Array(arrayBuffer);
          const cap = W.stego_capacity_png(pngBytes);
          setStegoCapacity(cap);
        } catch (e) {
          console.error("WASM stego_capacity_png error :", e);
        }
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setStegoImage(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setStegoImage(null);
    }
  };

  const isConfigurationValid = () => {
    if (contentType === 'text' && !message.trim()) return false;
    if (contentType === 'file' && !selectedFile) return false;
    if (contentType === 'image' && !selectedFile) return false;
    if (contentType === 'stego' && (!selectedFile || !message.trim())) return false;
    if (contentType === 'audio') {
      if (audioMode === 'record' && !audioBlob) return false;
      if (audioMode === 'stego' && (!audioWavBytes || !audioText.trim())) return false;
    }
    if (contentType === 'e2e') return false;

    if (!hasPassword || !password) return false;
    if (hasHoney && (!honeyPwd || !honeyContent.trim())) return false;
    if (hasGeoLock && allowedCountries.length === 0) return false;
    if (hasDeadMans && !deadMansInterval) return false;
    if (hasCanary && !canaryUrl.trim()) return false;
    if (hasTimeLock && !unlockAt) return false;
    if (hasAsnLock && !asnSelected.trim()) return false;

    return true;
  };

  const handleCreate = async () => {
    const isContentMissing = 
      (contentType === 'text' && !message.trim()) ||
      (contentType === 'file' && !selectedFile) ||
      (contentType === 'image' && !selectedFile) ||
      (contentType === 'stego' && (!selectedFile || !message.trim())) ||
      (contentType === 'audio' && audioMode === 'record' && !audioBlob) ||
      (contentType === 'audio' && audioMode === 'stego' && (!audioWavBytes || !audioText.trim()));

    if (isContentMissing) {
      setShowContentWarning(true);
      return;
    }

    if (!hasPassword) {
      setShowPasswordWarning(true);
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      let payloadData = '';
      let originalName = '';
      let mimeType = '';
      let size = 0;

      const W = getWasm();
      if (W && typeof W.encrypt_payload === 'function' && !hasHoney) {
        let rawDataBytes: Uint8Array;
        if (contentType === 'text') {
          rawDataBytes = new TextEncoder().encode(message);
          size = rawDataBytes.length;
        } else if (contentType === 'file' || contentType === 'image') {
          if (!selectedFile) throw new Error("No file selected");
          const arrayBuf = await selectedFile.arrayBuffer();
          rawDataBytes = new Uint8Array(arrayBuf);
          originalName = selectedFile.name;
          mimeType = selectedFile.type;
          size = selectedFile.size;
        } else if (contentType === 'stego') {
          if (!selectedFile || !message) throw new Error("Cover image and hidden message are required");
          const coverB64 = await getFileBase64(selectedFile);
          const hideRes = await fetch('/api/stego/hide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: coverB64, message })
          });
          const hideData = await hideRes.json();
          if (!hideRes.ok) throw new Error(hideData.error);
          const blob = b64toBlob(hideData.image, 'image/png');
          rawDataBytes = new Uint8Array(await blob.arrayBuffer());
          originalName = 'stego.png';
          mimeType = 'image/png';
          size = rawDataBytes.length;
        } else if (contentType === 'audio') {
          if (audioMode === 'record') {
            if (!audioBlob) throw new Error("No recording found");
            rawDataBytes = new Uint8Array(await audioBlob.arrayBuffer());
            originalName = 'voice.webm';
            mimeType = 'audio/webm';
            size = audioBlob.size;
          } else {
            if (!audioWavBytes) throw new Error("No WAV audio cover file loaded");
            if (!audioText) throw new Error("No secret message provided");
            if (!audioEmbedPassword) throw new Error("No audio stego password provided");

            const modifiedWav = await audioStegoEmbed(audioWavBytes, audioText, audioEmbedPassword);
            rawDataBytes = modifiedWav;
            originalName = audioFilename || 'stego.wav';
            mimeType = 'audio/wav';
            size = modifiedWav.length;
          }
        } else {
          throw new Error("Invalid content type");
        }

        const [cid, ckey, encBytes] = W.encrypt_payload(rawDataBytes, password);
        const encBase64 = b64url_encode(encBytes);

        const payload = {
          data: encBase64,
          password: null,
          expires_in: expiresIn,
          burn_after_read: burnAfterRead,
          max_views: maxViews === '' ? null : maxViews,
          has_password: true,
          has_honey: false,
          honey_data: null,
          honey_password: null,
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
          custom_id: cid,
          is_wasm_encrypted: true,
          is_pre_encrypted: true
        };

        const res = await fetch('/api/paste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        const finalId = contentType === 'text' ? result.id : `file-${result.id}`;
        const finalKey = ckey;
        setResultUrl(`${window.location.origin}/#${finalId}:${finalKey}`);
        setStatus({ type: 'ok', msg: t.securelyStored || 'Secret encrypted & stored successfully!' });

      } else {
        // Fallback server-side
        if (contentType === 'text') {
          payloadData = message;
          size = new TextEncoder().encode(message).length;
        } else if (contentType === 'file' || contentType === 'image') {
          if (!selectedFile) throw new Error("No file selected");
          payloadData = await getFileBase64(selectedFile);
          originalName = selectedFile.name;
          mimeType = selectedFile.type;
          size = selectedFile.size;
        } else if (contentType === 'stego') {
          if (!selectedFile || !message) throw new Error("Cover image and hidden message are required");
          const coverB64 = await getFileBase64(selectedFile);
          const hideRes = await fetch('/api/stego/hide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: coverB64, message })
          });
          const hideData = await hideRes.json();
          if (!hideRes.ok) throw new Error(hideData.error);
          payloadData = hideData.image;
          originalName = 'stego.png';
          mimeType = 'image/png';
          size = b64toBlob(payloadData, 'image/png').size;
        } else if (contentType === 'audio') {
          if (audioMode === 'record') {
            if (!audioBlob) throw new Error("No recording found");
            payloadData = await getFileBase64(audioBlob);
            originalName = 'voice.webm';
            mimeType = 'audio/webm';
            size = audioBlob.size;
          } else {
            if (!audioWavBytes) throw new Error("No WAV audio cover file loaded");
            if (!audioText) throw new Error("No secret message provided");
            if (!audioEmbedPassword) throw new Error("No audio stego password provided");

            const modifiedWav = await audioStegoEmbed(audioWavBytes, audioText, audioEmbedPassword);
            let binary = '';
            for (let i = 0; i < modifiedWav.byteLength; i++) {
              binary += String.fromCharCode(modifiedWav[i]);
            }
            payloadData = btoa(binary);
            originalName = audioFilename || 'stego.wav';
            mimeType = 'audio/wav';
            size = modifiedWav.length;
          }
        } else {
          throw new Error("Invalid content type");
        }

        const payload = {
          data: payloadData,
          password: hasPassword ? password : null,
          expires_in: expiresIn,
          burn_after_read: burnAfterRead,
          max_views: maxViews === '' ? null : maxViews,
          has_password: hasPassword,
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

        const finalId = contentType === 'text' ? result.id : `file-${result.id}`;
        const finalKey = hasPassword ? 'pwd' : result.key;
        setResultUrl(`${window.location.origin}/#${finalId}:${finalKey}`);
        setStatus({ type: 'ok', msg: t.securelyStored || 'Secret stored successfully!' });
      }
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateForm = () => {
    resetVaultState();
    setResultUrl(null);
  };

  return {
    contentType,
    setContentType,
    message,
    setMessage,
    password,
    setPassword,
    hasPassword,
    setHasPassword,
    burnAfterRead,
    setBurnAfterRead,
    maxViews,
    setMaxViews,
    expiresIn,
    setExpiresIn,
    hasHoney,
    setHasHoney,
    honeyPwd,
    setHoneyPwd,
    honeyContent,
    setHoneyContent,
    hasGeoLock,
    setHasGeoLock,
    allowedCountries,
    setAllowedCountries,
    hasDeadMans,
    setHasDeadMans,
    deadMansInterval,
    setDeadMansInterval,
    hasCanary,
    setHasCanary,
    canaryUrl,
    setCanaryUrl,
    hasTimeLock,
    setHasTimeLock,
    unlockAt,
    setUnlockAt,
    jYear,
    setJYear,
    jMonth,
    setJMonth,
    jDay,
    setJDay,
    jHour,
    setJHour,
    jMinute,
    setJMinute,
    hasSelfDestruct,
    setHasSelfDestruct,
    selfDestructHides,
    setSelfDestructHides,
    selfDestructTriggers,
    setSelfDestructTriggers,
    hasAsnLock,
    setHasAsnLock,
    asnMode,
    setAsnMode,
    asnSelected,
    setAsnSelected,
    selectedFile,
    setSelectedFile,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    isLoading,
    setIsLoading,
    resultUrl,
    setResultUrl,
    showPasswordWarning,
    setShowPasswordWarning,
    showContentWarning,
    setShowContentWarning,
    showKeyboardWarning,
    setShowKeyboardWarning,
    disabledInputs,
    handlePasswordKeyDown,
    handlePasswordChange,
    handleFileChangeDirect,
    isConfigurationValid,
    handleCreate,
    resetCreateForm,
  };
}
