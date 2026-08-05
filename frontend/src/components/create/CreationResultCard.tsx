import React from 'react';
import { Copy, Sparkles, Check } from 'lucide-react';
import { QrCodeHub } from '../QrCodeHub';
import { Language } from '../../types';

export interface CreationResultCardProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  resultUrl: string;
  copyToClipboardWithAutoClear: (content: string, delay: number, onWarn: (msg: string) => void, lang: any) => void;
  setStatus: (status: any) => void;
}

export const CreationResultCard: React.FC<CreationResultCardProps> = ({
  isDarkMode,
  language,
  t,
  resultUrl,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} space-y-6 shadow-xl`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-500">{t.secretCreatedSuccessfully}</h3>
          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.shareLinkWarning}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={resultUrl}
            className={`w-full p-4 rounded-2xl font-mono text-xs ${
              isDarkMode ? 'bg-zinc-950 text-emerald-400 border-white/10' : 'bg-white text-emerald-700 border-zinc-200'
            } border outline-none shadow-inner`}
          />
          <button
            type="button"
            onClick={() => {
              copyToClipboardWithAutoClear(
                resultUrl,
                10000,
                (msg) => setStatus({ type: 'warning', text: msg }),
                language
              );
            }}
            className="p-4 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold transition-all shadow-md flex items-center justify-center shrink-0"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-emerald-500/10 flex justify-center">
        <QrCodeHub value={resultUrl} isDarkMode={isDarkMode} language={language} t={t} />
      </div>
    </div>
  );
};
