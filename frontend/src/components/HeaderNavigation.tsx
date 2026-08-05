import React from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, Shield, HelpCircle, Sun, Moon } from 'lucide-react';
import { Language } from '../types';

interface HeaderNavigationProps {
  showDock: boolean;
  mainTab: 'create' | 'view';
  setMainTab: (tab: 'create' | 'view') => void;
  setShowSecurityShield: (val: boolean) => void;
  handleOpenTravelerManual: (tab: 'overview' | 'shortcuts') => void;
  language: Language;
  setLanguage: (val: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  t: any;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  showDock,
  mainTab,
  setMainTab,
  setShowSecurityShield,
  handleOpenTravelerManual,
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode,
  t,
}) => {
  return (
    <>
      {/* Mobile Floating Dock - Primary Nav for Mobile/Tablet */}
      <div id="floating-dock" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] lg:hidden w-[92%] max-w-sm md:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: showDock ? 0 : 100, 
            opacity: showDock ? 1 : 0,
            scale: showDock ? 1 : 0.95
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={`flex items-center justify-between p-1.5 rounded-full backdrop-blur-2xl border shadow-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/10 shadow-black/50' : 'bg-white/60 border-zinc-200 shadow-zinc-200/50'}`}
        >
          <div className="flex gap-1 flex-1">
            <button 
              onClick={() => setMainTab('create')}
              className={`flex-1 py-2 md:py-2.5 flex items-center justify-center transition-all rounded-full ${mainTab === 'create' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
              title={t.create}
            >
              <Plus className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
            <button 
              onClick={() => setMainTab('view')}
              className={`flex-1 py-2 md:py-2.5 flex items-center justify-center transition-all rounded-full ${mainTab === 'view' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
              title={t.view}
            >
              <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
          </div>
          
          <div className={`w-px h-6 md:h-7 mx-2.5 md:mx-3 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
          
          <div className="flex items-center gap-1 md:gap-1 pe-1">
            <button
              id="screenshot-shield-btn-mobile"
              onClick={() => setShowSecurityShield(true)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center relative ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
              title={language === 'fa' ? 'مدیریت سپرهای حفاظتی صفحه' : 'Manage Screen Shield Engines'}
            >
              <Shield className="w-4 h-4 md:w-4.5 md:h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </button>
            <button
              onClick={() => handleOpenTravelerManual('overview')}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
            >
              <HelpCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
            >
              {language === 'en' ? 'FA' : 'EN'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'text-yellow-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-black/5'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Free IRAN Marquee - Perfect Seamless Infinite Loop */}
      <div dir="ltr" className={`fixed top-0 left-0 w-full ${isDarkMode ? 'bg-emerald-500/5 border-white/5' : 'bg-emerald-500/5 border-black/5'} border-b py-1.5 z-50 overflow-hidden backdrop-blur-md`}>
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-16 w-max"
        >
          {/* First loop block */}
          <div className="flex gap-16 pr-16 items-center">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={`loop1-${i}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                  {t.freeIran}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-red-400' : 'bg-red-600'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                  {t.helpIran}
                </span>
              </React.Fragment>
            ))}
          </div>
          {/* Identical cloned block for seamless transition */}
          <div className="flex gap-16 pr-16 items-center" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={`loop2-${i}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                  {t.freeIran}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-4`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-red-400' : 'bg-red-600'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                  {t.helpIran}
                </span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating System Panel - Fixed floating at top corner on Desktop for effortless scroll access */}
      <div 
        id="desktop-toggles"
        className={`fixed top-11 end-6 lg:end-10 z-[60] hidden lg:flex items-center gap-2 p-1.5 rounded-full backdrop-blur-2xl border transition-all duration-300 shadow-xl hover:shadow-2xl ${
          isDarkMode ? 'bg-zinc-900/80 border-white/15 shadow-black/60' : 'bg-white/85 border-zinc-200/90 shadow-zinc-300/50'
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSecurityShield(true)}
          className={`p-2 rounded-full transition-all duration-300 relative ${
            isDarkMode 
              ? 'hover:bg-white/10 text-emerald-400' 
              : 'hover:bg-black/5 text-emerald-600'
          }`}
          title={language === 'en' ? 'Manage Screen Shield Engines' : 'مدیریت سپرهای حفاظتی صفحه'}
        >
          <Shield className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </motion.button>
        <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenTravelerManual('overview')}
          className={`p-2 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? 'hover:bg-white/10 text-emerald-400' 
              : 'hover:bg-black/5 text-emerald-600'
          }`}
          title={language === 'en' ? 'Traveler Security Manual' : 'راهنمای امنیتی مسافران'}
        >
          <HelpCircle className="w-4 h-4" />
        </motion.button>
        <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
          className={`px-3 py-1.5 rounded-full transition-all duration-300 font-bold text-[10px] tracking-widest ${
            isDarkMode 
              ? 'hover:bg-white/10 text-emerald-400' 
              : 'hover:bg-black/5 text-emerald-600'
          }`}
        >
          {language === 'en' ? 'FA' : 'EN'}
        </motion.button>
        <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <motion.button
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? 'hover:bg-white/10 text-yellow-400' 
              : 'hover:bg-black/5 text-zinc-600'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
      </div>
    </>
  );
};
