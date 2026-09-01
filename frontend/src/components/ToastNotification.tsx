import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { Language } from '../types';
import { triggerHapticFeedback } from '../utils/haptics';

export interface ToastStatus {
  type: 'ok' | 'err' | 'warn' | 'info' | string;
  msg: string;
}

interface ToastNotificationProps {
  status: ToastStatus | null;
  onClose: () => void;
  isDarkMode: boolean;
  language: Language;
}

/**
 * Strips leading emojis, corrupted replacement characters, and trims whitespace
 */
export const sanitizeToastText = (raw: string): string => {
  if (!raw) return '';
  return raw
    .replace(/^[\s\uFE0F\uFE0E\uFFFD\u200B-\u200D\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}❌⚠️🔒✅📋🛡️🔐]+/u, '')
    .replace(/\uFFFD/g, '')
    .trim();
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  status,
  onClose,
  isDarkMode,
  language,
}) => {
  useEffect(() => {
    if (!status) return;

    if (status.type === 'ok') {
      triggerHapticFeedback('success');
    } else if (status.type === 'err' || status.type === 'warn') {
      triggerHapticFeedback('error');
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  if (!status || !status.msg) return null;

  const isRtl = language === 'fa' || /[\u0600-\u06FF]/.test(status.msg);
  const cleanMsg = sanitizeToastText(status.msg) || status.msg;

  // Determine styling based on type
  let badgeStyle = isDarkMode
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    : 'bg-emerald-50 border-emerald-500/30 text-emerald-600';
  let borderStyle = isDarkMode
    ? 'border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.12)]'
    : 'border-emerald-500/40 shadow-[0_8px_25px_rgba(16,185,129,0.12)]';
  let IconComponent = Check;

  if (status.type === 'err') {
    badgeStyle = isDarkMode
      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
      : 'bg-rose-50 border-rose-500/30 text-rose-600';
    borderStyle = isDarkMode
      ? 'border-rose-500/40 shadow-[0_8px_30px_rgba(244,63,94,0.15)]'
      : 'border-rose-500/40 shadow-[0_8px_25px_rgba(244,63,94,0.12)]';
    IconComponent = XCircle;
  } else if (status.type === 'warn') {
    badgeStyle = isDarkMode
      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
      : 'bg-amber-50 border-amber-500/30 text-amber-600';
    borderStyle = isDarkMode
      ? 'border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.15)]'
      : 'border-amber-500/40 shadow-[0_8px_25px_rgba(245,158,11,0.12)]';
    IconComponent = AlertTriangle;
  } else if (status.type === 'info') {
    badgeStyle = isDarkMode
      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
      : 'bg-indigo-50 border-indigo-500/30 text-indigo-600';
    borderStyle = isDarkMode
      ? 'border-indigo-500/40 shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
      : 'border-indigo-500/40 shadow-[0_8px_25px_rgba(99,102,241,0.12)]';
    IconComponent = Info;
  }

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-[999999] max-w-[min(480px,calc(100vw-1.5rem))] w-fit px-2"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div
            className={`flex items-center justify-between gap-3 py-2 px-3 sm:py-2.5 sm:px-4 rounded-2xl border backdrop-blur-xl transition-all ${
              isDarkMode
                ? 'bg-zinc-950/95 text-zinc-100 shadow-2xl'
                : 'bg-white/98 text-zinc-900 shadow-xl'
            } ${borderStyle}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 ${badgeStyle}`}>
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <span className={`text-xs sm:text-[13px] font-semibold leading-snug break-words tracking-tight ${isRtl ? 'font-vazir text-right' : 'font-sans text-left'}`}>
                {cleanMsg}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200' 
                  : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700'
              }`}
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

