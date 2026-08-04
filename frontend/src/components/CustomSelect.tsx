import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Check } from 'lucide-react';
import { CustomSelectProps } from '../types';
import { localizeDigitsValue } from '../utils/numberConverter';

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, isDarkMode, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 shadow-sm'} rounded-2xl p-3 text-xs outline-none border transition-all hover:border-emerald-500/30`}
      >
        <span className="font-medium">
          {selectedOption ? localizeDigitsValue(selectedOption.label, language || 'en') : ''}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
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
            className={`absolute z-[100] w-full bottom-full mb-2 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDarkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-zinc-200'}`}
          >
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${opt.value === value ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-zinc-50')}`}
              >
                <span>{localizeDigitsValue(opt.label, language || 'en')}</span>
                {opt.value === value && <Check className="w-3 h-3" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CustomSelect;
