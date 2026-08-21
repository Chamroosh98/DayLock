import React from 'react';
import { MetaItemProps } from '../types';
import { localizeDigitsValue } from '../utils/numberConverter';
import { Eye, Clock, Key } from 'lucide-react';

export const MetaItem: React.FC<MetaItemProps> = ({ label, value, isDarkMode, language, iconType }) => {
  const displayValue = localizeDigitsValue(value, language || 'en');
  const isFa = language === 'fa';

  // Choose icon based on type
  let IconComponent = Eye;
  let iconColorClass = 'text-emerald-400';
  let iconBgClass = 'bg-emerald-500/10 border-emerald-500/20';

  if (iconType === 'expires') {
    IconComponent = Clock;
    iconColorClass = 'text-amber-400';
    iconBgClass = 'bg-amber-500/10 border-amber-500/20';
  } else if (iconType === 'maxViews') {
    IconComponent = Key;
    iconColorClass = 'text-indigo-400';
    iconBgClass = 'bg-indigo-500/10 border-indigo-500/20';
  }

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-zinc-950/40 border-white/10 hover:border-white/15 shadow-inner' 
          : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${iconBgClass}`}>
          <IconComponent className={`w-4 h-4 ${iconColorClass}`} />
        </div>
        <span className={`text-[11px] font-bold ${
          isFa ? 'font-vazir text-zinc-400' : 'text-zinc-400 uppercase tracking-wider'
        }`}>
          {label}
        </span>
      </div>
      <div className="flex items-center">
        <span className={`text-xs sm:text-sm font-black ${
          isFa ? 'font-vazir text-zinc-200' : 'font-mono text-zinc-200'
        }`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};
