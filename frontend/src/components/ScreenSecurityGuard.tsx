import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Lock, 
  EyeOff, 
  Printer, 
  Copy, 
  Sliders, 
  X, 
  Info,
  Check,
  AlertTriangle,
  Flame,
  UserCheck,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { forceClearClipboard } from '../utils/clipboardManager';
import { isBiometricsSupported, registerBiometrics, verifyBiometrics } from '../utils/webAuthn';

const toPersianNum = (numStr: string) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return numStr.replace(/[0-9]/g, w => farsiDigits[parseInt(w, 10)]);
};

interface ScreenSecurityGuardProps {
  isDarkMode: boolean;
  language: 'en' | 'fa';
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenSecurityGuard: React.FC<ScreenSecurityGuardProps> = ({
  isDarkMode,
  language,
  isOpen,
  onClose,
}) => {
  // Config state with localStorage persistence
  const [blurActive, setBlurActive] = useState(() => {
    return localStorage.getItem('vault_security_blur') !== 'false';
  });
  const [keysActive, setKeysActive] = useState(() => {
    return localStorage.getItem('vault_security_keys') !== 'false';
  });
  const [printActive, setPrintActive] = useState(() => {
    return localStorage.getItem('vault_security_print') !== 'false';
  });
  const [copyActive, setCopyActive] = useState(() => {
    return localStorage.getItem('vault_security_copy') !== 'false';
  });
  const [noiseActive, setNoiseActive] = useState(() => {
    return localStorage.getItem('vault_security_noise') === 'true'; // false by default
  });

  const [biometricLockActive, setBiometricLockActive] = useState(() => {
    return localStorage.getItem('vault_security_biometric_lock') !== 'false'; // true by default
  });

  const [lockMethod, setLockMethod] = useState<'biometric' | 'pin'>(() => {
    const saved = localStorage.getItem('vault_app_lock_method');
    if (saved === 'biometric' || saved === 'pin') return saved;
    return 'biometric';
  });

  const [pinCode, setPinCode] = useState(() => {
    return localStorage.getItem('vault_app_pin_code') || '';
  });

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [pinSetupStep, setPinSetupStep] = useState<'idle' | 'enter' | 'confirm'>('idle');
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');

  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [lockStatus, setLockStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return !!localStorage.getItem('vault_app_biometric_cred');
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tempBlur, setTempBlur] = useState(false);

  useEffect(() => {
    isBiometricsSupported().then(supported => {
      setBiometricsSupported(supported);
    });
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('vault_security_blur', String(blurActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [blurActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_keys', String(keysActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [keysActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_print', String(printActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [printActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_copy', String(copyActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [copyActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_noise', String(noiseActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [noiseActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_biometric_lock', String(biometricLockActive));
    window.dispatchEvent(new Event('vault_shields_updated'));
  }, [biometricLockActive]);

  // Toast notifier helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Clipboard Protection and Auto-Clear System
  useEffect(() => {
    let selfDestructTimer: NodeJS.Timeout | null = null;

    const clearClipboardNow = async () => {
      try {
        await navigator.clipboard.writeText('');
      } catch (_) {
        try {
          const activeEl = document.activeElement;
          const input = document.createElement('input');
          input.value = ' ';
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          if (activeEl instanceof HTMLElement) activeEl.focus();
        } catch (___) {}
      }
    };

    const handleClearClipboard = () => {
      if (selfDestructTimer) {
        clearTimeout(selfDestructTimer);
        selfDestructTimer = null;
      }
      clearClipboardNow();
    };

    const handleCopyToClipboard = async (text: string) => {
      if (selfDestructTimer) {
        clearTimeout(selfDestructTimer);
        selfDestructTimer = null;
      }
      try {
        await navigator.clipboard.writeText(text);
        if (!copyActive) {
          triggerToast(
            language === 'fa'
              ? '📋 کانتنت کپی شد!'
              : '📋 Copied to clipboard.'
          );
          return true;
        }

        triggerToast(
          language === 'fa'
            ? '📋 کانتنت کپی شد! پاکسازی خودکار پس از ۳۰ ثانیه.'
            : '📋 Copied to clipboard. Self-destruct in 30 seconds.'
        );

        // Schedule self-destruct in 30 seconds
        selfDestructTimer = setTimeout(() => {
          clearClipboardNow();
        }, 30000);
        return true;
      } catch (err) {
        return false;
      }
    };

    // Expose globally
    (window as any).secureClearClipboard = handleClearClipboard;
    (window as any).secureCopyToClipboard = handleCopyToClipboard;

    const handleHideOrBlur = () => {
      // Instantly clear clipboard when page/tab is hidden or blurred only if copy protection is active
      if (copyActive) {
        clearClipboardNow();
      }
    };

    window.addEventListener('blur', handleHideOrBlur);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleHideOrBlur();
      }
    });
    window.addEventListener('pagehide', handleHideOrBlur);
    window.addEventListener('beforeunload', handleHideOrBlur);

    return () => {
      if (selfDestructTimer) clearTimeout(selfDestructTimer);
      delete (window as any).secureClearClipboard;
      delete (window as any).secureCopyToClipboard;
      window.removeEventListener('blur', handleHideOrBlur);
      window.removeEventListener('pagehide', handleHideOrBlur);
      window.removeEventListener('beforeunload', handleHideOrBlur);
    };
  }, [language, copyActive]);

  // 1. App-Switcher & Focus Loss Protection (with Biometric Lock)
  const handleUnlock = async () => {
    if (!biometricLockActive) {
      setIsScreenLocked(false);
      setLockStatus('idle');
      return;
    }

    if (lockMethod === 'pin') {
      // PIN method doesn't trigger WebAuthn
      return;
    }

    if (!biometricsSupported) {
      // If biometric is chosen but unsupported, fallback to PIN if set, or just unlock
      const hasPin = !!localStorage.getItem('vault_app_pin_code');
      if (hasPin) {
        setLockMethod('pin');
        return;
      }
      setIsScreenLocked(false);
      setLockStatus('idle');
      return;
    }

    const credId = localStorage.getItem('vault_app_biometric_cred');
    if (!credId) {
      // Not enrolled yet. Enroll now!
      setLockStatus('verifying');
      try {
        const newCredId = await registerBiometrics('app-lock');
        if (newCredId) {
          localStorage.setItem('vault_app_biometric_cred', newCredId);
          setIsEnrolled(true);
          setIsScreenLocked(false);
          setLockStatus('success');
          triggerToast(
            language === 'fa'
              ? '✅ قفل اثرانگشت/چهره با پیروزی، اکتیو شد!'
              : '✅ Fingerprint/FaceID lock enabled successfully!'
          );
        } else {
          setLockStatus('error');
        }
      } catch (err) {
        console.error("Enrollment failed:", err);
        setLockStatus('error');
      }
      return;
    }

    // Already enrolled, verify!
    setLockStatus('verifying');
    try {
      const verified = await verifyBiometrics(credId);
      if (verified) {
        setIsScreenLocked(false);
        setLockStatus('idle');
      } else {
        setLockStatus('error');
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setLockStatus('error');
    }
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length >= 4 || lockStatus === 'success') return;
    const newVal = enteredPin + digit;
    setEnteredPin(newVal);

    if (newVal.length === 4) {
      const correctPin = localStorage.getItem('vault_app_pin_code');
      if (newVal === correctPin) {
        setLockStatus('success');
        setTimeout(() => {
          setIsScreenLocked(false);
          setEnteredPin('');
          setLockStatus('idle');
        }, 500);
      } else {
        setPinError(true);
        setEnteredPin('');
        triggerToast(
          language === 'fa'
            ? '❌ پین‌کد اشتباهه!'
            : '❌ Incorrect PIN'
        );
        setTimeout(() => setPinError(false), 500);
      }
    }
  };

  const handlePinBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!isScreenLocked || lockMethod !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScreenLocked, lockMethod, enteredPin]);

  useEffect(() => {
    if (!blurActive) {
      setIsScreenLocked(false);
      return;
    }

    const lockApp = () => {
      if (!biometricLockActive) return;

      const hasPin = !!localStorage.getItem('vault_app_pin_code');
      const hasBiometric = !!localStorage.getItem('vault_app_biometric_cred');

      if (lockMethod === 'biometric' && hasBiometric) {
        setIsScreenLocked(true);
        setLockStatus('idle');
      } else if (lockMethod === 'pin' && hasPin) {
        setIsScreenLocked(true);
        setLockStatus('idle');
      }
    };

    const handleBlur = () => {
      lockApp();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lockApp();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    // Initial check
    if (document.visibilityState === 'hidden') {
      lockApp();
    }

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [blurActive, biometricLockActive, lockMethod]);

  // Attempt auto-prompt when user returns to focus the window (only for biometric method)
  useEffect(() => {
    if (isScreenLocked && lockMethod === 'biometric' && biometricsSupported && isEnrolled && biometricLockActive) {
      const handleWindowFocus = () => {
        if (lockStatus === 'idle') {
          // Trigger biometric verification on tab focus return
          handleUnlock();
        }
      };
      window.addEventListener('focus', handleWindowFocus);
      return () => {
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [isScreenLocked, biometricsSupported, isEnrolled, lockStatus, biometricLockActive, lockMethod]);

  // 2. Keyboard Interceptor (PrintScreen, Save, Print blocking)
  useEffect(() => {
    if (!keysActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key intercept
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setTempBlur(true);
        triggerToast(language === 'fa' ? '⚠️ تلاش برای عکس‌برداری بلاک شد! سپر اکتیو کلاینت.' : '⚠️ PrintScreen blocked! Vault visual shielding active.');
        
        // Scrub clipboard
        try {
          navigator.clipboard.writeText('');
        } catch (_) {}

        setTimeout(() => setTempBlur(false), 2000);
      }

      // Ctrl + P or Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerToast(language === 'fa' ? '❌ پرینت مستقیم صفحات مسدوده.' : '❌ Direct document printing is blocked.');
      }

      // Ctrl + S or Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerToast(language === 'fa' ? '❌ ذخیره‌سازی لوکال قالب کد وب مسدوده.' : '❌ Local document cloning is blocked.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keysActive, language]);

  // 3. Print Spool Block (CSS injection)
  useEffect(() => {
    if (!printActive) return;

    const style = document.createElement('style');
    style.id = 'print-security-shield';
    style.innerHTML = `
      @media print {
        body { display: none !important; }
        html { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const element = document.getElementById('print-security-shield');
      if (element) {
        element.remove();
      }
    };
  }, [printActive]);

  // 4. Block Selection & Right-Click scraper hooks
  useEffect(() => {
    if (!copyActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow right clicks on text inputs, but block globally elsewhere
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      e.preventDefault();
      
      // If it is within a text view container or decrypted payload, don't show the warning toast (prevent whistle)
      if (target.closest('.no-whistle-menu')) return;
      
      triggerToast(language === 'fa' ? '🔒 راست‌کلیک مسدوده!' : '🔒 Menu access blocked!');
    };

    const handleCopy = (e: ClipboardEvent) => {
      // Overwrite clipboard on copying any text
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [copyActive, language]);

  const presetHigh = () => {
    setBlurActive(true);
    setKeysActive(true);
    setPrintActive(true);
    setCopyActive(true);
    setBiometricLockActive(true);
    setNoiseActive(true);
    triggerToast(language === 'fa' ? 'سپر حفاظتی روی حداکثر تنظیمه!' : 'Security Level set to Maximum Protection!');
  };

  const presetStandard = () => {
    setBlurActive(true);
    setKeysActive(true);
    setPrintActive(true);
    setCopyActive(true);
    setBiometricLockActive(true);
    setNoiseActive(false);
    triggerToast(language === 'fa' ? 'محافظت استاندارد اکتیوه!' : 'Standard Protection Profile enabled.');
  };

  const presetNone = () => {
    setBlurActive(false);
    setKeysActive(false);
    setPrintActive(false);
    setCopyActive(false);
    setBiometricLockActive(false);
    setNoiseActive(false);
    triggerToast(language === 'fa' ? 'تمام سپرهای امنیتی غیرفعال شدن!' : 'All protective shields disabled!');
  };

  return (
    <>
      {/* Noise Jammer background overlay (Codec Video compression Jammer) */}
      {noiseActive && (
        <div className="fixed inset-0 z-[2] pointer-events-none opacity-[0.015] select-none mix-blend-overlay overflow-hidden">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-500 via-zinc-900 to-black animate-pulse" />
        </div>
      )}

      {/* Temp blur when PrintScreen is triggered */}
      {tempBlur && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex items-center justify-center">
          <div className="text-center p-6 text-zinc-100 max-w-md">
            <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-lg font-black uppercase tracking-wider">
              {language === 'fa' ? 'سپر اسکرین‌شات اکتیوه!' : 'Screenshot Shield Triggered'}
            </h2>
            <p className="text-xs text-zinc-400 mt-2">
              {language === 'fa' ? 'صفحه موقتاً مسدود شده!' : 'Display temporarily hidden!'}
            </p>
          </div>
        </div>
      )}

      {/* Multitasking & App Switcher / Visibility Shield Overlay (Biometric Lock) */}
      <AnimatePresence>
        {isScreenLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[99999] bg-[#030303]/95 backdrop-blur-[55px] flex flex-col items-center justify-center p-8 select-none cursor-default"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="flex flex-col items-center justify-center text-center max-w-sm w-full"
            >
              <div className="w-full max-w-[280px]">
                {/* Unified Header (Lock Icon) */}
                {biometricsSupported ? (
                  isEnrolled ? (
                    <div className="flex flex-col items-center justify-center mb-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock();
                        }}
                        className="w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.05)] relative cursor-pointer active:scale-95 transition-all group hover:border-emerald-500/30"
                        title={language === 'fa' ? 'اسکن اثرانگشت / چهره' : 'Scan Fingerprint / FaceID'}
                      >
                        <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping opacity-35" style={{ animationDuration: '3s' }} />
                        <Lock className={`w-10 h-10 transition-all duration-300 ${
                          lockStatus === 'verifying' 
                            ? 'text-teal-400 animate-pulse' 
                            : lockStatus === 'error' 
                              ? 'text-rose-500 scale-110' 
                              : 'text-emerald-500 hover:text-emerald-400'
                        }`} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center mb-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(); // triggers registration
                        }}
                        className="w-20 h-20 rounded-full bg-zinc-500/5 border border-dashed border-zinc-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.2)] cursor-pointer active:scale-95 transition-all group hover:border-emerald-500/30 animate-pulse"
                        title={language === 'fa' ? 'فعال‌سازی اثرانگشت' : 'Enroll Fingerprint'}
                      >
                        <Lock className="w-10 h-10 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-5 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.02)]">
                    <Lock className="w-7 h-7 text-amber-500" />
                  </div>
                )}

                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300/80 mb-1">
                  {language === 'fa' ? 'فضای کاری قفل شده!' : 'Workspace Suspended'}
                </h2>
                <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                  {biometricsSupported
                    ? (language === 'fa' ? 'با اثرانگشت یا پین‌کد قفل‌گشایی کن' : 'Unlock with Biometrics or PIN')
                    : (language === 'fa' ? 'پین‌کد امنیتی را وارد کن' : 'Enter workspace 4-digit PIN')
                  }
                </p>

                {/* Dot Slots with Shake on error */}
                <motion.div 
                  dir="ltr"
                  animate={pinError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center gap-4 mb-8"
                >
                  {Array.from({ length: 4 }).map((_, i) => {
                    const isSuccess = lockStatus === 'success';
                    const filled = isSuccess || enteredPin.length > i;
                    return (
                      <div 
                        key={i} 
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                          isSuccess
                            ? 'bg-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.9)]'
                            : filled 
                              ? 'bg-zinc-400 scale-110 shadow-[0_0_8px_rgba(161,161,170,0.3)]' 
                              : 'border-2 border-zinc-800'
                        }`}
                      />
                    );
                  })}
                </motion.div>

                {/* Numeric Keypad Dialer */}
                <div dir="ltr" className="grid grid-cols-3 gap-4 justify-items-center mb-6">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        if (!pinCode) {
                          triggerToast(
                            language === 'fa'
                              ? '⚠️ ابتدا پین‌کد را در تنظیمات امنیتی تعریف کن'
                              : '⚠️ Please set a PIN code in security settings first'
                          );
                          return;
                        }
                        handlePinDigit(num);
                      }}
                      className="w-14 h-14 rounded-full border border-zinc-800/80 bg-zinc-950/40 text-zinc-200 font-sans font-bold text-lg hover:bg-zinc-900 active:scale-90 transition-all flex items-center justify-center cursor-pointer hover:border-amber-500/30"
                    >
                      {language === 'fa' ? toPersianNum(num) : num}
                    </button>
                  ))}

                  {/* Backspace/Delete */}
                  <button
                    onClick={handlePinBackspace}
                    className="w-14 h-14 rounded-full text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {language === 'fa' ? 'حذف' : 'Del'}
                  </button>

                  {/* Zero */}
                  <button
                    onClick={() => {
                      if (!pinCode) {
                        triggerToast(
                          language === 'fa'
                            ? '⚠️ ابتدا پین‌کد را در تنظیمات امنیتی تعریف کن'
                            : '⚠️ Please set a PIN code in security settings first'
                        );
                        return;
                      }
                      handlePinDigit('0');
                    }}
                    className="w-14 h-14 rounded-full border border-zinc-800/80 bg-zinc-950/40 text-zinc-200 font-sans font-bold text-lg hover:bg-zinc-900 active:scale-90 transition-all flex items-center justify-center cursor-pointer hover:border-amber-500/30"
                  >
                    {language === 'fa' ? '۰' : '0'}
                  </button>

                  {/* Biometric trigger if supported */}
                  {biometricsSupported ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlock();
                      }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isEnrolled ? 'text-emerald-500 hover:text-emerald-400' : 'text-zinc-600 hover:text-emerald-500'
                      }`}
                      title={language === 'fa' ? 'اسکن اثرانگشت' : 'Scan Fingerprint'}
                    >
                      <Fingerprint className={`w-6 h-6 ${isEnrolled ? 'animate-pulse' : ''}`} />
                    </button>
                  ) : (
                    <div className="w-14 h-14" />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Shields Panel Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-[32px] p-8 border shadow-2xl relative ${
                isDarkMode 
                  ? 'bg-zinc-950 border-white/10 text-zinc-200' 
                  : 'bg-white border-zinc-200 text-zinc-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 shrink-0">
                    <Shield className="w-5 h-5 text-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest leading-none">
                      {language === 'fa' ? 'مدیریت ترافیک ' : 'Shield Security Center'}
                    </h3>
                    <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'} mt-1`}>
                      {language === 'fa' ? 'کنترل سیستم‌های حفاظتی ضد اسکرین‌شات ' : 'Active anti-capture and screenshot hardware defenses'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                    isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profiles Selection */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={presetHigh}
                  className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center ${
                    blurActive && keysActive && printActive && copyActive && biometricLockActive && noiseActive
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                      : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {language === 'fa' ? 'ماکزیمم' : 'Maximum'}
                </button>
                <button
                  onClick={presetStandard}
                  className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center ${
                    blurActive && keysActive && printActive && copyActive && biometricLockActive && !noiseActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {language === 'fa' ? 'استاندارد' : 'Standard'}
                </button>
                <button
                  onClick={presetNone}
                  className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center ${
                    !blurActive && !keysActive && !printActive && !copyActive && !biometricLockActive && !noiseActive
                      ? 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                      : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {language === 'fa' ? 'غیرفعال' : 'Off'}
                </button>
              </div>

              {/* Toggles Container */}
              <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1">
                
                {/* Shield 1: Multitasking Blur */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  blurActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`p-1.5 rounded-xl mt-0.5 ${blurActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {language === 'fa' ? 'تاری خودکار در پس‌زمینه گوشی' : 'App-Switcher Blur Shield'}
                      </span>
                      <button 
                        onClick={() => setBlurActive(!blurActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${blurActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${blurActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {language === 'fa' 
                        ? 'تار کردن کل صفحه هنگام جابه‌جایی بین برنامه‌ها برای جلوگیری از ذخیره اسکرین‌شات پس‌زمینه به وسیله گوشی.'
                        : 'Obscures entire screen when switching apps, blocking display frame buffer leakage on system switchers.'}
                    </p>
                  </div>
                </div>

                {/* Shield 5: App Lock Guard (Biometric / PIN) */}
                <div className={`p-3 rounded-2xl border flex flex-col gap-3 transition-colors ${
                  biometricLockActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-xl mt-0.5 ${biometricLockActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide">
                          {language === 'fa' ? 'قفل هوشمند کلاینت هنگام خروج' : 'Smart Workspace App Lock'}
                        </span>
                        <button 
                          onClick={() => setBiometricLockActive(!biometricLockActive)}
                          className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${biometricLockActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        >
                          <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${biometricLockActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {language === 'fa' 
                          ? 'تایید هویت بیومتریک یا پین‌کد هنگام بازگشت به برنامه پس از خروج موقت.'
                          : 'Enforces biometric verification or custom PIN passcode when returning to the application tab.'}
                      </p>
                    </div>
                  </div>

                  {biometricLockActive && (
                    <div className="pl-10 space-y-3.5 border-t border-zinc-500/10 pt-3 text-left">
                      <div className="flex gap-4 items-center justify-between">
                        <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500">
                          {language === 'fa' ? 'روش قفل‌گشایی:' : 'Unlock Method:'}
                        </span>
                        <div className="flex bg-zinc-950/60 p-0.5 rounded-lg border border-white/5">
                          {biometricsSupported && (
                            <button
                              onClick={() => {
                                setLockMethod('biometric');
                                localStorage.setItem('vault_app_lock_method', 'biometric');
                              }}
                              className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                                lockMethod === 'biometric' 
                                  ? 'bg-emerald-500 text-black' 
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              {language === 'fa' ? 'بیومتریک' : 'Biometric'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setLockMethod('pin');
                              localStorage.setItem('vault_app_lock_method', 'pin');
                            }}
                            className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                              lockMethod === 'pin' 
                                ? 'bg-emerald-500 text-black' 
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {language === 'fa' ? 'پین‌کد (PIN)' : 'PIN Code'}
                          </button>
                        </div>
                      </div>

                      {lockMethod === 'pin' && (
                        <div className="space-y-2">
                          {pinCode ? (
                            <div className="flex items-center justify-between bg-zinc-950/20 p-2 rounded-xl border border-white/5">
                              <span className="text-[9px] text-zinc-400 font-medium">
                                {language === 'fa' ? '🔐 پین‌کد اکتیوه!' : '🔐 4-Digit PIN is active'}
                              </span>
                              <button
                                onClick={() => {
                                  setSetupPin('');
                                  setSetupConfirmPin('');
                                  setPinSetupStep('enter');
                                }}
                                className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-wider cursor-pointer"
                              >
                                {language === 'fa' ? 'تغییر پین‌کد' : 'Change PIN'}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                              <span className="text-[9px] text-rose-400 font-semibold leading-relaxed">
                                {language === 'fa' ? '⚠️ ابتدا یک پین‌کد ۴ رقمی تعریف کن' : '⚠️ Please set a 4-digit PIN first'}
                              </span>
                              <button
                                onClick={() => {
                                  setSetupPin('');
                                  setSetupConfirmPin('');
                                  setPinSetupStep('enter');
                                }}
                                className="px-2 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer shrink-0"
                              >
                                {language === 'fa' ? 'تنظیم پین‌کد' : 'Set PIN'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Shield 2: Print Blocker */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  printActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`p-1.5 rounded-xl mt-0.5 ${printActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {language === 'fa' ? 'بستن پرینت و ذخیره صفحه' : 'PDF / Print Blocker'}
                      </span>
                      <button 
                        onClick={() => setPrintActive(!printActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${printActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${printActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {language === 'fa' 
                        ? 'کانتنت را به شکل کامل در پرینت یا دکمه‌های پرینت مرورگر پنهان و خالی میکنه.'
                        : 'Forces the document print spool to render blank, guarding against physical print triggers or virtual PDF saves.'}
                    </p>
                  </div>
                </div>

                {/* Shield 3: Key Interception */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  keysActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`p-1.5 rounded-xl mt-0.5 ${keysActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {language === 'fa' ? 'شنود کلیدهای اسکرین‌شات' : 'Keyboard Hook Protector'}
                      </span>
                      <button 
                        onClick={() => setKeysActive(!keysActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${keysActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${keysActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {language === 'fa' 
                        ? 'رهگیری کلید PrintScreen و شورت‌کات پرینت در کلاینت برای ایجاد وقفه تاری موقت و پاک کردن بافر کلیپ‌بورد.'
                        : 'Intercepts print-screen keys, blurring content instantly on triggers and flushing clipboard buffer dynamically.'}
                    </p>
                  </div>
                </div>

                {/* Shield 4: Copy Protection */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  copyActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`p-1.5 rounded-xl mt-0.5 ${copyActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Copy className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {language === 'fa' ? 'قفل کپی و منوی راست‌کلیک' : 'Copy & Right-Click Lock'}
                      </span>
                      <button 
                        onClick={() => setCopyActive(!copyActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${copyActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${copyActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {language === 'fa' 
                        ? 'غیرفعال‌سازی راست‌کلیک و کپی کردن داده‌های گاوصندوق جهت خنثی‌سازی اسکریپت‌های کپی اتوماتیک.'
                        : 'Disables document highlights and right-click inspectors to block scrapers, bot scrapers, and quick copy-paste.'}
                    </p>
                  </div>
                </div>

                {/* Shield 6: Codec Jammer */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  noiseActive 
                    ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                    : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`p-1.5 rounded-xl mt-0.5 ${noiseActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {language === 'fa' ? 'نویز پالس متحرک (ضد ضبط ویدئو)' : 'Dynamic Codec Recording Jammer'}
                      </span>
                      <button 
                        onClick={() => setNoiseActive(!noiseActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${noiseActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${noiseActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {language === 'fa' 
                        ? 'ایجاد نویزهای میکروسکوپی در پس‌زمینه برای مختل کردن ضبط کدهای فشرده‌ساز ضبط ویدئوی سیستم.'
                        : 'Injects faint pulsating visual gradients to maximize dynamic complexity, degrading screen-record video encoder quality.'}
                    </p>
                  </div>
                </div>

              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold tracking-widest uppercase rounded-2xl transition-all shadow-lg shadow-emerald-500/10"
              >
                {language === 'fa' ? 'ذخیره و بستن سپر' : 'Lock Shield Configuration'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive 4-Digit PIN Setup Keypad Modal */}
      <AnimatePresence>
        {pinSetupStep !== 'idle' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-xs rounded-[32px] p-6 text-center border ${
                isDarkMode ? 'bg-zinc-950 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
              }`}
            >
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                {pinSetupStep === 'enter'
                  ? (language === 'fa' ? 'یک پین‌کد ۴ رقمی وارد کن' : 'Enter 4-Digit PIN')
                  : (language === 'fa' ? 'پین‌کد را تایید کن' : 'Confirm 4-Digit PIN')
                }
              </h3>

              <div dir="ltr" className="flex justify-center gap-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => {
                  const val = pinSetupStep === 'enter' ? setupPin : setupConfirmPin;
                  const filled = val.length > i;
                  return (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                        filled 
                          ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.8)]' 
                          : 'border border-zinc-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Setup PIN Keypad */}
              <div dir="ltr" className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      const current = pinSetupStep === 'enter' ? setupPin : setupConfirmPin;
                      if (current.length >= 4) return;
                      const nextVal = current + num;
                      if (pinSetupStep === 'enter') {
                        setSetupPin(nextVal);
                        if (nextVal.length === 4) {
                          setTimeout(() => setPinSetupStep('confirm'), 250);
                        }
                      } else {
                        setSetupConfirmPin(nextVal);
                        if (nextVal.length === 4) {
                          if (setupPin === nextVal) {
                            localStorage.setItem('vault_app_pin_code', nextVal);
                            setPinCode(nextVal);
                            setPinSetupStep('idle');
                            triggerToast(
                              language === 'fa'
                                ? '✅ پین‌کد با موفقیت ذخیره شد!'
                                : '✅ PIN Code successfully saved!'
                            );
                          } else {
                            triggerToast(
                              language === 'fa'
                                ? '❌ پین‌کدها همخوانی ندارند. دوباره تلاش کن!'
                                : '❌ PINs do not match. Start over.'
                            );
                            setSetupPin('');
                            setSetupConfirmPin('');
                            setPinSetupStep('enter');
                          }
                        }
                      }
                    }}
                    className={`w-12 h-12 rounded-full border text-sm font-black transition-all active:scale-95 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800 text-zinc-300' 
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {language === 'fa' ? toPersianNum(num) : num}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    setPinSetupStep('idle');
                    setSetupPin('');
                    setSetupConfirmPin('');
                  }}
                  className={`w-12 h-12 rounded-full text-[9px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-400 transition-colors cursor-pointer`}
                >
                  {language === 'fa' ? 'کنسل' : 'Cancel'}
                </button>

                <button
                  onClick={() => {
                    const current = pinSetupStep === 'enter' ? setupPin : setupConfirmPin;
                    if (current.length >= 4) return;
                    const nextVal = current + '0';
                    if (pinSetupStep === 'enter') {
                      setSetupPin(nextVal);
                      if (nextVal.length === 4) {
                        setTimeout(() => setPinSetupStep('confirm'), 250);
                      }
                    } else {
                      setSetupConfirmPin(nextVal);
                      if (nextVal.length === 4) {
                        if (setupPin === nextVal) {
                          localStorage.setItem('vault_app_pin_code', nextVal);
                          setPinCode(nextVal);
                          setPinSetupStep('idle');
                          triggerToast(
                            language === 'fa'
                              ? '✅ پین‌کد به درستی سیو شد!'
                              : '✅ PIN Code successfully saved!'
                          );
                        } else {
                          triggerToast(
                            language === 'fa'
                              ? '❌ پین‌کدها همخوانی ندارند. دوباره تلاش کن.'
                              : '❌ PINs do not match. Start over.'
                          );
                          setSetupPin('');
                          setSetupConfirmPin('');
                          setPinSetupStep('enter');
                        }
                      }
                    }
                  }}
                  className={`w-12 h-12 rounded-full border text-sm font-black transition-all active:scale-95 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800 text-zinc-300' 
                      : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {language === 'fa' ? '۰' : '0'}
                </button>

                <button
                  onClick={() => {
                    const current = pinSetupStep === 'enter' ? setupPin : setupConfirmPin;
                    if (current.length === 0) return;
                    if (pinSetupStep === 'enter') {
                      setSetupPin(current.slice(0, -1));
                    } else {
                      setSetupConfirmPin(current.slice(0, -1));
                    }
                  }}
                  className="w-12 h-12 rounded-full text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                  {language === 'fa' ? 'حذف' : 'Del'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Shield Action Notification Toast */}
      <AnimatePresence>
        {toastMessage && (() => {
          let type: 'error' | 'warning' | 'success' = 'success';
          let cleanMessage = toastMessage.replace(/^([❌⚠️🔒✅📋🛡️]|\ud83c[\udf00-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\udd00-\udfff])\s*/, '').trim();

          // Check prefixes or content keywords to categorize the toast
          if (
            toastMessage.startsWith('❌') || 
            toastMessage.toLowerCase().includes('incorrect') || 
            toastMessage.toLowerCase().includes('fail') || 
            toastMessage.toLowerCase().includes('error') || 
            toastMessage.toLowerCase().includes('اشتباه')
          ) {
            type = 'error';
          } else if (
            toastMessage.startsWith('⚠️') || 
            toastMessage.startsWith('🔒') ||
            toastMessage.toLowerCase().includes('blocked') || 
            toastMessage.toLowerCase().includes('block') || 
            toastMessage.toLowerCase().includes('بلاک')
          ) {
            type = 'warning';
          }

          let containerBorderClass = 'border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.1)]';
          let iconWrapperClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
          let IconComponent = Check;

          if (type === 'error') {
            containerBorderClass = 'border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.15)]';
            iconWrapperClass = 'bg-red-500/10 border-red-500/20 text-red-400';
            IconComponent = ShieldAlert;
          } else if (type === 'warning') {
            containerBorderClass = 'border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.12)]';
            iconWrapperClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            IconComponent = AlertTriangle;
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[999999] w-[calc(100%-2rem)] max-w-sm p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-md text-zinc-100 border ${containerBorderClass} shadow-2xl flex items-center gap-3`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${iconWrapperClass}`}>
                <IconComponent className="w-4 h-4 animate-bounce" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-left leading-normal flex-1">
                {cleanMessage}
              </p>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
};
