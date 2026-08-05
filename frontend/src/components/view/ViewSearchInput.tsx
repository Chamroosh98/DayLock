import React from 'react';
import { Search, RefreshCw, File } from 'lucide-react';
import { Language } from '../../types';

export interface ViewSearchInputProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  viewInput: string;
  setViewInput: (val: string) => void;
  isLoading: boolean;
  handleView: () => void;
  setContentType: (type: any) => void;
}

export const ViewSearchInput: React.FC<ViewSearchInputProps> = ({
  isDarkMode,
  language,
  t,
  viewInput,
  setViewInput,
  isLoading,
  handleView,
  setContentType,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {t.secretIdentifierOrUrl}
        </label>
        <button
          type="button"
          onClick={() => setContentType('stego')}
          className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          <File className="w-3 h-3" />
          {t.extractFromStegoImage}
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={viewInput}
            onChange={(e) => setViewInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleView();
              }
            }}
            placeholder={t.enterSecretIdOrUrl}
            className={`w-full px-5 py-4 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            } outline-none text-xs font-mono shadow-inner`}
          />
        </div>
        <button
          type="button"
          onClick={handleView}
          disabled={isLoading || !viewInput.trim()}
          className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {t.retrieveSecret}
        </button>
      </div>
    </div>
  );
};
