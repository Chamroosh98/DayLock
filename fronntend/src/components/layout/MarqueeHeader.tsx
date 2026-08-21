import React from 'react';
import { motion } from 'motion/react';

interface MarqueeHeaderProps {
  isDarkMode: boolean;
  t?: {
    freeIran?: string;
    helpIran?: string;
  };
}

export const MarqueeHeader: React.FC<MarqueeHeaderProps> = ({ isDarkMode }) => {
  const statement = "Remembering the IRAN Massacre on Jan 8-9, 2026 (18-19 Day 1404)";

  return (
    <div dir="ltr" className={`fixed top-0 left-0 w-full ${isDarkMode ? 'bg-emerald-500/5 border-white/5' : 'bg-emerald-500/5 border-black/5'} border-b py-1.5 z-50 overflow-hidden backdrop-blur-md`}>
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 47, ease: "linear" }}
        className="flex whitespace-nowrap gap-16 w-max"
      >
        {/* First loop block */}
        <div className="flex gap-16 pr-16 items-center">
          {[...Array(6)].map((_, i) => (
            <span key={`loop1-${i}`} className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
              {statement}
            </span>
          ))}
        </div>
        {/* Identical cloned block for seamless transition */}
        <div className="flex gap-16 pr-16 items-center" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <span key={`loop2-${i}`} className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
              {statement}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
