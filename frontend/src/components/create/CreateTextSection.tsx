import React from 'react';
import { motion } from 'motion/react';
import { getAutoDir, getAutoContainerClass } from '../../utils/textDirection';
import { Language } from '../../types';

export interface CreateTextSectionProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  message: string;
  setMessage: (val: string) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

export const CreateTextSection: React.FC<CreateTextSectionProps> = ({
  isDarkMode,
  language,
  t,
  message,
  setMessage,
  handleTouchStart,
  handleTouchEnd,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {t.secretPayload}
        </label>
        <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {message.length} {t.chars}
        </span>
      </div>
      <div className="relative">
        <textarea
          id="secret-payload-textarea"
          dir={getAutoDir(message, language)}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          placeholder={t.enterSecretMessage}
          rows={6}
          className={`w-full p-6 rounded-[28px] border ${
            isDarkMode
              ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50'
              : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500/50'
          } outline-none transition-all resize-none shadow-inner text-sm leading-relaxed ${getAutoContainerClass(message, language)}`}
        />
      </div>
    </div>
  );
};
