import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, QrCode, Check, ShieldCheck, RotateCcw } from 'lucide-react';
import { Language } from '../../../types';
import { QrCodeHub } from '../../../components/QrCodeHub';

interface ResultLinkCardProps {
  resultUrl: string;
  setResultUrl: (url: string | null) => void;
  resetCreateForm: () => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  copyToClipboardWithAutoClear: (text: string, durationMs?: number, onWarn?: (msg: string) => void, lang?: string) => void;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const ResultLinkCard: React.FC<ResultLinkCardProps> = ({
  resultUrl,
  setResultUrl,
  resetCreateForm,
  isDarkMode,
  language,
  t,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  const [showQrHub, setShowQrHub] = useState(false);
  const [copied, setCopied] = useState(false);

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
              {t.securelyStored}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: -15 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setResultUrl(null);
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

        <div className={`p-3 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/70 border-white/5 shadow-inner' : 'bg-white border-zinc-200 shadow-sm'} flex items-center justify-between gap-2.5 sm:gap-3`}>
          <span className="font-mono text-[11px] sm:text-xs text-emerald-400 truncate flex-1 font-bold select-all">{resultUrl}</span>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQrHub(true)}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title="QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                copyToClipboardWithAutoClear(resultUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                setStatus({ type: 'ok', msg: t.linkCopied });
              }}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/25'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Hub Modal */}
      {showQrHub && (
        <QrCodeHub
          url={resultUrl}
          onClose={() => setShowQrHub(false)}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
        />
      )}
    </motion.div>
  );
};
