import React from 'react';
import { motion } from 'motion/react';
import { Copy } from 'lucide-react';
import { Language } from '../../../types';
import { TrashIcon } from '../../../components/TrashIcon';
import { localizeDigitsValue, toPersianDigits } from '../../../utils/numberConverter';

interface ShamirSectionProps {
  shamirSecret: string;
  setShamirSecret: (secret: string) => void;
  shamirTotal: number;
  shamirThreshold: number;
  handleShamirTotalChangeFA: (valStr: string) => void;
  handleShamirThresholdChangeFA: (valStr: string) => void;
  handleShamirTotalBlurFA: () => void;
  handleShamirThresholdBlurFA: () => void;
  setShamirTotal: (val: number) => void;
  setShamirThreshold: (val: number) => void;
  handleShamirSplit: () => void;
  shamirShares: string[];
  shamirCombineInputs: string[];
  setShamirCombineInputs: React.Dispatch<React.SetStateAction<string[]>>;
  hoveredShamirTrash: number | null;
  setHoveredShamirTrash: (idx: number | null) => void;
  handleShamirCombine: () => void;
  shamirResult: string | null;
  isDarkMode: boolean;
  language: Language;
  t: any;
  copyToClipboardWithAutoClear: (text: string, durationMs?: number, onWarn?: (msg: string) => void, lang?: string) => void;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const ShamirSection: React.FC<ShamirSectionProps> = ({
  shamirSecret,
  setShamirSecret,
  shamirTotal,
  shamirThreshold,
  handleShamirTotalChangeFA,
  handleShamirThresholdChangeFA,
  handleShamirTotalBlurFA,
  handleShamirThresholdBlurFA,
  setShamirTotal,
  setShamirThreshold,
  handleShamirSplit,
  shamirShares,
  shamirCombineInputs,
  setShamirCombineInputs,
  hoveredShamirTrash,
  setHoveredShamirTrash,
  handleShamirCombine,
  shamirResult,
  isDarkMode,
  language,
  t,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Shamir Secret Field */}
      <div className={`space-y-1 sm:space-y-1.5 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
        <label className={`text-[8.5px] sm:text-[9px] font-bold text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir' : ''}`}>{t.shamirSecret}</label>
        <input
          type="text"
          value={shamirSecret}
          onChange={(e) => setShamirSecret(e.target.value)}
          placeholder={t.shamirSecret}
          dir="ltr"
          className={`w-full h-8 sm:h-9 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400'} border rounded-lg sm:rounded-xl px-2.5 sm:px-3 text-[10px] sm:text-[11px] placeholder:text-[9.5px] sm:placeholder:text-[10.5px] outline-none focus:border-emerald-500/50 transition-all shadow-sm ${language === 'fa' ? 'text-right font-vazir' : 'text-left font-mono'}`}
        />
      </div>

      {/* Total N, Threshold K and Description Box in a matched grid */}
      <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-2.5 items-end" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        {/* N Total */}
        <div className="col-span-1 sm:col-span-3 space-y-1 flex flex-col">
          <label className={`text-[8.5px] sm:text-[9px] font-bold text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirTotal}</label>
          <div className="relative w-full text-right">
            <input 
              type={language === 'fa' ? 'text' : 'number'} 
              min={3}
              max={10}
              value={language === 'fa' ? (shamirTotal === 0 ? '' : toPersianDigits(shamirTotal.toString())) : shamirTotal} 
              onChange={(e) => {
                if (language === 'fa') {
                  handleShamirTotalChangeFA(e.target.value);
                } else {
                  setShamirTotal(Math.max(3, parseInt(e.target.value) || 3));
                }
              }}
              onBlur={() => {
                if (language === 'fa') {
                  handleShamirTotalBlurFA();
                }
              }}
              className={`w-full h-8 sm:h-9 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-lg sm:rounded-xl px-2 sm:px-2.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-2.5 pl-9 sm:pr-3 sm:pl-11 text-right font-vazir text-[10.5px] sm:text-[11px] font-bold' : 'pr-11 pl-2 sm:pr-13 sm:pl-2.5 font-mono text-[10px] sm:text-[11px] ltr text-left'}`}
              dir={language === 'fa' ? 'rtl' : 'ltr'}
            />
            <div className={`absolute ${language === 'fa' ? 'left-2 sm:left-2.5' : 'right-2 sm:right-2.5'} top-1/2 -translate-y-1/2 text-[8px] sm:text-[8.5px] text-zinc-400 font-semibold ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
              {t.sharesLabel}
            </div>
          </div>
        </div>

        {/* K Threshold */}
        <div className="col-span-1 sm:col-span-3 space-y-1 flex flex-col">
          <label className={`text-[8.5px] sm:text-[9px] font-bold text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirThreshold}</label>
          <div className="relative w-full text-right">
            <input 
              type={language === 'fa' ? 'text' : 'number'} 
              min={2}
              max={shamirTotal}
              value={language === 'fa' ? (shamirThreshold === 0 ? '' : toPersianDigits(shamirThreshold.toString())) : shamirThreshold} 
              onChange={(e) => {
                if (language === 'fa') {
                  handleShamirThresholdChangeFA(e.target.value);
                } else {
                  setShamirThreshold(Math.max(2, Math.min(shamirTotal, parseInt(e.target.value) || 2)));
                }
              }}
              onBlur={() => {
                if (language === 'fa') {
                  handleShamirThresholdBlurFA();
                }
              }}
              className={`w-full h-8 sm:h-9 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-lg sm:rounded-xl px-2 sm:px-2.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-2.5 pl-9 sm:pr-3 sm:pl-11 text-right font-vazir text-[10.5px] sm:text-[11px] font-bold' : 'pr-11 pl-2 sm:pr-13 sm:pl-2.5 font-mono text-[10px] sm:text-[11px] ltr text-left'}`}
              dir={language === 'fa' ? 'rtl' : 'ltr'}
            />
            <div className={`absolute ${language === 'fa' ? 'left-2 sm:left-2.5' : 'right-2 sm:right-2.5'} top-1/2 -translate-y-1/2 text-[8px] sm:text-[8.5px] text-zinc-400 font-semibold ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
              {t.minLabel}
            </div>
          </div>
        </div>

        {/* Description Box matched in size and placed next to Shamir parameters */}
        <div className="col-span-2 sm:col-span-6 space-y-1 flex flex-col justify-end">
          <label className="hidden sm:block text-[8.5px] sm:text-[9px] font-bold text-transparent select-none px-1">Info</label>
          <div className={`w-full h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl border flex items-center ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200/85 text-emerald-700'} text-[9.5px] sm:text-[10px] leading-tight ${language === 'fa' ? 'font-vazir text-right justify-start' : 'font-mono text-left justify-start tracking-normal'}`}>
            <span>{localizeDigitsValue(t.shamirInfo.replace('{k}', "k_val").replace('{n}', "n_val"), language).replace("k_val", language === 'fa' ? toPersianDigits(shamirThreshold) : shamirThreshold.toString()).replace("n_val", language === 'fa' ? toPersianDigits(shamirTotal) : shamirTotal.toString())}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleShamirSplit}
        className={`w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-[10.5px] sm:text-xs transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 hover:bg-emerald-400' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15 hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir' : ''}`}
      >
        {t.split}
      </motion.button>

      {shamirShares.length > 0 && (
        <div className="space-y-2 animate-fade-in" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          <label className={`text-[8.5px] sm:text-[9px] font-bold text-emerald-500 px-1 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>{t.shamirShares}</label>
          <div className="space-y-1.5">
            {shamirShares.map((share, i) => (
              <div key={i} className={`py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl border flex items-center justify-between gap-2 sm:gap-2.5 ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} group`}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center font-bold text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-[9.5px]' : 'font-mono text-[9px]'}`}>
                    {language === 'fa' ? toPersianDigits(i + 1) : i + 1}
                  </div>
                  <div className={`truncate flex-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium'} ${language === 'fa' ? 'font-vazir text-right text-[10px] sm:text-[10.5px]' : 'font-mono text-[10px] sm:text-[10.5px]'}`}>{language === 'fa' ? toPersianDigits(share) : share}</div>
                </div>
                <button 
                  onClick={() => {
                    copyToClipboardWithAutoClear(share, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                    setStatus({ type: 'ok', msg: t.linkCopied });
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-emerald-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600'}`}
                  title={t.copyShare || "Copy Share"}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`w-full h-px ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'} my-2.5 sm:my-3.5`} />
      
      {/* Shamir Reconstruct Inputs section */}
      <div className="space-y-2 sm:space-y-2.5" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <label className={`text-[8.5px] sm:text-[9px] font-bold text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>{t.shamirReconstruct}</label>
        <div className="space-y-1.5 sm:space-y-2 px-2 sm:px-2.5">
          {shamirCombineInputs.map((input, i) => (
            <div key={i} className={`relative flex gap-2 sm:gap-2.5 items-center py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-zinc-950/20 border-white/10' : 'bg-zinc-50/50 border-zinc-200'}`}>
              {/* Number Badge (on the right in RTL, left in LTR) */}
              <div className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 font-bold flex items-center justify-center text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-[9.5px]' : 'font-mono text-[9px]'}`}>
                {language === 'fa' ? toPersianDigits(i + 1) : `#${i + 1}`}
              </div>
              <input
                type="text"
                value={language === 'fa' ? toPersianDigits(input) : input}
                onChange={(e) => {
                  const next = [...shamirCombineInputs];
                  next[i] = e.target.value;
                  setShamirCombineInputs(next);
                }}
                placeholder={t.shamirPlaceholder}
                dir={language === 'fa' ? 'rtl' : 'ltr'}
                className={`flex-1 bg-transparent outline-none py-0.5 ${language === 'fa' ? 'pl-6 pr-1 text-right font-vazir text-[10px] sm:text-[10.5px]' : 'pr-6 pl-1 text-left font-mono text-[9.5px] sm:text-[10px]'} ${isDarkMode ? 'text-zinc-200 placeholder:text-zinc-650' : 'text-zinc-800 placeholder:text-zinc-400'}`}
              />
              {/* Trash Button placed directly ON the border of the text box without its own border */}
              {shamirCombineInputs.length > 2 && (
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredShamirTrash(i)}
                  onMouseLeave={() => setHoveredShamirTrash(null)}
                  onClick={() => setShamirCombineInputs(prev => prev.filter((_, idx) => idx !== i))}
                  className={`absolute top-1/2 -translate-y-1/2 ${language === 'fa' ? '-left-2.5 sm:-left-3' : '-right-2.5 sm:-right-3'} w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border-0 ${isDarkMode ? 'bg-zinc-900 text-red-400 hover:text-red-300 shadow-md shadow-black/40 hover:bg-zinc-850' : 'bg-white text-red-500 hover:text-red-600 shadow-md shadow-zinc-200/80 hover:bg-red-50/80'} focus:outline-none z-10`}
                  title={t.delete || "Remove"}
                >
                  <TrashIcon animate={hoveredShamirTrash === i} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 sm:gap-2.5 mt-2 sm:mt-2.5">
          <button 
            onClick={() => setShamirCombineInputs(prev => [...prev, ''])}
            className={`flex-[1.3] py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-dashed text-[9.5px] sm:text-[10px] font-bold transition-all cursor-pointer ${isDarkMode ? 'border-white/10 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-white/[0.01]' : 'border-zinc-300 text-zinc-600 hover:border-emerald-500/30 hover:text-emerald-600 hover:bg-zinc-50'} ${language === 'fa' ? 'font-vazir' : ''}`}
          >
            + {t.addShare}
          </button>
          <button 
            onClick={handleShamirCombine}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-[9.5px] sm:text-[10px] transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir' : ''}`}
          >
            {t.combine}
          </button>
        </div>
        {shamirResult && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-emerald-50/50 border-emerald-200'} space-y-1.5`}>
            <div className={`text-[8.5px] sm:text-[9px] font-bold text-emerald-500 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>{t.shamirResult}</div>
            <div className={`text-[10px] sm:text-[11px] break-all font-bold leading-relaxed p-2 rounded-lg border ${isDarkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-inner'} ${language === 'fa' ? 'font-vazir text-right' : 'font-mono text-left'}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>{language === 'fa' ? toPersianDigits(shamirResult) : shamirResult}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
