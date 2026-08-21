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
    <div className="space-y-6 animate-fade-in">
      {/* Shamir Secret Field */}
      <div className={`space-y-3 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">{t.shamirSecret}</label>
        <input
          type="text"
          value={shamirSecret}
          onChange={(e) => setShamirSecret(e.target.value)}
          placeholder={t.shamirSecret}
          dir="ltr"
          className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400'} border rounded-2xl p-4.5 text-xs outline-none focus:border-emerald-500/50 transition-all shadow-sm ${language === 'fa' ? 'text-right' : 'text-left'}`}
        />
      </div>

      {/* Total N and Threshold K fields */}
      <div className="grid grid-cols-2 gap-4" dir="ltr">
        <div className="space-y-1.5 flex flex-col">
          <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirTotal}</label>
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
              className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-2xl p-3.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-3.5 pl-14 text-right font-vazir text-sm font-bold' : 'pr-14 pl-3.5 font-mono text-xs ltr text-left'}`}
              dir="ltr"
            />
            <div className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold uppercase ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
              {t.sharesLabel}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 flex flex-col">
          <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 w-full ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>{t.shamirThreshold}</label>
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
              className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-855'} rounded-2xl p-3.5 outline-none border focus:border-emerald-500/40 transition-all ${language === 'fa' ? 'pr-3.5 pl-14 text-right font-vazir text-sm font-bold' : 'pr-14 pl-3.5 font-mono text-xs ltr text-left'}`}
              dir="ltr"
            />
            <div className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold uppercase ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
              {t.minLabel}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200/85 text-emerald-700'} text-xs leading-relaxed ${language === 'fa' ? 'font-vazir text-right' : 'font-mono text-left text-[10px] tracking-wide'}`}>
        {localizeDigitsValue(t.shamirInfo.replace('{k}', "k_val").replace('{n}', "n_val"), language).replace("k_val", language === 'fa' ? toPersianDigits(shamirThreshold) : shamirThreshold.toString()).replace("n_val", language === 'fa' ? toPersianDigits(shamirTotal) : shamirTotal.toString())}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShamirSplit}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir text-sm font-bold' : ''}`}
      >
        {t.split}
      </motion.button>

      {shamirShares.length > 0 && (
        <div className="space-y-3 animate-fade-in" dir="ltr">
          <label className={`text-[9px] font-black uppercase tracking-widest text-emerald-500 px-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirShares}</label>
          <div className="space-y-2.5">
            {shamirShares.map((share, i) => (
              <div key={i} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} group`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center font-bold text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-xs' : 'font-mono text-[9px]'}`}>
                    {language === 'fa' ? toPersianDigits(i + 1) : i + 1}
                  </div>
                  <div className={`truncate flex-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium'} ${language === 'fa' ? 'font-vazir text-right text-xs' : 'font-mono text-[10.5px]'}`}>{language === 'fa' ? toPersianDigits(share) : share}</div>
                </div>
                <button 
                  onClick={() => {
                    copyToClipboardWithAutoClear(share, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                    setStatus({ type: 'ok', msg: t.linkCopied });
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-emerald-400' : 'hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600'}`}
                  title={t.copyShare || "Copy Share"}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`w-full h-px ${isDarkMode ? 'bg-white/10' : 'bg-zinc-200'} my-6`} />
      
      {/* Shamir Reconstruct Inputs section */}
      <div className="space-y-4" dir="ltr">
        <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirReconstruct}</label>
        <div className="space-y-3">
          {shamirCombineInputs.map((input, i) => (
            <div key={i} className={`flex gap-3 items-center p-2 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'}`}>
              <div className={`w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/15 font-black flex items-center justify-center text-emerald-400 flex-shrink-0 ${language === 'fa' ? 'font-vazir text-xs font-bold' : 'font-mono text-[10px]'}`}>
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
                dir="ltr"
                className={`flex-1 bg-transparent outline-none py-1 ${isDarkMode ? 'text-zinc-200 placeholder:text-zinc-650' : 'text-zinc-800 placeholder:text-zinc-400'} ${language === 'fa' ? 'font-vazir text-right text-xs' : 'font-mono text-[10px] text-left'}`}
              />
              {shamirCombineInputs.length > 2 && (
                <button 
                  onMouseEnter={() => setHoveredShamirTrash(i)}
                  onMouseLeave={() => setHoveredShamirTrash(null)}
                  onClick={() => setShamirCombineInputs(prev => prev.filter((_, idx) => idx !== i))}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${isDarkMode ? 'border-white/5 text-red-400 bg-zinc-950/40 hover:bg-red-500/10 hover:border-red-500/20' : 'border-zinc-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-200'}`}
                >
                  <TrashIcon animate={hoveredShamirTrash === i} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => setShamirCombineInputs(prev => [...prev, ''])}
            className={`flex-[1.3] py-3 rounded-2xl border border-dashed text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isDarkMode ? 'border-white/10 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-white/[0.01]' : 'border-zinc-300 text-zinc-600 hover:border-emerald-500/30 hover:text-emerald-600 hover:bg-zinc-50'} ${language === 'fa' ? 'font-vazir text-[11px] font-bold' : ''}`}
          >
            + {t.addShare}
          </button>
          <button 
            onClick={handleShamirCombine}
            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer ${isDarkMode ? 'bg-emerald-500 text-black font-extrabold hover:bg-emerald-400' : 'bg-emerald-600 text-white font-extrabold hover:bg-emerald-700'} ${language === 'fa' ? 'font-vazir text-[11px] font-bold' : ''}`}
          >
            {t.combine}
          </button>
        </div>
        {shamirResult && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-emerald-50/50 border-emerald-200'} space-y-2`}>
            <div className={`text-[9px] font-black uppercase tracking-widest text-emerald-500 ${language === 'fa' ? 'font-vazir text-right text-[10px]' : ''}`}>{t.shamirResult}</div>
            <div className={`text-xs break-all font-bold leading-relaxed p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-inner'} ${language === 'fa' ? 'font-vazir text-right' : 'font-mono text-left'}`} dir="ltr">{language === 'fa' ? toPersianDigits(shamirResult) : shamirResult}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
