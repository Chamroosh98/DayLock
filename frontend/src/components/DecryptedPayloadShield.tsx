import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DecryptedPayloadShieldProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  language: 'en' | 'fa';
}

export const DecryptedPayloadShield: React.FC<DecryptedPayloadShieldProps> = ({
  children,
  isDarkMode,
  language,
}) => {
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
      {/* Decrypted Payload Container */}
      <div 
        className="transition-all duration-500 ease-out select-all"
        style={{ 
          filter: finalRevealed ? 'none' : 'blur(20px)',
          pointerEvents: finalRevealed ? 'auto' : 'none',
          userSelect: finalRevealed ? 'text' : 'none'
        }}
      >
        {children}
      </div>

      {/* Dynamic Security Overlay (Blocks view completely when not revealed) */}
      <AnimatePresence>
        {!finalRevealed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/85 backdrop-blur-xl rounded-[32px] border border-dashed border-emerald-500/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-100 mb-1.5">
              {language === 'fa' ? 'سپر حفاظتی رمزگشایی فعال است' : 'Decrypted Shield Active'}
            </h4>
            
            <p className="text-[10px] text-zinc-400 mt-1 max-w-xs leading-relaxed mb-6">
              {language === 'fa'
                ? 'محتوا برای جلوگیری از اسکرین‌شات‌های ناخواسته تار گردیده است. از کلیدهای کنترل زیر برای مشاهده موقت یا دائم استفاده کنید.'
                : 'Sensitive payload is masked to secure visual frames. Use the active controls below to display securely.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm px-4">
              {/* Press & Hold Action Button */}
              <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-2xl transition-all shadow-lg shadow-emerald-500/15 select-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                {language === 'fa' ? 'نگه دارید تا دیده شود' : 'Press & Hold'}
              </button>

              {/* Sticky Eye Toggle Button */}
              <button
                onClick={toggleSticky}
                className={`py-3 px-4 rounded-2xl font-extrabold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    : 'bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
                title={language === 'fa' ? 'نمایش دائم' : 'Keep Visible'}
              >
                <Eye className="w-3.5 h-3.5" />
                {language === 'fa' ? 'باز کردن قفل' : 'Toggle lock'}
              </button>
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
              className="px-3 py-1.5 bg-rose-950/90 hover:bg-rose-900/90 text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md"
            >
              <Unlock className="w-3 h-3" />
              {language === 'fa' ? 'قفله کردن مجدد' : 'Lock Payload'}
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
              ⚠️ {language === 'fa' 
                ? 'هشدار: رمزگشایی مداوم فعال است. صفحه اکنون در برابر اسکرین‌شات آسیب‌پذیر می‌باشد!' 
                : 'Warning: Sticky view active. Content is vulnerable to screenshot triggers!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
