import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Language } from '../../types';

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
        const cleanMessage = toastMessage.replace(/^([❌⚠️🔒✅📋🛡️]|\ud83c[\udf00-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\udd00-\udfff])\s*/, '').trim();
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
          toastMessage.toLowerCase().includes('بلاک')
        ) {
          type = 'warning';
        }

        let containerBorderClass = isDarkMode 
          ? 'bg-zinc-950/95 border-emerald-500/30 text-zinc-100 shadow-[0_8px_24px_rgba(16,185,129,0.12)]' 
          : 'bg-white/95 border-emerald-500/40 text-zinc-900 shadow-[0_8px_24px_rgba(16,185,129,0.15)]';
        let iconWrapperClass = isDarkMode
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          : 'bg-emerald-50 border-emerald-500/30 text-emerald-600';
        let IconComponent = Check;

        if (type === 'error') {
          containerBorderClass = isDarkMode
            ? 'bg-zinc-950/95 border-red-500/40 text-zinc-100 shadow-[0_8px_24px_rgba(239,68,68,0.15)]'
            : 'bg-white/95 border-red-500/40 text-zinc-900 shadow-[0_8px_24px_rgba(239,68,68,0.15)]';
          iconWrapperClass = isDarkMode
            ? 'bg-red-500/15 border-red-500/30 text-red-400'
            : 'bg-red-50 border-red-500/30 text-red-600';
          IconComponent = ShieldAlert;
        } else if (type === 'warning') {
          containerBorderClass = isDarkMode
            ? 'bg-zinc-950/95 border-amber-500/40 text-zinc-100 shadow-[0_8px_24px_rgba(245,158,11,0.15)]'
            : 'bg-white/95 border-amber-500/40 text-zinc-900 shadow-[0_8px_24px_rgba(245,158,11,0.15)]';
          iconWrapperClass = isDarkMode
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : 'bg-amber-50 border-amber-500/30 text-amber-600';
          IconComponent = AlertTriangle;
        }

        return (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] w-auto max-w-[calc(100vw-2rem)] sm:max-w-md py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border backdrop-blur-md flex items-center gap-2.5 pointer-events-none transition-colors ${containerBorderClass} ${
              isRtl ? 'font-vazir' : 'font-sans'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${iconWrapperClass}`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <p className={`text-[11px] sm:text-xs font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${
              isRtl ? 'text-right' : 'text-left'
            }`}>
              {cleanMessage}
            </p>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};

