import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
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
    }, 4000);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  if (!status || !status.msg) return null;

  const isFa = language === 'fa';

  const getIcon = () => {
    switch (status.type) {
      case 'ok':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'err':
        return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] max-w-[min(460px,calc(100vw-24px))] w-fit px-2"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          <div
            className={`flex items-center justify-between gap-2.5 py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
              isDarkMode
                ? 'bg-zinc-900/95 border-white/10 text-zinc-100'
                : 'bg-white/95 border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {getIcon()}
              <span className={`text-[11.5px] sm:text-xs font-medium leading-snug break-words ${isFa ? 'font-vazir text-right' : 'text-left'}`}>
                {status.msg}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
