import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Music, FileText, Eye, EyeOff, RefreshCw, Lock, Unlock, Flame } from 'lucide-react';
import { Dropzone } from '../../../components/Dropzone';
import { Language } from '../../../types';

interface StegoExtractSectionProps {
  contentType: string;
  setContentType: (type: any) => void;
  stegoExtractFile: File | null;
  setStegoExtractFile: (file: File | null) => void;
  stegoExtractPassword: string;
  setStegoExtractPassword: (val: string) => void;
  showStegoExtractPwd: boolean;
  setShowStegoExtractPwd: (show: boolean) => void;
  handleStegoExtract: () => void;
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

      {/* Master Encryption Password Input */}
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
        onClick={handleStegoExtract} 
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

