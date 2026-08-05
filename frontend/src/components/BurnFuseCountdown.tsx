import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { Language } from '../types';

export interface BurnFuseCountdownProps {
  isDarkMode: boolean;
  language: Language;
  t?: any;
  durationSeconds?: number;
  onExpire?: () => void;
  className?: string;
}

export const BurnFuseCountdown: React.FC<BurnFuseCountdownProps> = ({
  isDarkMode,
  language,
  t,
  durationSeconds = 60,
  onExpire,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isBurnedOut, setIsBurnedOut] = useState(false);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsBurnedOut(false);
  }, [durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsBurnedOut(true);
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  // Calculate percentage of fuse remaining
  const percentage = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft <= 10 && !isBurnedOut;

  // Labels for EN / FA
  const labelBurnAfterRead = language === 'fa' ? 'فیوز سوزاندن پس از خواندن' : 'Burn-After-Read Fuse';
  const labelWindowRemaining = language === 'fa' ? 'زمان باقی‌مانده مطالعه:' : 'Reading Window Remaining:';
  const labelDestroyed = language === 'fa' ? 'پاست به طور کامل سوزانده شد!' : 'Paste Self-Destructed & Incinerated!';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isBurnedOut
          ? 'bg-red-950/30 border-red-500/50 text-red-400'
          : isUrgent
          ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
          : isDarkMode
          ? 'bg-zinc-900/90 border-amber-500/30'
          : 'bg-amber-50/80 border-amber-200'
      } ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
              isBurnedOut
                ? 'bg-red-500/20 text-red-500 border-red-500/30'
                : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
            }`}
          >
            <Flame className={`w-4 h-4 ${isUrgent || isBurnedOut ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
              {labelBurnAfterRead}
            </span>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {isBurnedOut ? labelDestroyed : labelWindowRemaining}
            </p>
          </div>
        </div>

        {/* Digital Countdown Display */}
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          <span className={isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-500'}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Visual Fuse Track Container */}
      <div className="relative w-full h-4 bg-zinc-950/60 rounded-full border border-zinc-800 p-0.5 overflow-visible flex items-center">
        {/* Background Fuse Rope Texture */}
        <div className="absolute inset-x-1 h-1.5 bg-gradient-to-r from-amber-900/40 via-amber-700/30 to-amber-900/40 rounded-full" />

        {/* Shortening Active Fuse Bar */}
        <motion.div
          className={`h-2 rounded-full relative transition-colors duration-500 ${
            isUrgent
              ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        >
          {/* Animated Spark Flame at the burning tip of the fuse */}
          {percentage > 0 && (
            <motion.div
              className={`absolute top-1/2 ${language === 'fa' ? '-left-2' : '-right-2'} -translate-y-1/2 flex items-center justify-center z-10`}
              animate={{
                scale: [1, 1.25, 1],
                rotate: [-5, 5, -5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.3,
                ease: 'easeInOut',
              }}
            >
              {/* Burning Ember Glow */}
              <div className="w-5 h-5 rounded-full bg-orange-500/80 blur-[3px] absolute animate-ping" />
              <Flame className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] relative z-10" />

              {/* Sparkles Emitter Particles */}
              <AnimatePresence>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 8 + 4),
                      y: -(Math.random() * 12 + 4),
                      scale: 0.2,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.4 + i * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Urgent Warning Message when under 10 seconds */}
      {isUrgent && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-[10px] text-red-400 font-semibold flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3 h-3 text-red-500 animate-bounce" />
          <span>
            {language === 'fa'
              ? 'فیوز به پایان رسیده است! یادداشت به زودی نابود می‌شود.'
              : 'Fuse is almost burned out! Content will self-destruct shortly.'}
          </span>
        </motion.div>
      )}
    </div>
  );
};
