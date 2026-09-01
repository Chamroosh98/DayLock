import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Fingerprint, Eye, EyeOff, RefreshCw, Flame, AlertCircle, ShieldAlert, KeyRound, Plus, Trash2, Zap, Clipboard } from 'lucide-react';
import { Language } from '../../../types';
import { localizeDigitsValue, toPersianDigits } from '../../../utils/numberConverter';
import { parseShamirShare } from '../../../utils/shamirHelpers';
import { readTextFromClipboard } from '../../../utils/clipboardManager';

export interface UnlockPasskeyFormProps {
  viewData: any;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  biometricsSupported?: boolean;
  hasBiometricsForCurrent?: boolean;
  handleBiometricUnlock?: () => void;
  viewPassword: string;
  setViewPassword: (val: string) => void;
  showViewPwd: boolean;
  setShowViewPwd: (val: boolean) => void;
  performDecryption: (data: any, pwd: string, isFile: boolean) => void;
  isDecrypting: boolean;
  rememberWithBiometrics?: boolean;
  setRememberWithBiometrics?: (val: boolean) => void;
  triggerShatterExplosion: (colors: string[]) => void;
  setViewData: (data: any) => void;
  setDecryptedContent: (content: any) => void;
  setViewInput: (val: string) => void;
  setStatus: (status: any) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (val: string, setter: (v: string) => void, fieldKey: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldKey: string) => void;
  status: any;
  remainingAttempts?: number;
  onTerminate?: () => void;
}

export const UnlockPasskeyForm: React.FC<UnlockPasskeyFormProps> = ({
  viewData,
  isDarkMode,
  language,
  t,
  biometricsSupported,
  hasBiometricsForCurrent,
  handleBiometricUnlock,
  viewPassword,
  setViewPassword,
  showViewPwd,
  setShowViewPwd,
  performDecryption,
  isDecrypting,
  rememberWithBiometrics,
  setRememberWithBiometrics,
  triggerShatterExplosion,
  setViewData,
  setDecryptedContent,
  setViewInput,
  setStatus,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  status,
  remainingAttempts,
  onTerminate,
}) => {
  const isFa = language === 'fa';
  const isShamir = Boolean(viewData?.has_shamir);
  
  const initialThreshold = viewData?.shamir_threshold || 3;
  const [shamirShares, setShamirShares] = useState<string[]>(() => 
    Array.from({ length: Math.max(initialThreshold, 2) }, () => '')
  );
  const [isCombining, setIsCombining] = useState(false);
  const [shamirError, setShamirError] = useState<string | null>(null);

  const handleShamirShareChange = (index: number, val: string) => {
    setShamirError(null);
    setShamirShares((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddShamirShare = () => {
    setShamirShares((prev) => [...prev, '']);
  };

  const handleRemoveShamirShare = (index: number) => {
    if (shamirShares.length <= 2) {
      handleShamirShareChange(index, '');
      return;
    }
    setShamirShares((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShamirDecrypt = async () => {
    const parsed = shamirShares.map((s) => parseShamirShare(s));
    const valid = parsed.filter((p) => p.isValid);

    const minRequired = viewData?.shamir_threshold || 2;
    if (valid.length < minRequired) {
      const err = t.thresholdNotMet?.replace('{min}', isFa ? toPersianDigits(minRequired) : minRequired.toString()) ||
        `Please enter at least ${isFa ? toPersianDigits(minRequired) : minRequired} valid shares to reconstruct the key.`;
      setShamirError(err);
      setStatus({ type: 'err', msg: err });
      return;
    }

    setIsCombining(true);
    setShamirError(null);

    try {
      const cleanShareList = valid.map((p) => p.cleanShare);
      const res = await fetch('/api/shamir/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: cleanShareList }),
      });

      const data = await res.json();
      if (!res.ok || !data.secret) {
        throw new Error(data.error || 'Failed to combine shares');
      }

      setViewPassword(data.secret);
      performDecryption(viewData, data.secret, viewData.isFile);
    } catch (err: any) {
      const errText = t.invalidPassword || 'Failed to reconstruct secret. Please verify your shares.';
      setShamirError(errText);
      setStatus({ type: 'err', msg: errText });
    } finally {
      setIsCombining(false);
    }
  };

  return (
    <div className={`space-y-6 ${isFa ? 'text-right' : 'text-left'}`}>
      {/* Node Header Card */}
      <div className={`p-8 sm:p-10 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} flex flex-col items-center gap-4 shadow-inner`}>
        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
          {isShamir ? <KeyRound className="w-8 h-8 text-purple-400" /> : <Lock className="w-8 h-8 text-emerald-500" />}
        </div>
        <div className="text-center">
          <p className={`text-xs font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
            {isShamir ? (t.shamirLock || 'Shamir Secret Sharing') : t.protectedNode}
          </p>
          <p className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-widest mt-1`}>
            {isShamir 
              ? (viewData?.shamir_threshold 
                  ? `${t.shamirCustodyRequired || 'Multi-Party Custody'} (${isFa ? toPersianDigits(viewData.shamir_threshold) : viewData.shamir_threshold} of ${isFa ? toPersianDigits(viewData.shamir_total || viewData.shamir_threshold) : (viewData.shamir_total || viewData.shamir_threshold)})` 
                  : (t.shamirCustodyRequired || 'Multi-Party Custody Required'))
              : t.authRequired}
          </p>
        </div>

        {/* Duress / Honeypot warning banner if configured */}
        {viewData?.has_honey && (
          <div className="w-full mt-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-amber-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span className={`text-[10px] font-medium ${isFa ? 'font-vazir' : ''}`}>
              {t.duressNotice}
            </span>
          </div>
        )}
      </div>

      {/* Biometric Unlock Button (for standard passwords) */}
      {!isShamir && biometricsSupported && hasBiometricsForCurrent && handleBiometricUnlock && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBiometricUnlock}
          className="w-full mb-4 h-[42px] xl:h-auto xl:py-5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-2xl xl:rounded-[32px] font-black tracking-wider text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg"
        >
          <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>{t.biometricUnlockBtn}</span>
        </motion.button>
      )}

      {/* Shamir Multi-Share Decryption UI */}
      {isShamir ? (
        <div className="space-y-4">
          <div className="space-y-2.5">
            {shamirShares.map((share, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-2 rounded-xl border border-purple-500/20 shrink-0 min-w-[36px] text-center">
                  #{isFa ? toPersianDigits(idx + 1) : idx + 1}
                </span>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={share}
                    onChange={(e) => handleShamirShareChange(idx, e.target.value)}
                    placeholder={`${t.enterShare || 'Enter or paste key'} #${isFa ? toPersianDigits(idx + 1) : idx + 1}`}
                    dir="ltr"
                    className={`w-full ${
                      isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
                    } border rounded-2xl h-[42px] pl-4 pr-10 text-xs outline-none transition-all focus:border-purple-500/50 text-left ltr font-mono`}
                  />
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const result = await readTextFromClipboard();
                        if (result.text) {
                          handleShamirShareChange(idx, result.text.trim());
                        } else {
                          setStatus({
                            type: 'info',
                            msg: isFa ? 'لطفاً از کلیدهای Ctrl+V برای چسباندن کلید استفاده کنید.' : 'Please press Ctrl+V to paste key.',
                          });
                        }
                      } catch (err) {
                        console.error('Failed to read clipboard', err);
                      }
                    }}
                    className={`absolute right-2.5 p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode ? 'text-zinc-400 hover:text-purple-400 hover:bg-white/5' : 'text-zinc-400 hover:text-purple-600 hover:bg-zinc-100'
                    }`}
                    title={t.paste || 'Paste'}
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                  </button>
                </div>
                {shamirShares.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveShamirShare(idx)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title={t.remove || 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Row: Add Key & Combine Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddShamirShare}
              className={`w-full sm:flex-1 h-[44px] px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-zinc-900/60 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:border-purple-500/30'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:border-purple-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.addShareInput || 'Add Key'}</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShamirDecrypt}
              disabled={isCombining || isDecrypting}
              className="w-full sm:flex-1 h-[44px] px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold tracking-wide text-xs transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCombining || isDecrypting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{t.combineAndDecrypt || 'Combine'}</span>
                </>
              )}
            </motion.button>
          </div>

          {shamirError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{shamirError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Password Input and Decrypt Button */
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:flex-1">
            <input
              id="view-passkey-input"
              type={showViewPwd ? 'text' : 'password'}
              value={viewPassword}
              onChange={(e) => {
                handlePasswordChange(
                  e.target.value,
                  (val) => {
                    setViewPassword(val);
                    if (status) setStatus(null);
                  },
                  'viewPassword'
                );
              }}
              disabled={disabledInputs['viewPassword']}
              placeholder={
                disabledInputs['viewPassword']
                  ? t.invalidKeyboardLocked
                  : t.enterMasterPassword
              }
              dir="ltr"
              className={`w-full ${
                isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
              } border rounded-2xl h-[42px] px-4 pe-11 text-xs xl:rounded-[32px] xl:h-auto xl:p-5 xl:ps-12 xl:pe-12 outline-none transition-all focus:border-emerald-500/50 text-left ltr disabled:opacity-40 disabled:cursor-not-allowed disabled:border-amber-500/40`}
              onKeyDown={(e) => {
                handlePasswordKeyDown(e, 'viewPassword');
                if (e.key === 'Enter') {
                  performDecryption(viewData, viewPassword, viewData.isFile);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowViewPwd(!showViewPwd)}
              className={`absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isDarkMode
                  ? 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {showViewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => performDecryption(viewData, viewPassword, viewData.isFile)}
            disabled={isDecrypting || !viewPassword || !viewPassword.trim()}
            className="w-full sm:w-auto px-10 h-[42px] xl:h-auto xl:py-5 bg-emerald-500 text-black rounded-2xl xl:rounded-[32px] font-black tracking-wide text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center min-w-[120px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.decrypt}
          </motion.button>
        </div>
      )}

      {/* Remaining attempts counter if applicable */}
      {!isShamir && typeof remainingAttempts === 'number' && (
        <div className={`flex items-center gap-2 text-[10px] text-amber-500 font-bold px-1 ${isFa ? 'font-vazir' : 'font-mono'}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>
            {`${t.remainingAttempts}${localizeDigitsValue(remainingAttempts, language)}`}
          </span>
        </div>
      )}

      {/* Remember with Biometrics Toggle */}
      {!isShamir && biometricsSupported && setRememberWithBiometrics && (
        <div className="flex items-center gap-3 mt-4 px-3 py-1">
          <label dir="ltr" className="relative flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={rememberWithBiometrics}
              onChange={(e) => setRememberWithBiometrics(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`w-8 h-4 rounded-full peer transition-all ${
                isDarkMode ? 'bg-zinc-800/60' : 'bg-zinc-300'
              } peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4`}
            ></div>
          </label>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {t.enableBiometricRemember}
          </span>
        </div>
      )}

      {/* Destroy / Terminate Session Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTerminate) {
            onTerminate();
          } else {
            triggerShatterExplosion(['#ef4444', '#dc2626', '#f87171', '#27272a', isDarkMode ? '#ffffff' : '#1e293b']);
            setViewData(null);
            setDecryptedContent(null);
            setViewInput('');
            setStatus(null);
            setViewPassword('');
            try {
              (window as any).secureClearClipboard?.();
            } catch (_) {}
          }
        }}
        className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isDarkMode
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]'
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
        }`}
      >
        <Flame className="w-4 h-4 animate-pulse" />
        <span>{t.terminate}</span>
      </motion.button>
    </div>
  );
};
