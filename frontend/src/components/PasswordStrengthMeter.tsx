import React, { useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { ShieldCheck, ShieldAlert, Zap, Lock, Info } from 'lucide-react';
import { Language } from '../types';

export interface PasswordStrengthMeterProps {
  password?: string;
  isDarkMode: boolean;
  language: Language;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = '',
  isDarkMode,
  language,
  className = '',
}) => {
  const result = useMemo(() => {
    if (!password) {
      return null;
    }
    try {
      return zxcvbn(password);
    } catch (e) {
      console.error('zxcvbn error:', e);
      return null;
    }
  }, [password]);

  if (!password) {
    return null;
  }

  const score = result ? result.score : 0; // 0 to 4

  // Text labels mapping for English and Persian
  const strengthLabels = {
    en: [
      { label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/30' },
      { label: 'Weak', color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500/30' },
      { label: 'Fair', color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30' },
      { label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30' },
      { label: 'Fortified', color: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-400/30' },
    ],
    fa: [
      { label: 'بسیار ضعیف', color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/30' },
      { label: 'ضعیف', color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500/30' },
      { label: 'متوسط', color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30' },
      { label: 'قوی', color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30' },
      { label: 'فوق‌العاده ایمن', color: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-400/30' },
    ],
  };

  const currentInfo = (strengthLabels[language] || strengthLabels.en)[score];

  // Crack time formatting helper
  const crackTimeDisplay = result?.crack_times_display?.offline_slow_hashing_1e4_per_second;

  const warningMsg = result?.feedback?.warning;
  const suggestionMsg = result?.feedback?.suggestions?.[0];

  return (
    <div className={`mt-2 space-y-2 text-xs transition-all duration-300 ${className}`}>
      {/* Top row: Label & Score badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          {score >= 3 ? (
            <ShieldCheck className={`w-3.5 h-3.5 ${currentInfo.color}`} />
          ) : (
            <ShieldAlert className={`w-3.5 h-3.5 ${currentInfo.color}`} />
          )}
          <span className={`text-[11px] font-bold ${currentInfo.color}`}>
            {currentInfo.label}
          </span>
        </div>

        {crackTimeDisplay && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isDarkMode ? 'bg-zinc-900/80 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}
          >
            {language === 'fa' ? `زمان کرک: ${crackTimeDisplay}` : `Crack time: ${crackTimeDisplay}`}
          </span>
        )}
      </div>

      {/* Progress Bars (4 segments) */}
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((index) => {
          const isActive = index <= score;
          return (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isActive
                  ? currentInfo.bg
                  : isDarkMode
                  ? 'bg-zinc-800'
                  : 'bg-zinc-200'
              }`}
            />
          );
        })}
      </div>

      {/* Feedback & Suggestion Warning (if weak) */}
      {(warningMsg || suggestionMsg) && score < 3 && (
        <div
          className={`flex items-start gap-1.5 p-2 rounded-xl text-[10px] leading-snug border ${
            isDarkMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/90'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>
            {warningMsg && <strong className="font-semibold">{warningMsg}. </strong>}
            {suggestionMsg}
          </span>
        </div>
      )}
    </div>
  );
};
