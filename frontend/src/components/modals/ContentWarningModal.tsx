import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Language } from '../../types';

interface ContentWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
  t: {
    contentWarningTitle: string;
    contentWarningDesc: string;
    gotIt?: string;
  };
}

export const ContentWarningModal: React.FC<ContentWarningModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  language,
  t,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div dir={language === 'fa' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative max-w-sm sm:max-w-md w-full p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-[32px] border ${
              isDarkMode 
                ? 'bg-zinc-950 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] text-zinc-100' 
                : 'bg-white border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-zinc-800'
            } z-10 space-y-4 sm:space-y-6 flex flex-col items-center text-center`}
          >
            {/* Glowing Icon */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-500/20 blur-xl sm:blur-2xl rounded-full"
              />
              <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[24px] flex items-center justify-center shadow-lg ${
                isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>

            {/* Text segment with custom font style */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className={`text-base sm:text-lg font-extrabold ${language === 'fa' ? 'font-vazir' : 'font-display'}`}>
                {t.contentWarningTitle}
              </h3>
              <p className={`text-[11px] sm:text-xs leading-relaxed font-normal ${
                isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
              } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}>
                {t.contentWarningDesc}
              </p>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                isDarkMode 
                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/10' 
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/10'
              }`}
            >
              {t.gotIt}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
