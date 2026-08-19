import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Check } from 'lucide-react';
import { CustomSelectProps } from '../types';
import { localizeDigitsValue } from '../utils/numberConverter';
import { translations } from '../data/translations';

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options = [], isDarkMode, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options?.find(o => o.value === value);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language || 'en'] || translations.en;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const isFa = language === 'fa';

  return (
    <div ref={containerRef} className="relative" dir={isFa ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        dir={isFa ? 'rtl' : 'ltr'}
        className={`w-full h-11 px-3.5 flex items-center justify-between ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 shadow-sm'} rounded-2xl text-xs outline-none border transition-all hover:border-emerald-500/30`}
      >
        <span className={`font-medium ${isFa ? 'font-vazir text-right text-[11.5px]' : 'text-left text-xs'}`}>
          {selectedOption ? localizeDigitsValue(selectedOption.label, language || 'en') : (t.selectOption || 'Select option...')}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 ms-2"
        >
          <Calendar className="w-3 h-3 opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            dir={isFa ? 'rtl' : 'ltr'}
            className={`absolute z-[100] w-full bottom-full mb-2 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDarkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-zinc-200'}`}
          >
            {options?.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                dir={isFa ? 'rtl' : 'ltr'}
                className={`w-full px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${isFa ? 'text-right font-vazir' : 'text-left'} ${opt.value === value ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-zinc-50')}`}
              >
                <span className={`flex-1 ${isFa ? 'font-vazir text-right' : 'text-left'}`}>{localizeDigitsValue(opt.label, language || 'en')}</span>
                {opt.value === value && <Check className="w-3 h-3 shrink-0 ms-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CustomSelect;
