import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Plus, Sparkles, Copy, Check, QrCode, AlertCircle, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { Language, StatusState } from '../../../types';
import { parseShamirShare } from '../../../utils/shamirHelpers';
import { toEnglishDigits, toPersianDigits, localizeDigitsValue } from '../../../utils/numberConverter';
import { LinkQrCodeModal } from '../../../components/modals/LinkQrCodeModal';
import { readTextFromClipboard } from '../../../utils/clipboardManager';

interface ShamirReconstructSectionProps {
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  copyToClipboardWithAutoClear: (text: string, timeoutMs: number, onWarning: (msg: string) => void, lang?: string) => Promise<boolean>;
  setStatus: (status: StatusState | null) => void;
}

export const ShamirReconstructSection: React.FC<ShamirReconstructSectionProps> = ({
  isDarkMode,
  language,
  t,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  const [shares, setShares] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [reconstructedSecret, setReconstructedSecret] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFa = language === 'fa';

  // Parse and validate each entered share
  const parsedShares = shares.map(s => parseShamirShare(s));
  const validShares = parsedShares.filter(p => p.isValid);
  const validCount = validShares.length;
  const canCombine = validCount >= 2;

  const handleShareChange = (index: number, value: string) => {
    setErrorMessage(null);
    setShares(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddShare = () => {
    setShares(prev => [...prev, '']);
  };

  const handleRemoveShare = (index: number) => {
    if (shares.length <= 2) {
      // Don't remove if 2 or fewer, just clear
      handleShareChange(index, '');
      return;
    }
    setShares(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setShares(['', '', '']);
    setReconstructedSecret(null);
    setErrorMessage(null);
  };

  const handlePaste = async (index: number) => {
    try {
      const result = await readTextFromClipboard();
      if (result.text) {
        handleShareChange(index, result.text);
      } else {
        setStatus({
          type: 'info',
          msg: isFa ? 'لطفاً از کلیدهای Ctrl+V برای چسباندن استفاده کنید.' : 'Please press Ctrl+V to paste.',
        });
      }
    } catch {
      setStatus({ type: 'warn', msg: 'Unable to access clipboard. Please paste manually.' });
    }
  };

  const handleCombine = async () => {
    if (!canCombine) {
      setErrorMessage(
        t.thresholdNotMet?.replace('{min}', isFa ? '۲' : '2') ||
        'Please enter at least 2 valid shares to reconstruct the secret.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const cleanShareList = validShares.map(p => p.cleanShare);
      const res = await fetch('/api/shamir/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: cleanShareList }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reconstruct secret');
      }

      setReconstructedSecret(data.secret);
      setStatus({
        type: 'ok',
        msg: t.shamirCombine || 'Secret reconstructed successfully!',
      });
    } catch (err: any) {
      setErrorMessage(
        t.invalidPassword || 'Failed to combine shares. Ensure you have entered correct shares matching the threshold.'
      );
      setStatus({
        type: 'err',
        msg: t.invalidPassword || 'Failed to reconstruct secret.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!reconstructedSecret) return;
    copyToClipboardWithAutoClear(reconstructedSecret, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
    setStatus({ type: 'ok', msg: t.copied || 'Copied to clipboard' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border space-y-5 ${
        isDarkMode
          ? 'bg-zinc-950/40 border-white/10 shadow-2xl shadow-black/40'
          : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'
      }`}
    >
      {/* Header */}
      <div className={`flex items-start justify-between gap-3 ${isFa ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'} ${isFa ? 'font-vazir' : ''}`}>
              {t.shamirReconstruct || 'Reconstruct Shamir Secret'}
            </h3>
          </div>
          <p className={`text-[11px] text-zinc-500 max-w-md ${isFa ? 'font-vazir' : ''}`}>
            {t.shamirCombineDesc || 'Enter or paste your generated Shamir shares below to reconstruct the original secret.'}
          </p>
        </div>

        {shares.some(s => s.trim()) && (
          <button
            type="button"
            onClick={handleClearAll}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isDarkMode
                ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            } ${isFa ? 'font-vazir' : ''}`}
            title={t.clearShares || 'Clear All'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.clearShares || 'Clear'}</span>
          </button>
        )}
      </div>

      {/* Dynamic Status / Progress Banner */}
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
          canCombine
            ? isDarkMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : isDarkMode
              ? 'bg-zinc-900/60 border-white/5 text-zinc-400'
              : 'bg-zinc-50 border-zinc-200 text-zinc-600'
        } ${isFa ? 'flex-row-reverse text-right font-vazir' : ''}`}
      >
        <div className={`flex items-center gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
          {canCombine ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">
            {canCombine
              ? t.thresholdMet || `Ready to combine (${isFa ? toPersianDigits(validCount) : validCount} valid shares)`
              : localizeDigitsValue(
                  t.validSharesCount?.replace('{count}', validCount.toString()) ||
                    `${validCount} valid shares detected`,
                  language
                )}
          </span>
        </div>

        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/20">
            {isFa ? `${toPersianDigits(validCount)} / ${toPersianDigits(shares.length)}` : `${validCount}/${shares.length}`}
          </span>
        </div>
      </div>

      {/* Share Inputs List */}
      <div className="space-y-2.5">
        {shares.map((share, idx) => {
          const parsed = parsedShares[idx];
          const hasContent = share.trim().length > 0;

          return (
            <div
              key={idx}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all ${
                hasContent && parsed.isValid
                  ? isDarkMode
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-sm'
                    : 'bg-white border-emerald-400 shadow-sm'
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
                {/* Index / Parsed ID Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-[11px] font-black shrink-0 transition-colors ${
                    hasContent && parsed.isValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-400 border border-white/5'
                        : 'bg-zinc-200 text-zinc-600'
                  }`}
                  title={parsed.isValid && parsed.shareIndex ? `Detected Share #${parsed.shareIndex}` : undefined}
                >
                  {parsed.isValid && parsed.shareIndex ? (
                    <span>#{isFa ? toPersianDigits(parsed.shareIndex) : parsed.shareIndex}</span>
                  ) : (
                    <span>{isFa ? toPersianDigits(idx + 1) : idx + 1}</span>
                  )}
                </div>

                {/* Monospace LTR Input - ALWAYS LTR for Hex Cryptographic Consistency */}
                <input
                  type="text"
                  dir="ltr"
                  value={share}
                  onChange={(e) => handleShareChange(idx, e.target.value)}
                  placeholder={t.shamirPlaceholder || 'Paste share here (e.g. 801cfa...)'}
                  className={`flex-1 min-w-0 bg-transparent font-mono text-[11px] sm:text-xs outline-none py-1 px-2 ${
                    isDarkMode ? 'text-zinc-100 placeholder:text-zinc-600' : 'text-zinc-900 placeholder:text-zinc-400'
                  }`}
                />

                {/* Inline Action Tools */}
                <div className="flex items-center gap-1 shrink-0" dir="ltr">
                  {!hasContent && (
                    <button
                      type="button"
                      onClick={() => handlePaste(idx)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                      } ${isFa ? 'font-vazir' : ''}`}
                    >
                      {t.pasteFromClipboard || 'Paste'}
                    </button>
                  )}

                  {shares.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveShare(idx)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer text-zinc-400 hover:text-red-400 ${
                        isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                      }`}
                      title={t.delete || 'Remove'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Share Button & Controls */}
      <div className={`flex flex-col sm:flex-row items-center gap-2.5 ${isFa ? 'sm:flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={handleAddShare}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-dashed text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isDarkMode
              ? 'border-white/15 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/5'
              : 'border-zinc-300 text-zinc-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
          } ${isFa ? 'font-vazir' : ''}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addShare || 'Add Share'}</span>
        </button>

        {/* Combine Reconstruct Action */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!canCombine || isLoading}
          onClick={handleCombine}
          className={`w-full sm:flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            canCombine
              ? isDarkMode
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              : isDarkMode
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          } ${isFa ? 'font-vazir' : ''}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{t.shamirCombine || t.combine || 'Combine Shares'}</span>
        </motion.button>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            isDarkMode
              ? 'bg-red-500/10 border-red-500/20 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          } ${isFa ? 'flex-row-reverse text-right font-vazir' : ''}`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Reconstructed Result Box */}
      <AnimatePresence>
        {reconstructedSecret && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={`p-4 rounded-2xl border space-y-3 ${
              isDarkMode
                ? 'bg-zinc-950 border-emerald-500/40 shadow-xl'
                : 'bg-emerald-50/50 border-emerald-300 shadow-lg'
            }`}
          >
            <div className={`flex items-center justify-between gap-2 ${isFa ? 'flex-row-reverse' : ''}`}>
              <span className={`text-[11px] font-bold text-emerald-400 uppercase tracking-wider ${isFa ? 'font-vazir' : ''}`}>
                {t.shamirResult || 'Reconstructed Secret'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedResult
                      ? 'bg-emerald-500 text-black'
                      : isDarkMode
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  } ${isFa ? 'font-vazir' : ''}`}
                >
                  {copiedResult ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedResult ? (t.copied || 'Copied') : (t.copy || 'Copy')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title={t.qrCode || 'QR Code'}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              dir="ltr"
              className={`p-3.5 rounded-xl font-mono text-xs sm:text-sm break-all select-all font-medium leading-relaxed border ${
                isDarkMode
                  ? 'bg-zinc-900/90 border-white/10 text-emerald-300'
                  : 'bg-white border-emerald-200 text-emerald-950 shadow-inner'
              }`}
            >
              {reconstructedSecret}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal for Reconstructed Secret */}
      {reconstructedSecret && (
        <LinkQrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          url={reconstructedSecret}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          setStatus={setStatus}
        />
      )}
    </motion.div>
  );
};
