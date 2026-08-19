import React from 'react';
import { ShieldCheck, Globe, Clock, Flame, Lock, Skull, AlertTriangle } from 'lucide-react';
import { Language } from '../../../types';
import { MetaItem } from '../../../components/MetaItem';
import { formatExpirationDate } from '../utils';
import { localizeDigitsValue } from '../../../utils/numberConverter';

export interface SecurityStatusBadgeProps {
  viewData: any;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  isHoneyView?: boolean;
}

export const SecurityStatusBadge: React.FC<SecurityStatusBadgeProps> = ({
  viewData,
  isDarkMode,
  language,
  t,
  isHoneyView = false,
}) => {
  if (!viewData) return null;

  const isFa = language === 'fa';
  const hasSecurityFeatures = Boolean(
    viewData.has_password ||
    (viewData.allowed_countries && viewData.allowed_countries.length > 0) ||
    (viewData.unlock_at && viewData.unlock_at > Date.now()) ||
    viewData.burn_after_read ||
    viewData.dead_mans_interval ||
    viewData.canary_url ||
    isHoneyView
  );

  return (
    <div className="space-y-2.5">
      {!isHoneyView && viewData.expires_at && (
        <MetaItem
          label={t.expiresIn || 'Expires In'}
          value={formatExpirationDate(viewData.expires_at, language)}
          isDarkMode={isDarkMode}
          language={language}
          iconType="expires"
        />
      )}

      {/* Security Features Active Indicators */}
      {hasSecurityFeatures && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {viewData.has_password && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.passwordProtected}</span>
            </div>
          )}

          {viewData.allowed_countries && viewData.allowed_countries.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>
                {`${t.geoLocked} (${localizeDigitsValue(viewData.allowed_countries.length, language)})`}
              </span>
            </div>
          )}

          {viewData.unlock_at && viewData.unlock_at > Date.now() && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-purple-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.timeLocked}</span>
            </div>
          )}

          {viewData.burn_after_read && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold animate-pulse">
              <Flame className="w-3 h-3 text-red-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.burnAfterRead}</span>
            </div>
          )}

          {viewData.dead_mans_interval && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold animate-pulse">
              <Skull className="w-3 h-3 text-red-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.deadMansSwitch}</span>
            </div>
          )}

          {viewData.canary_url && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.canaryToken}</span>
            </div>
          )}

          {isHoneyView && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className={isFa ? 'font-vazir' : 'uppercase tracking-wider'}>{t.duressDecoyActive}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
