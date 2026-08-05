import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { DraftData } from '../hooks/useDraftAutoSave';

export interface DraftAutoSaveBannerProps {
  hasDraft: boolean;
  draftInfo: DraftData | null;
  onRestore: () => void;
  onDiscard: () => void;
  isDarkMode: boolean;
  language: Language;
  className?: string;
}

export const DraftAutoSaveBanner: React.FC<DraftAutoSaveBannerProps> = ({
  hasDraft,
  draftInfo,
  onRestore,
  onDiscard,
  isDarkMode,
  language,
  className = '',
}) => {
  if (!hasDraft || !draftInfo) return null;

  const savedTimeFormatted = draftInfo.savedAt
    ? new Date(draftInfo.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const isFa = language === 'fa';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
          isDarkMode
            ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
            : 'bg-cyan-50 border-cyan-200 text-cyan-900'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Save className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{isFa ? 'پیش‌نویس ذخیره شده پیدا شد' : 'Saved Draft Available'}</span>
              {savedTimeFormatted && (
                <span className="text-[10px] font-mono opacity-80">({savedTimeFormatted})</span>
              )}
            </div>
            <p className="text-[11px] opacity-80">
              {isFa
                ? 'محتوای قبلی شما به صورت خودکار ذخیره شده است. آیا می‌خواهید آن را بازیابی کنید؟'
                : 'Unsaved creation draft detected from your previous session. Would you like to restore it?'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onRestore}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isFa ? 'بازیابی پیش‌نویس' : 'Restore Draft'}</span>
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className={`p-1.5 rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-400 hover:text-zinc-200'
                : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
            title={isFa ? 'حذف پیش‌نویس' : 'Discard Draft'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
