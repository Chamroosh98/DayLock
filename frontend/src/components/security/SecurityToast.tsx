import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, XCircle, AlertTriangle } from 'lucide-react';
import { Language } from '../../types';
import { sanitizeToastText } from '../ToastNotification';

interface SecurityToastProps {
  toastMessage: string | null;
  language?: Language;
  isDarkMode?: boolean;
}

export const SecurityToast: React.FC<SecurityToastProps> = ({ 
  toastMessage, 
  language,
  isDarkMode = true 
}) => {
  return (
    <AnimatePresence>
      {toastMessage && (() => {
        let type: 'error' | 'warning' | 'success' = 'success';
        const cleanMessage = sanitizeToastText(toastMessage) || toastMessage;
        const isRtl = language === 'fa' || /[\u0600-\u06FF]/.test(toastMessage);

        // Check prefixes or content keywords to categorize the toast
        if (
          toastMessage.startsWith('❌') || 
          toastMessage.toLowerCase().includes('incorrect') || 
          toastMessage.toLowerCase().includes('fail') || 
          toastMessage.toLowerCase().includes('error') || 
          toastMessage.toLowerCase().includes('اشتباه')
        ) {
          type = 'error';
        } else if (
          toastMessage.startsWith('⚠️') || 
          toastMessage.startsWith('🔒') ||
          toastMessage.toLowerCase().includes('blocked') || 
          toastMessage.toLowerCase().includes('block') || 
          toastMessage.toLowerCase().includes('بلاک') ||
          toastMessage.toLowerCase().includes('disabled')
        ) {
          type = 'warning';
        }

        let borderStyle = isDarkMode 
          ? 'border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.12)]' 
          : 'border-emerald-500/40 shadow-[0_8px_25px_rgba(16,185,129,0.12)]';
        let badgeStyle = isDarkMode
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          : 'bg-emerald-50 border-emerald-500/30 text-emerald-600';
        let IconComponent = Check;

        if (type === 'error') {
          borderStyle = isDarkMode
            ? 'border-rose-500/40 shadow-[0_8px_30px_rgba(244,63,94,0.15)]'
            : 'border-rose-500/40 shadow-[0_8px_25px_rgba(244,63,94,0.12)]';
          badgeStyle = isDarkMode
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            : 'bg-rose-50 border-rose-500/30 text-rose-600';
          IconComponent = XCircle;
        } else if (type === 'warning') {
          borderStyle = isDarkMode
            ? 'border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.15)]'
            : 'border-amber-500/40 shadow-[0_8px_25px_rgba(245,158,11,0.12)]';
          badgeStyle = isDarkMode
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : 'bg-amber-50 border-amber-500/30 text-amber-600';
          IconComponent = AlertTriangle;
        }

        return (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-[999999] max-w-[min(480px,calc(100vw-1.5rem))] w-fit px-2 pointer-events-none"
          >
            <div
              className={`flex items-center gap-3 py-2 px-3 sm:py-2.5 sm:px-4 rounded-2xl border backdrop-blur-xl transition-all ${
                isDarkMode
                  ? 'bg-zinc-950/95 text-zinc-100 shadow-2xl'
                  : 'bg-white/98 text-zinc-900 shadow-xl'
              } ${borderStyle}`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 ${badgeStyle}`}>
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <span className={`text-xs sm:text-[13px] font-semibold leading-snug break-words tracking-tight ${
                isRtl ? 'font-vazir text-right' : 'font-sans text-left'
              }`}>
                {cleanMessage}
              </span>
            </div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};


