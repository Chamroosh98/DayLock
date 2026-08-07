import React from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, Shield, HelpCircle, Sun, Moon } from 'lucide-react';
import { MainTab, Language } from '../../types';

interface MobileDockProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  showDock: boolean;
  t: {
    create: string;
    view: string;
  };
  setShowSecurityShield?: (show: boolean) => void;
  handleOpenTravelerManual?: (tab?: string) => void;
  onOpenSecurityShield?: () => void;
  onOpenTravelerManual?: (tab?: string) => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  mainTab,
  setMainTab,
  showDock,
  t,
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
    <>
      {/* Bottom Soft Blur & Fade Gradient to prevent content clutter under floating dock */}
      <div 
        className={`fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-[60] lg:hidden ${isDarkMode ? 'bg-[#0a0a0c]/75' : 'bg-zinc-50/75'}`}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)',
          maskImage: 'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

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
              onClick={openShield}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center relative ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
              title={language === 'fa' ? 'مدیریت سپرهای حفاظتی صفحه' : 'Manage Screen Shield Engines'}
            >
              <Shield className="w-4 h-4 md:w-4.5 md:h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </button>
            <button
              onClick={() => openManual('overview')}
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
    </>
  );
};
