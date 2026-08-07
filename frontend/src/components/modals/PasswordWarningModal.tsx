import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import { Language } from '../../types';

interface PasswordWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
  t: {
    passwordWarningTitle: string;
    passwordWarningDesc: string;
  };
}

export const PasswordWarningModal: React.FC<PasswordWarningModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  language,
  t,
}) => {
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
              onClick={onClose}
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
  );
};
