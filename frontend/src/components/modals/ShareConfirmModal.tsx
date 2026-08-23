import React, { useEffect } from 'react';
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
  const handleConfirmShare = async () => {
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
        setStatus({ type: 'ok', msg: t.copySuccess });
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleConfirmShare();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, sharePendingContent, onClose, language, t.copySuccess]);

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
            className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl sm:rounded-[32px] border p-5 sm:p-6 shadow-2xl ${
              isDarkMode 
                ? 'bg-zinc-950 border-white/10 text-zinc-100 shadow-amber-500/5' 
                : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
            } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            {/* Header Icon & Alert Glow */}
            <div className="flex flex-col items-center text-center mt-1 sm:mt-2 space-y-3 sm:space-y-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-amber-500/20 blur-[10px] sm:blur-[12px] rounded-full animate-pulse" />
                <div className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'bg-amber-50 border-amber-500/20 text-amber-600 shadow-sm'
                }`}>
                  <ShieldAlert className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5 px-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider sm:tracking-widest">
                  {t.shareConfirmTitle}
                </h3>
                <p className={`text-[11px] sm:text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t.shareConfirmDesc}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleConfirmShare}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-md'
                }`}
              >
                {t.shareConfirmBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                {t.cancel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
