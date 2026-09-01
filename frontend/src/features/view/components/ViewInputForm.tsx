import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clipboard, CheckCircle2, Eye, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { Language, StatusState } from '../../../types';
import { readTextFromClipboard } from '../../../utils/clipboardManager';

interface ViewInputFormProps {
  viewInput: string;
  setViewInput: (val: string) => void;
  handleView: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  status: StatusState | null;
  setStatus: (status: StatusState | null) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (val: string, setter: (v: string) => void, fieldKey: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldKey: string) => void;
}

export const ViewInputForm: React.FC<ViewInputFormProps> = ({
  viewInput,
  setViewInput,
  handleView,
  isLoading,
  isDarkMode,
  language,
  t,
  status,
  setStatus,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const isFa = language === 'fa';

  const handlePasteClipboard = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const inputEl = document.getElementById('view-url-input') as HTMLInputElement | null;
    try {
      const result = await readTextFromClipboard(inputEl);
      if (result.text && result.text.trim()) {
        const val = result.text.trim();
        setViewInput(val);
        if (status) setStatus(null);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      } else {
        if (inputEl) {
          inputEl.focus();
        }
        setStatus({
          type: 'info',
          msg: isFa
            ? 'دسترسی خودکار کلیپ‌بورد در این مرورگر مسدود است. لطفاً از کلیدهای Ctrl+V استفاده کنید.'
            : 'Clipboard access restricted by browser. Please press Ctrl+V to paste.',
        });
      }
    } catch (err) {
      console.warn("Clipboard read error:", err);
      if (inputEl) {
        inputEl.focus();
      }
      setStatus({
        type: 'info',
        msg: isFa
          ? 'دسترسی خودکار کلیپ‌بورد در این مرورگر مسدود است. لطفاً از کلیدهای Ctrl+V استفاده کنید.'
          : 'Clipboard access restricted by browser. Please press Ctrl+V to paste.',
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -6 }}
      className={`space-y-6 ${isFa ? 'text-right' : 'text-left'}`}
    >
      {/* Input & Icon-Only Paste Container */}
      <div className="relative flex items-center">
        <LinkIcon className={`absolute start-4 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
        <input
          id="view-url-input"
          type="text"
          value={viewInput}
          onKeyDown={(e) => {
            handlePasswordKeyDown(e, 'view-url-input');
            if (e.key === 'Enter') handleView();
          }}
          onChange={(e) => {
            handlePasswordChange(e.target.value, (val) => {
              setViewInput(val);
              if (status) setStatus(null);
            }, 'view-url-input');
          }}
          disabled={disabledInputs['view-url-input']}
          placeholder={disabledInputs['view-url-input'] ? t.invalidKeyboardLocked : (t.linkPlaceholder || 'Paste secret URL or token hash ...')}
          dir="ltr"
          className={`w-full ${
            isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-500'
          } border rounded-2xl h-[46px] ps-10 pe-11 text-xs outline-none ${viewInput ? 'font-mono' : (isFa ? 'font-vazir' : 'font-sans')} transition-all focus:border-emerald-500/50 text-left disabled:opacity-40 disabled:cursor-not-allowed shadow-sm`}
        />

        {/* Paste from Clipboard Button (Icon Only, Borderless) */}
        <button
          type="button"
          onClick={handlePasteClipboard}
          title={t.pasteFromClipboard || 'Paste'}
          className={`absolute end-3 p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            pasteSuccess
              ? 'text-emerald-400'
              : isDarkMode
              ? 'text-zinc-500 hover:text-zinc-200'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          {pasteSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Button: Decrypt */}
      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleView} 
        disabled={isLoading || !viewInput} 
        className="w-full h-[46px] bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black tracking-wider text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span className={isFa ? 'font-vazir' : 'font-sans'}>
              {t.decryptPayload || t.decrypt || 'Decrypt'}
            </span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
