import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, QrCode, Check, ShieldCheck, RotateCcw } from 'lucide-react';
import { Language } from '../../../types';
import { LinkQrCodeModal } from '../../../components/modals/LinkQrCodeModal';

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

  const handleCopy = () => {
    copyToClipboardWithAutoClear(resultUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setStatus({ type: 'ok', msg: t.linkCopied });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/10">
      <div className={`p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.08)]' : 'bg-emerald-50/80 border-emerald-200 shadow-xl'} space-y-4`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2.5 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
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

        {/* Dedicated Full-Width Link Box */}
        <div
          onClick={handleCopy}
          className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            isDarkMode 
              ? 'bg-zinc-950/80 border-white/10 hover:border-emerald-500/40 shadow-inner' 
              : 'bg-white border-zinc-200 hover:border-emerald-400 shadow-sm'
          }`}
          title="Click to copy link"
        >
          <div className="flex items-center justify-between gap-3">
            <span 
              dir="ltr"
              className="font-mono text-xs sm:text-sm text-emerald-400 break-all select-all font-semibold tracking-tight"
            >
              {resultUrl}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className={`p-2 rounded-xl transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-black shadow-md'
                  : isDarkMode
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Controls Row (Spacious & Clean) */}
        <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${language === 'fa' ? 'flex-row-reverse font-vazir' : ''}`}>
          {/* Copy Action Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className={`py-3 px-4 rounded-2xl font-black uppercase text-[11px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              copied
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : isDarkMode
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
            } ${language === 'fa' ? 'flex-row-reverse' : ''}`}
          >
            {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
            <span>{copied ? t.copied : t.copyLink}</span>
          </motion.button>

          {/* QR Code Action Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQrHub(true)}
            className={`py-3 px-4 rounded-2xl font-black uppercase text-[11px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              isDarkMode
                ? 'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 border-white/10 hover:border-emerald-500/30 shadow-sm'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-emerald-300 shadow-sm'
            } ${language === 'fa' ? 'flex-row-reverse' : ''}`}
          >
            <QrCode className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t.qrCode || 'QR Code'}</span>
          </motion.button>
        </div>
      </div>

      {/* Link QR Code Modal */}
      <LinkQrCodeModal
        isOpen={showQrHub}
        onClose={() => setShowQrHub(false)}
        url={resultUrl}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        setStatus={setStatus}
      />
    </motion.div>
  );
};
