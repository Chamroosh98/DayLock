import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Music, FileText, Eye, EyeOff, RefreshCw, Lock, Unlock, Flame, KeyRound, Plus, Trash2, Zap, AlertCircle, Clipboard } from 'lucide-react';
import { Dropzone } from '../../../components/Dropzone';
import { Language } from '../../../types';
import { parseShamirShare } from '../../../utils/shamirHelpers';
import { toPersianDigits } from '../../../utils/numberConverter';
import { readTextFromClipboard } from '../../../utils/clipboardManager';

interface StegoExtractSectionProps {
  contentType: string;
  setContentType: (type: any) => void;
  stegoExtractFile: File | null;
  setStegoExtractFile: (file: File | null) => void;
  stegoExtractPassword: string;
  setStegoExtractPassword: (val: string) => void;
  showStegoExtractPwd: boolean;
  setShowStegoExtractPwd: (show: boolean) => void;
  handleStegoExtract: (overrideKey?: string) => void;
  isStegoExtracting: boolean;
  stegoExtractResult: string | null;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (val: string, setter: (v: string) => void, fieldKey: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldKey: string) => void;
  copyToClipboardWithAutoClear: (text: string, timeoutMs: number, onWarning: (msg: string) => void, lang?: string) => Promise<boolean>;
  setStatus: (status: any) => void;
  handleTerminate?: () => void;
}

export const StegoExtractSection: React.FC<StegoExtractSectionProps> = ({
  stegoExtractFile,
  setStegoExtractFile,
  stegoExtractPassword,
  setStegoExtractPassword,
  showStegoExtractPwd,
  setShowStegoExtractPwd,
  handleStegoExtract,
  isStegoExtracting,
  stegoExtractResult,
  isDarkMode,
  language,
  t,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  copyToClipboardWithAutoClear,
  setStatus,
  handleTerminate,
}) => {
  const isFa = language === 'fa';
  const [authMode, setAuthMode] = useState<'password' | 'shamir'>('password');
  const [shamirShares, setShamirShares] = useState<string[]>(['', '', '']);
  const [isCombining, setIsCombining] = useState(false);
  const [shamirError, setShamirError] = useState<string | null>(null);

  const getFileMediaDetails = (file: File) => {
    const nameLower = file.name.toLowerCase();
    if (file.type.includes('image') || nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp') || nameLower.endsWith('.bmp')) {
      return { icon: <ImageIcon className="w-4 h-4 text-emerald-400" />, color: 'emerald' };
    }
    if (file.type.includes('audio') || nameLower.endsWith('.wav') || nameLower.endsWith('.mp3') || nameLower.endsWith('.ogg') || nameLower.endsWith('.flac')) {
      return { icon: <Music className="w-4 h-4 text-amber-400" />, color: 'amber' };
    }
    return { icon: <FileText className="w-4 h-4 text-cyan-400" />, color: 'cyan' };
  };

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

  const handleShamirFileExtract = async () => {
    const parsed = shamirShares.map((s) => parseShamirShare(s));
    const valid = parsed.filter((p) => p.isValid);

    if (valid.length < 2) {
      const err = t.thresholdNotMet?.replace('{min}', isFa ? toPersianDigits(2) : '2') ||
        `Please enter at least ${isFa ? toPersianDigits(2) : '2'} valid shares to reconstruct the key.`;
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

      setStegoExtractPassword(data.secret);
      handleStegoExtract(data.secret);
    } catch (err: any) {
      const errText = t.invalidPassword || 'Failed to reconstruct secret. Please verify your shares.';
      setShamirError(errText);
      setStatus({ type: 'err', msg: errText });
    } finally {
      setIsCombining(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -6 }}
      className={`space-y-6 ${isFa ? 'text-right' : 'text-left'}`}
    >
      {/* Dropzone or File Loaded Card */}
      {!stegoExtractFile ? (
        <Dropzone 
          onSelect={(e) => {
            if (e.target.files?.[0]) setStegoExtractFile(e.target.files[0]);
          }} 
          selectedFile={stegoExtractFile} 
          icon={
            <div className="flex items-center gap-2 text-emerald-500">
              <ImageIcon className="w-5 h-5" />
              <Music className="w-5 h-5" />
              <FileText className="w-5 h-5" />
            </div>
          } 
          accept="*/*,image/*,audio/*,application/*,.png,.jpg,.jpeg,.webp,.svg,.bmp,.wav,.mp3,.ogg,.flac,.bin,.pdf,.zip,.enc" 
          label={t.stegoExtractDesc || 'Upload Image, Audio, or Encrypted Binary file to decrypt'} 
          isDarkMode={isDarkMode} 
          language={language}
        />
      ) : (
        /* File Loaded Preview State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${
            isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                {getFileMediaDetails(stegoExtractFile).icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-bold truncate max-w-[180px] sm:max-w-xs ${
                  isDarkMode ? 'text-zinc-100' : 'text-zinc-800'
                }`}>
                  {stegoExtractFile.name}
                </h4>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {(stegoExtractFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* 1-Click Change File Icon Button */}
            <button
              type="button"
              onClick={() => setStegoExtractFile(null)}
              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer shrink-0"
              title={t.changeFile || 'Change File'}
            >
              <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Auth Method Selector (Password vs Shamir) */}
      <div className="flex items-center justify-end gap-2 px-1">
        <button
          type="button"
          onClick={() => setAuthMode('password')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            authMode === 'password'
              ? (isDarkMode ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800')
              : (isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900')
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>{t.password || 'Password'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMode('shamir')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            authMode === 'shamir'
              ? (isDarkMode ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-purple-50 border-purple-300 text-purple-800')
              : (isDarkMode ? 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900')
          }`}
        >
          <KeyRound className="w-3 h-3" />
          <span>{t.shamir || 'Shamir'}</span>
        </button>
      </div>

      {authMode === 'shamir' ? (
        /* Shamir Multi-Share Input for File Decryption */
        <div className="space-y-3">
          <div className="space-y-2">
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
                      isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
                    } border rounded-2xl h-[42px] pl-4 pr-10 text-xs outline-none transition-all focus:border-purple-500/50 text-left font-mono`}
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddShamirShare}
              className={`w-full sm:flex-1 h-[44px] px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-zinc-900/60 border-white/10 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.addShareInput || 'Add Key'}</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShamirFileExtract}
              disabled={isCombining || isStegoExtracting || !stegoExtractFile}
              className="w-full sm:flex-1 h-[44px] px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold tracking-wider text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isCombining || isStegoExtracting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span className={isFa ? 'font-vazir' : 'font-sans'}>
                    {t.combineAndDecrypt || 'Combine'}
                  </span>
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
        /* Master Encryption Password Input */
        <>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
            <input 
              type={showStegoExtractPwd ? "text" : "password"} 
              value={stegoExtractPassword} 
              onChange={(e) => handlePasswordChange(e.target.value, setStegoExtractPassword, 'stegoExtractPassword')}
              onKeyDown={(e) => {
                handlePasswordKeyDown(e, 'stegoExtractPassword');
                if (e.key === 'Enter' && stegoExtractPassword && stegoExtractPassword.trim()) handleStegoExtract();
              }}
              disabled={disabledInputs['stegoExtractPassword']}
              placeholder={disabledInputs['stegoExtractPassword'] ? t.invalidKeyboardLocked : t.masterPasswordPlaceholder}
              dir="ltr"
              className={`w-full ${
                isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
              } border rounded-2xl pl-10 pr-10 py-3 min-h-[46px] text-xs outline-none transition-all focus:border-emerald-500/50 text-left placeholder:text-left ${
                isFa ? 'font-vazir' : 'font-sans'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={() => setShowStegoExtractPwd(!showStegoExtractPwd)}
              className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
            >
              {showStegoExtractPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* High-Contrast Action Button */}
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStegoExtract()} 
            disabled={isStegoExtracting || !stegoExtractFile || !stegoExtractPassword || !stegoExtractPassword.trim()} 
            className="w-full h-[46px] bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black tracking-wider text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isStegoExtracting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span className={isFa ? 'font-vazir' : 'font-sans'}>
                  {t.extractSecret || 'Decrypt'}
                </span>
              </>
            )}
          </motion.button>
        </>
      )}

      {/* Extracted Secret Result Card */}
      {stegoExtractResult && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <span className={`text-[10px] font-black uppercase tracking-widest text-emerald-500 ${isFa ? 'font-vazir' : ''}`}>
              {t.extractedData || 'Extracted Data'}
            </span>
            <button 
              type="button"
              onClick={() => {
                copyToClipboardWithAutoClear(stegoExtractResult, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
              }} 
              className={`text-[10px] font-bold text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest cursor-pointer ${isFa ? 'font-vazir' : ''}`}
            >
              {t.copy || 'Copy'}
            </button>
          </div>
          <div dir="ltr" className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border ${
            isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          } text-xs sm:text-sm ${isFa ? 'font-vazir text-right' : 'font-sans text-left'} whitespace-pre-wrap break-all leading-relaxed shadow-inner`}>
            {stegoExtractResult}
          </div>

          {/* Terminate Session Button */}
          {handleTerminate && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleTerminate}
              className={`w-full py-3 px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
                isFa ? 'font-vazir' : 'font-sans uppercase tracking-wider'
              } ${
                isDarkMode
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 hover:border-rose-400/50 shadow-sm'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 shadow-sm'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{t.terminate}</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

