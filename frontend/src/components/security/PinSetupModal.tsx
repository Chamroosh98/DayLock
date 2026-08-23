import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../data/translations';
import { Language } from '../../types';
import { toPersianNum } from './securityUtils';

interface PinSetupModalProps {
  isDarkMode: boolean;
  pinSetupStep: 'idle' | 'enter' | 'confirm';
  setupPin: string;
  setupConfirmPin: string;
  language: Language;
  onSetupDigit: (num: string) => void;
  onSetupBackspace: () => void;
  onSetupCancel: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({
  isDarkMode,
  pinSetupStep,
  setupPin,
  setupConfirmPin,
  language,
  onSetupDigit,
  onSetupBackspace,
  onSetupCancel,
}) => {
  const t = translations[language] || translations.en;

  return (
    <AnimatePresence>
      {pinSetupStep !== 'idle' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            className={`w-full max-w-xs rounded-[32px] p-6 text-center border ${
              isDarkMode ? 'bg-zinc-950 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
            } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
          >
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">
              {pinSetupStep === 'enter'
                ? (t.enter4DigitPinTitle || 'Enter 4-Digit PIN')
                : (t.confirm4DigitPinTitle || 'Confirm 4-Digit PIN')
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
                  onClick={() => onSetupDigit(num)}
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
                onClick={onSetupCancel}
                className="w-12 h-12 rounded-full text-[9px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                {t.cancelBtn || 'Cancel'}
              </button>

              <button
                onClick={() => onSetupDigit('0')}
                className={`w-12 h-12 rounded-full border text-sm font-black transition-all active:scale-95 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800 text-zinc-300' 
                    : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                {language === 'fa' ? '۰' : '0'}
              </button>

              <button
                onClick={onSetupBackspace}
                className="w-12 h-12 rounded-full text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
              >
                {t.delBtn || 'Del'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
