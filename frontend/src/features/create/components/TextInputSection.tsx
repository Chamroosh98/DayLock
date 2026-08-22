import React from 'react';
import { Eraser, ClipboardPaste } from 'lucide-react';
import { Language } from '../../../types';
import { getAutoDir, getAutoContainerClass } from '../utils';

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

  const isFa = language === 'fa';

  return (
    <div className={`space-y-3 ${getAutoDir(message, language) === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div 
        id="main-text-input" 
        className={`flex flex-col rounded-[32px] border ${
          isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
        } overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-emerald-500/10`}
      >
        {/* Top Minimalist Action Icons Row (Placed above text, no borders, no overlapping) */}
        <div 
          className={`flex items-center px-4 sm:px-6 pt-3 pb-1 gap-1.5 ${isFa ? 'justify-start' : 'justify-end'}`}
        >
          <button
            type="button"
            disabled={!message}
            onClick={() => {
              if (message) {
                setMessage('');
                setStatus({ type: 'ok', msg: t.cleared || 'Cleared' });
              }
            }}
            aria-label={t.clear}
            title={t.clear}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              !message
                ? isDarkMode ? 'text-zinc-600 opacity-20 cursor-not-allowed' : 'text-zinc-300 opacity-20 cursor-not-allowed'
                : isDarkMode
                  ? 'text-zinc-400 hover:text-red-400 hover:bg-white/5 cursor-pointer'
                  : 'text-zinc-500 hover:text-red-600 hover:bg-zinc-100 cursor-pointer'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>
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
            aria-label={t.paste}
            title={t.paste}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isDarkMode
                ? 'text-zinc-400 hover:text-emerald-400 hover:bg-white/5'
                : 'text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => {
            const val = e.target.value;
            setMessage(val);
            if (val.length > 500000) {
              setStatus({ type: 'warn', msg: t.textLengthWarning || "Text length exceeds 500,000 characters." });
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.payloadPlaceholder}
          dir={getAutoDir(message, language)}
          className={`w-full h-[180px] sm:h-[200px] px-4 sm:px-7 pb-4 sm:pb-6 pt-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-xs sm:text-sm leading-relaxed placeholder:text-xs sm:placeholder:text-sm ${
            isDarkMode ? 'placeholder:text-zinc-600' : 'placeholder:text-zinc-400'
          } ${getAutoContainerClass(message, language)}`}
        />
      </div>
    </div>
  );
};
