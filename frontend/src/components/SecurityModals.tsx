import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, Keyboard, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

interface SecurityModalsProps {
  showPasswordWarning: boolean;
  setShowPasswordWarning: (val: boolean) => void;
  showContentWarning: boolean;
  setShowContentWarning: (val: boolean) => void;
  showKeyboardWarning: boolean;
  setShowKeyboardWarning: (val: boolean) => void;
  showShareConfirm: boolean;
  setShowShareConfirm: (val: boolean) => void;
  sharePendingContent: string;
  setSharePendingContent: (val: string) => void;
  onConfirmShare: (content: string) => Promise<void>;
  isDarkMode: boolean;
  language: Language;
  t: any;
}

export const SecurityModals: React.FC<SecurityModalsProps> = ({
  showPasswordWarning,
  setShowPasswordWarning,
  showContentWarning,
  setShowContentWarning,
  showKeyboardWarning,
  setShowKeyboardWarning,
  showShareConfirm,
  setShowShareConfirm,
  sharePendingContent,
  setSharePendingContent,
  onConfirmShare,
  isDarkMode,
  language,
  t,
}) => {
  return (
    <>
      {/* Password Warning Modal Popup */}
      <AnimatePresence>
        {showPasswordWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
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
                {language === 'fa' ? 'متوجه شدم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Warning Modal Popup */}
      <AnimatePresence>
        {showContentWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContentWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
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
                {language === 'fa' ? 'متوجه شدم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Layout Warning Modal Popup */}
      <AnimatePresence>
        {showKeyboardWarning && (
          <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyboardWarning(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
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
                {language === 'fa' ? 'متوجه شدم' : 'Got it'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Confirm Modal Popup */}
      <AnimatePresence>
        {showShareConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                      ? 'شما در حال اشتراک‌گذاری اطلاعات رمزگشایی‌شده حساس هستید. لطفا قبل از ارسال، مطمئن شوید که به مقصد یا برنامه مقصد اعتماد کامل دارید.' 
                      : 'You are about to share decrypted sensitive data. Make sure you trust the destination or application before sending.')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const content = sharePendingContent;
                    setShowShareConfirm(false);
                    setSharePendingContent('');
                    await onConfirmShare(content);
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
                  {t.cancel || (language === 'fa' ? 'لغو' : 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
