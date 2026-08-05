import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Mic, Trash2, Square, Shield, Volume2, 
  Sparkles, Globe, Sun, Moon, Heart, 
  FileText, File, Image as ImageIcon, Search, 
  Eye, EyeOff, Edit3, Check, Copy, AlertCircle, Share2, 
  Download, Upload, Zap, Flame, ShieldAlert,
  Fingerprint, RefreshCw, HelpCircle, Skull, Bird, Clock, MapPin, QrCode, Camera,
  Headphones, MessageSquare, ChevronDown, Plus, X, Keyboard
} from 'lucide-react';
import WorldMap from './components/WorldMap';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { ContentType, MainTab, Language, Country } from './types';
import { COUNTRIES, Flag } from './data/countries';
import { translations } from './data/translations';
import { TrashIcon } from './components/TrashIcon';
import { MetaItem } from './components/MetaItem';
import { TypeTab } from './components/TypeTab';
import { OptionToggle } from './components/OptionToggle';
import { CustomSelect } from './components/CustomSelect';
import { Dropzone } from './components/Dropzone';
import { QrCodeHub } from './components/QrCodeHub';
import { CameraCapture } from './components/CameraCapture';
import { ShortcutManager } from './components/ShortcutManager';
import { ScreenSecurityGuard } from './components/ScreenSecurityGuard';
import { DecryptedPayloadShield } from './components/DecryptedPayloadShield';
import { DateTimePicker } from './components/DateTimePicker';
import { TravelerManualModal } from './components/TravelerManualModal';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { localizeDigitsValue, toPersianDigits, toEnglishDigits } from './utils/numberConverter';
import { jalaliToGregorian, gregorianToJalali, isJalaliLeapYear } from './utils/jalaliConverter';
import { e2eGenKeypair, e2eEncrypt, e2eDecrypt } from './utils/e2eCrypto';
import { audioStegoEmbed, audioStegoExtract, getWavCapacity, wavToFloat32, buildWav } from './utils/audioStego';
import { copyToClipboardWithAutoClear, forceClearClipboard } from './utils/clipboardManager';
import { isBiometricsSupported, registerBiometrics, verifyBiometrics } from './utils/webAuthn';
import { getWasm, b64url_encode, b64url_decode, b64toUint8Array, uint8ArrayToB64 } from './utils/wasmLoader';

const formatExpirationDate = (expiresAtSeconds: number, lang: 'en' | 'fa') => {
  if (!expiresAtSeconds) return '—';
  const d = new Date(expiresAtSeconds * 1000);
  if (isNaN(d.getTime())) return '—';
  if (lang === 'fa') {
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jy}/${jm}/${jd} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return `${d.toLocaleDateString()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const HoneyPotIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Dipper stick */}
    <path d="M15 3 L19 7" strokeWidth="2.5" />
    <circle cx="19" cy="7" r="1.5" fill="currentColor" />
    
    {/* Jar top lid */}
    <rect x="6" y="6" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
    <rect x="6" y="6" width="12" height="3" rx="1.5" />
    
    {/* Jar body */}
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" fill="currentColor" opacity="0.05" />
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" />
    
    {/* Label on the jar */}
    <rect x="9" y="11" width="6" height="4" rx="1" fill="currentColor" opacity="0.15" />
    <text x="12" y="14" fontSize="5" fontWeight="bold" textAnchor="middle" stroke="none" fill="currentColor" className="font-sans">H</text>
  </svg>
);

const getFileBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const base64 = resultString.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const b64toBlob = (b64: string, type: string) => {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
};

const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Module-level registry to prevent reprocessing the same hash during React 18+ strict mode dual-mounts
const processedHashesSet = new Set<string>();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTrashAnimating, setIsTrashAnimating] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (language === 'fa') {
      document.documentElement.classList.add('lang-fa');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.classList.remove('lang-fa');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showDock, setShowDock] = useState(true);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryResults, setCountryResults] = useState<typeof COUNTRIES>([]);

  useEffect(() => {
    if (countrySearch.trim()) {
      const q = countrySearch.toLowerCase();
      const filtered = COUNTRIES.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) || 
        c.fa.includes(q)
      ).slice(0, 8);
      setCountryResults(filtered);
    } else {
      setCountryResults([]);
    }
  }, [countrySearch]);

  const startTour = () => {
    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: isDarkMode ? '#030409' : '#f4f4f5',
      overlayOpacity: 0.85,
      stagePadding: 6,
      popoverClass: isDarkMode ? 'driver-popover-dark' : 'driver-popover-light',
      nextBtnText: language === 'en' ? 'Next →' : 'بعدی ←',
      prevBtnText: language === 'en' ? '← Prev' : '→ قبلی',
      doneBtnText: language === 'en' ? 'Done ✓' : 'پایان ✓',
      steps: [
        // 1. All tabs in create tab (bulk container)
        { 
          element: '#content-type-selector', 
          popover: { 
            title: language === 'en' ? 'Payload Formats' : 'فرمت پیلود', 
            description: language === 'en' ? 'Select from six specialized templates: secure text, files, steganography, audio logs, secret splitting, or E2E chat rooms.' : 'از بین ۶ قالب تخصصی انتخاب کنید: پیام متنی، فایل امن، پنهان‌نگاری در تصویر، ضبط صدا، تقسیم راز یا چت امن دوطرفه.',
            side: "bottom", 
            align: 'start' 
          } 
        },

        // 2. All security options (bulk container)
        { 
          element: '#options-grid', 
          popover: { 
            title: language === 'en' ? 'Operational Controls' : 'گزینه‌های امنیتی و حفاظتی', 
            description: language === 'en' ? 'Configure zero-knowledge protection guards, including Password locks, self-destruct countdowns, geo-fences, and automatic Burn-on-Read.' : 'تنظیمات حفاظتی دانش-صفر مانند قفل عبور، حذف پس از خواندن، محدوده جغرافیایی مجاز، و تخریب خودکار را پیکربندی کنید.',
            side: "top", 
            align: 'start' 
          } 
        },

        // 3. Honeypot section and approach
        { 
          element: '#opt-honeypot', 
          popover: { 
            title: language === 'en' ? 'Honeypot Decoy' : 'تله فریب (هانی پات)', 
            description: language === 'en' ? 'Set a benign secondary passphrase linked to innocent cover-content. If compromised or forced to decrypt, providing the decoy reveals safe data while keeping your real secret invisible.' : 'یک رمز عبور فرعی برای شرایط اضطراری تعریف کنید. در صورت اجبار، ارائه این رمز عبور اطلاعاتی بی‌خطر را نشان داده و محتوای اصلی را پنهان نگه می‌دارد.',
            side: "top", 
            align: 'start' 
          } 
        }
      ]
    });
    d.drive();
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowDock(false);
      } else if (currentScrollY < lastScrollY) {
        setShowDock(true);
      }
      
      if (currentScrollY < 10) {
        setShowDock(true);
      }
      
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[language];
  const [mainTab, setMainTab] = useState<MainTab>('create');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [isMobileModeMenuOpen, setIsMobileModeMenuOpen] = useState(false);
  const [imageAcquisition, setImageAcquisition] = useState<'camera' | 'upload' | null>(null);

  // Touch Swipe Gesture State and Handlers for tab navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName.toLowerCase() === 'textarea' ||
      target.tagName.toLowerCase() === 'input' ||
      target.tagName.toLowerCase() === 'select' ||
      target.closest('.no-swipe') ||
      target.closest('.leaflet-container') ||
      target.closest('button') ||
      target.closest('[role="slider"]')
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      const tabs: ContentType[] = ['text', 'file', 'stego', 'audio', 'shamir', 'e2e'];
      const currentIndex = tabs.indexOf(contentType);
      
      if (diffX > 0) {
        if (currentIndex < tabs.length - 1) {
          const nextTab = tabs[currentIndex + 1];
          setContentType(nextTab);
          if (nextTab === 'stego') setImageAcquisition(null);
        }
      } else {
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1];
          setContentType(prevTab);
          if (prevTab === 'stego') setImageAcquisition(null);
        }
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };
  
  // Create State
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showMasterPwd, setShowMasterPwd] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [expiresIn, setExpiresIn] = useState(86400);
  const [hasHoney, setHasHoney] = useState(false);
  const [honeyPwd, setHoneyPwd] = useState('');
  const [showHoneyPwd, setShowHoneyPwd] = useState(false);
  const [showAudioEmbedPwd, setShowAudioEmbedPwd] = useState(false);
  const [showViewPwd, setShowViewPwd] = useState(false);
  const [showStegoExtractPwd, setShowStegoExtractPwd] = useState(false);
  const [honeyContent, setHoneyContent] = useState('');
  
  const [hasGeoLock, setHasGeoLock] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [hasDeadMans, setHasDeadMans] = useState(false);
  const [deadMansInterval, setDeadMansInterval] = useState<number | null>(86400);
  const [hasCanary, setHasCanary] = useState(false);
  const [canaryUrl, setCanaryUrl] = useState('');
  const [hasTimeLock, setHasTimeLock] = useState(false);
  const [unlockAt, setUnlockAt] = useState<number | null>(null);

  // Jalali Calendar states initialized dynamically
  const [jYear, setJYear] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [jy] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jy;
  });
  const [jMonth, setJMonth] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jm;
  });
  const [jDay, setJDay] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, , jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jd;
  });
  const [jHour, setJHour] = useState<number>(() => {
    return new Date().getHours();
  });
  const [jMinute, setJMinute] = useState<number>(() => {
    return new Date().getMinutes();
  });

  // Keep jYear, jMonth, jDay in sync with Gregorian unlockAt for Farsi language
  useEffect(() => {
    if (language === 'fa' && hasTimeLock) {
      try {
        const [gy, gm, gd] = jalaliToGregorian(jYear, jMonth, jDay);
        const gDate = new Date(gy, gm - 1, gd, jHour, jMinute, 0);
        setUnlockAt(Math.floor(gDate.getTime() / 1000));
      } catch (err) {
        console.error('Error converting Jalali to Gregorian:', err);
      }
    }
  }, [jYear, jMonth, jDay, jHour, jMinute, language, hasTimeLock]);
  
  const [hasSelfDestruct, setHasSelfDestruct] = useState(false);
  const [selfDestructHides, setSelfDestructHides] = useState(3);
  const [selfDestructTriggers, setSelfDestructTriggers] = useState<string[]>(['tab']);
  const [isSelfDestructed, setIsSelfDestructed] = useState(false);
  const [hidesCount, setHidesCount] = useState(0);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [showKeyboardWarning, setShowKeyboardWarning] = useState(false);
  const [showTravelerManual, setShowTravelerManual] = useState(false);
  const [manualDefaultTab, setManualDefaultTab] = useState<'overview' | 'shortcuts'>('overview');
  const handleOpenTravelerManual = (tab: 'overview' | 'shortcuts' = 'overview') => {
    setManualDefaultTab(tab);
    setShowTravelerManual(true);
  };
  const [showSecurityShield, setShowSecurityShield] = useState(false);
  const [hoveredShamirTrash, setHoveredShamirTrash] = useState<number | null>(null);

  const [shamirSecret, setShamirSecret] = useState('');
  const [shamirTotal, setShamirTotal] = useState(5);
  const [shamirThreshold, setShamirThreshold] = useState(3);
  const [shamirShares, setShamirShares] = useState<string[]>([]);
  const [shamirCombineInputs, setShamirCombineInputs] = useState<string[]>(['', '', '']);
  const [shamirResult, setShamirResult] = useState<string | null>(null);

  // Helper change and blur handlers for Farsi total/threshold support
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [stegoCapacity, setStegoCapacity] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'ok' | 'err' | 'warn', msg: string } | null>(null);

  // View State
  const [viewInput, setViewInput] = useState('');
  const [viewData, setViewData] = useState<any>(null);
  const [viewPassword, setViewPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [isHoneyView, setIsHoneyView] = useState(false);
  const [viewError, setViewError] = useState<{ type: 'geo' | 'time' | 'dms' | 'generic', data: any } | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [sharePendingContent, setSharePendingContent] = useState<string>('');

  // Trigger clipboard neutralization when decrypted content is closed / cleared
  useEffect(() => {
    if (!decryptedContent) {
      forceClearClipboard();
    }
  }, [decryptedContent]);

  // Auto-clear status (Toast) after 4 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const [disabledInputs, setDisabledInputs] = useState<Record<string, boolean>>({});

  const isAsciiChar = (char: string) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126;
  };

  const triggerKeyboardWarning = (inputId: string) => {
    setShowKeyboardWarning(true);
    
    setDisabledInputs(prev => ({ ...prev, [inputId]: true }));
    
    setTimeout(() => {
      setDisabledInputs(prev => ({ ...prev, [inputId]: false }));
    }, 2000);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => {
    if (disabledInputs[inputId]) {
      e.preventDefault();
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
    if (disabledInputs[inputId]) {
      return;
    }
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
  
  const [stegoExtractFile, setStegoExtractFile] = useState<File | null>(null);
  const [stegoExtractResult, setStegoExtractResult] = useState<string | null>(null);
  const [isStegoExtracting, setIsStegoExtracting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [stegoExtractPassword, setStegoExtractPassword] = useState('');

  // Biometric States
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [rememberWithBiometrics, setRememberWithBiometrics] = useState(false);
  const [hasBiometricsForCurrent, setHasBiometricsForCurrent] = useState(false);

  useEffect(() => {
    isBiometricsSupported().then(supported => {
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

  // ASN Lock State
  const [hasAsnLock, setHasAsnLock] = useState(false);
  const [asnMode, setAsnMode] = useState<'block' | 'allow'>('block');
  const [asnSelected, setAsnSelected] = useState('');

  // Audio Stego State
  const [audioWavBytes, setAudioWavBytes] = useState<Uint8Array | null>(null);
  const [audioFilename, setAudioFilename] = useState('');
  const [audioText, setAudioText] = useState('');
  const [audioWavCapacity, setAudioWavCapacity] = useState(0);
  const [audioWaveformSamples, setAudioWaveformSamples] = useState<Float32Array | null>(null);
  
  const [audioExtractFile, setAudioExtractFile] = useState<File | null>(null);
  const [audioExtractPassword, setAudioExtractPassword] = useState('');
  const [audioExtractResult, setAudioExtractResult] = useState<string | null>(null);
  const [isAudioExtracting, setIsAudioExtracting] = useState(false);
  
  const [audioWavPayload, setAudioWavPayload] = useState<Uint8Array | null>(null);
  const [audioEmbedPassword, setAudioEmbedPassword] = useState('');
  const [audioMode, setAudioMode] = useState<'record' | 'stego'>('record');

  // E2E Message Board State
  const [e2eKeyPair, setE2EKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(() => {
    const saved = localStorage.getItem('daylock_e2e_keypair');
    return saved ? JSON.parse(saved) : null;
  });
  const [e2eChannelDetails, setE2EChannelDetails] = useState<{ id: string; expires_at: number } | null>(null);
  const [e2eRecipientPubInput, setE2ERecipientPubInput] = useState('');
  const [e2eMessageText, setE2EMessageText] = useState('');
  const [e2eActiveMessages, setE2EActiveMessages] = useState<any[]>([]);
  const [isE2ELoading, setIsE2ELoading] = useState(false);

  // Dynamic bidirectional text direction detection helper
  const getAutoDir = (text: string) => {
    if (!text) return language === 'fa' ? 'rtl' : 'ltr';
    const arabicRange = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRange.test(text) ? 'rtl' : 'ltr';
  };

  const getAutoContainerClass = (text: string) => {
    const dir = getAutoDir(text);
    const fontClass = dir === 'rtl' ? 'font-vazir' : 'font-sans';
    const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';
    return `${fontClass} ${alignClass}`;
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- Effects ---
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      if (processedHashesSet.has(hash)) {
        try {
          window.history.replaceState("", document.title, window.location.pathname + window.location.search);
        } catch (e) {
          window.location.hash = "";
        }
        return;
      }

      processedHashesSet.add(hash);
      setMainTab('view');
      setViewInput(hash);
      // Clean hash from browser address bar immediately for security so refresh won't reload it!
      try {
        window.history.replaceState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = "";
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);



  // --- Handlers ---

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

  const isConfigurationValid = () => {
    // Check main content first matching its type
    if (contentType === 'text' && !message.trim()) return false;
    if (contentType === 'file' && !selectedFile) return false;
    if (contentType === 'image' && !selectedFile) return false;
    if (contentType === 'stego' && (!selectedFile || !message.trim())) return false;
    if (contentType === 'audio') {
      if (audioMode === 'record' && !audioBlob) return false;
      if (audioMode === 'stego' && (!audioWavBytes || !audioText.trim())) return false;
    }
    if (contentType === 'shamir') return false; // Shamir uses split button, not encrypt button
    if (contentType === 'e2e') return false; // E2E uses Spawn Channel button

    // Check features configured correctly if toggled
    if (!hasPassword || !password) return false;
    if (hasHoney && (!honeyPwd || !honeyContent.trim())) return false;
    if (hasGeoLock && allowedCountries.length === 0) return false;
    if (hasDeadMans && !deadMansInterval) return false;
    if (hasCanary && !canaryUrl.trim()) return false;
    if (hasTimeLock && !unlockAt) return false;
    if (hasSelfDestruct && (!selfDestructHides || selfDestructHides <= 0 || selfDestructTriggers.length === 0)) return false;

    return true;
  };

  const handleCreateE2EChannel = async () => {
    if (!e2eKeyPair) return;
    setIsE2ELoading(true);
    setStatus({ type: 'warn', msg: "Registering secure E2E Channel on backend ..." });
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
          let text = language === 'fa'
            ? "[خطا در رمزگشایی : بهم نخوردن کلید خصوصی]"
            : "[Decryption Failed : Private key mismatch]";
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
            text = language === 'fa'
              ? "[رمزگذاری شده : برای رمزگشایی ابتدا هویت E2E بساز]"
              : "[Encrypted: Generate E2E identity to decrypt]";
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

  const handleAudioExtract = async () => {
    if (!audioExtractFile) return;
    setIsAudioExtracting(true);
    setStatus({ type: 'warn', msg: "Decoding hidden data from WAV audio cover ..." });
    try {
      const arrayBuffer = await audioExtractFile.arrayBuffer();
      const wavBytes = new Uint8Array(arrayBuffer);
      const text = await audioStegoExtract(wavBytes, audioExtractPassword);
      setAudioExtractResult(text);
      setStatus({ type: 'ok', msg: "Steganography message extracted successfully!" });
    } catch (err: any) {
      setAudioExtractResult(null);
      setStatus({ type: 'err', msg: err.message || "Failed to extract message. Ensure the WAV is valid and the password is correct." });
    } finally {
      setIsAudioExtracting(false);
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
        } else if (contentType === 'stego') {
          if (!selectedFile || !message) throw new Error("Cover image and hidden message are required");
          const coverBytes = new Uint8Array(await selectedFile.arrayBuffer());
          const secretBytes = encoder.encode(message);
          const outPngBytes = W.stego_hide(coverBytes, secretBytes, password || '');
          const kindNum = 2; // Image
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
            const kindNum = 1; // Voice
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
            const kindNum = 0; // standard file
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
      }
      
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShatterExplosion = (colors: string[]) => {
    const isDark = document.documentElement.classList.contains('dark');
    const effectiveColors = colors.map(c => 
      c.toLowerCase() === '#ffffff' || c.toLowerCase() === '#fff'
        ? (isDark ? '#ffffff' : '#1e293b')
        : c
    );
    const card = document.getElementById('active-session-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('trigger-session-explosion', {
        detail: { rect, colors: effectiveColors }
      }));
    } else {
      // Fallback: burst from middle of viewport if container not found
      const rect = {
        x: window.innerWidth / 4,
        y: window.innerHeight / 3,
        width: window.innerWidth / 2,
        height: window.innerHeight / 3
      };
      window.dispatchEvent(new CustomEvent('trigger-session-explosion', {
        detail: { rect, colors: effectiveColors }
      }));
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
        setStatus({ type: 'err', msg: language === 'fa' ? 'لطفاً شناسه یا لینک معتبر وارد کن!' : 'Please enter a valid link or paste ID' });
        return;
      }
      
      // Support for E2E Channels
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
        setStatus({ type: 'err', msg: language === 'fa' ? 'شناسه پیست معتبر نیست' : 'Invalid paste ID' });
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
                    console.warn("WASM stego extraction failed on view :", stegoErr);
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
                console.error("Auto stego extraction failed   :", e);
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
      const imgB64 = await getFileBase64(stegoExtractFile);
      const cleanB64 = imgB64.includes(',') ? imgB64.split(',')[1] : imgB64;
      const res = await fetch('/api/stego/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: cleanB64 })
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
        has_password: false
      });

      setDecryptedContent({
        url,
        name: stegoExtractFile.name,
        type: stegoExtractFile.type || 'image/png',
        kind: 'stego',
        stegoText: data.message
      });

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
                  console.warn("WASM stego extraction failed on view :", stegoErr);
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
            console.error("Local WASM password decryption failed :", decErr);
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
              console.error("Auto stego extraction failed :", e);
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
          console.warn("Could not register biometrics :", biometricErr);
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

  const handleClearEverything = () => {
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
    setShamirResult(null);
    setSelectedFile(null);
    setAudioBlob(null);
    setStegoImage(null);
    setResultUrl(null);

    // Reset ASN Lock state
    setHasAsnLock(false);
    setAsnMode('block');
    setAsnSelected('');

    // Reset Audio Stego state
    setAudioWavBytes(null);
    setAudioFilename('');
    setAudioText('');
    setAudioWavCapacity(0);
    setAudioWaveformSamples(null);
    setAudioExtractFile(null);
    setAudioExtractPassword('');
    setAudioExtractResult(null);
    setIsAudioExtracting(false);
    setAudioWavPayload(null);
    setAudioEmbedPassword('');

    // Reset E2E state
    setE2EChannelDetails(null);
    setE2ERecipientPubInput('');
    setE2EMessageText('');
    setE2EActiveMessages([]);

    setStatus({ type: 'ok', msg: "SafePaste environment reset completed!" });
    setViewInput('');
    setViewData(null);
    setViewPassword('');
    setDecryptedContent(null);
    setStegoExtractFile(null);
    setStegoExtractResult(null);
    setIsStegoExtracting(false);
  };

  const handleToggleTab = () => {
    setMainTab((prev) => (prev === 'create' ? 'view' : 'create'));
  };

  return (
    <div dir={language === 'fa' ? 'rtl' : 'ltr'} className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-zinc-50 text-zinc-900'} ${language === 'fa' ? 'font-vazir lang-fa' : 'font-sans'} selection:bg-emerald-500/30 flex flex-col pt-12 pb-20 px-4 sm:px-6 md:pt-12 md:px-12 md:pb-24 lg:pb-16 overflow-x-hidden relative`}>
      <ExplosionOverlay />
      
      {/* Bottom Soft Blur & Fade Gradient to prevent content clutter under floating dock */}
      <div 
        className={`fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-[60] lg:hidden ${isDarkMode ? 'bg-[#0a0a0c]/75' : 'bg-zinc-50/75'}`}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)',
          maskImage: 'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      {/* Mobile Floating Dock - Primary Nav for Mobile/Tablet */}
      <div id="floating-dock" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] lg:hidden w-[92%] max-w-sm md:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: showDock ? 0 : 100, 
            opacity: showDock ? 1 : 0,
            scale: showDock ? 1 : 0.95
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={`flex items-center justify-between p-1.5 rounded-full backdrop-blur-2xl border shadow-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/10 shadow-black/50' : 'bg-white/60 border-zinc-200 shadow-zinc-200/50'}`}
        >
          <div className="flex gap-1 flex-1">
            <button 
              onClick={() => setMainTab('create')}
              className={`flex-1 py-2 md:py-2.5 flex items-center justify-center transition-all rounded-full ${mainTab === 'create' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
              title={t.create}
            >
              <Plus className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
            <button 
              onClick={() => setMainTab('view')}
              className={`flex-1 py-2 md:py-2.5 flex items-center justify-center transition-all rounded-full ${mainTab === 'view' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
              title={t.view}
            >
              <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
          </div>
          
          <div className={`w-px h-6 md:h-7 mx-2.5 md:mx-3 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
          
          <div className="flex items-center gap-1 md:gap-1 pe-1">
            <button
              id="screenshot-shield-btn-mobile"
              onClick={() => setShowSecurityShield(true)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center relative ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
              title={language === 'fa' ? 'مدیریت سپرهای حفاظتی صفحه' : 'Manage Screen Shield Engines'}
            >
              <Shield className="w-4 h-4 md:w-4.5 md:h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </button>
            <button
              onClick={() => handleOpenTravelerManual('overview')}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
            >
              <HelpCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
            >
              {language === 'en' ? 'FA' : 'EN'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'text-yellow-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-black/5'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Free IRAN Marquee - Perfect Seamless Infinite Loop */}
      <div dir="ltr" className={`fixed top-0 left-0 w-full ${isDarkMode ? 'bg-emerald-500/5 border-white/5' : 'bg-emerald-500/5 border-black/5'} border-b py-1.5 z-50 overflow-hidden backdrop-blur-md`}>
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-16 w-max"
        >
          {/* First loop block */}
          <div className="flex gap-16 pr-16 items-center">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={`loop1-${i}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                  {t.freeIran}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-red-400' : 'bg-red-600'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                  {t.helpIran}
                </span>
              </React.Fragment>
            ))}
          </div>
          {/* Identical cloned block for seamless transition */}
          <div className="flex gap-16 pr-16 items-center" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={`loop2-${i}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                  {t.freeIran}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-red-400' : 'bg-red-600'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                  {t.helpIran}
                </span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating System Panel - Perfectly aligned between Top Navbar (Marquee) and Main Grid Column layouts */}
      <div className="w-full hidden lg:flex justify-end mb-2 mt-8 z-10 animate-fade-in">
        <div 
          id="desktop-toggles"
          className={`flex items-center gap-2 p-1.5 rounded-full backdrop-blur-xl border transition-all duration-500 
            ${isDarkMode ? 'bg-zinc-900/40 border-white/10' : 'bg-white/40 border-zinc-200 shadow-lg shadow-zinc-200/50'}`}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSecurityShield(true)}
            className={`p-2 rounded-full transition-all duration-300 relative ${
              isDarkMode 
                ? 'hover:bg-white/5 text-emerald-400' 
                : 'hover:bg-black/5 text-emerald-600'
            }`}
            title={language === 'en' ? 'Manage Screen Shield Engines' : 'مدیریت سپرهای حفاظتی صفحه'}
          >
            <Shield className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </motion.button>
          <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenTravelerManual('overview')}
            className={`p-2 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'hover:bg-white/5 text-emerald-400' 
                : 'hover:bg-black/5 text-emerald-600'
            }`}
            title={language === 'en' ? 'Traveler Security Manual' : 'راهنمای امنیتی تور'}
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
          <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
            className={`px-3 py-1.5 rounded-full transition-all duration-300 font-bold text-[10px] tracking-widest ${
              isDarkMode 
                ? 'hover:bg-white/5 text-emerald-400' 
                : 'hover:bg-black/5 text-emerald-600'
            }`}
          >
            {language === 'en' ? 'FA' : 'EN'}
          </motion.button>
          <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'hover:bg-white/5 text-yellow-400' 
                : 'hover:bg-black/5 text-zinc-600'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 relative z-10 mt-4 sm:mt-8 lg:mt-4">
        <motion.div 
          id="main-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className={`flex-1 ${isDarkMode ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl'} backdrop-blur-3xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col transition-all duration-500`}>
            {/* Header */}
            <div className={`p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} rounded-2xl flex items-center justify-center border shadow-inner shrink-0`}>
                  <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className={`text-lg sm:text-xl ${language === 'fa' ? 'font-vazir font-bold' : 'lg:font-display lg:italic lg:tracking-tight font-sans font-black tracking-wide'}`}>{t.title}</h1>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setIsTrashAnimating(true)}
                  onMouseLeave={() => setIsTrashAnimating(false)}
                  onClick={() => {
                    setIsTrashAnimating(true);
                    setTimeout(() => setIsTrashAnimating(false), 800);

                    if (mainTab === 'create') {
                      if (contentType === 'text') setMessage('');
                      if (contentType === 'file') setSelectedFile(null);
                      if (contentType === 'audio') {
                        setAudioBlob(null);
                        setRecordingTime(0);
                        setAudioWavBytes(null);
                        setAudioFilename('');
                        setAudioWavCapacity(0);
                        setAudioWaveformSamples(null);
                        setAudioText('');
                      }
                      if (contentType === 'image') setSelectedFile(null);
                      if (contentType === 'stego') {
                        setMessage('');
                        setSelectedFile(null);
                        setStegoImage(null);
                      }
                      setPassword('');
                      setHasPassword(false);
                      setBurnAfterRead(false);
                      setHasHoney(false);
                      setResultUrl(null);
                      setStatus(null);
                    } else {
                      setViewInput('');
                      setViewData(null);
                      setDecryptedContent(null);
                      setStatus(null);
                      setViewPassword('');
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                >
                  <TrashIcon animate={isTrashAnimating} />
                </motion.button>
              </div>
            </div>

            {/* Main Tabs - Desktop Only */}
            <div className={`hidden lg:flex p-1.5 border-b ${isDarkMode ? 'bg-zinc-950/20 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}>
              <button 
                onClick={() => setMainTab('create')}
                className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${mainTab === 'create' ? (isDarkMode ? 'bg-white/5 text-emerald-400 shadow-inner' : 'bg-white text-emerald-600 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')}`}
              >
                {t.create}
              </button>
              <button 
                onClick={() => setMainTab('view')}
                className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${mainTab === 'view' ? (isDarkMode ? 'bg-white/5 text-emerald-400 shadow-inner' : 'bg-white text-emerald-600 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')}`}
              >
                {t.view}
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
              <AnimatePresence mode="wait">
                {mainTab === 'create' ? (
                  <motion.div 
                    id="main-input-area" 
                    key="create" 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }} 
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="space-y-5 sm:space-y-8"
                  >
                    {/* Content Type Selector Block */}
                    <div id="content-type-selector">
                      {/* Content Type Selector - Mobile Inline (Swipe-friendly) */}
                      <div className="block md:hidden overflow-x-auto scrollbar-none py-1 -mx-2 px-2">
                        <div className="flex gap-1.5 min-w-max">
                          {[
                            { id: 'text', label: t.text, icon: <FileText className="w-3.5 h-3.5" /> },
                            { id: 'file', label: t.file, icon: <File className="w-3.5 h-3.5" /> },
                            { id: 'stego', label: t.image, icon: <ImageIcon className="w-3.5 h-3.5" /> },
                            { id: 'audio', label: t.audio, icon: <Headphones className="w-3.5 h-3.5" /> },
                            { id: 'shamir', label: t.shamir, icon: <Zap className="w-3.5 h-3.5" /> },
                            { id: 'e2e', label: t.e2e, icon: <MessageSquare className="w-3.5 h-3.5" /> },
                          ].map((item) => {
                            const isActive = contentType === item.id;
                            return (
                              <button
                                id={`type-tab-${item.id}`}
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setContentType(item.id as ContentType);
                                  if (item.id === 'stego') setImageAcquisition(null);
                                }}
                                className={`flex flex-row items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-[28.5vw] shrink-0 ${
                                  isActive
                                    ? isDarkMode
                                      ? 'bg-zinc-900 text-white border border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.06)]'
                                      : 'bg-white text-zinc-900 border border-emerald-500/30 shadow-sm'
                                    : isDarkMode
                                    ? 'bg-zinc-900/30 text-zinc-500 border border-white/5 hover:text-zinc-300'
                                    : 'bg-zinc-100/50 text-zinc-500 border border-zinc-200/50 hover:text-zinc-700'
                                }`}
                              >
                                <span className={isActive ? 'text-emerald-500 shrink-0' : 'text-zinc-400 shrink-0'}>
                                  {item.icon}
                                </span>
                                <span className="truncate max-w-full px-0.5">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Type Tabs - Desktop */}
                      <div className={`hidden md:block p-1.5 rounded-3xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-100/70 border-zinc-200/85'} shadow-inner`}>
                        <div className="grid grid-cols-6 items-center w-full">
                          <TypeTab id="type-tab-text" active={contentType === 'text'} onClick={() => setContentType('text')} icon={<FileText/>} text={t.text} isDarkMode={isDarkMode} />
                          <TypeTab id="type-tab-file" active={contentType === 'file'} onClick={() => setContentType('file')} icon={<File/>} text={t.file} isDarkMode={isDarkMode} />
                          <TypeTab id="type-tab-stego" active={contentType === 'stego'} onClick={() => {
                            setContentType('stego');
                            setImageAcquisition(null);
                          }} icon={<ImageIcon/>} text={t.image} isDarkMode={isDarkMode} />
                          <TypeTab id="type-tab-audio" active={contentType === 'audio'} onClick={() => setContentType('audio')} icon={<Headphones/>} text={t.audio} isDarkMode={isDarkMode} />
                          <TypeTab id="type-tab-shamir" active={contentType === 'shamir'} onClick={() => setContentType('shamir')} icon={<Zap/>} text={t.shamir} isDarkMode={isDarkMode} />
                          <TypeTab id="type-tab-e2e" active={contentType === 'e2e'} onClick={() => setContentType('e2e')} icon={<MessageSquare/>} text={t.e2e} isDarkMode={isDarkMode} />
                        </div>
                      </div>
                    </div>

                    {/* Input Sections */}
                    {contentType === 'text' && (
                      <div className={`space-y-3 ${getAutoDir(message) === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <div className={`flex flex-col rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'} overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-emerald-500/10`}>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t.payloadPlaceholder}
                            dir={getAutoDir(message)}
                            className={`w-full h-[220px] p-5 sm:p-8 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-sm leading-relaxed ${isDarkMode ? 'placeholder:text-zinc-600' : 'placeholder:text-zinc-400'} ${getAutoContainerClass(message)}`}
                          />
                          {/* Rich Nested Bottom Toolbar */}
                          <div className={`flex items-center justify-between px-6 py-4 border-t ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                            <div className="flex gap-2 font-mono text-[9px] text-zinc-500 tracking-wider">
                              <span>{localizeDigitsValue(message.length.toString(), language)} {language === 'fa' ? 'کاراکتر' : 'chars'}</span>
                              <span className="opacity-40">•</span>
                              <span>{localizeDigitsValue((message.trim() === '' ? 0 : message.trim().split(/\s+/).length).toString(), language)} {language === 'fa' ? 'کلمه' : 'words'}</span>
                            </div>
                            <div className="flex gap-2">
                              {message && (
                                <button
                                  type="button"
                                  onClick={() => setMessage('')}
                                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                    isDarkMode
                                      ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                                      : 'bg-white border-zinc-200 text-zinc-650 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  {language === 'fa' ? 'پاک کردن' : 'Clear'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const text = await navigator.clipboard.readText();
                                    setMessage(text);
                                    setStatus({ type: 'ok', msg: language === 'fa' ? 'متن به درستی جایگذاری شد' : 'Clipboard pasted successfully' });
                                  } catch (err) {
                                    // Soft fallback: try reading directly or inform gracefully to reduce browser/OS level visual prompts
                                    setStatus({ type: 'err', msg: language === 'fa' ? 'لطفا متن خودتو مستقیماً داخل کادر جایگذاری کن.' : 'Please paste directly into the box.' });
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                  isDarkMode
                                    ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    : 'bg-white border-zinc-200 text-zinc-650 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {language === 'fa' ? 'جایگذاری' : 'Paste'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {contentType === 'file' && (
                      <Dropzone onSelect={handleFileSelect} selectedFile={selectedFile} icon={<File className="w-10 h-10"/>} isDarkMode={isDarkMode} label={t.file} language={language} />
                    )}

                    {contentType === 'stego' && (
                      <div className="space-y-6">
                        {/* Acquisition Choice Phase - Selected File is empty */}
                        {!selectedFile && !imageAcquisition && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                            {/* Live Camera Card */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setImageAcquisition('camera')}
                              className={`p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center gap-4 transition-all min-h-[150px] sm:min-h-[180px] ${
                                isDarkMode
                                  ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/30 text-zinc-300'
                                  : 'border-zinc-200 bg-zinc-100/30 hover:border-emerald-500/30 text-zinc-700'
                              }`}
                            >
                              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner">
                                <Camera className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {language === 'fa' ? 'تصویربرداری با دوربین' : 'Camera Capture'}
                                </h4>
                                <p className={`text-[9px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} uppercase tracking-wider mt-1.5 ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {language === 'fa' ? 'گرفتن تصویر زنده با دوربین دستگاه' : 'Capture instant live snap'}
                                </p>
                              </div>
                            </motion.div>

                            {/* Standard File Upload Card */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setImageAcquisition('upload')}
                              className={`p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center gap-4 transition-all min-h-[150px] sm:min-h-[180px] ${
                                isDarkMode
                                  ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/30 text-zinc-300'
                                  : 'border-zinc-200 bg-zinc-100/30 hover:border-emerald-500/30 text-zinc-700'
                              }`}
                            >
                              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {language === 'fa' ? 'بارگذاری از گالری' : 'Gallery / File Upload'}
                                </h4>
                                <p className={`text-[9px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} uppercase tracking-wider mt-1.5 ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {language === 'fa' ? 'انتخاب یا رها کردن فایل تصویری' : 'Upload or drop an image file'}
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        )}

                        {/* Rendering selected flows when selectedFile is still empty */}
                        {!selectedFile && imageAcquisition === 'camera' && (
                          <div className="space-y-4 animate-fade-in">
                            <button
                              type="button"
                              onClick={() => setImageAcquisition(null)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                                isDarkMode
                                  ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
                              }`}
                            >
                              {language === 'fa' ? 'بازگشت به انتخاب' : '← Back to Selection'}
                            </button>
                            <CameraCapture 
                              onCapture={(file) => {
                                handleFileChangeDirect(file);
                              }} 
                              isDarkMode={isDarkMode} 
                              t={t} 
                              setStatus={setStatus} 
                            />
                          </div>
                        )}

                        {!selectedFile && imageAcquisition === 'upload' && (
                          <div className="space-y-4 animate-fade-in">
                            <button
                              type="button"
                              onClick={() => setImageAcquisition(null)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                                isDarkMode
                                  ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
                              }`}
                            >
                              {language === 'fa' ? 'بازگشت به انتخاب' : '← Back to Selection'}
                            </button>
                            <Dropzone 
                              onSelect={handleFileSelect} 
                              selectedFile={selectedFile} 
                              icon={<ImageIcon className="w-10 h-10"/>} 
                              accept="image/*" 
                              isDarkMode={isDarkMode} 
                              label={contentType === 'stego' ? t.selectPngCover : t.image} 
                              language={language}
                            />
                          </div>
                        )}

                        {/* Interactive Preview Phase - File Selected */}
                        {selectedFile && (
                          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                            <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'} space-y-4`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5 className={`text-xs font-black uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                      {selectedFile.name}
                                    </h5>
                                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image/png'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setStegoImage(null);
                                    setImageAcquisition(null);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    isDarkMode
                                      ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                      : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 pr-4'
                                  } ${language === 'fa' ? 'font-vazir' : ''}`}
                                >
                                  {language === 'fa' ? 'تغییر تصویر' : 'Change Image'}
                                </button>
                              </div>

                              <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/5 aspect-video md:aspect-[2/1] flex items-center justify-center">
                                <img
                                  src={stegoImage || URL.createObjectURL(selectedFile)}
                                  alt="Preview"
                                  className="max-h-full max-w-full object-contain rounded-xl"
                                />
                              </div>
                            </div>

                            {/* Stego Capacity Tracker */}
                            {contentType === 'stego' && stegoImage && (
                              <div className="space-y-1.5 px-1 animate-fade-in">
                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                  <span className={language === 'fa' ? 'font-vazir' : ''}>{t.stegoCapacity}</span>
                                  <span>{Math.round(Math.min(100, (new TextEncoder().encode(message).length / stegoCapacity) * 100))}%</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (new TextEncoder().encode(message).length / stegoCapacity) * 100)}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                  />
                                </div>
                              </div>
                            )}

                            {/* Secret Message Input for Steganography */}
                            {contentType === 'stego' && (
                              <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.stegoPlaceholder}
                                dir={getAutoDir(message)}
                                className={`w-full h-[180px] ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'} border rounded-[32px] p-5 sm:p-8 focus:outline-none text-sm leading-relaxed resize-none transition-smooth ${getAutoContainerClass(message)}`}
                              />
                            )}
                            <canvas ref={stegoCanvasRef} className="hidden" />
                          </motion.div>
                        )}
                      </div>
                    )}



                    {contentType === 'shamir' && (
                      <div className="space-y-6 animate-fade-in">
                        {/* Shamir Secret Field */}
                        <div className={`space-y-3 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">{t.shamirSecret}</label>
                          <input
                            type="text"
                            value={shamirSecret}
                            onChange={(e) => setShamirSecret(e.target.value)}
                            placeholder={t.shamirSecret}
                            dir={language === 'fa' ? 'rtl' : 'ltr'}
                            className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400'} border rounded-2xl p-4.5 text-xs outline-none focus:border-emerald-500/50 transition-all shadow-sm ${language === 'fa' ? 'text-right' : 'text-left'}`}
                          />
                        </div>

                        {/* Total N and Threshold K fields */}
                        <div className="grid grid-cols-2 gap-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                          <div className="space-y-1.5 flex flex-col">
                            <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirTotal}</label>
                            <div className="relative w-full text-right">
                              <input 
                                type={language === 'fa' ? 'text' : 'number'} 
                                min={3}
                                max={10}
                                value={language === 'fa' ? (shamirTotal === 0 ? '' : toPersianDigits(shamirTotal.toString())) : shamirTotal} 
                                onChange={(e) => {
                                  if (language === 'fa') {
                                    handleShamirTotalChangeFA(e.target.value);
                                  } else {
                                    setShamirTotal(Math.max(3, parseInt(e.target.value) || 3));
                                  }
                                }}
                                onBlur={() => {
                                  if (language === 'fa') {
                                    handleShamirTotalBlurFA();
                                  }
                                }}
                                className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-2xl p-3.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-3.5 pl-14 text-right font-vazir text-sm font-bold' : 'pr-14 pl-3.5 font-mono text-xs ltr text-left'}`}
                                dir={language === 'fa' ? 'rtl' : 'ltr'}
                              />
                              <div className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold uppercase ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
                                {language === 'fa' ? 'کل' : 'SHARES'}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5 flex flex-col">
                            <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirThreshold}</label>
                            <div className="relative w-full text-right">
                              <input 
                                type={language === 'fa' ? 'text' : 'number'} 
                                min={2}
                                max={shamirTotal}
                                value={language === 'fa' ? (shamirThreshold === 0 ? '' : toPersianDigits(shamirThreshold.toString())) : shamirThreshold} 
                                onChange={(e) => {
                                  if (language === 'fa') {
                                    handleShamirThresholdChangeFA(e.target.value);
                                  } else {
                                    setShamirThreshold(Math.max(2, Math.min(shamirTotal, parseInt(e.target.value) || 2)));
                                  }
                                }}
                                onBlur={() => {
                                  if (language === 'fa') {
                                    handleShamirThresholdBlurFA();
                                  }
                                }}
                                className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-2xl p-3.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-3.5 pl-14 text-right font-vazir text-sm font-bold' : 'pr-14 pl-3.5 font-mono text-xs ltr text-left'}`}
                                dir={language === 'fa' ? 'rtl' : 'ltr'}
                              />
                              <div className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold uppercase ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
                                {language === 'fa' ? 'مینیمم' : 'MIN'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200/85 text-emerald-700'} text-xs leading-relaxed ${language === 'fa' ? 'font-vazir text-right' : 'font-mono text-left text-[10px] tracking-wide'}`}>
                          {localizeDigitsValue(t.shamirInfo.replace('{k}', "k_val").replace('{n}', "n_val"), language).replace("k_val", language === 'fa' ? toPersianDigits(shamirThreshold) : shamirThreshold.toString()).replace("n_val", language === 'fa' ? toPersianDigits(shamirTotal) : shamirTotal.toString())}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleShamirSplit}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir text-sm font-bold' : ''}`}
                        >
                          {t.split}
                        </motion.button>

                        {shamirShares.length > 0 && (
                          <div className="space-y-3 animate-fade-in" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                            <label className={`text-[9px] font-black uppercase tracking-widest text-emerald-500 px-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirShares}</label>
                            <div className="space-y-2.5">
                              {shamirShares.map((share, i) => (
                                <div key={i} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} group`}>
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center font-bold text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-xs' : 'font-mono text-[9px]'}`}>
                                      {language === 'fa' ? toPersianDigits(i + 1) : i + 1}
                                    </div>
                                    <div className={`truncate flex-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium'} ${language === 'fa' ? 'font-vazir text-right text-xs' : 'font-mono text-[10.5px]'}`}>{language === 'fa' ? toPersianDigits(share) : share}</div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      copyToClipboardWithAutoClear(share, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                                      setStatus({ type: 'ok', msg: t.linkCopied });
                                    }}
                                    className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-emerald-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600'}`}
                                    title="Copy Share"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className={`w-full h-px ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'} my-6`} />
                        
                        {/* Shamir Reconstruct Inputs section */}
                        <div className="space-y-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                          <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirReconstruct}</label>
                          <div className="space-y-3">
                            {shamirCombineInputs.map((input, i) => (
                              <div key={i} className={`flex gap-3 items-center p-2 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'}`}>
                                <div className={`w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/15 font-black flex items-center justify-center text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-xs font-bold' : 'font-mono text-[10px]'}`}>
                                  {language === 'fa' ? toPersianDigits(i + 1) : `#${i + 1}`}
                                </div>
                                <input
                                  type="text"
                                  value={language === 'fa' ? toPersianDigits(input) : input}
                                  onChange={(e) => {
                                    const next = [...shamirCombineInputs];
                                    next[i] = e.target.value;
                                    setShamirCombineInputs(next);
                                  }}
                                  placeholder={t.shamirPlaceholder}
                                  dir={language === 'fa' ? 'rtl' : 'ltr'}
                                  className={`flex-1 bg-transparent outline-none py-1 ${isDarkMode ? 'text-zinc-200 placeholder:text-zinc-650' : 'text-zinc-800 placeholder:text-zinc-400'} ${language === 'fa' ? 'font-vazir text-right text-xs' : 'font-mono text-[10px] text-left'}`}
                                />
                                {shamirCombineInputs.length > 2 && (
                                  <button 
                                    onMouseEnter={() => setHoveredShamirTrash(i)}
                                    onMouseLeave={() => setHoveredShamirTrash(null)}
                                    onClick={() => setShamirCombineInputs(prev => prev.filter((_, idx) => idx !== i))}
                                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${isDarkMode ? 'border-white/5 text-red-400 bg-zinc-950/40 hover:bg-red-500/10 hover:border-red-500/20' : 'border-zinc-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-200'}`}
                                  >
                                    <TrashIcon animate={hoveredShamirTrash === i} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button 
                              onClick={() => setShamirCombineInputs(prev => [...prev, ''])}
                              className={`flex-[1.3] py-3 rounded-2xl border border-dashed text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isDarkMode ? 'border-white/10 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-white/[0.01]' : 'border-zinc-300 text-zinc-600 hover:border-emerald-500/30 hover:text-emerald-600 hover:bg-zinc-50'} ${language === 'fa' ? 'font-vazir text-[11px] font-bold' : ''}`}
                            >
                              + {t.addShare}
                            </button>
                            <button 
                              onClick={handleShamirCombine}
                              className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black font-extrabold hover:bg-emerald-400' : 'bg-emerald-600 text-white font-extrabold hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir text-[11px] font-bold' : ''}`}
                            >
                              {t.combine}
                            </button>
                          </div>
                          {shamirResult && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-emerald-50/50 border-emerald-200'} space-y-2`}>
                              <div className={`text-[9px] font-black uppercase tracking-widest text-emerald-500 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirResult}</div>
                              <div className={`text-xs break-all font-bold leading-relaxed p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-inner'} ${language === 'fa' ? 'font-vazir text-right' : 'font-mono text-left'}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>{language === 'fa' ? toPersianDigits(shamirResult) : shamirResult}</div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {contentType === 'audio' && (
                      <div className="space-y-6">
                        {/* Sub-mode selector for Audio: Record Voice vs Stego Audio */}
                        <div className={`p-2 rounded-[24px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-100/70 border-zinc-200/85'} shadow-inner flex flex-col sm:flex-row gap-2`}>
                          <button
                            type="button"
                            onClick={() => setAudioMode('record')}
                            className={`flex-1 py-3 px-4 text-[10.5px] font-extrabold uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-3 ${
                              audioMode === 'record'
                                ? `${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'} shadow-sm`
                                : `${isDarkMode ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-850'}`
                            } ${language === 'fa' ? 'font-vazir text-[11.5px] font-bold' : ''}`}
                          >
                            <Mic className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            <span>{language === 'fa' ? 'ریکورد صدا بشکل امن' : 'Secure Voice Recorder'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAudioMode('stego')}
                            className={`flex-1 py-3 px-4 text-[10.5px] font-extrabold uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-3 ${
                              audioMode === 'stego'
                                ? `${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'} shadow-sm`
                                : `${isDarkMode ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-850'}`
                            } ${language === 'fa' ? 'font-vazir text-[11.5px] font-bold' : ''}`}
                          >
                            <Headphones className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            <span>{language === 'fa' ? 'پنهان‌نگاری در فایل صوتی' : 'Audio Steganography'}</span>
                          </button>
                        </div>

                        {audioMode === 'record' ? (
                          <div className={`bg-zinc-950/20 border ${isDarkMode ? 'border-white/10' : 'border-zinc-200'} rounded-[32px] p-8 flex flex-col items-center justify-center gap-6 min-h-[300px] relative overflow-hidden shadow-lg`}>
                            {/* Status Label */}
                            <div className="absolute top-4 left-6 right-6 flex items-center justify-between border-b border-zinc-500/10 pb-3">
                              <p className={`text-[10px] font-black uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                                {isRecording 
                                  ? (language === 'fa' ? 'در حال ریکورد ...' : 'REC • LIVE') 
                                  : (audioBlob 
                                    ? (language === 'fa' ? 'پیش‌نمایش صدا' : 'READY TO SECURE') 
                                    : (language === 'fa' ? 'ریکورد صدا' : 'VOICE RECORDER'))}
                              </p>
                              <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500' : audioBlob ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                            </div>

                            {/* Monospace Code Clock Display */}
                            <div className="mt-8 flex flex-col items-center gap-2">
                              <div className={`px-6 py-2.5 rounded-2xl ${isDarkMode ? 'bg-zinc-950/60 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-100 text-emerald-600 border border-zinc-200'} font-mono text-4xl font-extrabold tracking-tight shadow-inner`}>
                                {formatTime(recordingTime)}
                              </div>
                            </div>

                            {/* Animated Equalizer Waveform when Recording */}
                            {isRecording ? (
                              <div className="flex items-end justify-center gap-[3px] h-14 my-1 px-8">
                                {[...Array(18)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="w-[3px] bg-red-400 rounded-full"
                                    animate={{
                                      height: [10, Math.random() * 45 + 12, 10]
                                    }}
                                    transition={{
                                      duration: 0.5 + Math.random() * 0.4,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      delay: i * 0.02
                                    }}
                                  />
                                ))}
                              </div>
                            ) : audioBlob ? (
                              <div className="text-center space-y-1 my-3 animate-fade-in">
                                <p className="text-[10px] font-mono text-zinc-400 font-bold hover:text-emerald-400 transition-colors">
                                  {localizeDigitsValue((audioBlob.size / 1024).toFixed(1), language)} KB
                                </p>
                              </div>
                            ) : (
                              <div className="text-center space-y-1 text-zinc-500 text-[9px] uppercase tracking-wider my-4">
                                {language === 'fa' ? 'برای ریکورد دکمه میکروفون رو بزن' : 'TAP THE MIC TO START'}
                              </div>
                            )}

                            <div className="flex gap-6 mt-2 relative z-10">
                              <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={toggleRecording}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                  isRecording 
                                    ? 'bg-red-500 border border-red-400/20 text-white animate-pulse shadow-red-500/20' 
                                    : isDarkMode 
                                      ? 'bg-zinc-900 border border-white/5 text-zinc-350 hover:bg-zinc-800' 
                                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                }`}
                              >
                                {isRecording ? <Square className="w-5 h-5 text-white fill-current"/> : <Mic className="w-5 h-5 text-emerald-500"/>}
                              </motion.button>
                              {audioBlob && (
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => {
                                    const url = URL.createObjectURL(audioBlob);
                                    new Audio(url).play();
                                  }}
                                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                    isDarkMode 
                                      ? 'bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400' 
                                      : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                                  title="Play Recording"
                                >
                                  <Volume2 className="w-5 h-5"/>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {!audioWavBytes ? (
                              <div className="space-y-4 animate-fade-in">
                                <Dropzone 
                                  onSelect={async (file) => {
                                    try {
                                      setStatus({ type: 'warn', msg: "Analyzing WAV audio file..." });
                                      const arrayBuffer = await file.arrayBuffer();
                                      const wavBytes = new Uint8Array(arrayBuffer);
                                      
                                      // Verify and measure capacity
                                      const cap = getWavCapacity(wavBytes);
                                      if (cap <= 0) {
                                        throw new Error("Invalid WAV file or unsupported header format (must be standard PCM encoded, 8-bit or 16-bit WAV).");
                                      }

                                      // Extract sample data for waveform rendering
                                      const samples = wavToFloat32(wavBytes);
                                      
                                      setAudioWavBytes(wavBytes);
                                      setAudioFilename(file.name);
                                      setAudioWavCapacity(cap);
                                      setAudioWaveformSamples(samples);
                                      setStatus({ type: 'ok', msg: `WAV loaded successfully! Stego capacity: ${cap} characters.` });
                                    } catch (err: any) {
                                      setStatus({ type: 'err', msg: err.message });
                                    }
                                  }} 
                                  selectedFile={null} 
                                  icon={<Headphones className="w-10 h-10 text-emerald-500"/>} 
                                  accept=".wav,audio/wav,audio/x-wav" 
                                  isDarkMode={isDarkMode} 
                                  label={language === 'fa' ? 'یه فایل صوتی با فرمت WAV انتخاب کن' : 'Select a standard PCM WAV audio file'} 
                                  language={language}
                                />
                              </div>
                            ) : (
                              <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                {/* File Info */}
                                <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'} space-y-4`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                        <Headphones className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h5 className={`text-xs font-black uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                          {audioFilename}
                                        </h5>
                                        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                          {(audioWavBytes.length / 1024).toFixed(1)} KB • audio/wav
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAudioWavBytes(null);
                                        setAudioFilename('');
                                        setAudioWavCapacity(0);
                                        setAudioWaveformSamples(null);
                                      }}
                                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        isDarkMode
                                          ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                          : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 pr-4'
                                      } ${language === 'fa' ? 'font-vazir' : ''}`}
                                    >
                                      {language === 'fa' ? 'تغییر فایل صوتی' : 'Change Audio'}
                                    </button>
                                  </div>

                                  {/* Interactive Waveform Preview */}
                                  {audioWaveformSamples && (
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400">
                                        <span>PCM Audio Waveform</span>
                                        <span>{audioWaveformSamples.length} samples</span>
                                      </div>
                                      <div className="h-14 flex items-end justify-between gap-[2px] pt-2">
                                        {Array.from({ length: 48 }).map((_, idx) => {
                                          const step = Math.floor(audioWaveformSamples.length / 48);
                                          const val = Math.abs(audioWaveformSamples[idx * step] || 0.1);
                                          const heightPercentage = Math.min(100, Math.max(15, val * 100));
                                          return (
                                            <div 
                                              key={idx}
                                              style={{ height: `${heightPercentage}%` }}
                                              className={`w-full rounded-full transition-all duration-300 ${isDarkMode ? 'bg-emerald-500/80 hover:bg-emerald-400' : 'bg-emerald-600/80 hover:bg-emerald-500'}`}
                                            />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Capacity Bar */}
                                <div className="space-y-1.5 px-1 animate-fade-in">
                                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                    <span className={language === 'fa' ? 'font-vazir' : ''}>{t.stegoCapacity} ({audioWavCapacity} chars max)</span>
                                    <span>{Math.round(Math.min(100, (new TextEncoder().encode(audioText).length / audioWavCapacity) * 100))}%</span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, (new TextEncoder().encode(audioText).length / audioWavCapacity) * 100)}%` }}
                                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                    />
                                  </div>
                                </div>

                                {/* Secret Message input */}
                                <textarea
                                  value={audioText}
                                  onChange={(e) => setAudioText(e.target.value)}
                                  placeholder={t.stegoPlaceholder}
                                  dir={getAutoDir(audioText)}
                                  className={`w-full h-[140px] ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'} border rounded-[32px] p-8 focus:outline-none text-sm leading-relaxed resize-none transition-smooth ${getAutoContainerClass(audioText)}`}
                                />

                                {/* Stego Decapsulation Password input */}
                                <div className="relative">
                                   <Lock className={`absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                                   <input 
                                     type={showAudioEmbedPwd ? "text" : "password"} 
                                     value={audioEmbedPassword} 
                                     onChange={(e) => handlePasswordChange(e.target.value, setAudioEmbedPassword, 'audioEmbedPassword')}
                                     onKeyDown={(e) => handlePasswordKeyDown(e, 'audioEmbedPassword')}
                                     disabled={disabledInputs['audioEmbedPassword']}
                                     placeholder={disabledInputs['audioEmbedPassword'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : (language === 'fa' ? 'گذرواژه برای جاسازی/استخراج رمز' : 'Password to encrypt/embed stego message')}
                                     dir="ltr"
                                     className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-450'} border rounded-2xl h-[42px] ps-11 pe-11 text-xs xl:rounded-[32px] xl:h-auto xl:p-5 xl:ps-12 xl:pe-12 outline-none focus:border-emerald-500/50 transition-all text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
                                   />
                                   <button
                                     type="button"
                                     onClick={() => setShowAudioEmbedPwd(!showAudioEmbedPwd)}
                                     className={`absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                                   >
                                     {showAudioEmbedPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                   </button>
                                 </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {contentType === 'e2e' && (
                      <div className="space-y-6">
                        {!e2eKeyPair ? (
                          <div className={`p-5 xs:p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border text-center flex flex-col items-center justify-center gap-5 sm:gap-6 ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-white border-zinc-200'}`}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner shrink-0">
                              <Shield className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                            </div>
                            <div className="space-y-2 max-w-md">
                              <h4 className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                                {language === 'fa' ? 'فعالسازی رمزگذاری سرتاسری (E2E)' : 'Activate End-to-End Encryption'}
                              </h4>
                              <p className={`text-[11px] sm:text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed ${language === 'fa' ? 'font-vazir' : ''}`}>
                                {language === 'fa' 
                                  ? 'برای بهره از کانال‌های گفتگوی ایمن، یک جفت کلید رمزنگاری اختصاصی بساز. این کلید به هیچ وجه از مرورگر شما خارج نمیشه!' 
                                  : 'To interact in secure channels, generate a personal cryptographic keypair. Your private key never leaves this browser.'}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.01, translateY: -1 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={async () => {
                                setStatus({ type: 'warn', msg: "Generating secure crypto keys..." });
                                const keys = await e2eGenKeypair();
                                setE2EKeyPair(keys);
                                localStorage.setItem('daylock_e2e_keypair', JSON.stringify(keys));
                                setStatus({ type: 'ok', msg: "E2E Cryptographic Keypair Activated!" });
                              }}
                              className={`w-full max-w-sm py-4 px-4 sm:px-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-2 ${
                                isDarkMode 
                                  ? 'bg-zinc-950 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                  : 'bg-white border-emerald-600/20 hover:border-emerald-600/40 shadow-[0_4px_15px_rgba(16,185,129,0.05)]'
                              }`}
                            >
                              {/* Pulse backing glow */}
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              <div className="flex items-center gap-2.5 relative z-10">
                                <Zap className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
                                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'} ${language === 'fa' ? 'font-vazir text-[11px] font-bold' : ''}`}>
                                  {language === 'fa' ? 'ساخت کلیدهای امنیتی اختصاصی' : 'Generate Secure Cryptographic Keys'}
                                </span>
                              </div>
                              <span className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-widest text-zinc-500 relative z-10 text-center px-1">
                                {language === 'fa' ? 'ساخت کلید در مرورگر شما' : 'Keypair Generation'}
                              </span>
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Key pair identity panel */}
                            <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'} space-y-4`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
                                    <Shield className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir text-[11px]' : ''}`}>
                                      {language === 'fa' ? 'هویت رمزنگاری سرتاسری، اکتیوه!' : 'End-to-End Cryptographic Identity Active'}
                                    </h5>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(language === 'fa' ? ' مطمئنی دیگه؟ با پاک کردن جفت کلید، تموم پیام‌های پیشین، غیر قابل خواندن میشن ها!' : 'Warning: Deleting your keys will make previous encrypted chats unreadable forever.')) {
                                      localStorage.removeItem('daylock_e2e_keypair');
                                      setE2EKeyPair(null);
                                      setStatus({ type: 'warn', msg: "E2E Keypair deactivated." });
                                    }
                                  }}
                                  className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all cursor-pointer text-center"
                                >
                                  {language === 'fa' ? 'حذف هویت' : 'Revoke Identity'}
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <label className={`text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-[9px]' : ''}`}>
                                  {language === 'fa' ? 'شناسه پابلیک شما' : 'Your Public ID'}
                                </label>
                                <div className={`flex gap-2 items-center p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-white border-zinc-200'}`}>
                                  <span className="flex-1 font-mono text-[9.5px] truncate text-zinc-400 text-left select-all">{e2eKeyPair.publicKey}</span>
                                  <button
                                    onClick={() => {
                                      copyToClipboardWithAutoClear(e2eKeyPair.publicKey, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                                      setStatus({ type: 'ok', msg: t.linkCopied });
                                    }}
                                    className={`p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-emerald-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600'}`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Create Channel Area */}
                            {!e2eChannelDetails ? (
                              <div className={`p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border text-center space-y-4 sm:space-y-6 ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'}`}>
                                <div className="space-y-1.5">
                                  <h4 className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                                    {language === 'fa' ? 'ایجاد کانال گفتگوی دوطرفه' : 'Establish E2E Conversation Channel'}
                                  </h4>
                                  <p className={`text-[9px] sm:text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} uppercase tracking-wider ${language === 'fa' ? 'font-vazir' : ''}`}>
                                    {language === 'fa' ? 'یک لینک گفتگو بساز و آن را برای دوست خود بفرس' : 'Generate a chat board, share link, and chat in absolute isolation'}
                                  </p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={handleCreateE2EChannel}
                                  disabled={isE2ELoading}
                                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer shadow-lg transition-all ${isDarkMode ? 'bg-indigo-500 text-black font-extrabold hover:bg-indigo-400' : 'bg-indigo-600 text-white font-extrabold hover:bg-indigo-700'}`}
                                >
                                  {isE2ELoading ? (language === 'fa' ? 'در حال راه‌اندازی ...' : 'establishing ...') : (language === 'fa' ? 'ایجاد کانال پیام‌رسانی امن' : 'Spawn Secure E2E Channel')}
                                </motion.button>
                              </div>
                            ) : (
                              <div className={`p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'} space-y-3`}>
                                <div className="flex items-center gap-2 text-indigo-500">
                                  <Check className="w-4 h-4 shrink-0" />
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${language === 'fa' ? 'font-vazir' : ''}`}>
                                    {language === 'fa' ? 'کانال گفتگو با پیروزی راه‌اندازی شد!' : 'Channel Initialized!'}
                                  </span>
                                </div>
                                <p className={`text-xs text-zinc-450 dark:text-zinc-400 leading-relaxed ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {language === 'fa' 
                                    ? 'لینک ایجاد شده را با مخاطبت به اشتراک بذار. به محض اینکه او لینک را باز کند، می‌توانید به شکل زنده گفتگو کنید.' 
                                    : 'Share the generated link with your contact. Once they open it, you can chat in real-time.'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options Container with perfect unified vertical spacing */}
                    <div className="space-y-4">
                      {/* Options Grid */}
                      <div id="options-grid" className="grid grid-cols-2 gap-4">
                      <OptionToggle id="opt-burn" active={burnAfterRead} onClick={() => setBurnAfterRead(!burnAfterRead)} icon={<Flame className="w-4 h-4"/>} title={t.burnOnRead} isDarkMode={isDarkMode} variant="danger" />
                      <OptionToggle id="opt-password" active={hasPassword} onClick={() => setHasPassword(!hasPassword)} icon={hasPassword ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>} title={t.passwordLock} isDarkMode={isDarkMode} />
                      <OptionToggle id="opt-geo" active={hasGeoLock} onClick={() => setHasGeoLock(!hasGeoLock)} icon={<Globe className="w-4 h-4"/>} title={t.geoLock} isDarkMode={isDarkMode} />
                      <OptionToggle id="opt-deadman" active={hasDeadMans} onClick={() => setHasDeadMans(!hasDeadMans)} icon={<Skull className="w-4 h-4"/>} title={t.deadMansSwitch} isDarkMode={isDarkMode} variant="danger" />
                      <OptionToggle id="opt-canary" active={hasCanary} onClick={() => setHasCanary(!hasCanary)} icon={<Bird className="w-4 h-4"/>} title={t.canaryToken} isDarkMode={isDarkMode} />
                      <OptionToggle id="opt-time" active={hasTimeLock} onClick={() => setHasTimeLock(!hasTimeLock)} icon={<Clock className="w-4 h-4"/>} title={t.timeLock} isDarkMode={isDarkMode} />
                      <OptionToggle id="opt-selfdestruct" active={hasSelfDestruct} onClick={() => setHasSelfDestruct(!hasSelfDestruct)} icon={<ShieldAlert className="w-4 h-4"/>} title={t.selfDestruct} isDarkMode={isDarkMode} variant="danger" />
                      <OptionToggle id="opt-asn" active={hasAsnLock} onClick={() => setHasAsnLock(!hasAsnLock)} icon={<Shield className="w-4 h-4"/>} title={t.asnLock} isDarkMode={isDarkMode} />
                    </div>

                    {/* Expiration & Max Views */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">{t.expiresIn}</label>
                        <CustomSelect 
                          value={expiresIn} 
                          onChange={setExpiresIn}
                          isDarkMode={isDarkMode}
                          language={language}
                          options={[
                            { value: 3600, label: `1 ${t.hours}` },
                            { value: 21600, label: `6 ${t.hours}` },
                            { value: 86400, label: `1 ${t.days}` },
                            { value: 604800, label: `7 ${t.days}` },
                            { value: 2592000, label: `30 ${t.days}` },
                          ]}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">{t.maxViews}</label>
                        <div className={`flex items-center gap-1 p-1 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                          <button 
                            onClick={() => setMaxViews(prev => (prev === '' || prev <= 1) ? '' : prev - 1)}
                            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                          >
                            <span className="text-lg font-light">−</span>
                          </button>
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9۰-۹]*"
                            value={maxViews === '' ? '' : localizeDigitsValue(maxViews, language)} 
                            onChange={(e) => {
                              const standardValue = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                              const val = standardValue === '' ? '' : parseInt(standardValue, 10);
                              if (val === '' || val > 0) setMaxViews(val);
                            }}
                            placeholder={t.unlimited}
                            className={`w-full min-w-0 bg-transparent text-center text-xs outline-none font-bold tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}
                          />
                          <button 
                            onClick={() => setMaxViews(prev => (prev === '' ? 1 : prev + 1))}
                            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                          >
                            <span className="text-lg font-light">+</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {hasGeoLock && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'} space-y-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{t.allowedCountries}</span>
                        </div>
                        <div className="relative">
                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                          <input 
                            type="text" 
                            value={countrySearch} 
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder={t.searchCountry}
                            dir={language === 'fa' ? 'rtl' : 'ltr'}
                            className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-2.5 ps-9 text-xs outline-none ${language === 'fa' ? 'text-right' : 'text-left'}`}
                          />
                          {countryResults.length > 0 && (
                            <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                              {countryResults.map(c => (
                                <button 
                                  key={c.code}
                                  onClick={() => {
                                    if (!allowedCountries.includes(c.code)) setAllowedCountries([...allowedCountries, c.code]);
                                    setCountrySearch('');
                                  }}
                                  className={`w-full p-2.5 text-left text-xs flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-zinc-50'}`}
                                >
                                  <Flag code={c.code} emoji={c.flag} />
                                  <span className="flex-1">{language === 'fa' ? c.fa : c.name}</span>
                                  <span className="text-[10px] font-mono text-zinc-500">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {allowedCountries.map(code => {
                            const c = COUNTRIES.find(x => x.code === code);
                            return (
                              <span key={code} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
                                <Flag code={code} emoji={c?.flag || ''} />
                                <span>{code}</span>
                                <button onClick={() => setAllowedCountries(allowedCountries.filter(x => x !== code))} className="hover:text-red-500 transition-colors">×</button>
                              </span>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {hasAsnLock && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{t.asnLock}</span>
                          </div>
                          <div className="flex gap-1.5 p-0.5 rounded-lg border bg-zinc-950/20 border-white/5">
                            <button
                              onClick={() => setAsnMode('block')}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${asnMode === 'block' ? 'bg-red-500/25 text-red-400 border border-red-500/30' : 'text-zinc-400 border border-transparent'}`}
                            >
                              {language === 'fa' ? 'بلاک' : 'BLOCK'}
                            </button>
                            <button
                              onClick={() => setAsnMode('allow')}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${asnMode === 'allow' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 border border-transparent'}`}
                            >
                              {language === 'fa' ? 'مجاز' : 'ALLOW'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                            {t.asnLockDesc}
                          </label>
                          <input 
                            type="text" 
                            value={asnSelected} 
                            onChange={(e) => setAsnSelected(e.target.value)}
                            placeholder="e.g. 1234, 5678"
                            className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-2.5 text-xs outline-none border ${language === 'fa' ? 'text-right' : 'text-left font-mono'}`}
                          />
                        </div>
                      </motion.div>
                    )}

                    {hasDeadMans && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} space-y-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Skull className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{t.deadMansSwitch}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: `1 ${t.hours}`, val: 3600 },
                            { label: `1 ${t.days}`, val: 86400 },
                            { label: `7 ${t.days}`, val: 604800 }
                          ].map(p => (
                            <button 
                              key={p.val}
                              onClick={() => setDeadMansInterval(p.val)}
                              className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${deadMansInterval === p.val ? (isDarkMode ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-red-500 border-red-500 text-white') : (isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-500')}`}
                            >
                              {localizeDigitsValue(p.label, language)}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9۰-۹]*"
                            value={deadMansInterval ? localizeDigitsValue(Math.floor(deadMansInterval / 3600), language) : ''} 
                            onChange={(e) => {
                              const standardValue = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                              const parsed = parseInt(standardValue, 10);
                              setDeadMansInterval(isNaN(parsed) ? null : parsed * 3600);
                            }}
                            dir={language === 'fa' ? 'rtl' : 'ltr'}
                            className={`flex-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-2.5 text-xs outline-none border`}
                          />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.hours}</span>
                        </div>
                      </motion.div>
                    )}

                    {hasSelfDestruct && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} space-y-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{t.selfDestruct}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">{t.maxViews}</label>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9۰-۹]*"
                              value={localizeDigitsValue(selfDestructHides, language)} 
                              onChange={(e) => {
                                const standardValue = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                                const parsed = parseInt(standardValue, 10);
                                setSelfDestructHides(isNaN(parsed) ? 3 : parsed);
                              }}
                              dir={language === 'fa' ? 'rtl' : 'ltr'}
                              className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200'} rounded-xl p-2.5 text-xs outline-none border transition-all`}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">Triggers</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelfDestructTriggers(prev => prev.includes('tab') ? prev.filter(t => t !== 'tab') : [...prev, 'tab'])}
                                className={`flex-1 py-2 rounded-xl text-[9px] font-bold transition-all border ${selfDestructTriggers.includes('tab') ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-white/10 text-zinc-500'}`}
                              >
                                {t.tabSwitch}
                              </button>
                              <button 
                                onClick={() => setSelfDestructTriggers(prev => prev.includes('print') ? prev.filter(t => t !== 'print') : [...prev, 'print'])}
                                className={`flex-1 py-2 rounded-xl text-[9px] font-bold transition-all border ${selfDestructTriggers.includes('print') ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-white/10 text-zinc-500'}`}
                              >
                                {t.printScreen}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {hasCanary && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'} space-y-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Bird className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{t.canaryToken}</span>
                        </div>
                        <input 
                          type="url" 
                          value={canaryUrl} 
                          onChange={(e) => setCanaryUrl(e.target.value)}
                          placeholder="https://webhook.site/..."
                          dir={language === 'fa' ? 'rtl' : 'ltr'}
                          className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-2.5 text-xs outline-none border ${language === 'fa' ? 'text-right' : 'text-left'}`}
                        />
                      </motion.div>
                    )}

                    {hasTimeLock && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <DateTimePicker
                          value={unlockAt}
                          onChange={(val) => setUnlockAt(val)}
                          language={language}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    )}

                    {hasPassword && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`space-y-4 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                        <div className="relative">
                          <Lock className={`absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                          <input 
                            type={showMasterPwd ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => handlePasswordChange(e.target.value, setPassword, 'masterPassword')}
                            onKeyDown={(e) => handlePasswordKeyDown(e, 'masterPassword')}
                            disabled={disabledInputs['masterPassword']}
                            placeholder={disabledInputs['masterPassword'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : t.masterPasswordPlaceholder}
                            dir="ltr"
                            className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-400'} border rounded-2xl h-[42px] ps-11 pe-11 text-xs xl:rounded-[32px] xl:h-auto xl:p-5 xl:ps-12 xl:pe-12 outline-none focus:border-emerald-500/50 transition-all text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowMasterPwd(!showMasterPwd)}
                            className={`absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                          >
                            {showMasterPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                         <OptionToggle id="opt-honeypot" active={hasHoney} onClick={() => setHasHoney(!hasHoney)} icon={<HoneyPotIcon className="w-4 h-4"/>} title={t.honeyPotDecoy} isDarkMode={isDarkMode} variant="warning" />
                         {hasHoney && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                             animate={{ opacity: 1, scale: 1, y: 0 }} 
                             className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                               isDarkMode 
                                 ? 'bg-gradient-to-b from-amber-500/[0.04] to-transparent border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.03)]' 
                                 : 'bg-gradient-to-b from-amber-50/40 to-white border-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.03)]'
                             } space-y-4`}
                           >
                             <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                             <div className="flex items-center gap-2 border-b pb-2 border-amber-500/10">
                                <HoneyPotIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <span className={`text-[10px] font-black text-amber-500 uppercase tracking-widest ${language === 'fa' ? 'font-vazir' : ''}`}>
                                  {t.decoyConfig}
                                </span>
                              </div>

                             <div className="space-y-3">
                               <div className="space-y-1 text-left">
                                 <label className={`block text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>
                                   {language === 'fa' ? 'گذرواژه تله عسل (فریب)' : 'Honey Decoy Password'}
                                 </label>
                                 <div className="relative">
                                    <HoneyPotIcon className={`absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-amber-500/40' : 'text-amber-500/60'}`} />
                                    <input 
                                       type={showHoneyPwd ? "text" : "password"} 
                                       value={honeyPwd} 
                                       onChange={(e) => handlePasswordChange(e.target.value, setHoneyPwd, 'honeyPassword')}
                                       onKeyDown={(e) => handlePasswordKeyDown(e, 'honeyPassword')}
                                       disabled={disabledInputs['honeyPassword']}
                                       placeholder={disabledInputs['honeyPassword'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : t.decoyPassword} 
                                      dir="ltr" 
                                      className={`w-full ${
                                        isDarkMode 
                                          ? 'bg-zinc-950/50 border-white/5 text-zinc-200 placeholder:text-zinc-700' 
                                          : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400'
                                      } rounded-2xl h-[42px] ps-9 pe-9 text-xs xl:rounded-[24px] xl:h-auto xl:p-4 xl:ps-10 xl:pe-10 outline-none focus:border-amber-500/40 transition-all text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`} 
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowHoneyPwd(!showHoneyPwd)}
                                      className={`absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                                    >
                                      {showHoneyPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                 <span className={`block text-[8px] text-zinc-500 mt-1 leading-normal ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                                   {language === 'fa' ? 'گذرواژه‌ای که برای گمراه‌کردن فوضولچه ها، میخای بهره ببری' : 'The secondary password you surrender to inspectors under duress'}
                                 </span>
                               </div>

                               <div className="space-y-1 text-left">
                                 <label className={`block text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>
                                   {language === 'fa' ? 'کانتنت فریب‌دهنده (تله)' : 'Honey Decoy Payload'}
                                 </label>
                                 <textarea 
                                   value={honeyContent} 
                                   onChange={(e) => setHoneyContent(e.target.value)} 
                                   placeholder={t.decoyContent} 
                                   dir={getAutoDir(honeyContent)} 
                                   className={`w-full h-20 ${
                                     isDarkMode 
                                       ? 'bg-zinc-950/50 border-white/5 text-zinc-200 placeholder:text-zinc-700' 
                                       : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400'
                                   } rounded-2xl p-3 text-xs outline-none resize-none focus:border-amber-500/40 transition-all ${getAutoContainerClass(honeyContent)}`} 
                                 />
                                 <span className={`block text-[8px] text-zinc-500 mt-1 leading-normal ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                                   {language === 'fa' ? 'کانتنت بی‌خطر (مانند آدرس خرید یا ...) که نمایش داده خواهد شد' : 'Innocent fake content (e.g., travel guide, recipes) that will be displayed'}
                                 </span>
                               </div>
                             </div>
                           </motion.div>
                         )}
                      </motion.div>
                    )}

                    <motion.button
                      id="init-encryption-btn"
                      whileHover={isLoading ? {} : { scale: 1.02, translateY: -2 }}
                      whileTap={isLoading ? {} : { scale: 0.98 }}
                      onClick={handleCreate}
                      disabled={isLoading}
                      className={`w-full h-[46px] xl:h-auto xl:py-5 rounded-2xl xl:rounded-[32px] font-black tracking-wide text-sm xl:text-base transition-all flex items-center justify-center gap-4 ${
                        isLoading
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                          : !isConfigurationValid()
                            ? isDarkMode
                              ? 'bg-zinc-800 text-zinc-400 border border-white/5 cursor-pointer hover:bg-zinc-700/80'
                              : 'bg-zinc-200 text-zinc-500 border border-zinc-300 cursor-pointer hover:bg-zinc-300/80'
                            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-2xl shadow-emerald-500/30 cursor-pointer hover:shadow-emerald-500/40 hover:scale-102'
                      }`}
                    >
                      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin"/> : password ? <Lock className="w-5 h-5"/> : <Unlock className="w-5 h-5"/>}
                      <span>{t.initEncryption}</span>
                    </motion.button>
                    </div>

                    {resultUrl && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                        <div className={`flex items-center gap-3 p-3 border rounded-2xl ${isDarkMode ? 'bg-zinc-950/60 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                          <div className="flex-1 text-[10px] font-mono text-emerald-500 break-all p-2 leading-relaxed">{resultUrl}</div>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              copyToClipboardWithAutoClear(resultUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                              setStatus({ type: 'ok', msg: t.linkCopied });
                            }} 
                            className="p-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                          >
                            <Copy className="w-4 h-4"/>
                          </motion.button>
                        </div>
                        <p className={`text-center text-[8px] uppercase tracking-widest font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.shareLink}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                    {!viewData ? (
                      <div className={`space-y-6 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <Search className={`absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                              <input
                                id="view-url-input"
                                type="text"
                                value={viewInput}
                                onKeyDown={(e) => handlePasswordKeyDown(e, 'view-url-input')}
                                onChange={(e) => {
                                  handlePasswordChange(e.target.value, (val) => {
                                    setViewInput(val);
                                    if (status) setStatus(null);
                                  }, 'view-url-input');
                                }}
                                disabled={disabledInputs['view-url-input']}
                                placeholder={disabledInputs['view-url-input'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : t.linkPlaceholder}
                                dir="ltr"
                                className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'} border rounded-2xl h-[42px] ps-11 text-xs xl:rounded-[32px] xl:h-auto xl:p-5 xl:ps-12 outline-none font-mono transition-all focus:border-emerald-500/50 text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
                              />
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleView} 
                              disabled={isLoading || !viewInput} 
                              className="px-8 h-[42px] xl:h-auto xl:py-5 bg-emerald-500 text-black rounded-2xl xl:rounded-[32px] font-black tracking-wide text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 flex items-center justify-center"
                            >
                              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Eye className="w-4 h-4"/>}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ) : viewError ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {viewError.type === 'geo' && (
                          <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'} flex flex-col items-center gap-4 text-center`}>
                            <Globe className="w-12 h-12 text-blue-500" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-blue-500">{t.geoBlocked}</h3>
                            <p className="text-xs text-zinc-500">{t.yourCountry}: <span className="font-bold text-red-500">{viewError.data.your_country}</span></p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {viewError.data.allowed_countries.map((cc: string) => {
                                const c = COUNTRIES.find(x => x.code === cc);
                                return (
                                  <span key={cc} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center gap-2">
                                    <Flag code={cc} emoji={c?.flag || ''} />
                                    <span>✓ {cc}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {viewError.type === 'time' && (
                          <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'} flex flex-col items-center gap-4 text-center`}>
                            <Clock className="w-12 h-12 text-purple-500" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-purple-500">{t.timeLocked}</h3>
                            <p className="text-xs text-zinc-500">{t.unlockAt}: <span className="font-bold">{new Date(viewError.data.unlock_at * 1000).toLocaleString()}</span></p>
                          </div>
                        )}
                        {viewError.type === 'dms' && (
                          <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} flex flex-col items-center gap-4 text-center`}>
                            <Skull className="w-12 h-12 text-red-500" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-red-500">{t.deadMansTriggered}</h3>
                            <p className="text-xs text-zinc-500">Content deleted due to inactivity.</p>
                          </div>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setViewError(null)} 
                          className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
                              : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                          }`}
                        >
                          <Flame className="w-4 h-4 animate-pulse" />
                          <span>{t.terminate}</span>
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div id="active-session-card" className="space-y-8">
                        {viewData.is_e2e_channel ? (
                          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                            {/* Chat Header */}
                            <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-white border-zinc-200'} space-y-4`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
                                    <MessageSquare className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                      E2E Board
                                    </h5>
                                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5 truncate">
                                      Channel: {viewData.id}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRefreshE2EMessages(viewData.id)}
                                  className="w-full sm:w-auto py-2.5 sm:p-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold sm:font-normal"
                                  title="Refresh Chat"
                                >
                                  <RefreshCw className="w-4 h-4 shrink-0" />
                                  <span className="sm:hidden uppercase tracking-widest text-[9px] font-black">Refresh Chat</span>
                                </button>
                              </div>

                              {/* Peer Public Key Input for chat pairing */}
                              <div className="space-y-1.5">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">
                                  {language === 'fa' ? 'شناسه پابلیک طرف مقابل' : 'Peer Public ID'}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input 
                                    type="text"
                                    value={e2eRecipientPubInput}
                                    onChange={(e) => setE2ERecipientPubInput(e.target.value)}
                                    placeholder={language === 'fa' ? 'شناسه پابلیک دوستت را وارد کن' : 'Paste your contact\'s public ID here to encrypt'}
                                    className={`w-full sm:flex-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-3 text-[10px] font-mono outline-none border focus:border-indigo-500/50`}
                                  />
                                  {viewData.e2e_public_key && viewData.e2e_public_key !== e2eKeyPair?.publicKey && (
                                    <button
                                      type="button"
                                      onClick={() => setE2ERecipientPubInput(viewData.e2e_public_key)}
                                      className={`w-full sm:w-auto px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-500/20 transition-all cursor-pointer text-center ${language === 'fa' ? 'font-vazir' : ''}`}
                                    >
                                      {language === 'fa' ? 'بهره از شناسه کانال' : 'Use Channel ID'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Messages Container */}
                            <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} h-[300px] sm:h-[350px] overflow-y-auto space-y-3.5 flex flex-col`}>
                              {e2eActiveMessages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                  <MessageSquare className="w-8 h-8 text-indigo-500/40 animate-pulse mb-2 shrink-0" />
                                  <p className={`text-[10px] uppercase font-bold tracking-widest text-zinc-500 ${language === 'fa' ? 'font-vazir text-[11px]' : ''}`}>
                                    {language === 'fa' ? 'هنوز پیامی وجود ندارد' : 'No messages yet'}
                                  </p>
                                  <p className={`text-[9px] text-zinc-600 mt-1 ${language === 'fa' ? 'font-vazir text-[10px]' : ''}`}>
                                    {language === 'fa' ? 'گفتگو را در کادر زیر آغاز کن.' : 'Start the conversation below.'}
                                  </p>
                                </div>
                              ) : (
                                e2eActiveMessages.map((msg, i) => {
                                  const isSystem = msg.text.startsWith('[Encrypted:') || msg.text.startsWith('[Decryption Failed:') || msg.text.startsWith('[رمزگذاری شده:') || msg.text.startsWith('[خطا در رمزگشایی:');
                                  return (
                                    <motion.div 
                                      key={msg.id || i}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className={`p-3 px-4 rounded-2xl text-xs max-w-[85%] ${
                                        isSystem 
                                          ? 'bg-zinc-800/15 text-zinc-500 border border-zinc-800/25 self-center text-center font-mono text-[9px] my-1 rounded-xl' 
                                          : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 self-start text-left rounded-tl-none'
                                      } shadow-sm`}
                                    >
                                      <p className="leading-relaxed break-words">{msg.text}</p>
                                      <p className="text-[8px] font-mono text-zinc-500 mt-1.5 text-right select-none">
                                        {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                                      </p>
                                    </motion.div>
                                  );
                                })
                              )}
                            </div>

                            {/* Chat input box */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input 
                                type="text"
                                value={e2eMessageText}
                                onChange={(e) => setE2EMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSendE2EMessage(viewData.id, e2eRecipientPubInput);
                                }}
                                placeholder={language === 'fa' ? 'پیامت رو بنویس ...' : 'Type your encrypted message ...'}
                                className={`flex-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-650' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-400'} border rounded-2xl p-3.5 text-xs outline-none transition-all focus:border-indigo-500/50`}
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSendE2EMessage(viewData.id, e2eRecipientPubInput)}
                                disabled={!e2eRecipientPubInput}
                                className="w-full sm:w-auto py-3.5 px-6 bg-indigo-500 text-white font-black tracking-widest text-[10px] uppercase rounded-2xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/15 disabled:opacity-40 shrink-0 cursor-pointer text-center flex items-center justify-center gap-2"
                              >
                                Send
                              </motion.button>
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { triggerShatterExplosion(['#6366f1', '#4f46e5', '#818cf8', '#1e1b4b', isDarkMode ? '#ffffff' : '#1e293b']); setViewData(null); setE2EActiveMessages([]); setE2EChannelDetails(null); (window as any).secureClearClipboard?.(); }} 
                              className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                isDarkMode 
                                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
                                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                              }`}
                            >
                              <Flame className="w-4 h-4 animate-pulse" />
                              <span>{t.terminate}</span>
                            </motion.button>
                          </motion.div>
                        ) : viewData.has_password && !decryptedContent ? (
                          <div className={`space-y-6 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                            <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} flex flex-col items-center gap-4 shadow-inner`}>
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                                <Lock className="w-8 h-8 text-emerald-500" />
                              </div>
                              <div className="text-center">
                                <p className={`text-xs font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>{t.protectedNode}</p>
                                <p className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-widest mt-1`}>{t.authRequired}</p>
                              </div>
                            </div>
                            
                            {biometricsSupported && hasBiometricsForCurrent && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBiometricUnlock}
                                className="w-full mb-4 h-[42px] xl:h-auto xl:py-5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-2xl xl:rounded-[32px] font-black tracking-wider text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg"
                              >
                                <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
                                <span>{t.biometricUnlockBtn}</span>
                              </motion.button>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative w-full sm:flex-1">
                                 <input
                                   type={showViewPwd ? "text" : "password"}
                                   value={viewPassword}
                                   onChange={(e) => {
                                     handlePasswordChange(e.target.value, (val) => {
                                       setViewPassword(val);
                                       if (status) setStatus(null);
                                     }, 'viewPassword');
                                   }}
                                   disabled={disabledInputs['viewPassword']}
                                   placeholder={disabledInputs['viewPassword'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : t.enterMasterPassword}
                                   dir="ltr"
                                   className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'} border rounded-2xl h-[42px] px-4 pe-11 text-xs xl:rounded-[32px] xl:h-auto xl:p-5 xl:ps-12 xl:pe-12 outline-none transition-all focus:border-emerald-500/50 text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
                                   onKeyDown={(e) => {
                                     handlePasswordKeyDown(e, 'viewPassword');
                                     if (e.key === 'Enter') performDecryption(viewData, viewPassword, viewData.isFile);
                                   }}
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setShowViewPwd(!showViewPwd)}
                                   className={`absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                                 >
                                   {showViewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                 </button>
                               </div>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => performDecryption(viewData, viewPassword, viewData.isFile)} 
                                disabled={isDecrypting}
                                className="w-full sm:w-auto px-10 h-[42px] xl:h-auto xl:py-5 bg-emerald-500 text-black rounded-2xl xl:rounded-[32px] font-black tracking-wide text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center min-w-[120px]"
                              >
                                {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin"/> : t.decrypt}
                              </motion.button>
                            </div>

                            {biometricsSupported && (
                              <div className="flex items-center gap-3 mt-4 px-3 py-1">
                                <label className="relative flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={rememberWithBiometrics}
                                    onChange={(e) => setRememberWithBiometrics(e.target.checked)}
                                    className="sr-only peer" 
                                  />
                                  <div className={`w-8 h-4 rounded-full peer transition-all ${isDarkMode ? 'bg-zinc-800/60' : 'bg-zinc-300'} peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4`}></div>
                                </label>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  {t.enableBiometricRemember}
                                </span>
                              </div>
                            )}

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { triggerShatterExplosion(['#ef4444', '#dc2626', '#f87171', '#27272a', isDarkMode ? '#ffffff' : '#1e293b']); setViewData(null); setDecryptedContent(null); setViewInput(''); setStatus(null); setViewPassword(''); }} 
                              className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                isDarkMode 
                                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
                                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                              }`}
                            >
                              <Flame className="w-4 h-4 animate-pulse" />
                              <span>{t.terminate}</span>
                            </motion.button>
                          </div>
                        ) : decryptedContent ? (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {!isHoneyView && (
                              <div className="flex flex-col gap-3">
                                <MetaItem label={t.maxViews} value={viewData.max_views || '∞'} isDarkMode={isDarkMode} language={language} iconType="maxViews" />
                                <MetaItem label={t.expiresIn} value={formatExpirationDate(viewData.expires_at, language)} isDarkMode={isDarkMode} language={language} iconType="expires" />
                                <MetaItem label={t.views || 'Views'} value={viewData.views} isDarkMode={isDarkMode} language={language} iconType="views" />
                              </div>
                            )}
                            {typeof decryptedContent === 'string' ? (
                              <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
                                <div className="relative group">
                                  <div 
                                    dir={getAutoDir(decryptedContent)} 
                                    className={`p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border ${
                                      isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                                    } text-sm whitespace-pre-wrap break-all leading-relaxed shadow-inner min-h-[280px] ${
                                      getAutoDir(decryptedContent) === 'rtl' ? 'pl-28' : 'pr-28'
                                    } ${getAutoContainerClass(decryptedContent)}`}
                                  >
                                    {decryptedContent}
                                  </div>
                                  <div className={`absolute top-4 ${
                                    getAutoDir(decryptedContent) === 'rtl' ? 'left-4' : 'right-4'
                                  } flex items-center gap-2`}>
                                    <button
                                      onClick={() => {
                                        setSharePendingContent(decryptedContent);
                                        setShowShareConfirm(true);
                                      }}
                                      className={`p-2.5 rounded-xl border transition-all duration-200 shadow-md ${
                                        isDarkMode 
                                          ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' 
                                          : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                                      }`}
                                      title={t.share || "Share"}
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await copyToClipboardWithAutoClear(decryptedContent, 30000, (msg) => setStatus({ type: 'warn', msg }), language === 'fa' ? 'fa' : 'en');
                                          setStatus({ type: 'ok', msg: t.copySuccess || "Content copied to clipboard" });
                                        } catch (err) {
                                          console.error("Failed to copy", err);
                                        }
                                      }}
                                      className={`p-2.5 rounded-xl border transition-all duration-200 shadow-md ${
                                        isDarkMode 
                                          ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' 
                                          : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                                      }`}
                                      title={t.copy}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </DecryptedPayloadShield>
                            ) : (
                              <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
                                <div className={`p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-zinc-50 border-zinc-200'} flex flex-col items-center justify-center gap-6 shadow-2xl min-h-[280px]`}>
                                  {decryptedContent.kind === 'image' || decryptedContent.type.startsWith('image/') ? (
                                    <div className="relative group">
                                      <img src={decryptedContent.url} className="max-h-80 rounded-3xl shadow-2xl border border-white/10" alt="Decrypted" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-emerald-400" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                      <File className="w-10 h-10 text-emerald-500" />
                                    </div>
                                  )}
                                  <div className="text-center">
                                    <p className="text-base font-black tracking-tight">{decryptedContent.name}</p>
                                    <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono mt-2 tracking-widest`}>{decryptedContent.type} • {localizeDigitsValue((viewData.size / 1024 / 1024).toFixed(2), language)} MB</p>
                                  </div>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { const a = document.createElement('a'); a.href = decryptedContent.url; a.download = decryptedContent.name; a.click(); }} 
                                    className="px-10 py-4 bg-emerald-500 text-black rounded-[20px] font-black tracking-wide text-xs hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-2xl shadow-emerald-500/30"
                                  >
                                    <Download className="w-5 h-5"/> {t.downloadAsset}
                                  </motion.button>
                                </div>
                              </DecryptedPayloadShield>
                            )}

                            {decryptedContent.kind === 'stego' && decryptedContent.stegoText && (
                              <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full p-8 rounded-[32px] border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-200'} space-y-4`}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                      <Search className="w-4 h-4" />
                                      {language === 'fa' ? 'پیام پنهان استگانوگرافی' : 'Steganography Hidden Message'}
                                    </span>
                                    <button 
                                      onClick={() => {
                                        copyToClipboardWithAutoClear(decryptedContent.stegoText, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                                        setStatus({ type: 'ok', msg: t.linkCopied });
                                      }}
                                      className={`text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border hover:text-emerald-500 transition-all ${
                                        isDarkMode ? 'border-white/5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                                      }`}
                                    >
                                      {t.copy || 'Copy'}
                                    </button>
                                  </div>
                                  <div className={`text-sm ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} whitespace-pre-wrap break-all leading-relaxed ${language === 'fa' ? 'font-vazir text-right' : 'font-sans text-left'}`}>
                                    {decryptedContent.stegoText}
                                  </div>
                                </motion.div>
                              </DecryptedPayloadShield>
                            )}

                            {decryptedContent.kind === 'audio' && (
                              <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full p-8 rounded-[32px] border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-200'} space-y-4`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                      <Headphones className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                        Decrypted WAV Stego Audio
                                      </h5>
                                      <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                        {decryptedContent.name || 'stego.wav'}
                                      </p>
                                    </div>
                                  </div>
                                  <audio controls className="w-full mt-2" src={decryptedContent.url || `data:audio/wav;base64,${decryptedContent.base64}`} />
                                </motion.div>
                              </DecryptedPayloadShield>
                            )}

                            {decryptedContent.kind === 'voice' && (
                              <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full p-8 rounded-[32px] border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-200'} space-y-4`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                      <Mic className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                        {language === 'fa' ? 'صدای ریکورد شده رمزگشایی شده' : 'Decrypted Voice Message'}
                                      </h5>
                                      <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                        {decryptedContent.name || 'voice.webm'}
                                      </p>
                                    </div>
                                  </div>
                                  <audio controls className="w-full mt-2" src={decryptedContent.url || `data:audio/webm;base64,${decryptedContent.base64}`} />
                                </motion.div>
                              </DecryptedPayloadShield>
                            )}

                            {/* QR Code and Mobile Sharing Hub Component */}
                            {!isHoneyView && (
                              <QrCodeHub 
                                decryptedContent={decryptedContent}
                                isDarkMode={isDarkMode}
                                t={t}
                                setStatus={setStatus}
                                language={language}
                              />
                            )}

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { triggerShatterExplosion(['#10b981', '#059669', '#34d399', '#022c22', isDarkMode ? '#ffffff' : '#1e293b']); setViewData(null); setDecryptedContent(null); setViewInput(''); setStatus(null); setIsHoneyView(false); setViewPassword(''); (window as any).secureClearClipboard?.(); }} 
                              className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                isDarkMode 
                                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
                                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                              }`}
                            >
                              <Flame className="w-4 h-4 animate-pulse" />
                              <span>{t.terminate}</span>
                            </motion.button>
                          </motion.div>
                        ) : null}
                      </div>
                    )}

                    {!viewData && !viewError && !decryptedContent && (
                      <div className="pt-8 border-t border-white/5">
                        <button 
                          onClick={() => setContentType('stego')}
                          className={`w-full py-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'} text-xs font-black tracking-wide transition-all flex items-center justify-center gap-3`}
                        >
                          <Search className="w-4 h-4" />
                          {t.stegoExtract}
                        </button>
                        
                        {contentType === 'stego' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
                            <Dropzone 
                              onSelect={(e) => {
                                if (e.target.files?.[0]) setStegoExtractFile(e.target.files[0]);
                              }} 
                              selectedFile={stegoExtractFile} 
                              icon={<ImageIcon className="w-10 h-10"/>} 
                              accept="image/png" 
                              label={t.stegoExtractDesc} 
                              isDarkMode={isDarkMode} 
                              language={language}
                            />
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                 <input 
                                   type={showStegoExtractPwd ? "text" : "password"} 
                                   value={stegoExtractPassword} 
                                   onChange={(e) => handlePasswordChange(e.target.value, setStegoExtractPassword, 'stegoExtractPassword')}
                                   onKeyDown={(e) => handlePasswordKeyDown(e, 'stegoExtractPassword')}
                                   disabled={disabledInputs['stegoExtractPassword']}
                                   placeholder={disabledInputs['stegoExtractPassword'] ? (language === 'fa' ? '⚠️ کیبورد نامعتبر! قفل موقت ...' : '⚠️ Invalid Keyboard! Temporarily Locked ...') : t.masterPasswordPlaceholder}
                                   dir="ltr"
                                   className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'} border rounded-2xl h-[42px] px-4 pe-11 text-xs outline-none transition-all focus:border-emerald-500/50 text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setShowStegoExtractPwd(!showStegoExtractPwd)}
                                   className={`absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'}`}
                                 >
                                   {showStegoExtractPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                 </button>
                               </div>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStegoExtract} 
                                disabled={isStegoExtracting || !stegoExtractFile} 
                                className="px-8 h-[42px] bg-emerald-500 text-black rounded-2xl font-black tracking-wide text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 flex items-center justify-center"
                              >
                                {isStegoExtracting ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                              </motion.button>
                            </div>
                            {stegoExtractResult && (
                              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t.extractedData}</span>
                                  <button onClick={() => {
                                    copyToClipboardWithAutoClear(stegoExtractResult, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                                  }} className="text-[10px] font-bold text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">{t.copy}</button>
                                </div>
                                <div dir={language === 'fa' ? 'rtl' : 'ltr'} className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} text-sm ${language === 'fa' ? 'font-vazir' : 'font-sans'} whitespace-pre-wrap break-all leading-relaxed shadow-inner ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                                  {stegoExtractResult}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Global Network Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 flex flex-col"
        >
          <div className={`flex-1 ${isDarkMode ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl'} backdrop-blur-2xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col relative group transition-all duration-700`}>
            {/* Map Header */}
            <div dir="ltr" className="p-4 sm:p-8 pb-3 sm:pb-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 ${isDarkMode ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-100'} border rounded-2xl shadow-inner`}>
                  <ShieldAlert className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} animate-pulse`} />
                  <span className={`text-[8px] sm:text-[9px] font-mono ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-black uppercase tracking-widest`}>
                    SOS: HELP IRAN
                  </span>
                </div>
              </div>
            </div>

            {/* Map Component */}
            <div className="flex-1 relative min-h-[280px] xs:min-h-[320px] sm:min-h-[450px] lg:min-h-[650px] flex items-center justify-center">
              <div className={`absolute inset-0 ${isDarkMode ? 'opacity-60 group-hover:opacity-80' : 'opacity-60 group-hover:opacity-80'} transition-opacity duration-1000`}>
                <WorldMap isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="mt-8 mb-4 lg:mb-6 flex flex-col items-center justify-center gap-4 text-center select-none"
      >
        <div className={`h-px w-32 ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-black/5 to-transparent'}`} />
        
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div dir="ltr" className="flex items-center justify-center gap-1.5 text-zinc-500/80 dark:text-zinc-600/80 text-center text-[10px] font-bold tracking-wide">
            <span className="uppercase tracking-widest text-[9px] font-black opacity-80">
              Powered By :
            </span>
            <span>
              Shervina
            </span>
            <Heart className="w-3 h-3 text-zinc-500/40 fill-zinc-500/10 shrink-0" />
            <span>
              (IRAN's Girl)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Self-Destruct Overlay */}
      <AnimatePresence>
        {isSelfDestructed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-black backdrop-blur-3xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md space-y-8"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"
                />
                <div className="relative w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-500/50 mx-auto">
                  <Skull className="w-12 h-12 text-black" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-red-500">{t.selfDestructTriggered}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{t.selfDestructMessage}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all"
              >
                {t.terminateSession}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Self-Destruct Counter (Floating) */}
      <AnimatePresence>
        {viewData?.self_destruct_hides && !isSelfDestructed && hidesCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 bg-red-500 text-black rounded-full font-black text-xs md:text-sm shadow-2xl shadow-red-500/40 flex items-center gap-3"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{localizeDigitsValue(viewData.self_destruct_hides - hidesCount, language)} {t.hidesRemaining}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Warning Modal Popup */}
      <AnimatePresence>
        {showPasswordWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-md w-full p-6 md:p-8 rounded-[32px] border ${
                isDarkMode 
                  ? 'bg-zinc-950 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.1)] text-zinc-100' 
                  : 'bg-white border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-zinc-800'
              } z-10 space-y-6 flex flex-col items-center text-center`}
            >
              {/* Glowing Icon */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"
                />
                <div className={`relative w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg ${
                  isDarkMode ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}>
                  <Lock className="w-8 h-8" />
                </div>
              </div>

              {/* Text segment with custom font style */}
              <div className="space-y-3">
                <h3 className={`text-lg font-extrabold ${language === 'fa' ? 'font-vazir' : 'font-display'}`}>
                  {t.passwordWarningTitle}
                </h3>
                <p className={`text-xs leading-relaxed font-normal ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}>
                  {t.passwordWarningDesc}
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPasswordWarning(false)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  isDarkMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/10' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/10'
                }`}
              >
                {language === 'fa' ? 'گرفتم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Warning Modal Popup */}
      <AnimatePresence>
        {showContentWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContentWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-md w-full p-6 md:p-8 rounded-[32px] border ${
                isDarkMode 
                  ? 'bg-zinc-950 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] text-zinc-100' 
                  : 'bg-white border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-zinc-800'
              } z-10 space-y-6 flex flex-col items-center text-center`}
            >
              {/* Glowing Icon */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"
                />
                <div className={`relative w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg ${
                  isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>

              {/* Text segment with custom font style */}
              <div className="space-y-3">
                <h3 className={`text-lg font-extrabold ${language === 'fa' ? 'font-vazir' : 'font-display'}`}>
                  {t.contentWarningTitle}
                </h3>
                <p className={`text-xs leading-relaxed font-normal ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}>
                  {t.contentWarningDesc}
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowContentWarning(false)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  isDarkMode 
                    ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/10' 
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/10'
                }`}
              >
                {language === 'fa' ? 'گرفتم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Layout Warning Modal Popup */}
      <AnimatePresence>
        {showKeyboardWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyboardWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-md w-full p-6 md:p-8 rounded-[32px] border ${
                isDarkMode 
                  ? 'bg-zinc-950 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] text-zinc-100' 
                  : 'bg-white border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-zinc-800'
              } z-10 space-y-6 flex flex-col items-center text-center`}
            >
              {/* Glowing Icon */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"
                />
                <div className={`relative w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg ${
                  isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <Keyboard className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              {/* Text segment with custom font style */}
              <div className="space-y-3">
                <h3 className={`text-lg font-extrabold ${language === 'fa' ? 'font-vazir' : 'font-display'}`}>
                  {t.keyboardWarningTitle}
                </h3>
                <p className={`text-xs leading-relaxed font-normal ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}>
                  {t.keyboardWarningDesc}
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowKeyboardWarning(false)}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  isDarkMode 
                    ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/10' 
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/10'
                }`}
              >
                {language === 'fa' ? 'گرفتم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShortcutManager 
        onClearEverything={handleClearEverything}
        onToggleTab={handleToggleTab}
        onOpenHelpWithTab={handleOpenTravelerManual}
      />

      <ScreenSecurityGuard 
        isDarkMode={isDarkMode}
        language={language}
        isOpen={showSecurityShield}
        onClose={() => setShowSecurityShield(false)}
      />

      <TravelerManualModal
        isOpen={showTravelerManual}
        onClose={() => setShowTravelerManual(false)}
        language={language}
        isDarkMode={isDarkMode}
        onStartTour={startTour}
        defaultTab={manualDefaultTab}
      />

      <AnimatePresence>
        {showShareConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowShareConfirm(false);
                setSharePendingContent('');
              }}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative w-full max-w-md overflow-hidden rounded-[32px] border p-6 shadow-2xl ${
                isDarkMode 
                  ? 'bg-zinc-950 border-white/10 text-zinc-100 shadow-amber-500/5' 
                  : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
              }`}
              dir={language === 'fa' ? 'rtl' : 'ltr'}
            >
              {/* Header Icon & Alert Glow */}
              <div className="flex flex-col items-center text-center mt-2 space-y-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[12px] rounded-full animate-pulse" />
                  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'bg-amber-50 border-amber-500/20 text-amber-600 shadow-sm'
                  }`}>
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-1.5 px-2">
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    {t.shareConfirmTitle || (language === 'fa' ? 'هشدار امنیتی' : 'Security Advisory')}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {t.shareConfirmDesc || (language === 'fa' 
                      ? ' در حال اشتراک‌گذاری دیتای رمزگشایی‌شده حساس هستیا! پیش از فرستادن، مطمئن شو که به مقصد یا برنامه مقصد اعتماد کامل داری.' 
                      : 'You are about to share decrypted sensitive data. Make sure you trust the destination or application before sending.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const content = sharePendingContent;
                    setShowShareConfirm(false);
                    setSharePendingContent('');
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          text: content,
                        });
                      } catch (err) {
                        console.error("Error sharing:", err);
                      }
                    } else {
                      try {
                        await copyToClipboardWithAutoClear(content, 30000, (msg) => setStatus({ type: 'warn', msg }), language === 'fa' ? 'fa' : 'en');
                        setStatus({ type: 'ok', msg: t.copySuccess || (language === 'fa' ? 'کانتنت با پیروزی کپی شد' : "Content copied to clipboard") });
                      } catch (err) {
                        console.error("Failed to copy:", err);
                      }
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                    isDarkMode
                      ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-amber-600 text-white hover:bg-amber-700 shadow-md'
                  }`}
                >
                  {t.shareConfirmBtn || (language === 'fa' ? 'اطمینان دارم، اشتراک‌گذاری' : 'I Trust, Share')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareConfirm(false);
                    setSharePendingContent('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all duration-200 active:scale-[0.98] ${
                    isDarkMode
                      ? 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  {t.cancel || (language === 'fa' ? 'کنسل' : 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification System */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
          >
            <div 
              className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl ${
                isDarkMode 
                  ? 'bg-zinc-900/95 border-white/10 text-zinc-100 shadow-black/40' 
                  : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
              } ${
                status.type === 'err' 
                  ? 'border-l-4 border-l-red-500' 
                  : status.type === 'warn'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-emerald-500'
              }`}
              dir={language === 'fa' ? 'rtl' : 'ltr'}
            >
              {/* Icon */}
              <div className="shrink-0">
                {status.type === 'err' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : status.type === 'warn' ? (
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                ) : (
                  <Check className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                {status.msg.replace(/^([❌⚠️🔒✅📋🛡️]|\ud83c[\udf00-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\udd00-\udfff])\s*/, '').trim()}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setStatus(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode 
                    ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' 
                    : 'text-zinc-400 hover:text-zinc-650 hover:bg-black/5'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


