import React, { useState, useRef } from 'react';
import { ContentType, Language } from '../types';
import { getWasm, b64url_encode } from '../utils/wasmLoader';
import { getFileBase64, b64toBlob } from '../utils/fileHelpers';
import { audioStegoEmbed } from '../utils/audioStego';
import { savePasteMetadata } from '../utils/pasteStorage';

export interface UseCreatePayloadProps {
  t: any;
  language: Language;
  contentType: ContentType;
  message: string;
  audioBlob: Blob | null;
  audioMode: 'record' | 'stego';
  audioWavBytes: Uint8Array | null;
  audioText: string;
  audioFilename: string;
  audioEmbedPassword: string;
  hasPassword: boolean;
  password: string;
  hasHoney: boolean;
  honeyPwd: string;
  honeyContent: string;
  expiresIn: number;
  burnAfterRead: boolean;
  maxViews: number | '';
  hasGeoLock: boolean;
  allowedCountries: string[];
  hasDeadMans: boolean;
  deadMansInterval: number | null;
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

  setShowContentWarning: (show: boolean) => void;
  setShowPasswordWarning: (show: boolean) => void;
  setStatus: (status: any) => void;
  setResultUrl: (url: string | null) => void;
}

export const useCreatePayload = ({
  t,
  language,
  contentType,
  message,
  audioBlob,
  audioMode,
  audioWavBytes,
  audioText,
  audioFilename,
  audioEmbedPassword,
  hasPassword,
  password,
  hasHoney,
  honeyPwd,
  honeyContent,
  expiresIn,
  burnAfterRead,
  maxViews,
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
  setShowContentWarning,
  setShowPasswordWarning,
  setStatus,
  setResultUrl,
}: UseCreatePayloadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [stegoCapacity, setStegoCapacity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);

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
          console.error("WASM stego_capacity_png error:", e);
        }
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setStegoImage(event.target?.result as string);
          if (stegoCanvasRef.current) {
            const ctx = stegoCanvasRef.current.getContext('2d');
            stegoCanvasRef.current.width = img.width;
            stegoCanvasRef.current.height = img.height;
            ctx?.drawImage(img, 0, 0);
            if (!W || typeof W.stego_capacity_png !== 'function') {
              setStegoCapacity(Math.floor((img.width * img.height * 3) / 8) - 4);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileChangeDirect(e.target.files[0]);
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
    if (contentType === 'shamir') return false;
    if (contentType === 'e2e') return false;

    if (!hasPassword || !password) return false;
    if (hasHoney && (!honeyPwd || !honeyContent.trim())) return false;
    if (hasGeoLock && allowedCountries.length === 0) return false;
    if (hasDeadMans && !deadMansInterval) return false;
    if (hasCanary && !canaryUrl.trim()) return false;
    if (hasTimeLock && !unlockAt) return false;
    if (hasSelfDestruct && (!selfDestructHides || selfDestructHides <= 0 || selfDestructTriggers.length === 0)) return false;

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

    if (!password) {
      setShowPasswordWarning(true);
      return;
    }

    if (!isConfigurationValid()) {
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

      if (W && !isE2e) {
        const encoder = new TextEncoder();
        let mainEnc: any;

        if (contentType === 'text') {
          const rawBytes = encoder.encode(message);
          if (hasPassword) {
            mainEnc = W.encrypt_with_password(rawBytes, password);
          } else {
            mainEnc = W.encrypt_with_random_key(rawBytes);
          }
          size = rawBytes.length;
        } else if (contentType === 'file' || contentType === 'image') {
          if (!selectedFile) throw new Error("No file selected");
          const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
          const kindNum = contentType === 'image' ? 2 : 0;
          if (hasPassword) {
            mainEnc = W.encrypt_file_with_password(fileBytes, selectedFile.name, selectedFile.type, kindNum, password);
          } else {
            mainEnc = W.encrypt_file_with_random_key(fileBytes, selectedFile.name, selectedFile.type, kindNum);
          }
          originalName = selectedFile.name;
          mimeType = selectedFile.type;
          size = selectedFile.size;
        } else if (contentType === 'stego') {
          if (!selectedFile || !message) throw new Error("Cover image and hidden message are required");
          const coverBytes = new Uint8Array(await selectedFile.arrayBuffer());
          const secretBytes = encoder.encode(message);
          const outPngBytes = W.stego_hide(coverBytes, secretBytes, password || '');
          const kindNum = 2;
          if (hasPassword) {
            mainEnc = W.encrypt_file_with_password(outPngBytes, 'stego.png', 'image/png', kindNum, password);
          } else {
            mainEnc = W.encrypt_file_with_random_key(outPngBytes, 'stego.png', 'image/png', kindNum);
          }
          originalName = 'stego.png';
          mimeType = 'image/png';
          size = outPngBytes.length;
        } else if (contentType === 'audio') {
          if (audioMode === 'record') {
            if (!audioBlob) throw new Error("No recording found");
            const fileBytes = new Uint8Array(await audioBlob.arrayBuffer());
            const kindNum = 1;
            if (hasPassword) {
              mainEnc = W.encrypt_file_with_password(fileBytes, 'voice.webm', 'audio/webm', kindNum, password);
            } else {
              mainEnc = W.encrypt_file_with_random_key(fileBytes, 'voice.webm', 'audio/webm', kindNum);
            }
            originalName = 'voice.webm';
            mimeType = 'audio/webm';
            size = audioBlob.size;
          } else {
            if (!audioWavBytes) throw new Error("No WAV audio cover file loaded");
            if (!audioText) throw new Error("No secret message provided");
            if (!audioEmbedPassword) throw new Error("No audio stego password provided");

            const modifiedWav = W.audio_stego_embed(audioWavBytes, audioText, audioEmbedPassword);
            const kindNum = 0;
            if (hasPassword) {
              mainEnc = W.encrypt_file_with_password(modifiedWav, audioFilename || 'stego.wav', 'audio/wav', kindNum, password);
            } else {
              mainEnc = W.encrypt_file_with_random_key(modifiedWav, audioFilename || 'stego.wav', 'audio/wav', kindNum);
            }
            originalName = audioFilename || 'stego.wav';
            mimeType = 'audio/wav';
            size = modifiedWav.length;
          }
        }

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
          has_password: hasPassword,
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
        const finalKey = hasPassword ? 'pwd' : b64url_encode(mainEnc.key);
        setResultUrl(`${window.location.origin}/#${finalId}:${finalKey}`);
        setStatus({ type: 'ok', msg: t.securelyStored });

        // Save metadata to local storage for metrics tracking
        const nowSec = Math.floor(Date.now() / 1000);
        savePasteMetadata({
          id: finalId,
          createdAt: nowSec,
          expiresAt: expiresIn > 0 ? nowSec + expiresIn : 0,
          kind: contentType,
          burnAfterRead: burnAfterRead,
        });

      } else {
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
            const len = modifiedWav.byteLength;
            for (let i = 0; i < len; i++) {
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
        setStatus({ type: 'ok', msg: t.securelyStored });

        // Save metadata to local storage for metrics tracking
        const nowSec = Math.floor(Date.now() / 1000);
        savePasteMetadata({
          id: finalId,
          createdAt: nowSec,
          expiresAt: expiresIn > 0 ? nowSec + expiresIn : 0,
          kind: contentType,
          burnAfterRead: burnAfterRead,
        });
      }

    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreatePayload = () => {
    setSelectedFile(null);
    setStegoImage(null);
    setStegoCapacity(0);
  };

  return {
    selectedFile, setSelectedFile,
    stegoImage, setStegoImage,
    stegoCapacity, setStegoCapacity,
    isLoading, setIsLoading,
    stegoCanvasRef,
    handleFileChangeDirect,
    handleFileSelect,
    isConfigurationValid,
    handleCreate,
    resetCreatePayload,
  };
};
