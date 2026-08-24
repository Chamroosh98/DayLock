import React, { useState, useRef, useEffect } from 'react';
import { CreateTabProps } from '../types';
import { getFileBase64, b64toBlob } from '../utils';
import { COUNTRIES } from '../../../data/countries';
import { jalaliToGregorian, gregorianToJalali } from '../../../utils/jalaliConverter';
import { localizeDigitsValue, toPersianDigits, toEnglishDigits } from '../../../utils/numberConverter';
import { e2eGenKeypair } from '../../../utils/e2eCrypto';
import { getWavCapacity, wavToFloat32, audioStegoEmbed } from '../../../utils/audioStego';
import { getWasm, b64url_encode, b64toUint8Array } from '../../../utils/wasmLoader';
import { useVaultState } from '../../../hooks/useVaultState';
import { convertImageToPng, calculateStegoCapacity, formatStegoSize } from '../../../utils/imageProcessor';

export const useCreateLogic = (props: CreateTabProps) => {
  const {
    contentType,
    setContentType,
    imageAcquisition,
    setImageAcquisition,
    language,
    t,
    status,
    setStatus,
    isLoading,
    setIsLoading,
    setShowPasswordWarning,
    setShowContentWarning,
    copyToClipboardWithAutoClear,
    resetTrigger
  } = props;

  // Vault State
  const vault = useVaultState({ language, initialContentType: contentType });

  const {
    message,
    setMessage,
    undoMessage,
    redoMessage,
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

  const [showAudioEmbedPwd, setShowAudioEmbedPwd] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [hoveredShamirTrash, setHoveredShamirTrash] = useState<number | null>(null);

  const [shamirSecret, setShamirSecret] = useState('');
  const [shamirTotal, setShamirTotal] = useState(5);
  const [shamirThreshold, setShamirThreshold] = useState(3);
  const [shamirShares, setShamirShares] = useState<string[]>([]);
  const [shamirCombineInputs, setShamirCombineInputs] = useState<string[]>(['', '', '']);
  const [shamirResult, setShamirResult] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stegoResultFile, setStegoResultFile] = useState<{ blob: Blob; url: string; filename: string } | null>(null);

  // Audio Stego State
  const [audioWavBytes, setAudioWavBytes] = useState<Uint8Array | null>(null);
  const [audioFilename, setAudioFilename] = useState('');
  const [audioText, setAudioText] = useState('');
  const [audioWavCapacity, setAudioWavCapacity] = useState(0);
  const [audioWaveformSamples, setAudioWaveformSamples] = useState<Float32Array | null>(null);
  const [audioEmbedPassword, setAudioEmbedPassword] = useState('');
  const [audioMode, setAudioMode] = useState<'record' | 'stego'>('record');

  // E2E Message Board State
  const [e2eKeyPair, setE2EKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(() => {
    const saved = localStorage.getItem('daylock_e2e_keypair');
    return saved ? JSON.parse(saved) : null;
  });
  const [e2eChannelDetails, setE2EChannelDetails] = useState<{ id: string; expires_at: number } | null>(null);
  const [isE2ELoading, setIsE2ELoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Filter countries
  const countryResults = countrySearch.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.fa.includes(countrySearch)
      ).slice(0, 5)
    : [];

  // Reset form when trigger changes
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      resetCreateForm();
    }
  }, [resetTrigger]);

  const resetCreateForm = () => {
    setMessage('');
    setPassword('');
    setHasPassword(true);
    setBurnAfterRead(false);
    setMaxViews('');
    setExpiresIn(86400);
    setHasHoney(false);
    setHoneyPwd('');
    setHoneyContent('');
    setHasGeoLock(false);
    setAllowedCountries([]);
    setCountrySearch('');
    setHasDeadMans(false);
    setDeadMansInterval(86400);
    setHasCanary(false);
    setCanaryUrl('');
    setHasTimeLock(false);
    setUnlockAt(null);
    setHasSelfDestruct(false);
    setSelfDestructHides(3);
    setSelfDestructTriggers(['tab']);
    setShamirSecret('');
    setShamirShares([]);
    setShamirCombineInputs(['', '', '']);
    setShamirResult(null);
    setSelectedFile(null);
    setAudioBlob(null);
    setStegoImage(null);
    setResultUrl(null);
    if (stegoResultFile?.url) {
      URL.revokeObjectURL(stegoResultFile.url);
    }
    setStegoResultFile(null);

    setHasAsnLock(false);
    setAsnMode('block');
    setAsnSelected('');

    setAudioWavBytes(null);
    setAudioFilename('');
    setAudioText('');
    setAudioWavCapacity(0);
    setAudioWaveformSamples(null);
    setAudioEmbedPassword('');

    setE2EChannelDetails(null);
  };

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    return localizeDigitsValue(formatted, language);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (err) {
        setStatus({ type: 'err', msg: t.micDenied });
      }
    }
  };

  const handleFileChangeDirect = async (file: File) => {
    setSelectedFile(file);

    // Architectural limits warning
    if (file.type.startsWith('image/')) {
      if (file.size > 25 * 1024 * 1024) {
        setStatus({ type: 'warn', msg: t.imageSizeWarning || "Image exceeds 25 MB. Processing might take a few moments." });
      }
    } else {
      if (file.size > 25 * 1024 * 1024) {
        setStatus({ type: 'warn', msg: t.fileSizeWarning || "File size exceeds 25 MB. In-browser encryption may experience latency." });
      }
    }

    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) {
      try {
        const processed = await convertImageToPng(file, file.name);
        setSelectedFile(processed.pngFile);
        setStegoImage(processed.dataUrl);
        setStegoCapacity(processed.capacityBytes);

        if (stegoCanvasRef.current) {
          const ctx = stegoCanvasRef.current.getContext('2d');
          stegoCanvasRef.current.width = processed.width;
          stegoCanvasRef.current.height = processed.height;
          const img = new Image();
          img.onload = () => ctx?.drawImage(img, 0, 0);
          img.src = processed.dataUrl;
        }

        setStatus({
          type: 'ok',
          msg: language === 'fa'
            ? `تصویر با موفقیت بارگذاری شد (گنجایش: ${formatStegoSize(processed.capacityBytes, language)})`
            : `Image loaded (Stego capacity: ${formatStegoSize(processed.capacityBytes, language)})`
        });
      } catch (err: any) {
        console.error("Error processing cover image:", err);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setStegoImage(event.target?.result as string);
            const cap = calculateStegoCapacity(img.width, img.height);
            setStegoCapacity(cap);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileChangeDirect(e.target.files[0]);
    }
  };

  const handleShamirTotalChangeFA = (valStr: string) => {
    const eng = toEnglishDigits(valStr);
    const parsed = parseInt(eng, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(15, parsed));
      setShamirTotal(clamped);
      if (shamirThreshold > clamped) {
        setShamirThreshold(Math.max(2, clamped));
      }
    } else if (valStr === '') {
      setShamirTotal(0);
    }
  };

  const handleShamirThresholdChangeFA = (valStr: string) => {
    const eng = toEnglishDigits(valStr);
    const parsed = parseInt(eng, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(2, Math.min(shamirTotal || 15, parsed));
      setShamirThreshold(clamped);
    } else if (valStr === '') {
      setShamirThreshold(0);
    }
  };

  const handleShamirTotalBlurFA = () => {
    if (shamirTotal < 3) {
      setShamirTotal(3);
    }
    if (shamirThreshold > shamirTotal) {
      setShamirThreshold(shamirTotal);
    }
  };

  const handleShamirThresholdBlurFA = () => {
    if (shamirThreshold < 2) {
      setShamirThreshold(2);
    } else if (shamirThreshold > shamirTotal) {
      setShamirThreshold(shamirTotal);
    }
  };

  const handleShamirSplit = async () => {
    if (!shamirSecret) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/shamir/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: shamirSecret, total: shamirTotal, threshold: shamirThreshold })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShamirShares(data.shares);
      setStatus({ type: 'ok', msg: t.shamirSplit });
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShamirCombine = async () => {
    const validShares = shamirCombineInputs
      .filter(s => s.trim())
      .map(s => toEnglishDigits(s));
    if (validShares.length < 2) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/shamir/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: validShares })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShamirResult(data.secret);
      setStatus({ type: 'ok', msg: t.shamirCombine });
    } catch (err: any) {
      setStatus({ type: 'err', msg: t.invalidPassword });
    } finally {
      setIsLoading(false);
    }
  };

  const validateConfiguration = (): string | null => {
    if (contentType === 'text' && !message.trim()) return t.contentWarningDesc || "Please enter text message.";
    if (contentType === 'file' && !selectedFile) return t.contentWarningDesc || "Please select a file.";
    if (contentType === 'image' && !selectedFile) return t.contentWarningDesc || "Please select an image.";
    if (contentType === 'stego') {
      if (!selectedFile) return language === 'fa' ? 'لطفاً تصویر پوشش را انتخاب کنید.' : 'Please select a cover image.';
      if (!message.trim()) return language === 'fa' ? 'لطفاً پیام مخفی را وارد کنید.' : 'Please enter the secret message to hide.';
    }
    if (contentType === 'audio') {
      if (audioMode === 'record' && !audioBlob) return language === 'fa' ? 'لطفاً صدای خود را ضبط کنید.' : 'Please record audio first.';
      if (audioMode === 'stego') {
        if (!audioWavBytes) return language === 'fa' ? 'لطفاً فایل صوتی WAV را بارگذاری کنید.' : 'Please load a WAV audio file.';
        if (!audioText.trim()) return language === 'fa' ? 'لطفاً پیام مخفی صوتی را وارد کنید.' : 'Please enter secret message for audio.';
      }
    }
    if (contentType !== 'stego' && hasPassword && !password) return t.invalidPassword || "Password is required.";
    if (hasHoney && (!honeyPwd || !honeyContent.trim())) return language === 'fa' ? 'اطلاعات هانی‌پات ناقص است.' : 'HoneyPot decoy configuration is incomplete.';
    if (hasGeoLock && allowedCountries.length === 0) return language === 'fa' ? 'حداقل یک کشور برای قفل مکانی انتخاب کنید.' : 'Please select at least one country for Geo-Lock.';
    if (hasDeadMans && !deadMansInterval) return language === 'fa' ? 'بازه زمانی کلید مرگ را مشخص کنید.' : 'Please specify Dead Man interval.';
    if (hasCanary && !canaryUrl.trim()) return language === 'fa' ? 'آدرس توکن قناری را وارد کنید.' : 'Please enter Canary token webhook URL.';
    if (hasTimeLock && !unlockAt) return language === 'fa' ? 'زمان بازگشایی را مشخص کنید.' : 'Please specify Time-Lock unlock time.';
    if (hasSelfDestruct && (!selfDestructHides || selfDestructHides <= 0 || selfDestructTriggers.length === 0)) return language === 'fa' ? 'تنظیمات نابودی خودکار ناقص است.' : 'Self-destruct configuration incomplete.';

    return null;
  };

  const isConfigurationValid = () => {
    return validateConfiguration() === null;
  };

  const handleCreateE2EChannel = async () => {
    if (!e2eKeyPair) return;
    setIsE2ELoading(true);
    setStatus({ type: 'warn', msg: "Registering secure E2E Channel on backend..." });
    try {
      const payload = {
        is_e2e_channel: true,
        e2e_public_key: e2eKeyPair.publicKey,
        expires_in: expiresIn,
        block_asns: hasAsnLock && asnMode === 'block' ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
        allow_asns: hasAsnLock && asnMode === 'allow' ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to establish E2E Channel.");

      setE2EChannelDetails({ id: data.id, expires_at: data.expires_at });
      
      const shareUrl = `${window.location.origin}/#e2e-${data.id}`;
      setResultUrl(shareUrl);
      setStatus({ type: 'ok', msg: "E2E Channel spawned! Link copied to clipboard." });
      copyToClipboardWithAutoClear(shareUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsE2ELoading(false);
    }
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
      if (contentType === 'stego') {
        if (!selectedFile) {
          setStatus({
            type: 'err',
            msg: language === 'fa' ? 'لطفاً ابتدا یک تصویر به عنوان پوشش انتخاب کنید یا عکس بگیرید.' : 'Please select or capture a cover image first.'
          });
        } else {
          setStatus({
            type: 'err',
            msg: language === 'fa' ? 'لطفاً پیام مخفی مورد نظر را در کادر متن وارد کنید.' : 'Please enter the secret message to hide.'
          });
        }
      }
      return;
    }

    if (contentType !== 'stego' && !password) {
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
          throw new Error(language === 'fa' ? "تصویر پوششی و متن مخفی هر دو الزامی هستند." : "Cover image and hidden message are required");
        }

        const encoder = new TextEncoder();
        const secretBytes = encoder.encode(message);

        // Stego capacity validation
        if (stegoCapacity > 0 && secretBytes.length > stegoCapacity) {
          const excess = secretBytes.length - stegoCapacity;
          const msg = language === 'fa'
            ? `⚠️ حجم پیام مخفی (${formatStegoSize(secretBytes.length, language)}) بیشتر از گنجایش تصویر (${formatStegoSize(stegoCapacity, language)}) است! لطفاً متن را ${formatStegoSize(excess, language)} کوتاه‌تر کنید.`
            : `⚠️ Secret message (${formatStegoSize(secretBytes.length, language)}) exceeds image capacity (${formatStegoSize(stegoCapacity, language)})! Please shorten by ${formatStegoSize(excess, language)}.`;
          setStatus({ type: 'err', msg });
          setIsLoading(false);
          return;
        }

        setStatus({ type: 'warn', msg: language === 'fa' ? 'در حال تبدیل و پنهان‌سازی پیام درون پیکسل‌های تصویر ...' : 'Embedding hidden payload into image pixels ...' });

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

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStegoResultFile({ blob, url, filename });
        setStatus({ type: 'ok', msg: t.stegoEmbeddedSuccess || 'DayLock file embedded & downloaded successfully!' });
        return;
      }

      if (contentType === 'audio' && audioMode === 'stego') {
        if (!audioWavBytes) throw new Error("No WAV audio cover file loaded");
        if (!audioText.trim()) throw new Error("No secret message provided");
        const stegoPwd = audioEmbedPassword || password || '';

        let modifiedWav: Uint8Array;
        if (W && typeof W.audio_stego_embed === 'function') {
          modifiedWav = W.audio_stego_embed(audioWavBytes, audioText, stegoPwd);
        } else {
          modifiedWav = await audioStegoEmbed(audioWavBytes, audioText, stegoPwd);
        }

        const blob = new Blob([modifiedWav], { type: 'audio/wav' });
        const baseName = audioFilename ? audioFilename.replace(/\.[^/.]+$/, "") : 'DayLock';
        const filename = `DayLock_${baseName}.wav`;
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStegoResultFile({ blob, url, filename });
        setStatus({ type: 'ok', msg: t.stegoEmbeddedSuccess || 'DayLock audio embedded & downloaded successfully!' });
        return;
      }

      if (W && !isE2e) {
        // --- CLIENT-SIDE WASM ZERO-KNOWLEDGE ENCRYPTION ---
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
        } else if (contentType === 'audio' && audioMode === 'record') {
          if (!audioBlob) throw new Error("No recording found");
          const fileBytes = new Uint8Array(await audioBlob.arrayBuffer());
          const kindNum = 1; // Voice
          if (hasPassword) {
            mainEnc = W.encrypt_file_with_password(fileBytes, 'voice.webm', 'audio/webm', kindNum, password);
          } else {
            mainEnc = W.encrypt_file_with_random_key(fileBytes, 'voice.webm', 'audio/webm', kindNum);
          }
          originalName = 'voice.webm';
          mimeType = 'audio/webm';
          size = audioBlob.size;
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

      } else {
        // --- SERVER-SIDE FALLBACK ENCRYPTION ---
        if (contentType === 'text') {
          payloadData = message;
          size = new TextEncoder().encode(message).length;
        } else if (contentType === 'file' || contentType === 'image') {
          if (!selectedFile) throw new Error("No file selected");
          payloadData = await getFileBase64(selectedFile);
          originalName = selectedFile.name;
          mimeType = selectedFile.type;
          size = selectedFile.size;
        } else if (contentType === 'audio' && audioMode === 'record') {
          if (!audioBlob) throw new Error("No recording found");
          payloadData = await getFileBase64(audioBlob);
          originalName = 'voice.webm';
          mimeType = 'audio/webm';
          size = audioBlob.size;
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
      }
      
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    setMessage,
    undoMessage,
    redoMessage,
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
    showAudioEmbedPwd,
    setShowAudioEmbedPwd,
    honeyContent,
    setHoneyContent,
    hasGeoLock,
    setHasGeoLock,
    allowedCountries,
    setAllowedCountries,
    countrySearch,
    setCountrySearch,
    countryResults,
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
    hasSelfDestruct,
    setHasSelfDestruct,
    selfDestructHides,
    setSelfDestructHides,
    selfDestructTriggers,
    setSelfDestructTriggers,
    hoveredShamirTrash,
    setHoveredShamirTrash,
    shamirSecret,
    setShamirSecret,
    shamirTotal,
    setShamirTotal,
    shamirThreshold,
    setShamirThreshold,
    shamirShares,
    setShamirShares,
    shamirCombineInputs,
    setShamirCombineInputs,
    shamirResult,
    setShamirResult,
    selectedFile,
    setSelectedFile,
    isRecording,
    recordingTime,
    audioBlob,
    setAudioBlob,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    resultUrl,
    setResultUrl,
    stegoResultFile,
    setStegoResultFile,
    hasAsnLock,
    setHasAsnLock,
    asnMode,
    setAsnMode,
    asnSelected,
    setAsnSelected,
    audioWavBytes,
    setAudioWavBytes,
    audioFilename,
    setAudioFilename,
    audioText,
    setAudioText,
    audioWavCapacity,
    setAudioWavCapacity,
    audioWaveformSamples,
    setAudioWaveformSamples,
    audioEmbedPassword,
    setAudioEmbedPassword,
    audioMode,
    setAudioMode,
    e2eKeyPair,
    setE2EKeyPair,
    e2eChannelDetails,
    setE2EChannelDetails,
    isE2ELoading,
    stegoCanvasRef,
    formatTime,
    toggleRecording,
    handleFileChangeDirect,
    handleFileSelect,
    handleShamirTotalChangeFA,
    handleShamirThresholdChangeFA,
    handleShamirTotalBlurFA,
    handleShamirThresholdBlurFA,
    handleShamirSplit,
    handleShamirCombine,
    isConfigurationValid,
    handleCreateE2EChannel,
    handleCreate,
    resetCreateForm
  };
};
