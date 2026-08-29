import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Clock, Skull, Flame, ShieldAlert, Wifi, RefreshCw, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { COUNTRIES, Flag } from '../../../data/countries';
import { Language } from '../../../types';
import { ViewErrorState } from '../types';

interface SecurityLimitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewError: ViewErrorState | null;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  onRetry?: () => void;
  onTerminate?: () => void;
}

export const SecurityLimitationModal: React.FC<SecurityLimitationModalProps> = ({
  isOpen,
  onClose,
  viewError,
  isDarkMode,
  language,
  t,
  onRetry,
  onTerminate,
}) => {
  const isFa = language === 'fa';
  const errorData = viewError?.data || {};
  const unlockAt = errorData.unlock_at || (typeof errorData === 'number' ? errorData : 0);

  // Time remaining for Time-Lock
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalSec: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSec: 0,
  });

  useEffect(() => {
    if (!viewError || viewError.type !== 'time' || !unlockAt) return;

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
  }, [viewError, unlockAt, onRetry]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!viewError) return null;

  const yourCountryObj = COUNTRIES?.find(c => c.code === errorData.your_country);
  const allowedCountriesList: string[] = errorData.allowed_countries || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div dir={isFa ? 'rtl' : 'ltr'} className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop with soft blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className={`relative max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl ${
              isDarkMode
                ? 'bg-zinc-950 border-amber-500/25 shadow-[0_0_60px_rgba(245,158,11,0.12)] text-zinc-100'
                : 'bg-white border-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)] text-zinc-800'
            } z-10 space-y-6 flex flex-col`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`absolute top-5 ${isFa ? 'left-5' : 'right-5'} p-2 rounded-full transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              {viewError.type === 'geo' && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-500 shadow-inner">
                  <Globe className="w-10 h-10 animate-pulse" />
                </div>
              )}
              {viewError.type === 'time' && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-500 shadow-inner">
                  <Clock className="w-10 h-10 animate-spin-slow" />
                </div>
              )}
              {viewError.type === 'asn' && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-500 shadow-inner">
                  <Wifi className="w-10 h-10 animate-pulse" />
                </div>
              )}
              {viewError.type === 'dms' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 shadow-inner">
                  <Skull className="w-10 h-10 animate-bounce" />
                </div>
              )}
              {(viewError.type === 'expired' || viewError.type === 'burned') && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 shadow-inner">
                  <Flame className="w-10 h-10 animate-pulse" />
                </div>
              )}
              {(viewError.type === 'rate_limit' || viewError.type === 'generic') && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 shadow-inner">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">
                  {t.securityLimitation || 'Security Limitation Active'}
                </span>
                <h3 className="text-xl font-black">
                  {viewError.type === 'geo' && (t.geoBlocked || 'Access Blocked : Geo-Lock')}
                  {viewError.type === 'time' && (t.timeLocked || 'Time-Locked Content')}
                  {viewError.type === 'asn' && (t.asnBlocked || 'Access Blocked : Network/ASN')}
                  {viewError.type === 'dms' && (t.deadMansTriggered || "Dead Man's Switch Triggered")}
                  {viewError.type === 'expired' && (t.secretExpiredTitle || 'Secret Expired')}
                  {viewError.type === 'burned' && (t.secretBurnedTitle || 'Secret Destroyed / Unavailable')}
                  {viewError.type === 'rate_limit' && (t.rateLimitExceeded || 'Rate Limit Exceeded')}
                  {viewError.type === 'generic' && (t.decryptionError || 'Access Restriction')}
                </h3>
              </div>
            </div>

            {/* Description Details */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isDarkMode ? 'bg-zinc-900/60 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}>
              {viewError.type === 'geo' && (
                <div className="space-y-4">
                  <p className="text-center">{t.geoBlockedDesc || 'This secret is protected by Geographic Access Control. Your location is not authorized to view this content.'}</p>
                  
                  {/* Your Country */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <span className="font-medium text-[11px]">{t.yourCountry || 'Your Location'}:</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <Flag code={errorData.your_country} emoji={yourCountryObj?.flag} className="w-4 h-3 rounded-xs" />
                      <span>{isFa ? yourCountryObj?.fa || errorData.your_country : yourCountryObj?.name || errorData.your_country || 'Unknown'}</span>
                      <span className="text-[10px] opacity-75">({errorData.your_country})</span>
                    </span>
                  </div>

                  {/* Allowed Countries */}
                  {allowedCountriesList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-zinc-400 block">{t.allowed || 'Allowed Regions'}:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {allowedCountriesList.map(code => {
                          const c = COUNTRIES?.find(x => x.code === code);
                          return (
                            <span
                              key={code}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                                isDarkMode ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}
                            >
                              <Flag code={code} emoji={c?.flag} className="w-3.5 h-2.5 rounded-xs" />
                              <span>{isFa ? c?.fa || code : c?.name || code}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewError.type === 'time' && (
                <div className="space-y-4">
                  <p className="text-center">{t.timeLockedDesc || 'This secret is time-locked and encrypted until the specified unlock timestamp.'}</p>
                  
                  {/* Live Countdown Display */}
                  <div className="grid grid-cols-4 gap-2 text-center py-2">
                    <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                      <div className="text-base sm:text-lg font-black">{timeLeft.days}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">{t.days || 'Days'}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                      <div className="text-base sm:text-lg font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">{t.hours || 'Hours'}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                      <div className="text-base sm:text-lg font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">{t.minutes || 'Min'}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/25 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                      <div className="text-base sm:text-lg font-black animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase font-bold text-zinc-400">{t.seconds || 'Sec'}</div>
                    </div>
                  </div>

                  {/* Exact Timestamp */}
                  <div className="text-center text-[11px] text-zinc-400">
                    <span>{t.unlockAt || 'Unlocks at'}: </span>
                    <span className="font-bold text-purple-400">
                      {unlockAt ? new Date(unlockAt * 1000).toLocaleString(isFa ? 'fa-IR' : undefined) : '-'}
                    </span>
                  </div>
                </div>
              )}

              {viewError.type === 'asn' && (
                <div className="space-y-3">
                  <p className="text-center">{t.asnBlockedDesc || 'Access to this secret is restricted to authorized Internet Service Providers / ASNs.'}</p>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <span className="font-medium text-[11px]">{t.yourAsn || 'Your Network'}:</span>
                    <span className="font-mono font-bold">AS{errorData.your_asn || 'Unknown'} {errorData.asn_name ? `(${errorData.asn_name})` : ''}</span>
                  </div>
                </div>
              )}

              {viewError.type === 'dms' && (
                <div className="space-y-2 text-center">
                  <p>{t.deadMansTriggeredDesc || 'This secret was permanently erased due to inactive owner verification.'}</p>
                </div>
              )}

              {viewError.type === 'expired' && (
                <div className="space-y-2 text-center">
                  <p>{t.secretExpiredDesc || 'The retention lifetime (TTL) for this secret has elapsed. The payload has been deleted from memory.'}</p>
                </div>
              )}

              {viewError.type === 'burned' && (
                <div className="space-y-2 text-center">
                  <p>{t.secretBurnedDesc || 'This secret was configured for Single-View Self-Destruct and has already been opened or purged.'}</p>
                </div>
              )}

              {(viewError.type === 'rate_limit' || viewError.type === 'generic') && (
                <div className="space-y-2 text-center">
                  <p>{errorData.error || errorData.message || (t.operationFailed || 'Access blocked or link is currently unavailable.')}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {onRetry && viewError.type === 'time' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRetry();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode ? 'bg-purple-500 text-black hover:bg-purple-400 shadow-lg shadow-purple-500/20' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.retryCheck || 'Check Again'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onTerminate) {
                    onTerminate();
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                  isDarkMode
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <span>{t.backToView || 'Dismiss'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
