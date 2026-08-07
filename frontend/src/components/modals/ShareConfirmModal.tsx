import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { Language, StatusState } from '../../types';
import { copyToClipboardWithAutoClear } from '../../utils/clipboardManager';

interface ShareConfirmModalProps {
  isOpen: boolean;
  sharePendingContent: string;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
  setStatus: (status: StatusState | null) => void;
  t: {
    shareConfirmTitle?: string;
    shareConfirmDesc?: string;
    shareConfirmBtn?: string;
    copySuccess?: string;
    cancel?: string;
  };
}

export const ShareConfirmModal: React.FC<ShareConfirmModalProps> = ({
  isOpen,
  sharePendingContent,
  onClose,
  isDarkMode,
  language,
  setStatus,
  t,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                    ? 'شما در حال اشتراک‌گذاری اطلاعات رمزگشایی‌شده حساس هستید. لطفا قبل از ارسال، مطمئن شوید که به مقصد یا برنامه مقصد اعتماد کامل دارید.' 
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
                  onClose();
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
                      setStatus({ type: 'ok', msg: t.copySuccess || (language === 'fa' ? 'محتوا با موفقیت کپی شد' : "Content copied to clipboard") });
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
                onClick={onClose}
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
  );
};
