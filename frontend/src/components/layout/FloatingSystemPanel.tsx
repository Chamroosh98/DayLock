import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, HelpCircle, Sun, Moon, Languages, X, Flame } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';
import { Flag } from '../../data/countries';

interface FloatingSystemPanelProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
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

export const FloatingSystemPanel: React.FC<FloatingSystemPanelProps> = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  setShowSecurityShield,
  handleOpenTravelerManual,
  onOpenSecurityShield,
  onOpenTravelerManual,
  onPanicWipe,
}) => {
  const [isSelectingLanguage, setIsSelectingLanguage] = useState(false);
  const t = translations[language] || translations.en;

  const openShield = onOpenSecurityShield || (() => setShowSecurityShield && setShowSecurityShield(true));
  const openManual = (tab?: string) => {
    if (onOpenTravelerManual) {
      onOpenTravelerManual(tab);
    } else if (handleOpenTravelerManual) {
      handleOpenTravelerManual(tab);
    }
  };

  // ESC key listener to exit language selection mode (a11y)
  useEffect(() => {
    if (!isSelectingLanguage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelectingLanguage(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectingLanguage]);

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setIsSelectingLanguage(false);
  };

  return (
    <motion.div 
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      id="desktop-toggles"
      dir="ltr"
      className={`fixed top-12 right-6 lg:right-10 z-[70] hidden lg:flex items-center gap-2 p-1.5 rounded-full backdrop-blur-2xl border transition-colors duration-300 shadow-2xl ${
        isDarkMode 
          ? 'bg-zinc-900/80 border-white/15 shadow-black/60 hover:border-white/25 hover:bg-zinc-900/90' 
          : 'bg-white/85 border-zinc-200 shadow-zinc-300/40 hover:border-zinc-300 hover:bg-white/95'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isSelectingLanguage ? (
          /* INITIAL STATE (DEFAULT SYSTEM MENU) */
          <motion.div
            key="default-panel"
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* Language Switcher Trigger (Flag Only) */}
            {(() => {
              const activeLangItem = LANGUAGES_LIST.find((item) => item.code === language) || LANGUAGES_LIST[1];
              return (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSelectingLanguage(true)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer overflow-hidden ${
                    isDarkMode
                      ? 'hover:bg-white/10'
                      : 'hover:bg-zinc-100'
                  }`}
                  title={t.switchLanguage}
                  aria-label={t.switchLanguage}
                >
                  <div className="w-5 h-3.5 flex items-center justify-center rounded-sm overflow-hidden leading-none shrink-0">
                    <Flag code={activeLangItem.countryCode} emoji={activeLangItem.emoji} className="w-5 h-3.5 object-cover" />
                  </div>
                </motion.button>
              );
            })()}

            <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

            {/* Manual Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => openManual('overview')}
              className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-emerald-400' 
                  : 'hover:bg-emerald-50 text-emerald-600'
              }`}
              title={t.travelerManualTitle}
            >
              <HelpCircle className="w-4 h-4" />
            </motion.button>

            <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

            {/* Screen Shield Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={openShield}
              className={`p-2 rounded-full transition-all duration-300 relative cursor-pointer ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-emerald-400' 
                  : 'hover:bg-emerald-50 text-emerald-600'
              }`}
              title={t.manageScreenShield}
            >
              <Shield className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </motion.button>

            {/* Panic Mode Trigger Button */}
            {onPanicWipe && (
              <>
                <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={onPanicWipe}
                  className="p-2 rounded-full transition-all duration-300 relative cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  title={t.panicModeButton || "Instant Panic Mode Wipe (Ctrl+Shift+Backspace)"}
                  aria-label="Instant Panic Mode Wipe"
                >
                  <Flame className="w-4 h-4" />
                </motion.button>
              </>
            )}

            <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-amber-400' 
                  : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
              title={isDarkMode ? t.switchToLightMode : t.switchToDarkMode}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </motion.div>
        ) : (
          /* LANGUAGE SELECTION STATE (DYNAMIC MORPH) */
          <motion.div
            key="language-panel"
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5"
          >
            {/* Back / Close Trigger */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSelectingLanguage(false)}
              aria-label="Close Language Menu"
              className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-100'
                  : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className={`w-px h-4 ${isDarkMode ? 'bg-white/15' : 'bg-zinc-200'}`} />

            {/* Language Options (Clean Flag-Only Badges) */}
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
                  className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/60 shadow-md shadow-emerald-500/20 scale-110'
                      : isDarkMode
                      ? 'hover:bg-white/10 opacity-70 hover:opacity-100 border border-transparent'
                      : 'hover:bg-zinc-100 opacity-70 hover:opacity-100 border border-transparent'
                  }`}
                >
                  <Flag code={langItem.countryCode} emoji={langItem.emoji} className="w-5 h-3.5 rounded-sm object-cover" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingSystemPanel;

