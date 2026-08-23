import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, ShieldAlert, Zap, Globe, 
  HelpCircle, AlertTriangle, Plane, CheckCircle2,
  Lock, Layers, Sparkles, Keyboard
} from 'lucide-react';
import { travelerManual } from '../data/travelerManual';
import { translations } from '../data/translations';
import { Language } from '../types';

interface TravelerManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isDarkMode: boolean;
  onStartTour: () => void;
  defaultTab?: TabType;
}

type TabType = 'overview' | 'coreModes' | 'advancedModes' | 'evasion' | 'emergency' | 'perimeter' | 'shortcuts';

export const TravelerManualModal: React.FC<TravelerManualModalProps> = ({
  isOpen,
  onClose,
  language,
  isDarkMode,
  onStartTour,
  defaultTab
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const t = travelerManual[language] || travelerManual.en;
  const mainT = translations[language] || translations.en;
  const isRtl = language === 'fa';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || 'overview');
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const tabsOrder: TabType[] = ['overview', 'coreModes', 'advancedModes', 'evasion', 'emergency', 'perimeter', 'shortcuts'];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null || touchStartY === null || touchEndY === null) return;
    const xDistance = touchStart - touchEnd;
    const yDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    // Must be a horizontal swipe and not a vertical scroll
    if (Math.abs(xDistance) > minSwipeDistance && Math.abs(xDistance) > Math.abs(yDistance)) {
      const isLeftSwipe = xDistance > 0;
      const isRightSwipe = xDistance < 0;
      const currentIndex = tabsOrder.indexOf(activeTab);

      if (isLeftSwipe) {
        if (isRtl) {
          if (currentIndex > 0) setActiveTab(tabsOrder[currentIndex - 1]);
        } else {
          if (currentIndex < tabsOrder.length - 1) setActiveTab(tabsOrder[currentIndex + 1]);
        }
      } else if (isRightSwipe) {
        if (isRtl) {
          if (currentIndex < tabsOrder.length - 1) setActiveTab(tabsOrder[currentIndex + 1]);
        } else {
          if (currentIndex > 0) setActiveTab(tabsOrder[currentIndex - 1]);
        }
      }
    }
  };

  const getTabIcon = (tab: TabType, isActive: boolean) => {
    const iconClass = "w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110";
    let icon = <BookOpen className={iconClass} />;
    switch (tab) {
      case 'overview': icon = <BookOpen className={iconClass} />; break;
      case 'coreModes': icon = <Lock className={iconClass} />; break;
      case 'advancedModes': icon = <Layers className={iconClass} />; break;
      case 'evasion': icon = <ShieldAlert className={iconClass} />; break;
      case 'emergency': icon = <Zap className={iconClass} />; break;
      case 'perimeter': icon = <Globe className={iconClass} />; break;
      case 'shortcuts': icon = <Keyboard className={iconClass} />; break;
    }

    return (
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
        isActive
          ? isDarkMode
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-white/20 text-white'
          : isDarkMode
            ? 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'
            : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-800'
      }`}>
        {icon}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'} 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`relative max-w-4xl w-full rounded-2xl sm:rounded-[32px] border overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[88vh] max-h-[780px] ${
              isDarkMode 
                ? 'bg-zinc-950 border-white/5 text-zinc-100 shadow-black/80' 
                : 'bg-white border-zinc-200 text-zinc-800 shadow-zinc-200/50'
            }`}
          >
            {/* Unified Modal Close Button */}
            <button 
              onClick={onClose}
              className={`absolute ${isRtl ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} top-3 sm:top-4 z-50 p-1.5 sm:p-2 rounded-full transition-all ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200' 
                  : 'hover:bg-black/5 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Sidebar - Navigation Tabs (Right in RTL/Fa, Left in LTR) */}
            <div className={`w-full lg:w-64 p-4 sm:p-6 flex flex-col justify-between shrink-0 border-b lg:border-b-0 ${
              isRtl ? 'lg:border-l' : 'lg:border-r'
            } ${
              isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div>
                {/* Header info */}
                <div className={`flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 ${isRtl ? 'flex-row text-right pl-8 lg:pl-0' : 'flex-row text-left pr-8 lg:pr-0'}`}>
                  <div className="relative shrink-0">
                    {/* Glowing background ring */}
                    <span className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-emerald-500/20 blur-sm animate-pulse"></span>
                    <div className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                    }`}>
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                      <span className="absolute -bottom-1 -end-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-ping"></span>
                      </span>
                    </div>
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h2 className="font-sans font-black text-xs sm:text-sm tracking-tight leading-tight">
                      {t.title}
                    </h2>
                  </div>
                </div>

                {/* Tabs Grid/List */}
                <nav 
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none"
                >
                  {(['overview', 'coreModes', 'advancedModes', 'evasion', 'emergency', 'perimeter', 'shortcuts'] as TabType[]).map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        dir={isRtl ? 'rtl' : 'ltr'}
                        className={`group flex items-center gap-2 px-2.5 py-1.5 sm:py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${isRtl ? 'text-right font-vazir' : 'text-left font-sans'} ${
                          isActive 
                            ? isDarkMode
                              ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20'
                              : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isDarkMode
                              ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                              : 'text-zinc-600 hover:bg-black/5 hover:text-zinc-900'
                        }`}
                      >
                        {getTabIcon(tab, isActive)}
                        <span>{t.tabs[tab]}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tour Trigger in sidebar */}
              <div className="hidden lg:block mt-6 pt-4 border-t border-dashed border-zinc-700/20">
                <button
                  onClick={() => {
                    onClose();
                    onStartTour();
                  }}
                  className={`w-full py-3 px-4 rounded-[18px] text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isDarkMode
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span className={isRtl ? 'font-vazir' : 'font-sans'}>{t.startTourBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Pane - Dynamic Content Area */}
            <div dir={isRtl ? 'rtl' : 'ltr'} className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Scrollable Content */}
              <div 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="flex-1 overflow-y-auto pt-10 sm:pt-14 lg:pt-6 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6"
              >
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <h3 className={`text-xl font-black tracking-tight ${isRtl ? 'font-vazir' : 'font-display'}`}>
                          {t.overviewHeading}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                          {t.overviewText}
                        </p>
                      </div>

                      {/* Warning disclaimer box */}
                      <div className={`p-4 rounded-2xl border flex gap-3 items-start ${
                        isDarkMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider block">
                            {mainT.importantSecurityWarning}
                          </span>
                          <p className={`text-[10.5px] leading-relaxed ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {t.warningText}
                          </p>
                        </div>
                      </div>

                      {/* Info grid of primary modules */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {t.overviewCards.map((card, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'} space-y-2`}>
                            <span className={`text-[10px] font-black uppercase text-emerald-400 tracking-wider ${isRtl ? 'font-vazir' : 'font-mono'}`}>
                              {card.title}
                            </span>
                            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {card.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab !== 'overview' && activeTab !== 'shortcuts' && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Step Header */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                            {t.steps[activeTab as Exclude<TabType, 'overview' | 'shortcuts'>].badge}
                          </span>
                        </div>
                        <h3 className={`text-lg font-extrabold ${isRtl ? 'font-vazir' : 'font-display'}`}>
                          {t.steps[activeTab as Exclude<TabType, 'overview' | 'shortcuts'>].title}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                          {t.steps[activeTab as Exclude<TabType, 'overview' | 'shortcuts'>].description}
                        </p>
                      </div>

                      {/* Prominent high-priority Pro-Survival Suggestion placed BEFORE points */}
                      <div className={`p-4 rounded-2xl border ${
                        isDarkMode 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm'
                      } flex items-start gap-3 transition-all duration-300 hover:scale-[1.01]`}>
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 mt-0.5 animate-pulse">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest block text-amber-500 ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {mainT.proSurvivalSuggestion}
                          </span>
                          <p className={`text-[11px] font-semibold leading-relaxed ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {t.steps[activeTab as Exclude<TabType, 'overview' | 'shortcuts'>].tip}
                          </p>
                        </div>
                      </div>

                      {/* Bullet list with custom icons */}
                      <div className="space-y-3.5">
                        {t.steps[activeTab as Exclude<TabType, 'overview' | 'shortcuts'>].points.map((point, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <div className="mt-0.5 text-emerald-400 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'shortcuts' && (
                    <motion.div
                      key="shortcuts"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                            {mainT.systemHotkeys || 'SYSTEM HOTKEYS'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-extrabold ${isRtl ? 'font-vazir' : 'font-display'}`}>
                          {mainT.keyboardShortcutsTitle || 'Keyboard Shortcuts & Tactical Hotkeys'}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                          {mainT.keyboardShortcutsDesc || 'Boost your secure workflow efficiency in high-pressure or fast-paced situations with instantaneous tactile shortcuts.'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-2xl border ${
                        isDarkMode 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm'
                      } flex items-start gap-3 transition-all duration-300 hover:scale-[1.01]`}>
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-500 mt-0.5 animate-pulse">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest block text-amber-500 ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {mainT.proSurvivalSuggestion || '🔥 PRO-SURVIVAL SUGGESTION'}
                          </span>
                          <p className={`text-[11px] font-semibold leading-relaxed ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {mainT.proSurvivalSuggestionDesc || 'Rehearse these hotkeys under calm conditions so that you can invoke them instinctively in high-threat scenarios.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Undo Shortcut */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.undoShortcut || 'Undo Text / Content Edit'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.undoShortcutDesc || 'Undoes the last edit or accidental deletion so users never have to re-type their content.'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Ctrl / Cmd</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Z</kbd>
                          </div>
                        </div>

                        {/* Redo Shortcut */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.redoShortcut || 'Redo Changes'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.redoShortcutDesc || 'Redoes previously undone changes.'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Ctrl</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Y</kbd>
                            <span className="text-zinc-500 text-[10px] mx-0.5">/</span>
                            <kbd className={`px-2 rounded-xl bg-zinc-950 border font-extrabold text-[10px] text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Shift+Z</kbd>
                          </div>
                        </div>

                        {/* Clear All Fields */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.clearAllFieldsRam}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.clearAllFieldsRamDesc}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Ctrl</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Delete</kbd>
                          </div>
                        </div>

                        {/* Toggle Mode / Tab */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.toggleViewMode}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.toggleViewModeDesc}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Alt</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>T</kbd>
                          </div>
                        </div>

                        {/* Help / Security Operations Guide */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.toggleSecurityManual}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.toggleSecurityManualDesc}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-3.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>?</kbd>
                          </div>
                        </div>

                        {/* Active Panic Screen Block */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-red-400' : 'text-red-600'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.triggerPanicBlock}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {mainT.triggerPanicBlockDesc}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Ctrl</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Shift</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-red-400 ${isDarkMode ? 'border-red-500/30' : 'border-red-200 shadow-sm'}`}>Backspace</kbd>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile/Tablet bottom actions (Tour only) */}
              <div className={`p-4 border-t lg:hidden flex items-center justify-center ${
                isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
                <button
                  onClick={() => {
                    onClose();
                    onStartTour();
                  }}
                  className={`w-full max-w-xs py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isDarkMode
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span className={isRtl ? 'font-vazir' : 'font-sans'}>{t.startTourBtn}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
