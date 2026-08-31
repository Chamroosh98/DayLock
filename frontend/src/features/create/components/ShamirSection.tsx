import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Layers, Copy, Check, QrCode, Plus, Trash2, RotateCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Language } from '../../../types';
import { toEnglishDigits, toPersianDigits, localizeDigitsValue } from '../../../utils/numberConverter';
import { parseShamirShare } from '../../../utils/shamirHelpers';
import { LinkQrCodeModal } from '../../../components/modals/LinkQrCodeModal';

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
  handleShamirCombine,
  shamirResult,
  isDarkMode,
  language,
  t,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  const [subTab, setSubTab] = useState<'split' | 'combine'>('split');
  const [copiedShareIdx, setCopiedShareIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  const isFa = language === 'fa';

  const handleCopySingleShare = (share: string, idx: number) => {
    copyToClipboardWithAutoClear(share, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopiedShareIdx(idx);
    setTimeout(() => setCopiedShareIdx(null), 2000);
    setStatus({ type: 'ok', msg: t.linkCopied || 'Share copied!' });
  };

  const handleCopyAllShares = () => {
    if (shamirShares.length === 0) return;
    const formatted = shamirShares.map((s, i) => `Share #${i + 1}: ${s}`).join('\n\n');
    copyToClipboardWithAutoClear(formatted, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    setStatus({ type: 'ok', msg: t.allSharesCopied || 'All shares copied to clipboard!' });
  };

  const handleCopyResult = () => {
    if (!shamirResult) return;
    copyToClipboardWithAutoClear(shamirResult, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
    setStatus({ type: 'ok', msg: t.copied || 'Copied to clipboard!' });
  };

  // Pre-fill combine inputs with generated shares if user clicks test
  const handlePopulateCombineWithGenerated = () => {
    if (shamirShares.length > 0) {
      // Pick first threshold shares to demonstrate threshold reconstruction
      const subset = shamirShares.slice(0, Math.max(2, shamirThreshold));
      setShamirCombineInputs(subset);
    }
    setSubTab('combine');
  };

  // Parsed shares in combine view
  const parsedCombineInputs = shamirCombineInputs.map(s => parseShamirShare(s));
  const validCombineCount = parsedCombineInputs.filter(p => p.isValid).length;
  const canCombine = validCombineCount >= 2;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Sub-tab switcher: Split Secret vs Combine Shares */}
      <div className="flex justify-center">
        <div className={`p-1 rounded-full flex items-center gap-1 border ${
          isDarkMode ? 'bg-zinc-950/70 border-white/10' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            type="button"
            onClick={() => setSubTab('split')}
            className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              subTab === 'split'
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-950'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {subTab === 'split' && (
              <motion.div
                layoutId="shamirSubTabHighlight"
                className={`absolute inset-0 rounded-full border shadow-sm ${
                  isDarkMode ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white border-emerald-200'
                }`}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5" />
              <span className={isFa ? 'font-vazir' : ''}>{t.shamirSplit || 'Split Secret'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('combine')}
            className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              subTab === 'combine'
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-950'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {subTab === 'combine' && (
              <motion.div
                layoutId="shamirSubTabHighlight"
                className={`absolute inset-0 rounded-full border shadow-sm ${
                  isDarkMode ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white border-emerald-200'
                }`}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span className={isFa ? 'font-vazir' : ''}>{t.shamirCombine || 'Combine Shares'}</span>
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'split' ? (
          <motion.div
            key="split-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Shamir Secret Field */}
            <div className={`space-y-1.5 ${isFa ? 'text-right' : 'text-left'}`}>
              <label className={`text-[9px] sm:text-[10px] font-bold text-zinc-500 px-1 ${isFa ? 'font-vazir' : ''}`}>
                {t.shamirSecret || 'Secret to Split'}
              </label>
              <input
                type="text"
                value={shamirSecret}
                onChange={(e) => setShamirSecret(e.target.value)}
                placeholder={t.shamirSecret || 'Enter raw secret text, password, or key to split...'}
                className={`w-full h-9 sm:h-10 ${
                  isDarkMode
                    ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder:text-zinc-600'
                    : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                } border rounded-xl px-3 text-xs outline-none focus:border-emerald-500/50 transition-all shadow-sm ${
                  isFa ? 'text-right font-vazir' : 'text-left font-mono'
                }`}
              />
            </div>

            {/* Total N, Threshold K and Description Box in a matched grid */}
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-end" dir={isFa ? 'rtl' : 'ltr'}>
              {/* N Total */}
              <div className="col-span-1 sm:col-span-3 space-y-1 flex flex-col">
                <label className={`text-[9px] font-bold text-zinc-500 px-1 w-full ${isFa ? 'font-vazir text-right' : 'text-left'}`}>
                  {t.shamirTotal || 'Total Shares (N)'}
                </label>
                <div className="relative w-full">
                  <input
                    type={isFa ? 'text' : 'number'}
                    min={3}
                    max={15}
                    value={isFa ? (shamirTotal === 0 ? '' : toPersianDigits(shamirTotal.toString())) : shamirTotal}
                    onChange={(e) => {
                      if (isFa) {
                        handleShamirTotalChangeFA(e.target.value);
                      } else {
                        setShamirTotal(Math.max(3, parseInt(e.target.value) || 3));
                      }
                    }}
                    onBlur={() => {
                      if (isFa) {
                        handleShamirTotalBlurFA();
                      }
                    }}
                    className={`w-full h-9 ${
                      isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                    } rounded-xl px-3 outline-none border focus:border-emerald-500/40 transition-all ${
                      isFa ? 'pr-3 pl-10 text-right font-vazir text-xs font-bold' : 'pr-12 pl-3 font-mono text-xs ltr text-left'
                    }`}
                  />
                  <div className={`absolute ${isFa ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-semibold ${isFa ? 'font-vazir' : 'font-mono'}`}>
                    {t.sharesLabel || 'Shares'}
                  </div>
                </div>
              </div>

              {/* K Threshold */}
              <div className="col-span-1 sm:col-span-3 space-y-1 flex flex-col">
                <label className={`text-[9px] font-bold text-zinc-500 px-1 w-full ${isFa ? 'font-vazir text-right' : 'text-left'}`}>
                  {t.shamirThreshold || 'Threshold (K)'}
                </label>
                <div className="relative w-full">
                  <input
                    type={isFa ? 'text' : 'number'}
                    min={2}
                    max={shamirTotal}
                    value={isFa ? (shamirThreshold === 0 ? '' : toPersianDigits(shamirThreshold.toString())) : shamirThreshold}
                    onChange={(e) => {
                      if (isFa) {
                        handleShamirThresholdChangeFA(e.target.value);
                      } else {
                        setShamirThreshold(Math.max(2, Math.min(shamirTotal, parseInt(e.target.value) || 2)));
                      }
                    }}
                    onBlur={() => {
                      if (isFa) {
                        handleShamirThresholdBlurFA();
                      }
                    }}
                    className={`w-full h-9 ${
                      isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                    } rounded-xl px-3 outline-none border focus:border-emerald-500/40 transition-all ${
                      isFa ? 'pr-3 pl-10 text-right font-vazir text-xs font-bold' : 'pr-12 pl-3 font-mono text-xs ltr text-left'
                    }`}
                  />
                  <div className={`absolute ${isFa ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-semibold ${isFa ? 'font-vazir' : 'font-mono'}`}>
                    {t.minLabel || 'Min (K)'}
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className="col-span-2 sm:col-span-6 space-y-1 flex flex-col justify-end">
                <div className={`w-full h-9 px-3 rounded-xl border flex items-center ${
                  isDarkMode
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                } text-[10px] sm:text-[11px] leading-tight ${isFa ? 'font-vazir text-right' : 'font-sans text-left'}`}>
                  <span>
                    {localizeDigitsValue(
                      t.shamirInfo?.replace('{k}', 'k_val').replace('{n}', 'n_val') ||
                        'Any {k} of {n} shares can reconstruct the secret.',
                      language
                    )
                      .replace('k_val', isFa ? toPersianDigits(shamirThreshold) : shamirThreshold.toString())
                      .replace('n_val', isFa ? toPersianDigits(shamirTotal) : shamirTotal.toString())}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Action Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={!shamirSecret.trim()}
              onClick={handleShamirSplit}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                shamirSecret.trim()
                  ? isDarkMode
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400'
                    : 'bg-emerald-600 text-white shadow-emerald-600/15 hover:bg-emerald-700'
                  : isDarkMode
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              } ${isFa ? 'font-vazir' : ''}`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{t.split || 'Split Secret'}</span>
            </motion.button>

            {/* Generated Shares Container */}
            {shamirShares.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
                dir={isFa ? 'rtl' : 'ltr'}
              >
                <div className={`flex items-center justify-between gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
                  <label className={`text-[10px] font-bold text-emerald-500 px-1 uppercase tracking-wider ${isFa ? 'font-vazir' : ''}`}>
                    {t.shamirShares || 'Generated Shares'} ({isFa ? toPersianDigits(shamirShares.length) : shamirShares.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyAllShares}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      copiedAll
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : isDarkMode
                          ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:bg-emerald-50'
                    } ${isFa ? 'font-vazir' : ''}`}
                  >
                    {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAll ? (t.copied || 'Copied') : (t.copyAllShares || 'Copy All')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {shamirShares.map((share, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        isDarkMode ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center font-mono text-[10.5px] font-black text-emerald-400 shrink-0">
                          #{isFa ? toPersianDigits(i + 1) : i + 1}
                        </div>
                        {/* Always LTR monospace display so hex keys never glitch in Persian */}
                        <div
                          dir="ltr"
                          className="font-mono text-[10.5px] sm:text-xs text-zinc-300 select-all break-all truncate flex-1 text-left"
                        >
                          {share}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" dir="ltr">
                        <button
                          type="button"
                          onClick={() => handleCopySingleShare(share, i)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            copiedShareIdx === i
                              ? 'bg-emerald-500 text-black'
                              : isDarkMode
                                ? 'bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                                : 'bg-zinc-100 text-zinc-600 hover:text-emerald-700 hover:bg-zinc-200'
                          }`}
                          title={t.copyShare || 'Copy Share'}
                        >
                          {copiedShareIdx === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setQrModalUrl(share)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={t.qrCode || 'QR Code'}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shortcut to test reconstruct right away */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handlePopulateCombineWithGenerated}
                    className={`w-full py-2 rounded-xl text-xs font-semibold border border-dashed flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    } ${isFa ? 'font-vazir' : ''}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t.shamirReconstruct || 'Test Combining Shares'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="combine-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Live Combine Status Banner */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
                canCombine
                  ? isDarkMode
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isDarkMode
                    ? 'bg-zinc-900/60 border-white/5 text-zinc-400'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600'
              } ${isFa ? 'flex-row-reverse text-right font-vazir' : ''}`}
            >
              <div className={`flex items-center gap-1.5 ${isFa ? 'flex-row-reverse' : ''}`}>
                {canCombine ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {canCombine
                    ? t.thresholdMet || `Ready to combine (${isFa ? toPersianDigits(validCombineCount) : validCombineCount} valid shares)`
                    : localizeDigitsValue(
                        t.validSharesCount?.replace('{count}', validCombineCount.toString()) ||
                          `${validCombineCount} valid shares detected`,
                        language
                      )}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/20" dir="ltr">
                {isFa ? `${toPersianDigits(validCombineCount)} / ${toPersianDigits(shamirCombineInputs.length)}` : `${validCombineCount}/${shamirCombineInputs.length}`}
              </span>
            </div>

            {/* Combine Input Rows */}
            <div className="space-y-2">
              {shamirCombineInputs.map((input, idx) => {
                const parsed = parsedCombineInputs[idx];
                const hasContent = input.trim().length > 0;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border transition-all ${
                      hasContent && parsed.isValid
                        ? isDarkMode
                          ? 'bg-zinc-900/90 border-emerald-500/40'
                          : 'bg-white border-emerald-400'
                        : hasContent && !parsed.isValid
                          ? isDarkMode
                            ? 'bg-zinc-900/90 border-amber-500/40'
                            : 'bg-white border-amber-400'
                          : isDarkMode
                            ? 'bg-zinc-950/60 border-white/5'
                            : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                          hasContent && parsed.isValid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isDarkMode
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {parsed.isValid && parsed.shareIndex ? (
                          <span>#{isFa ? toPersianDigits(parsed.shareIndex) : parsed.shareIndex}</span>
                        ) : (
                          <span>#{isFa ? toPersianDigits(idx + 1) : idx + 1}</span>
                        )}
                      </div>

                      <input
                        type="text"
                        dir="ltr"
                        value={input}
                        onChange={(e) => {
                          const next = [...shamirCombineInputs];
                          next[idx] = e.target.value;
                          setShamirCombineInputs(next);
                        }}
                        placeholder={t.shamirPlaceholder || 'Paste share here (e.g. 801cfa...)'}
                        className={`flex-1 min-w-0 bg-transparent font-mono text-[10.5px] sm:text-xs outline-none py-1 px-2 text-left ${
                          isDarkMode ? 'text-zinc-100 placeholder:text-zinc-600' : 'text-zinc-900 placeholder:text-zinc-400'
                        }`}
                      />

                      {shamirCombineInputs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setShamirCombineInputs(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title={t.delete || 'Remove'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setShamirCombineInputs(prev => [...prev, ''])}
                className={`px-3 py-2 rounded-xl border border-dashed text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDarkMode
                    ? 'border-white/15 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300'
                    : 'border-zinc-300 text-zinc-700 hover:border-emerald-500 hover:text-emerald-700'
                } ${isFa ? 'font-vazir' : ''}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addShare || 'Add Share'}</span>
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={!canCombine}
                onClick={handleShamirCombine}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  canCombine
                    ? isDarkMode
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/15'
                    : isDarkMode
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                } ${isFa ? 'font-vazir' : ''}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.shamirCombine || t.combine || 'Combine'}</span>
              </motion.button>
            </div>

            {/* Reconstructed Secret Feedback */}
            {shamirResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-zinc-950 border-emerald-500/40' : 'bg-emerald-50/60 border-emerald-300'
                }`}
              >
                <div className={`flex items-center justify-between gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[10px] font-bold text-emerald-400 uppercase tracking-wider ${isFa ? 'font-vazir' : ''}`}>
                    {t.shamirResult || 'Reconstructed Secret'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        copiedResult
                          ? 'bg-emerald-500 text-black'
                          : isDarkMode
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {copiedResult ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrModalUrl(shamirResult)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:text-emerald-700'
                      }`}
                      title={t.qrCode || 'QR Code'}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  dir="ltr"
                  className={`p-3 rounded-lg font-mono text-xs break-all select-all font-medium leading-relaxed border ${
                    isDarkMode
                      ? 'bg-zinc-900/90 border-white/10 text-emerald-300'
                      : 'bg-white border-emerald-200 text-emerald-950'
                  }`}
                >
                  {shamirResult}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      {qrModalUrl && (
        <LinkQrCodeModal
          isOpen={!!qrModalUrl}
          onClose={() => setQrModalUrl(null)}
          url={qrModalUrl}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          setStatus={setStatus}
        />
      )}
    </div>
  );
};
