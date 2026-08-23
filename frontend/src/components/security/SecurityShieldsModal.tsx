import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  EyeOff, 
  Printer, 
  Copy, 
  X, 
  Info,
  Flame,
  UserCheck,
  AlertTriangle,
  Fingerprint,
  Lock
} from 'lucide-react';
import { translations } from '../../data/translations';
import { Language } from '../../types';

interface SecurityShieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
  blurActive: boolean;
  setBlurActive: (val: boolean) => void;
  keysActive: boolean;
  setKeysActive: (val: boolean) => void;
  printActive: boolean;
  setPrintActive: (val: boolean) => void;
  copyActive: boolean;
  setCopyActive: (val: boolean) => void;
  noiseActive: boolean;
  setNoiseActive: (val: boolean) => void;
  biometricLockActive: boolean;
  setBiometricLockActive: (val: boolean) => void;
  lockMethod: 'biometric' | 'pin';
  setLockMethod: (val: 'biometric' | 'pin') => void;
  biometricsSupported: boolean;
  isEnrolled: boolean;
  pinCode: string;
  onEnrollBiometrics: () => void;
  onOpenPinSetup: () => void;
  onPresetHigh: () => void;
  onPresetStandard: () => void;
  onPresetNone: () => void;
}

export const SecurityShieldsModal: React.FC<SecurityShieldsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  language,
  blurActive,
  setBlurActive,
  keysActive,
  setKeysActive,
  printActive,
  setPrintActive,
  copyActive,
  setCopyActive,
  noiseActive,
  setNoiseActive,
  biometricLockActive,
  setBiometricLockActive,
  lockMethod,
  setLockMethod,
  biometricsSupported,
  isEnrolled,
  pinCode,
  onEnrollBiometrics,
  onOpenPinSetup,
  onPresetHigh,
  onPresetStandard,
  onPresetNone,
}) => {
  const t = translations[language] || translations.en;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <motion.div 
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`w-full max-w-lg rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border shadow-2xl relative ${
              isDarkMode 
                ? 'bg-zinc-950 border-white/10 text-zinc-200' 
                : 'bg-white border-zinc-200 text-zinc-800'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 shrink-0">
                  <Shield className="w-5 h-5 text-emerald-500 animate-pulse" />
                </div>
                <div className={language === 'fa' ? 'text-right' : 'text-left'}>
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">
                    {t.shieldCenterTitle || 'Shield Security Center'}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                  isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profiles Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={onPresetHigh}
                className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center cursor-pointer ${
                  blurActive && keysActive && printActive && copyActive && biometricLockActive
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                {t.presetMax || 'Maximum'}
              </button>
              <button
                onClick={onPresetStandard}
                className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center cursor-pointer ${
                  blurActive && keysActive && printActive && copyActive && !biometricLockActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                {t.presetStandard || 'Standard'}
              </button>
              <button
                onClick={onPresetNone}
                className={`py-2 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 text-center cursor-pointer ${
                  !blurActive && !keysActive && !printActive && !copyActive && !biometricLockActive
                    ? 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                    : isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.presetOff || 'Off'}
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
                <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${blurActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      {t.appSwitcherBlur || 'App-Switcher Blur Shield'}
                    </span>
                    <button 
                      dir="ltr"
                      onClick={() => setBlurActive(!blurActive)}
                      className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${blurActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${blurActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className={`text-[9px] mt-1 leading-normal ${language === 'fa' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.appSwitcherBlurDesc || 'Obscures entire screen when switching apps, blocking display frame buffer leakage on system switchers.'}
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
                  <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${biometricLockActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {t.smartWorkspaceLock || 'Smart Workspace App Lock'}
                      </span>
                      <button 
                        dir="ltr"
                        onClick={() => setBiometricLockActive(!biometricLockActive)}
                        className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${biometricLockActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${biometricLockActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className={`text-[9px] mt-1 leading-normal ${language === 'fa' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {t.smartWorkspaceAppLockDesc || 'Enforces biometric verification or custom PIN passcode when returning to the application tab.'}
                    </p>
                  </div>
                </div>

                {biometricLockActive && (
                  <div className={`${language === 'fa' ? 'pr-10 text-right' : 'pl-10 text-left'} space-y-3.5 border-t border-zinc-500/10 pt-3`}>
                    <div className="flex gap-4 items-center justify-between">
                      <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500">
                        {t.unlockMethodLabel || 'Unlock Method :'}
                      </span>
                      <div className="flex bg-zinc-950/60 p-0.5 rounded-lg border border-white/5">
                        {biometricsSupported && (
                          <button
                            onClick={() => {
                              setLockMethod('biometric');
                              localStorage.setItem('vault_app_lock_method', 'biometric');
                            }}
                            className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all cursor-pointer ${
                              lockMethod === 'biometric' 
                                ? 'bg-emerald-500 text-black' 
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {t.biometricOption || 'Biometric'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setLockMethod('pin');
                            localStorage.setItem('vault_app_lock_method', 'pin');
                          }}
                          className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all cursor-pointer ${
                            lockMethod === 'pin' 
                              ? 'bg-emerald-500 text-black' 
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {t.pinOption || 'PIN Code'}
                        </button>
                      </div>
                    </div>

                    {lockMethod === 'biometric' && (
                      <div className="space-y-2">
                        {isEnrolled ? (
                          <div className="flex items-center justify-between bg-zinc-950/20 p-2 rounded-xl border border-white/5">
                            <span className="text-[9px] text-zinc-400 font-medium flex items-center gap-1.5">
                              <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
                              {t.biometricActiveStatus || 'Biometrics enrolled & active'}
                            </span>
                            <button
                              onClick={onEnrollBiometrics}
                              className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-wider cursor-pointer"
                            >
                              {t.biometricReEnrollBtn || 'Re-Enroll'}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <span className="text-[9px] text-zinc-300 font-semibold leading-relaxed">
                              {t.biometricPromptEnroll || 'Register biometric sensor for rapid unlocking'}
                            </span>
                            <button
                              onClick={onEnrollBiometrics}
                              className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all cursor-pointer shrink-0"
                            >
                              {t.biometricEnrollBtn || 'Enroll Biometrics'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {lockMethod === 'pin' && (
                      <div className="space-y-2">
                        {pinCode ? (
                          <div className="flex items-center justify-between bg-zinc-950/20 p-2 rounded-xl border border-white/5">
                            <span className="text-[9px] text-zinc-400 font-medium">
                              {t.pinActiveStatus || '🔐 4-Digit PIN is active'}
                            </span>
                            <button
                              onClick={onOpenPinSetup}
                              className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-wider cursor-pointer"
                            >
                              {t.changePinBtn || 'Change PIN'}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <span className="text-[9px] text-rose-400 font-semibold leading-relaxed">
                              {t.pleaseSetPinFirst || '⚠️ Please set a 4-digit PIN first'}
                            </span>
                            <button
                              onClick={onOpenPinSetup}
                              className="px-2 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer shrink-0"
                            >
                              {t.setPinBtn || 'Set PIN'}
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
                <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${printActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                  <Printer className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      {t.pdfPrintBlocker || 'PDF / Print Blocker'}
                    </span>
                    <button 
                      dir="ltr"
                      onClick={() => setPrintActive(!printActive)}
                      className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${printActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${printActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className={`text-[9px] mt-1 leading-normal ${language === 'fa' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.pdfPrintBlockerDesc || 'Forces the document print spool to render blank, guarding against physical print triggers or virtual PDF saves.'}
                  </p>
                </div>
              </div>

              {/* Shield 3: Key Interception */}
              <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                keysActive 
                  ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                  : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
                <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${keysActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      {t.keyboardHookProtector || 'Keyboard Hook Protector'}
                    </span>
                    <button 
                      dir="ltr"
                      onClick={() => setKeysActive(!keysActive)}
                      className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${keysActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${keysActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className={`text-[9px] mt-1 leading-normal ${language === 'fa' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.keyboardHookProtectorDesc || 'Intercepts print-screen keys, blurring content instantly on triggers and flushing clipboard buffer dynamically.'}
                  </p>
                </div>
              </div>

              {/* Shield 4: Copy Protection */}
              <div className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                copyActive 
                  ? isDarkMode ? 'bg-zinc-900/50 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-500/20'
                  : isDarkMode ? 'bg-zinc-900/10 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
                <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${copyActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                  <Copy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      {t.copyRightClickLock || 'Copy & Right-Click Lock'}
                    </span>
                    <button 
                      dir="ltr"
                      onClick={() => setCopyActive(!copyActive)}
                      className={`w-7 h-4 rounded-full relative transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${copyActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`block w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${copyActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className={`text-[9px] mt-1 leading-normal ${language === 'fa' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.copyRightClickLockDesc || 'Disables document highlights and right-click inspectors to block scrapers, bot scrapers, and quick copy-paste.'}
                  </p>
                </div>
              </div>

            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold tracking-widest uppercase rounded-2xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {t.saveShieldConfig || 'Lock Shield Configuration'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
