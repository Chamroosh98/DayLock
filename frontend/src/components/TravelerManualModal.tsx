import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Compass, ShieldAlert, Zap, Globe, 
  HelpCircle, AlertTriangle, Plane, CheckCircle2,
  Lock, Layers, Sparkles, Keyboard
} from 'lucide-react';
import { travelerManual } from '../data/travelerManual';

interface TravelerManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fa';
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
  const t = travelerManual[language];
  const isRtl = language === 'fa';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || 'overview');
    }
  }, [isOpen, defaultTab]);

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
    const iconClass = "w-4 h-4 transition-transform duration-300 group-hover:scale-110";
    let icon = <Compass className={iconClass} />;
    switch (tab) {
      case 'overview': icon = <Compass className={iconClass} />; break;
      case 'coreModes': icon = <Lock className={iconClass} />; break;
      case 'advancedModes': icon = <Layers className={iconClass} />; break;
      case 'evasion': icon = <ShieldAlert className={iconClass} />; break;
      case 'emergency': icon = <Zap className={iconClass} />; break;
      case 'perimeter': icon = <Globe className={iconClass} />; break;
      case 'shortcuts': icon = <Keyboard className={iconClass} />; break;
    }

    return (
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
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
            className={`relative max-w-4xl w-full rounded-[32px] border overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[90vh] max-h-[780px] ${
              isDarkMode 
                ? 'bg-zinc-950 border-white/5 text-zinc-100 shadow-black/80' 
                : 'bg-white border-zinc-200 text-zinc-800 shadow-zinc-200/50'
            }`}
          >
            {/* Unified Modal Close Button */}
            <button 
              onClick={onClose}
              className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-4 z-50 p-2 rounded-full transition-all ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200' 
                  : 'hover:bg-black/5 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Sidebar - Navigation Tabs */}
            <div className={`w-full lg:w-64 p-6 flex flex-col justify-between shrink-0 border-b lg:border-b-0 ${
              isRtl ? 'lg:border-l' : 'lg:border-r'
            } ${
              isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div>
                {/* Header info */}
                <div className={`flex items-center gap-3 mb-6 ${isRtl ? 'pl-10 lg:pl-0' : 'pr-10 lg:pr-0'}`}>
                  <div className="relative shrink-0">
                    {/* Glowing background ring */}
                    <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-sm animate-pulse"></span>
                    <div className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                    }`}>
                      <Compass className="w-5 h-5 animate-pulse" />
                      <span className="absolute -bottom-1 -end-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className={`font-black text-sm tracking-tight leading-tight ${isRtl ? 'font-vazir' : 'font-display'}`}>
                      {t.title}
                    </h2>
                    <p className={`text-[9px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} font-medium leading-normal`}>
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                {/* Tabs Grid/List */}
                <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none">
                  {(['overview', 'coreModes', 'advancedModes', 'evasion', 'emergency', 'perimeter', 'shortcuts'] as TabType[]).map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${isRtl ? 'text-right' : 'text-left'} ${
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
                        <span className={isRtl ? 'font-vazir' : 'font-sans'}>{t.tabs[tab]}</span>
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
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Scrollable Content */}
              <div 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="flex-1 overflow-y-auto pt-14 lg:pt-6 p-6 md:p-8 space-y-6"
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
                            {language === 'en' ? 'Important Security Warning' : 'هشدار امنیتی بسیار مهم'}
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

                      <div className={`p-4 rounded-2xl text-[11px] font-bold leading-normal text-zinc-400 ${isDarkMode ? 'bg-zinc-900/20' : 'bg-zinc-100/50'} text-center ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                        {t.quickNote}
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
                            {language === 'en' ? '🔥 PRO-SURVIVAL SUGGESTION' : '🔥 تاکتیک بقای حرفه‌ای'}
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
                            {language === 'en' ? 'SYSTEM HOTKEYS' : 'کلیدهای میانبر سیستم'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-extrabold ${isRtl ? 'font-vazir' : 'font-display'}`}>
                          {language === 'en' ? 'Keyboard Shortcuts & Tactical Hotkeys' : 'کلیدهای میانبر و ابزارهای تندبر'}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                          {language === 'en' 
                            ? 'Boost your secure workflow efficiency in high-pressure or fast-paced situations with instantaneous tactile shortcuts.' 
                            : 'کارایی جریان کار امن خود را در شرایط حساس یا پرفشار با استفاده از کلیدهای میانبر آنی و لمسی ارتقا دهید.'}
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
                            {language === 'en' ? '🔥 PRO-SURVIVAL SUGGESTION' : '🔥 تاکتیک بقای حرفه‌ای'}
                          </span>
                          <p className={`text-[11px] font-semibold leading-relaxed ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                            {language === 'en'
                              ? 'Rehearse these hotkeys under calm conditions so that you can invoke them instinctively in high-threat scenarios.'
                              : 'این کلیدهای میانبر را در شرایط عادی تمرین کنید تا در زمان تفتیش یا شرایط تهدیدآمیز بتوانید آن‌ها را به‌صورت غریزی اجرا کنید.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Clear All Fields */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                          <div className="space-y-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' ? 'Clear All Fields (RAM Wipe)' : 'پاکسازی کامل داده‌ها (RAM)'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' 
                                ? 'Instantly purges all active secrets, inputs, files, passwords, and state from volatile memory.' 
                                : 'حذف آنی تمامی ورودی‌ها، متون، فایل‌ها، رمزها و حالت‌ها از حافظه ناپایدار RAM.'}
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
                              {language === 'en' ? 'Toggle View Mode / Active Tab' : 'جابجایی حالت نمایش / تب فعال'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' 
                                ? 'Switches view focus seamlessly between Text, File, and Audio steganography modes.' 
                                : 'تغییر وضعیت یکپارچه صفحه نمایش بین متون، فایل‌ها و نهان‌نگاری صوتی.'}
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
                              {language === 'en' ? 'Toggle Security Manual & Hotkeys' : 'بازگشایی کتابچه و کلیدهای میانبر'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' 
                                ? 'Opens or closes this Security & Operations Guide panel from anywhere.' 
                                : 'باز کردن یا بستن سریع همین بخش کتابچه امنیت و کلیدهای میانبر.'}
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
                            <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' ? 'Trigger Active Panic Block' : 'تحریک فعال سپر خودتخریبی'}
                            </span>
                            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : 'font-sans'}`}>
                              {language === 'en' 
                                ? 'Wipes all local keys, resets the clipboards, and blanks the viewport to white/black.' 
                                : 'حذف آنی تمام کلیدها، بازنشانی کلیپ‌بورد و سفید/سیاه کردن فوری صفحه برای ممانعت از دیدن.'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start sm:self-auto" dir="ltr">
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>Ctrl</kbd>
                            <span className="text-zinc-500">+</span>
                            <kbd className={`px-2.5 py-1.5 rounded-xl bg-zinc-950 border font-extrabold text-zinc-300 ${isDarkMode ? 'border-white/10' : 'border-zinc-200 shadow-sm'}`}>P</kbd>
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
