import React from 'react';
import { Eye, EyeOff, ImageIcon, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { Dropzone } from '../Dropzone';
import { Language } from '../../types';

export interface ViewStegoExtractProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  stegoExtractFile: File | null;
  setStegoExtractFile: (file: File | null) => void;
  stegoExtractPassword: string;
  setStegoExtractPassword: (val: string) => void;
  showStegoExtractPwd: boolean;
  setShowStegoExtractPwd: (val: boolean) => void;
  isStegoExtracting: boolean;
  handleStegoExtract: () => void;
  stegoExtractResult: string | null;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
}

export const ViewStegoExtract: React.FC<ViewStegoExtractProps> = ({
  isDarkMode,
  language,
  t,
  stegoExtractFile,
  setStegoExtractFile,
  stegoExtractPassword,
  setStegoExtractPassword,
  showStegoExtractPwd,
  setShowStegoExtractPwd,
  isStegoExtracting,
  handleStegoExtract,
  stegoExtractResult,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.extractFromStegoImage}</h3>
          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.uploadStegoToExtract}</p>
        </div>
      </div>

      <Dropzone
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        selectedFile={stegoExtractFile}
        onFileSelect={(file) => setStegoExtractFile(file)}
      />

      <div className="space-y-2">
        <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {t.stegoPasswordOptional}
        </label>
        <div className="relative">
          <input
            type={showStegoExtractPwd ? 'text' : 'password'}
            value={stegoExtractPassword}
            disabled={disabledInputs['stegoExtractPwd']}
            onChange={(e) => handlePasswordChange(e.target.value, setStegoExtractPassword, 'stegoExtractPwd')}
            onKeyDown={(e) => handlePasswordKeyDown(e, 'stegoExtractPwd')}
            placeholder={t.optionalPassword}
            className={`w-full px-4 py-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            } outline-none text-xs`}
          />
          <button
            type="button"
            onClick={() => setShowStegoExtractPwd(!showStegoExtractPwd)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showStegoExtractPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStegoExtract}
        disabled={isStegoExtracting || !stegoExtractFile}
        className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
      >
        {isStegoExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {t.extractPayload}
      </button>

      {stegoExtractResult && (
        <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-zinc-200'} border space-y-3`}>
          <p className="text-xs font-bold text-amber-500">{t.extractedHiddenContent}:</p>
          <div className="p-4 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs whitespace-pre-wrap">
            {stegoExtractResult}
          </div>
        </div>
      )}
    </div>
  );
};
