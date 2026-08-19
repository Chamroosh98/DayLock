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

  const getBorderColor = () => {
    switch (status.type) {
      case 'ok':
        return 'border-emerald-500/30';
      case 'err':
        return 'border-red-500/30';
      case 'warn':
        return 'border-amber-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100%-2rem)] px-1"
        >
          <div
            className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${getBorderColor()} ${
              isDarkMode
                ? 'bg-zinc-900/90 text-zinc-100'
                : 'bg-white/90 text-zinc-800'
            }`}
          >
            <div className={`flex items-center gap-2.5 min-w-0 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
              {getIcon()}
              <span className="text-xs font-medium truncate">{status.msg}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
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
