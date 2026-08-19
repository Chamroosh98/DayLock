import React, { useState, useRef, useEffect } from 'react';
import { Eye, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../data/translations';
import { Language } from '../types';

interface DecryptedPayloadShieldProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  language: Language;
}

export const DecryptedPayloadShield: React.FC<DecryptedPayloadShieldProps> = ({
  children,
  isDarkMode,
  language,
}) => {
  const t = (translations as any)[language] || translations.en;
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const [shieldsDisabled, setShieldsDisabled] = useState(() => {
    return localStorage.getItem('vault_security_copy') === 'false';
  });

  useEffect(() => {
    const checkShields = () => {
      setShieldsDisabled(localStorage.getItem('vault_security_copy') === 'false');
    };

    checkShields();
    window.addEventListener('storage', checkShields);
    window.addEventListener('vault_shields_updated', checkShields);

    return () => {
      window.removeEventListener('storage', checkShields);
      window.removeEventListener('vault_shields_updated', checkShields);
    };
  }, []);

  const finalRevealed = shieldsDisabled || isRevealed;

  // Clean up timers
  useEffect(() => {
    return () => {
      if (holdTimeout.current) clearTimeout(holdTimeout.current);
    };
  }, []);

  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isSticky) return;
    setIsRevealed(true);
  };

  const handleHoldEnd = () => {
    if (isSticky) return;
    setIsRevealed(false);
  };

  const toggleSticky = () => {
    if (isSticky) {
      setIsSticky(false);
      setIsRevealed(false);
      setShowWarning(false);
    } else {
      setIsSticky(true);
      setIsRevealed(true);
      setShowWarning(true);
      // Auto-fade warning after 4 seconds
      setTimeout(() => setShowWarning(false), 4000);
    }
  };

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden no-whistle-menu">
      {/* Decrypted Payload Container with subtle blur backdrop when unrevealed */}
      <div 
        className="transition-all duration-500 ease-out select-all"
        style={{ 
          filter: finalRevealed ? 'none' : 'blur(14px)',
          pointerEvents: finalRevealed ? 'auto' : 'none',
          userSelect: finalRevealed ? 'text' : 'none'
        }}
      >
        {children}
      </div>

      {/* Polished Glassmorphism Privacy Card */}
      <AnimatePresence>
        {!finalRevealed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md rounded-[28px] sm:rounded-[32px] border ${
              isDarkMode 
                ? 'bg-zinc-950/60 border-white/10 shadow-2xl' 
                : 'bg-white/75 border-zinc-200/90 shadow-2xl'
            }`}
          >
            {/* Lock Badge */}
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-2xl bg-[#00ff87]/15 animate-ping opacity-75" />
              <Lock className="w-5 h-5 text-[#00ff87] relative z-10" />
            </div>

            <h4 className={`text-xs font-black uppercase tracking-widest mb-1.5 ${
              isDarkMode ? 'text-zinc-100' : 'text-zinc-800'
            } ${language === 'fa' ? 'font-vazir' : ''}`}>
              {t.decryptedShieldActive}
            </h4>
            
            <p className={`text-[10px] ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
            } max-w-xs leading-relaxed mb-5 ${language === 'fa' ? 'font-vazir' : ''}`}>
              {t.decryptedShieldDesc}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-row items-center justify-center gap-2.5 w-full max-w-sm px-2">
              {/* Primary Action: Hold to Reveal with pulsing emerald accent (#00ff87) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className={`flex-1 h-[44px] px-4 bg-[#00ff87] hover:bg-[#00e67a] active:bg-[#00cc6c] text-black font-black text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-[#00ff87]/25 hover:shadow-[#00ff87]/40 select-none cursor-pointer flex items-center justify-center gap-2 ${
                  language === 'fa' ? 'font-vazir' : ''
                }`}
              >
                <Eye className="w-4 h-4 animate-pulse" />
                <span>{t.pressAndHold}</span>
              </motion.button>

              {/* Secondary Action: Unlock / Toggle Sticky */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleSticky}
                className={`h-[44px] px-4 sm:px-5 rounded-2xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:border-emerald-500/30'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                } ${language === 'fa' ? 'font-vazir' : ''}`}
                title={t.keepVisible}
              >
                <Unlock className="w-4 h-4" />
                <span>{t.toggleLock}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mode Active Top Badge & Warning Indicator */}
      {finalRevealed && !shieldsDisabled && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {isSticky && (
            <button
              onClick={toggleSticky}
              className="px-3 py-1.5 bg-rose-950/90 hover:bg-rose-900/90 text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer"
            >
              <Unlock className="w-3 h-3" />
              {t.lockPayload}
            </button>
          )}
        </div>
      )}

      {/* Temporary Floating warning when sticky lock is engaged */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-xs p-3 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-2xl text-center shadow-2xl"
          >
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
              ⚠️ {t.stickyWarning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
