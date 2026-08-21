import React from 'react';
import { motion } from 'motion/react';
import { TrashIcon } from '../TrashIcon';
import { MainTab, Language } from '../../types';

interface AppHeaderProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  isTrashAnimating: boolean;
  setIsTrashAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  setResetTrigger: React.Dispatch<React.SetStateAction<number>>;
  setStatus: (status: any) => void;
  setViewInput: (val: string) => void;
  setViewData: (val: any) => void;
  setDecryptedContent: (val: any) => void;
  setViewPassword: (val: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isDarkMode,
  language,
  t,
  mainTab,
  setMainTab,
  isTrashAnimating,
  setIsTrashAnimating,
  setResetTrigger,
  setStatus,
  setViewInput,
  setViewData,
  setDecryptedContent,
  setViewPassword,
}) => {
  return (
    <>
      {/* Header */}
      <div 
        dir={language === 'fa' ? 'rtl' : 'ltr'}
        className={`p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <img src="/dl.svg" alt="DayLock Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg sm:text-xl font-sans font-black tracking-tight">{t.title}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setIsTrashAnimating(true)}
            onMouseLeave={() => setIsTrashAnimating(false)}
            onClick={() => {
              setIsTrashAnimating(true);
              setTimeout(() => setIsTrashAnimating(false), 800);

              setResetTrigger(prev => prev + 1);
              setStatus(null);
              setViewInput('');
              setViewData(null);
              setDecryptedContent(null);
              setViewPassword('');
              try {
                (window as any).secureClearClipboard?.();
              } catch (_) {}
            }}
            className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
          >
            <TrashIcon animate={isTrashAnimating} />
          </motion.button>
        </div>
      </div>

      {/* Main Tabs - Desktop Only */}
      <div 
        dir={language === 'fa' ? 'rtl' : 'ltr'}
        className={`hidden lg:flex p-1 border-b gap-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-zinc-100/90 border-zinc-200'}`}
      >
        <button 
          onClick={() => setMainTab('create')}
          className={`flex-1 py-2 px-4 text-xs font-bold transition-all rounded-xl cursor-pointer ${
            language === 'fa' ? 'font-vazir' : 'font-sans uppercase tracking-wider'
          } ${
            mainTab === 'create' 
              ? (isDarkMode ? 'bg-white/10 text-emerald-400 shadow-sm border border-emerald-500/20' : 'bg-white text-emerald-600 shadow-sm border border-zinc-200/80') 
              : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]' : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/50')
          }`}
        >
          {t.create}
        </button>
        <button 
          onClick={() => setMainTab('view')}
          className={`flex-1 py-2 px-4 text-xs font-bold transition-all rounded-xl cursor-pointer ${
            language === 'fa' ? 'font-vazir' : 'font-sans uppercase tracking-wider'
          } ${
            mainTab === 'view' 
              ? (isDarkMode ? 'bg-white/10 text-emerald-400 shadow-sm border border-emerald-500/20' : 'bg-white text-emerald-600 shadow-sm border border-zinc-200/80') 
              : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]' : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/50')
          }`}
        >
          {t.view}
        </button>
      </div>
    </>
  );
};
