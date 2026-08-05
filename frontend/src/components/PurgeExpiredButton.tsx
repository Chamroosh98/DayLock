import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import { purgeExpiredPastes } from '../utils/pasteStorage';
import { Language } from '../types';

export interface PurgeExpiredButtonProps {
  isDarkMode: boolean;
  language: Language;
  onPurgeComplete?: (purgedCount: number) => void;
  setStatus?: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
  className?: string;
}

export const PurgeExpiredButton: React.FC<PurgeExpiredButtonProps> = ({
  isDarkMode,
  language,
  onPurgeComplete,
  setStatus,
  className = '',
}) => {
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = () => {
    setIsPurging(true);
    setTimeout(() => {
      const { purgedCount, remainingCount } = purgeExpiredPastes();
      setIsPurging(false);

      if (onPurgeComplete) {
        onPurgeComplete(purgedCount);
      }

      if (setStatus) {
        const isFa = language === 'fa';
        if (purgedCount > 0) {
          setStatus({
            type: 'ok',
            msg: isFa
              ? `پاکسازی انجام شد: ${purgedCount} پاست منقضی‌شده به طور کامل از حافظه محلی حذف گردید!`
              : `Purge completed: ${purgedCount} expired paste entries and remnants completely cleared!`,
          });
        } else {
          setStatus({
            type: 'ok',
            msg: isFa
              ? 'هیچ پاست منقضی‌شده‌ای برای پاکسازی یافت نشد.'
              : 'No expired pastes found to purge. Storage is clean.',
          });
        }
      }
    }, 400);
  };

  const isFa = language === 'fa';

  return (
    <button
      type="button"
      onClick={handlePurge}
      disabled={isPurging}
      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
        isDarkMode
          ? 'bg-red-950/40 hover:bg-red-900/60 border-red-500/30 text-red-400 hover:text-red-300'
          : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'
      } ${className}`}
      title={
        isFa
          ? 'حذف کامل تمام پاست‌های منقضی‌شده از حافظه محلی'
          : 'Purge all expired paste remnants and metadata from local storage'
      }
    >
      <Flame className={`w-3.5 h-3.5 text-red-500 ${isPurging ? 'animate-bounce' : ''}`} />
      <span>
        {isPurging
          ? isFa
            ? 'در حال پاکسازی...'
            : 'Purging Expired...'
          : isFa
          ? 'پاکسازی منقضی‌شده‌ها'
          : 'Purge Expired'}
      </span>
    </button>
  );
};
