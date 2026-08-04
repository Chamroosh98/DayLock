import React from 'react';
import { MetaItemProps } from '../types';
import { localizeDigitsValue } from '../utils/numberConverter';
import { Eye, Clock, Key } from 'lucide-react';

export const MetaItem: React.FC<MetaItemProps> = ({ label, value, isDarkMode, language, iconType }) => {
  const displayValue = localizeDigitsValue(value, language || 'en');

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
    <div className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-zinc-900/35 border-white/5 hover:border-white/10 hover:bg-zinc-900/60' 
        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
    } shadow-sm group`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${iconBgClass}`}>
          <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClass}`} />
        </div>
        <div className="flex flex-col text-left">
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] ${
            isDarkMode ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500'
          } transition-colors`}>
            {label}
          </span>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs sm:text-sm font-black font-mono transition-colors ${
          isDarkMode 
            ? 'text-zinc-100 group-hover:text-emerald-400' 
            : 'text-zinc-800 group-hover:text-emerald-600'
        }`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};
