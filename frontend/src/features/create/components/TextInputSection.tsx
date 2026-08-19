import React from 'react';
import { Language } from '../../../types';
import { getAutoDir, getAutoContainerClass } from '../utils';
import { localizeDigitsValue } from '../../../utils/numberConverter';

interface TextInputSectionProps {
  message: string;
  setMessage: (msg: string) => void;
  undoMessage?: () => void;
  redoMessage?: () => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  message,
  setMessage,
  undoMessage,
  redoMessage,
  isDarkMode,
  language,
  t,
  setStatus,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      if (e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        redoMessage?.();
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoMessage?.();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoMessage?.();
      }
    }
  };

  return (
    <div className={`space-y-3 ${getAutoDir(message, language) === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div id="main-text-input" className={`flex flex-col rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'} overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-emerald-500/10`}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.payloadPlaceholder}
          dir={getAutoDir(message, language)}
          className={`w-full h-[200px] sm:h-[220px] p-4 sm:p-7 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-xs sm:text-sm leading-relaxed placeholder:text-xs sm:placeholder:text-sm ${isDarkMode ? 'placeholder:text-zinc-600' : 'placeholder:text-zinc-400'} ${getAutoContainerClass(message, language)}`}
        />
        {/* Rich Nested Bottom Toolbar */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${isDarkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className={`flex gap-2 text-[9px] text-zinc-500 tracking-wider ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
            <span>{localizeDigitsValue(message.length.toString(), language)} {t.charsLabel}</span>
            <span className="opacity-40">•</span>
            <span>{localizeDigitsValue((message.trim() === '' ? 0 : message.trim().split(/\s+/).length).toString(), language)} {t.wordsLabel}</span>
          </div>
          <div className="flex gap-2">
            {message && (
              <button
                type="button"
                onClick={() => setMessage('')}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                    : 'bg-white border-zinc-200 text-zinc-650 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {t.clear}
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setMessage(text);
                  setStatus({ type: 'ok', msg: t.clipboardPasted });
                } catch (err) {
                  setStatus({ type: 'err', msg: t.pasteDirectly });
                }
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                  : 'bg-white border-zinc-200 text-zinc-650 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {t.paste}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
