import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Check, X } from 'lucide-react';
import { Language } from '../types';

interface ToastNotificationProps {
  status: { type: 'ok' | 'err' | 'warn'; msg: string } | null;
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
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl ${
              isDarkMode
                ? 'bg-zinc-900/95 border-white/10 text-zinc-100 shadow-black/40'
                : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
            } ${
              status.type === 'err'
                ? 'border-l-4 border-l-red-500'
                : status.type === 'warn'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-emerald-500'
            }`}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
          >
            {/* Icon */}
            <div className="shrink-0">
              {status.type === 'err' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : status.type === 'warn' ? (
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              ) : (
                <Check className="w-5 h-5 text-emerald-500" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {status.msg
                .replace(
                  /^([❌⚠️🔒✅📋🛡️]|\ud83c[\udf00-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\udd00-\udfff])\s*/,
                  ''
                )
                .trim()}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  : 'text-zinc-400 hover:text-zinc-650 hover:bg-black/5'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
