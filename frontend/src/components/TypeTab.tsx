import React from 'react';
import { motion } from 'motion/react';
import { TypeTabProps } from '../types';

export const TypeTab: React.FC<TypeTabProps> = ({ id, active, onClick, icon, text, isDarkMode }) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-2 px-1 xs:px-2.5 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-300 w-full select-none focus:outline-none cursor-pointer ${
        active 
          ? (isDarkMode ? 'text-emerald-450 font-bold' : 'text-emerald-700 font-bold') 
          : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-900')
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-type-tab-element"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className={`absolute inset-0 rounded-full ${
            isDarkMode 
              ? 'bg-zinc-900 border border-white/[0.06] shadow-md shadow-zinc-950/50' 
              : 'bg-white border border-zinc-200 shadow-md shadow-zinc-150/40'
          }`}
          style={{ zIndex: 0 }}
        />
      )}
      
      <div className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${active ? 'scale-110 text-emerald-500' : 'opacity-70 text-zinc-400'}`}>
        {React.cloneElement(icon, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' })}
      </div>
      <span className="relative z-10 text-[8px] xs:text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider">{text}</span>
    </button>
  );
};

export default TypeTab;
