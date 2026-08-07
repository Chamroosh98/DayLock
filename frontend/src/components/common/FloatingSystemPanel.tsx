import React from 'react';
import { motion } from 'motion/react';
import { Shield, HelpCircle, Sun, Moon } from 'lucide-react';
import { Language } from '../../types';

interface FloatingSystemPanelProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  setShowSecurityShield?: (show: boolean) => void;
  handleOpenTravelerManual?: (tab?: string) => void;
  onOpenSecurityShield?: () => void;
  onOpenTravelerManual?: (tab?: string) => void;
}

export const FloatingSystemPanel: React.FC<FloatingSystemPanelProps> = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  setShowSecurityShield,
  handleOpenTravelerManual,
  onOpenSecurityShield,
  onOpenTravelerManual,
}) => {
  const openShield = onOpenSecurityShield || (() => setShowSecurityShield && setShowSecurityShield(true));
  const openManual = (tab?: string) => {
    if (onOpenTravelerManual) {
      onOpenTravelerManual(tab);
    } else if (handleOpenTravelerManual) {
      handleOpenTravelerManual(tab);
    }
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      id="desktop-toggles"
      className={`fixed top-12 right-6 lg:right-10 z-[70] hidden lg:flex items-center gap-2 p-1.5 rounded-full backdrop-blur-2xl border transition-all duration-300 shadow-2xl ${
        isDarkMode 
          ? 'bg-zinc-900/80 border-white/15 shadow-black/60 hover:border-white/25 hover:bg-zinc-900/90' 
          : 'bg-white/85 border-zinc-200 shadow-zinc-300/40 hover:border-zinc-300 hover:bg-white/95'
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={openShield}
        className={`p-2 rounded-full transition-all duration-300 relative ${
          isDarkMode 
            ? 'hover:bg-white/10 text-emerald-400' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
        title={language === 'en' ? 'Manage Screen Shield Engines' : 'مدیریت سپرهای حفاظتی صفحه'}
      >
        <Shield className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
      </motion.button>

      <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => openManual('overview')}
        className={`p-2 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'hover:bg-white/10 text-emerald-400' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
        title={language === 'en' ? 'Traveler Security Manual' : 'راهنمای امنیتی مسافران'}
      >
        <HelpCircle className="w-4 h-4" />
      </motion.button>

      <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
        className={`px-3 py-1.5 rounded-full transition-all duration-300 font-bold text-[10px] tracking-widest ${
          isDarkMode 
            ? 'hover:bg-white/10 text-emerald-400' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
        title={language === 'en' ? 'Switch Language (فارسی)' : 'تغییر زبان (English)'}
      >
        {language === 'en' ? 'FA' : 'EN'}
      </motion.button>

      <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

      <motion.button
        whileHover={{ scale: 1.08, rotate: 15 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`p-2 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'hover:bg-white/10 text-yellow-400' 
            : 'hover:bg-amber-50 text-zinc-700'
        }`}
        title={isDarkMode ? (language === 'en' ? 'Light Mode' : 'حالت روشن') : (language === 'en' ? 'Dark Mode' : 'حالت تاریک')}
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>
    </motion.div>
  );
};
