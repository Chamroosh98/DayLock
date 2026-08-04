import React from 'react';
import { motion } from 'motion/react';
import { OptionToggleProps } from '../types';

export const OptionToggle: React.FC<OptionToggleProps> = ({ 
  id,
  active, 
  onClick, 
  icon, 
  title, 
  isDarkMode, 
  variant = 'default' 
}) => {
  const activeStyles = variant === 'danger' 
    ? (isDarkMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600')
    : variant === 'warning'
      ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600')
      : (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600');

  const dotColor = variant === 'danger' 
    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
    : variant === 'warning'
      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';

  const getIconColor = () => {
    if (!active) {
      return isDarkMode ? '#d4d4d8' : '#71717a';
    }
    if (variant === 'danger') {
      return isDarkMode ? '#f87171' : '#dc2626';
    }
    if (variant === 'warning') {
      return isDarkMode ? '#fbbf24' : '#d97706';
    }
    return isDarkMode ? '#34d399' : '#059669';
  };

  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
        active 
          ? activeStyles 
          : (isDarkMode ? 'bg-zinc-900/40 border-white/20 text-zinc-300 hover:border-white/30' : 'bg-zinc-100 border-zinc-300 text-zinc-500 hover:border-zinc-400')
      }`}
    >
      <motion.div
        className="flex items-center justify-center"
        animate={active && variant === 'danger' ? {
          scale: [1, 1.15, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(239,68,68,0))", 
            "drop-shadow(0 0 12px rgba(239,68,68,0.8))", 
            "drop-shadow(0 0 0px rgba(239,68,68,0))"
          ],
          color: ["#f87171", "#ef4444", "#f87171"]
        } : active && variant === 'warning' ? {
          scale: [1, 1.15, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(245,158,11,0))", 
            "drop-shadow(0 0 12px rgba(245,158,11,0.8))", 
            "drop-shadow(0 0 0px rgba(245,158,11,0))"
          ],
          color: ["#fbbf24", "#f59e0b", "#fbbf24"]
        } : {
          scale: 1,
          filter: "none",
          color: getIconColor()
        }}
        transition={(active && (variant === 'danger' || variant === 'warning')) ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.2 }}
      >
        {icon}
      </motion.div>
      <span className="text-xs font-black tracking-wide">{title}</span>
      <div className={`ms-auto w-1.5 h-1.5 rounded-full ${active ? dotColor : 'bg-zinc-800'}`} />
    </button>
  );
};
export default OptionToggle;
