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
  language,
  variant = 'default' 
}) => {
  const activeStylesMapDark: Record<string, string> = {
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    default: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const activeStylesMapLight: Record<string, string> = {
    danger: 'bg-red-50 border-red-200 text-red-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    default: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  };

  const dotColorMap: Record<string, string> = {
    danger: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    indigo: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    default: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  };

  const iconColorDarkMap: Record<string, string> = {
    danger: '#f87171',
    warning: '#fbbf24',
    blue: '#60a5fa',
    cyan: '#22d3ee',
    purple: '#c084fc',
    indigo: '#818cf8',
    default: '#34d399',
  };

  const iconColorLightMap: Record<string, string> = {
    danger: '#dc2626',
    warning: '#d97706',
    blue: '#2563eb',
    cyan: '#0891b2',
    purple: '#9333ea',
    indigo: '#4f46e5',
    default: '#059669',
  };

  const activeStyles = isDarkMode
    ? (activeStylesMapDark[variant] || activeStylesMapDark.default)
    : (activeStylesMapLight[variant] || activeStylesMapLight.default);

  const dotColor = dotColorMap[variant] || dotColorMap.default;

  const getIconColor = () => {
    if (!active) {
      return isDarkMode ? '#d4d4d8' : '#71717a';
    }
    return isDarkMode
      ? (iconColorDarkMap[variant] || iconColorDarkMap.default)
      : (iconColorLightMap[variant] || iconColorLightMap.default);
  };

  const isFa = language === 'fa';

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      dir={isFa ? 'rtl' : 'ltr'}
      className={`flex items-center gap-2.5 px-4 py-3 min-h-[46px] rounded-2xl border transition-all cursor-pointer ${
        active 
          ? activeStyles 
          : (isDarkMode ? 'bg-zinc-900/40 border-white/20 text-zinc-300 hover:border-white/30' : 'bg-zinc-100 border-zinc-300 text-zinc-500 hover:border-zinc-400')
      }`}
    >
      <motion.div
        className="flex items-center justify-center flex-shrink-0 w-4 h-4"
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
      <span className={`text-[11.5px] sm:text-xs font-semibold tracking-tight leading-snug flex-1 ${isFa ? 'font-vazir text-right' : 'font-sans text-left'}`}>{title}</span>
      <div className={`ms-auto w-2 h-2 rounded-full flex-shrink-0 ${active ? dotColor : (isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300')}`} />
    </button>
  );
};
export default OptionToggle;
