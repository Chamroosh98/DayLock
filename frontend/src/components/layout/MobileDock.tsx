import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Eye, Shield, HelpCircle, Sun, Moon, X, Flame } from 'lucide-react';
import { MainTab, Language } from '../../types';
import { translations } from '../../data/translations';
import { Flag } from '../../data/countries';

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
  onPanicWipe?: () => void;
}

const LANGUAGES_LIST: { code: Language; name: string; countryCode: string; emoji: string }[] = [
  { code: 'fa', name: 'Persian (FA)', countryCode: 'IR', emoji: '🦁☀️' },
  { code: 'en', name: 'English (EN)', countryCode: 'US', emoji: '🇺🇸' },
  { code: 'ru', name: 'Russian (RU)', countryCode: 'RU', emoji: '🇷🇺' },
  { code: 'zh', name: 'Chinese (ZH)', countryCode: 'CN', emoji: '🇨🇳' },
];

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
  onPanicWipe,
}) => {
  const [isSelectingLanguage, setIsSelectingLanguage] = useState(false);
  const currentT = translations[language] || translations.en;
  const openShield = onOpenSecurityShield || (() => setShowSecurityShield && setShowSecurityShield(true));
  const openManual = (tab?: string) => {
    if (onOpenTravelerManual) {
      onOpenTravelerManual(tab);
    } else if (handleOpenTravelerManual) {
      handleOpenTravelerManual(tab);
    }
  };

  const activeLangItem = LANGUAGES_LIST.find((item) => item.code === language) || LANGUAGES_LIST[1];

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setIsSelectingLanguage(false);
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
      <div id="floating-dock" dir="ltr" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] lg:hidden w-auto max-w-[95vw]">
        <motion.div
          layout
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: showDock ? 0 : 100, 
            opacity: showDock ? 1 : 0,
            scale: showDock ? 1 : 0.95
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={`flex items-center p-1.5 rounded-full backdrop-blur-2xl border shadow-2xl ${isDarkMode ? 'bg-zinc-900/80 border-white/10 shadow-black/50' : 'bg-white/80 border-zinc-200 shadow-zinc-200/50'}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isSelectingLanguage ? (
              <motion.div
                key="default-dock-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => setMainTab('create')}
                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all rounded-full ${mainTab === 'create' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
                    title={t.create}
                  >
                    <Plus className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </button>
                  <button 
                    onClick={() => setMainTab('view')}
                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all rounded-full ${mainTab === 'view' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
                    title={t.view}
                  >
                    <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </button>
                </div>
                
                <div className={`w-px h-5 md:h-6 mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />
                
                <div className="flex items-center gap-0.5 md:gap-1">
                  {/* Flag Trigger Button */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSelectingLanguage(true)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                    }`}
                    title={currentT.switchLanguage}
                    aria-label={currentT.switchLanguage}
                  >
                    <div className="w-5 h-3.5 flex items-center justify-center rounded-sm overflow-hidden leading-none shrink-0">
                      <Flag code={activeLangItem.countryCode} emoji={activeLangItem.emoji} className="w-5 h-3.5 object-cover" />
                    </div>
                  </motion.button>

                  <button
                    onClick={() => openManual('overview')}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
                    title={currentT.travelerManualTitle}
                  >
                    <HelpCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </button>

                  <button
                    id="screenshot-shield-btn-mobile"
                    onClick={openShield}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center relative ${isDarkMode ? 'text-emerald-400 hover:bg-white/5' : 'text-emerald-600 hover:bg-black/5'}`}
                    title={currentT.manageScreenShield}
                  >
                    <Shield className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </button>

                  {/* Panic Mode Mobile Trigger */}
                  {onPanicWipe && (
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={onPanicWipe}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center relative bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition-all duration-200 cursor-pointer shadow-sm shadow-red-500/20"
                      title={currentT.panicModeButton || "Panic Mode Wipe (Ctrl+Shift+Backspace)"}
                      aria-label="Panic Mode Wipe"
                    >
                      <Flame className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    </motion.button>
                  )}

                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center ${isDarkMode ? 'text-amber-400 hover:bg-white/5' : 'text-zinc-600 hover:bg-black/5'}`}
                    title={isDarkMode ? currentT.switchToLightMode : currentT.switchToDarkMode}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="language-selector-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 px-1 py-0.5"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSelectingLanguage(false)}
                  aria-label="Close Language Menu"
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-100'
                      : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>

                <div className={`w-px h-5 md:h-6 mx-0.5 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

                <div className="flex items-center gap-1">
                  {LANGUAGES_LIST.map((langItem) => {
                    const isSelected = language === langItem.code;
                    return (
                      <motion.button
                        key={langItem.code}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLanguageSelect(langItem.code)}
                        title={langItem.name}
                        aria-label={`Select ${langItem.name}`}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border border-emerald-500/60 shadow-md shadow-emerald-500/20 scale-105'
                            : isDarkMode
                            ? 'hover:bg-white/10 opacity-70 hover:opacity-100 border border-transparent'
                            : 'hover:bg-zinc-100 opacity-70 hover:opacity-100 border border-transparent'
                        }`}
                      >
                        <div className="w-5 h-3.5 flex items-center justify-center rounded-sm overflow-hidden leading-none shrink-0">
                          <Flag code={langItem.countryCode} emoji={langItem.emoji} className="w-5 h-3.5 object-cover" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
