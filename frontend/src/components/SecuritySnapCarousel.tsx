import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { OptionToggleProps } from '../types';

export interface SecurityCarouselCardItem {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: OptionToggleProps['variant'];
}

interface SecuritySnapCarouselProps {
  items: SecurityCarouselCardItem[];
  isDarkMode: boolean;
  language: string;
}

export const SecuritySnapCarousel: React.FC<SecuritySnapCarouselProps> = ({
  items,
  isDarkMode,
  language,
}) => {
  const isRtl = language === 'fa';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollProgress(0);
    }
  }, [isRtl, language]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const current = Math.abs(scrollLeft);
    setScrollProgress(Math.min(1, Math.max(0, current / maxScroll)));
  };

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

  const langDimensions = {
    ru: {
      col: 'auto-cols-[minmax(245px,max-content)] sm:auto-cols-[minmax(260px,max-content)]',
      btn: 'min-w-[245px] sm:min-w-[260px] px-4 gap-3.5',
    },
    fa: {
      col: 'auto-cols-[minmax(185px,max-content)] sm:auto-cols-[minmax(195px,max-content)]',
      btn: 'min-w-[185px] sm:min-w-[195px] px-3.5 gap-2.5',
    },
    en: {
      col: 'auto-cols-[minmax(180px,max-content)] sm:auto-cols-[minmax(190px,max-content)]',
      btn: 'min-w-[180px] sm:min-w-[190px] px-3.5 gap-2.5',
    },
    zh: {
      col: 'auto-cols-[minmax(150px,max-content)] sm:auto-cols-[minmax(160px,max-content)]',
      btn: 'min-w-[150px] sm:min-w-[160px] px-3 gap-2',
    },
  }[language] || {
    col: 'auto-cols-[minmax(180px,max-content)] sm:auto-cols-[minmax(190px,max-content)]',
    btn: 'min-w-[180px] sm:min-w-[190px] px-3.5 gap-2.5',
  };

  const handleItemClick = (e: React.MouseEvent<HTMLButtonElement>, item: SecurityCarouselCardItem) => {
    item.onClick();
    const btn = e.currentTarget;
    if (btn) {
      btn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  return (
    <div className="w-full relative select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 2-Row Horizontal Scroll Matrix */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Security Options Matrix"
        className={`grid grid-rows-2 grid-flow-col ${langDimensions.col} gap-2.5 
        overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 pt-0.5 px-0.5
        scrollbar-none focus:outline-none`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => {
          const isActive = item.active;
          const variant = item.variant || 'default';
          const activeStyles = isDarkMode
            ? (activeStylesMapDark[variant] || activeStylesMapDark.default)
            : (activeStylesMapLight[variant] || activeStylesMapLight.default);
          const dotColor = dotColorMap[variant] || dotColorMap.default;

          return (
            <motion.button
              key={item.id}
              id={item.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={(e) => handleItemClick(e, item)}
              className={`snap-start flex items-center justify-between ${langDimensions.btn} py-2.5 sm:py-3 min-h-[46px] rounded-2xl border transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? activeStyles 
                  : (isDarkMode ? 'bg-zinc-900/50 border-white/10 text-zinc-300 hover:border-white/20' : 'bg-zinc-100/90 border-zinc-200 text-zinc-600 hover:border-zinc-300')
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center justify-center shrink-0 w-4 h-4">
                  {item.icon}
                </div>
                <span className={`text-[11px] sm:text-xs font-semibold tracking-tight whitespace-nowrap ${isRtl ? 'font-vazir text-right' : 'font-sans text-left'}`}>
                  {item.title}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? dotColor : (isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300')}`} />
            </motion.button>
          );
        })}
      </div>

      {/* Subtle Horizontal Scroll Indicator Track */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <div className={`h-1 w-14 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-150"
            style={{ 
              width: '40%', 
              transform: `translateX(${isRtl ? -scrollProgress * 150 : scrollProgress * 150}%)` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

