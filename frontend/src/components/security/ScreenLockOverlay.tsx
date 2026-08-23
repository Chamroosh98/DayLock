import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Fingerprint } from 'lucide-react';
import { translations } from '../../data/translations';
import { Language } from '../../types';
import { toPersianNum } from './securityUtils';

interface ScreenLockOverlayProps {
  isScreenLocked: boolean;
  biometricsSupported: boolean;
  isEnrolled: boolean;
  lockStatus: 'idle' | 'verifying' | 'error' | 'success';
  pinError: boolean;
  enteredPin: string;
  pinCode: string;
  language: Language;
  onUnlock: () => void;
  onPinDigit: (digit: string) => void;
  onPinBackspace: () => void;
  triggerToast: (msg: string) => void;
}

export const ScreenLockOverlay: React.FC<ScreenLockOverlayProps> = ({
  isScreenLocked,
  biometricsSupported,
  isEnrolled,
  lockStatus,
  pinError,
  enteredPin,
  pinCode,
  language,
  onUnlock,
  onPinDigit,
  onPinBackspace,
  triggerToast,
}) => {
  const t = translations[language] || translations.en;

  return (
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
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            className={`flex flex-col items-center justify-center text-center max-w-sm w-full ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
          >
            <div className="w-full max-w-[280px]">
              {/* Unified Header (Lock Icon) */}
              {biometricsSupported ? (
                isEnrolled ? (
                  <div className="flex flex-col items-center justify-center mb-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnlock();
                      }}
                      className="w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.05)] relative cursor-pointer active:scale-95 transition-all group hover:border-emerald-500/30"
                      title={t.scanFingerprintFaceId || 'Scan Fingerprint / FaceID'}
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
                        onUnlock(); // triggers registration
                      }}
                      className="w-20 h-20 rounded-full bg-zinc-500/5 border border-dashed border-zinc-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.2)] cursor-pointer active:scale-95 transition-all group hover:border-emerald-500/30 animate-pulse"
                      title={t.enrollFingerprint || 'Enroll Fingerprint'}
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
                {t.workspaceSuspendedTitle || 'Workspace Suspended'}
              </h2>
              <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                {biometricsSupported
                  ? (t.unlockWithBiometricsOrPin || 'Unlock with Biometrics or PIN')
                  : (t.enterWorkspacePin || 'Enter workspace 4-digit PIN')
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
                        triggerToast(t.pleaseSetPinFirstToast || '⚠️ Please set a PIN code first');
                        return;
                      }
                      onPinDigit(num);
                    }}
                    className="w-14 h-14 rounded-full border border-zinc-800/80 bg-zinc-950/40 text-zinc-200 font-sans font-bold text-lg hover:bg-zinc-900 active:scale-90 transition-all flex items-center justify-center cursor-pointer hover:border-amber-500/30"
                  >
                    {language === 'fa' ? toPersianNum(num) : num}
                  </button>
                ))}

                {/* Backspace/Delete */}
                <button
                  onClick={onPinBackspace}
                  className="w-14 h-14 rounded-full text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {t.delBtn || 'Del'}
                </button>

                {/* Zero */}
                <button
                  onClick={() => {
                    if (!pinCode) {
                      triggerToast(t.pleaseSetPinInSettingsToast || '⚠️ Please set a PIN code in security settings first');
                      return;
                    }
                    onPinDigit('0');
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
                      onUnlock();
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isEnrolled ? 'text-emerald-500 hover:text-emerald-400' : 'text-zinc-600 hover:text-emerald-500'
                    }`}
                    title={t.scanFingerprint || 'Scan Fingerprint'}
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
  );
};
