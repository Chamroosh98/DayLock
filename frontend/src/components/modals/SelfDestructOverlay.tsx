import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, ShieldAlert } from 'lucide-react';
import { Language } from '../../types';
import { localizeDigitsValue } from '../../utils/numberConverter';

interface SelfDestructOverlayProps {
  isSelfDestructed: boolean;
  viewData: any;
  hidesCount: number;
  language: Language;
  t: {
    selfDestructTriggered: string;
    selfDestructMessage: string;
    terminateSession: string;
    hidesRemaining: string;
  };
}

export const SelfDestructOverlay: React.FC<SelfDestructOverlayProps> = ({
  isSelfDestructed,
  viewData,
  hidesCount,
  language,
  t,
}) => {
  useEffect(() => {
    if (!isSelfDestructed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isSelfDestructed]);

  const isFa = language === 'fa';

  return (
    <>
      <AnimatePresence>
        {isSelfDestructed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            dir={isFa ? 'rtl' : 'ltr'}
            className={`fixed inset-0 z-[1000] bg-black backdrop-blur-3xl flex items-center justify-center p-4 sm:p-6 text-center ${isFa ? 'font-vazir' : 'font-sans'}`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs sm:max-w-md space-y-5 sm:space-y-8"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-500/20 blur-2xl sm:blur-3xl rounded-full"
                />
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-red-500 rounded-2xl sm:rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-500/50 mx-auto">
                  <Skull className="w-8 h-8 sm:w-12 sm:h-12 text-black" />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-red-500">{t.selfDestructTriggered}</h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">{t.selfDestructMessage}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-zinc-900 border border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-400 hover:text-white transition-all cursor-pointer"
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
            dir={isFa ? 'rtl' : 'ltr'}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 bg-red-500 text-black rounded-full font-black text-xs md:text-sm shadow-2xl shadow-red-500/40 flex items-center gap-3 ${isFa ? 'font-vazir' : 'font-sans'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{localizeDigitsValue(viewData.self_destruct_hides - hidesCount, language)} {t.hidesRemaining}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
