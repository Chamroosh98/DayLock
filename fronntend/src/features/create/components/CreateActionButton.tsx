import React from 'react';
import { motion } from 'motion/react';
import { Zap, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Language } from '../../../types';

export interface CreateActionButtonProps {
  handleCreate: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  language: Language;
  t: any;
  password?: string;
  isConfigurationValid?: boolean;
}

export const CreateActionButton: React.FC<CreateActionButtonProps> = ({
  handleCreate,
  isLoading,
  isDarkMode,
  language,
  t,
}) => {
  return (
    <motion.button
      id="encrypt-submit-button"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
      whileHover={isLoading ? {} : { scale: 1.005 }}
      whileTap={isLoading ? {} : { scale: 0.995 }}
      onClick={handleCreate}
      disabled={isLoading}
      className={`w-full py-3.5 sm:py-4.5 px-3 sm:px-4 min-h-[48px] rounded-2xl sm:rounded-[28px] font-bold text-[11.5px] sm:text-sm tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer text-center leading-tight ${
        isLoading
          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          : isDarkMode
          ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10'
          : 'bg-zinc-200/90 text-zinc-800 hover:bg-zinc-300/90 border border-zinc-300/60'
      } ${language === 'fa' ? 'font-vazir' : ''}`}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Lock className="w-4 h-4 opacity-80" />
          <span>{t.initEncryption}</span>
        </>
      )}
    </motion.button>
  );
};
