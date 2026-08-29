import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, ShieldCheck, RotateCcw, Check } from 'lucide-react';
import { Language } from '../../../types';

interface StegoResultCardProps {
  stegoResultFile: { url: string; filename: string; blob: Blob };
  setStegoResultFile: (val: any) => void;
  resetCreateForm: () => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
}

export const StegoResultCard: React.FC<StegoResultCardProps> = ({
  stegoResultFile,
  setStegoResultFile,
  resetCreateForm,
  isDarkMode,
  language,
  t,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const a = document.createElement('a');
    a.href = stegoResultFile.url;
    a.download = stegoResultFile.filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 100);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/10">
      <div className={`p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.08)]' : 'bg-emerald-50/80 border-emerald-200 shadow-xl'} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.75, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-500/30 blur-md rounded-full"
              />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className={`relative w-7 h-7 rounded-xl flex items-center justify-center border ${
                  isDarkMode 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                }`}
              >
                <ShieldCheck className="w-4 h-4 animate-pulse" />
              </motion.div>
            </div>
            <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-500 ${language === 'fa' ? 'font-vazir' : ''}`}>
              {t.stegoEmbeddedSuccess || 'DayLock File Ready'}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: -15 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setStegoResultFile(null);
              resetCreateForm();
            }}
            className={`p-2 rounded-xl transition-all border ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-sm' 
                : 'bg-white/90 border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm'
            } cursor-pointer`}
            title={t.createAnother || 'Create New'}
            aria-label={t.createAnother || 'Create New'}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>

        <div className={`p-3 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/70 border-white/5 shadow-inner' : 'bg-white border-zinc-200 shadow-sm'} flex items-center justify-between gap-3`}>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[11px] sm:text-xs text-emerald-400 truncate block font-bold">{stegoResultFile.filename}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{(stegoResultFile.blob.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className={`px-4 py-2 sm:py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              downloaded
                ? isDarkMode
                  ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20'
                  : 'bg-emerald-700 text-white shadow-sm'
                : isDarkMode
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{language === 'fa' ? 'دانلود شد' : (t.downloaded || 'Downloaded')}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.downloadFile || 'Download File'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
