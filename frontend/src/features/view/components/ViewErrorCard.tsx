import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Clock, Skull, Flame, Wifi, AlertTriangle, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { COUNTRIES, Flag } from '../../../data/countries';
import { Language } from '../../../types';
import { ViewErrorState } from '../types';

interface ViewErrorCardProps {
  viewError: ViewErrorState;
  setViewError: (err: ViewErrorState | null) => void;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  onTerminate?: () => void;
  onRetry?: () => void;
}

export const ViewErrorCard: React.FC<ViewErrorCardProps> = ({
  viewError,
  setViewError,
  isDarkMode,
  language,
  t,
  onTerminate,
  onRetry,
}) => {
  const isFa = language === 'fa';
  const errorData = viewError.data || {};
  const unlockAt = errorData.unlock_at || (typeof errorData === 'number' ? errorData : 0);

  // Time remaining state for Time-Lock
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalSec: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSec: 0,
  });

  useEffect(() => {
    if (viewError.type !== 'time' || !unlockAt) return;

    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, unlockAt - now);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({ days, hours, minutes, seconds, totalSec: diff });

      if (diff === 0 && onRetry) {
        onRetry();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [viewError.type, unlockAt, onRetry]);

  const yourCountryObj = COUNTRIES?.find(c => c.code === errorData.your_country);
  const allowedCountriesList: string[] = errorData.allowed_countries || [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Geo-Lock Limitation View */}
      {viewError.type === 'geo' && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-blue-500/5 border-blue-500/25 shadow-[0_0_40px_rgba(59,130,246,0.08)]' : 'bg-blue-50/80 border-blue-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <Globe className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              {t.securityLimitation || 'Security Limitation Active'}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide text-blue-500">{t.geoBlocked || 'Access Blocked : Geo-Lock'}</h3>
          </div>
          
          <p className="text-xs text-zinc-400 max-w-md">
            {t.geoBlockedDesc || 'This secret is protected by Geographic Access Control. Access is only permitted from authorized locations.'}
          </p>

          <div className="w-full max-w-sm space-y-3 pt-2">
            {/* Detected Country */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <span className="text-xs font-semibold">{t.yourCountry || 'Your Country'}:</span>
              <span className="font-bold flex items-center gap-2">
                <Flag code={errorData.your_country} emoji={yourCountryObj?.flag} className="w-4 h-3 rounded-xs" />
                <span>{isFa ? yourCountryObj?.fa || errorData.your_country : yourCountryObj?.name || errorData.your_country || 'Unknown'}</span>
                <span className="text-[10px] opacity-75">({errorData.your_country})</span>
              </span>
            </div>

            {/* Allowed Countries */}
            {allowedCountriesList.length > 0 && (
              <div className="space-y-2 text-left">
                <span className="text-[11px] font-bold text-zinc-400 block text-center">{t.allowed || 'Allowed Countries'}:</span>
                <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto">
                  {allowedCountriesList.map((cc: string) => {
                    const c = COUNTRIES?.find(x => x.code === cc);
                    return (
                      <span key={cc} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        isDarkMode ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        <Flag code={cc} emoji={c?.flag || ''} className="w-3.5 h-2.5 rounded-xs" />
                        <span>✓ {isFa ? c?.fa || cc : c?.name || cc}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time-Lock Limitation View */}
      {viewError.type === 'time' && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-purple-500/5 border-purple-500/25 shadow-[0_0_40px_rgba(168,85,247,0.08)]' : 'bg-purple-50/80 border-purple-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Clock className="w-10 h-10 animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
              {t.securityLimitation || 'Security Limitation Active'}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide text-purple-500">{t.timeLocked || 'Time-Locked Content'}</h3>
          </div>

          <p className="text-xs text-zinc-400 max-w-md">
            {t.timeLockedDesc || 'This secret is locked and cannot be decrypted until the designated release time.'}
          </p>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2 text-center py-2 w-full max-w-xs">
            <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
              <div className="text-lg sm:text-xl font-black">{timeLeft.days}</div>
              <div className="text-[9px] uppercase font-bold text-zinc-400">{t.days || 'Days'}</div>
            </div>
            <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
              <div className="text-lg sm:text-xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase font-bold text-zinc-400">{t.hours || 'Hours'}</div>
            </div>
            <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
              <div className="text-lg sm:text-xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase font-bold text-zinc-400">{t.minutes || 'Min'}</div>
            </div>
            <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
              <div className="text-lg sm:text-xl font-black animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase font-bold text-zinc-400">{t.seconds || 'Sec'}</div>
            </div>
          </div>

          <div className="text-xs text-zinc-400">
            {t.unlockAt || 'Unlocks at'}: <span className="font-bold text-purple-400">{unlockAt ? new Date(unlockAt * 1000).toLocaleString(isFa ? 'fa-IR' : undefined) : '-'}</span>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-2 py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
                isDarkMode ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.retryCheck || 'Check Again'}</span>
            </button>
          )}
        </div>
      )}

      {/* ASN-Lock Limitation View */}
      {viewError.type === 'asn' && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-cyan-500/5 border-cyan-500/25 shadow-[0_0_40px_rgba(6,182,212,0.08)]' : 'bg-cyan-50/80 border-cyan-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
            <Wifi className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">
              {t.securityLimitation || 'Security Limitation Active'}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide text-cyan-500">{t.asnBlocked || 'Access Blocked : ASN Lock'}</h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            {t.asnBlockedDesc || 'Access to this secret is restricted to authorized network providers.'}
          </p>
          <div className={`p-3 rounded-2xl border flex items-center justify-between w-full max-w-xs ${
            isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <span className="text-xs font-semibold">{t.yourAsn || 'Your Network'}:</span>
            <span className="font-mono font-bold">AS{errorData.your_asn || 'Unknown'}</span>
          </div>
        </div>
      )}

      {/* Dead Man's Switch */}
      {viewError.type === 'dms' && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-red-500/5 border-red-500/25 shadow-[0_0_40px_rgba(239,68,68,0.08)]' : 'bg-red-50/80 border-red-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
            <Skull className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              {t.securityLimitation || 'Security Limitation Active'}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide text-red-500">{t.deadMansTriggered || "Dead Man's Switch Triggered"}</h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            {t.deadMansTriggeredDesc || 'This secret was permanently erased due to inactive owner check-in interval.'}
          </p>
        </div>
      )}

      {/* Expired / Burned */}
      {(viewError.type === 'expired' || viewError.type === 'burned') && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-rose-500/5 border-rose-500/25 shadow-[0_0_40px_rgba(244,63,94,0.08)]' : 'bg-rose-50/80 border-rose-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Flame className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
              {t.securityLimitation || 'Security Limitation Active'}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide text-rose-500">
              {viewError.type === 'expired' ? (t.secretExpiredTitle || 'Secret Expired') : (t.secretBurnedTitle || 'Secret Destroyed / Unavailable')}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            {viewError.type === 'expired'
              ? (t.secretExpiredDesc || 'The retention lifetime (TTL) for this secret has elapsed. The payload has been deleted from memory.')
              : (t.secretBurnedDesc || 'This secret was configured for Single-View Self-Destruct and has already been opened or purged.')}
          </p>
        </div>
      )}

      {/* Generic or Rate Limit */}
      {(viewError.type === 'generic' || viewError.type === 'rate_limit') && (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${
          isDarkMode ? 'bg-amber-500/5 border-amber-500/25 shadow-[0_0_40px_rgba(245,158,11,0.08)]' : 'bg-amber-50/80 border-amber-200'
        } flex flex-col items-center gap-4 text-center`}>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-wide text-amber-500">
            {viewError.type === 'rate_limit' ? (t.rateLimitExceeded || 'Rate Limit Exceeded') : (t.decryptionError || 'Security Warning')}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md">
            {errorData.error || errorData.message || (t.operationFailed || 'Access blocked or secret is unavailable.')}
          </p>
        </div>
      )}

      {/* Terminate / Clear Action Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTerminate) {
            onTerminate();
          } else {
            setViewError(null);
          }
        }} 
        className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isDarkMode 
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
        }`}
      >
        <Flame className="w-4 h-4 animate-pulse" />
        <span>{t.terminate || 'Clear & Return'}</span>
      </motion.button>
    </motion.div>
  );
};
