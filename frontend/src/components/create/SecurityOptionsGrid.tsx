import React from 'react';
import {
  Clock, Eye, EyeOff, Flame, Globe, Lock, MapPin, Shield, ShieldAlert, Skull, Zap
} from 'lucide-react';
import { OptionToggle } from '../OptionToggle';
import { CustomSelect } from '../CustomSelect';
import { DateTimePicker } from '../DateTimePicker';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { COUNTRIES, Flag } from '../../data/countries';
import { Language } from '../../types';

const HoneyPotIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 3 L19 7" strokeWidth="2.5" />
    <circle cx="19" cy="7" r="1.5" fill="currentColor" />
    <rect x="6" y="6" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
    <rect x="6" y="6" width="12" height="3" rx="1.5" />
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" fill="currentColor" opacity="0.05" />
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" />
    <rect x="9" y="11" width="6" height="4" rx="1" fill="currentColor" opacity="0.15" />
    <text x="12" y="14" fontSize="5" fontWeight="bold" textAnchor="middle" stroke="none" fill="currentColor" className="font-sans">H</text>
  </svg>
);

export interface SecurityOptionsGridProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  burnAfterRead: boolean;
  setBurnAfterRead: (val: boolean) => void;
  hasPassword: boolean;
  setHasPassword: (val: boolean) => void;
  password: string;
  setPassword: (val: string) => void;
  showMasterPwd: boolean;
  setShowMasterPwd: (val: boolean) => void;
  hasDeadMans: boolean;
  setHasDeadMans: (val: boolean) => void;
  deadMansInterval: number | null;
  setDeadMansInterval: (val: number | null) => void;
  hasCanary: boolean;
  setHasCanary: (val: boolean) => void;
  canaryUrl: string;
  setCanaryUrl: (val: string) => void;
  hasHoney: boolean;
  setHasHoney: (val: boolean) => void;
  honeyPwd: string;
  setHoneyPwd: (val: string) => void;
  showHoneyPwd: boolean;
  setShowHoneyPwd: (val: boolean) => void;
  honeyContent: string;
  setHoneyContent: (val: string) => void;
  hasSelfDestruct: boolean;
  setHasSelfDestruct: (val: boolean) => void;
  selfDestructHides: number;
  setSelfDestructHides: (val: number) => void;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: (val: string[]) => void;
  hasTimeLock: boolean;
  setHasTimeLock: (val: boolean) => void;
  unlockAt: number | null;
  setUnlockAt: (val: number | null) => void;
  jYear: number;
  setJYear: (val: number) => void;
  jMonth: number;
  setJMonth: (val: number) => void;
  jDay: number;
  setJDay: (val: number) => void;
  jHour: number;
  setJHour: (val: number) => void;
  jMinute: number;
  setJMinute: (val: number) => void;
  hasGeoLock: boolean;
  setHasGeoLock: (val: boolean) => void;
  countrySearch: string;
  setCountrySearch: (val: string) => void;
  countryResults: typeof COUNTRIES;
  setCountryResults: (val: typeof COUNTRIES) => void;
  allowedCountries: string[];
  setAllowedCountries: (val: string[]) => void;
  hasAsnLock: boolean;
  setHasAsnLock: (val: boolean) => void;
  asnMode: 'block' | 'allow';
  setAsnMode: (val: 'block' | 'allow') => void;
  asnSelected: string;
  setAsnSelected: (val: string) => void;
  expiresIn: number;
  setExpiresIn: (val: number) => void;
  maxViews: number | '';
  setMaxViews: (val: number | '') => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
}

export const SecurityOptionsGrid: React.FC<SecurityOptionsGridProps> = ({
  isDarkMode,
  language,
  t,
  burnAfterRead,
  setBurnAfterRead,
  hasPassword,
  setHasPassword,
  password,
  setPassword,
  showMasterPwd,
  setShowMasterPwd,
  hasDeadMans,
  setHasDeadMans,
  deadMansInterval,
  setDeadMansInterval,
  hasCanary,
  setHasCanary,
  canaryUrl,
  setCanaryUrl,
  hasHoney,
  setHasHoney,
  honeyPwd,
  setHoneyPwd,
  showHoneyPwd,
  setShowHoneyPwd,
  honeyContent,
  setHoneyContent,
  hasSelfDestruct,
  setHasSelfDestruct,
  selfDestructHides,
  setSelfDestructHides,
  selfDestructTriggers,
  setSelfDestructTriggers,
  hasTimeLock,
  setHasTimeLock,
  unlockAt,
  setUnlockAt,
  jYear,
  setJYear,
  jMonth,
  setJMonth,
  jDay,
  setJDay,
  jHour,
  setJHour,
  jMinute,
  setJMinute,
  hasGeoLock,
  setHasGeoLock,
  countrySearch,
  setCountrySearch,
  countryResults,
  setCountryResults,
  allowedCountries,
  setAllowedCountries,
  hasAsnLock,
  setHasAsnLock,
  asnMode,
  setAsnMode,
  asnSelected,
  setAsnSelected,
  expiresIn,
  setExpiresIn,
  maxViews,
  setMaxViews,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-4 h-4 text-emerald-500" />
        <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {t.securityConfiguration}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiration Settings */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.expirationTTL}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.autoDeleteAfter}</p>
            </div>
          </div>
          <CustomSelect
            isDarkMode={isDarkMode}
            value={expiresIn}
            onChange={(val) => setExpiresIn(Number(val))}
            options={[
              { value: 600, label: t.ttl10Mins },
              { value: 3600, label: t.ttl1Hour },
              { value: 86400, label: t.ttl24Hours },
              { value: 604800, label: t.ttl7Days },
              { value: 2592000, label: t.ttl30Days },
            ]}
          />
        </div>

        {/* Max Views */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.maxViewLimit}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.selfDestructAfterViews}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
              placeholder={t.unlimited}
              className={`w-full px-4 py-3 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
              } outline-none text-xs font-mono`}
            />
          </div>
        </div>

        {/* Master Password Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<Lock className="w-4 h-4 text-emerald-500" />}
            title={t.masterPassword}
            subtitle={t.encryptPayloadWithPass}
            checked={hasPassword}
            onChange={(val) => setHasPassword(val)}
          />
          {hasPassword && (
            <div className="space-y-2 pt-2">
              <div className="relative">
                <input
                  type={showMasterPwd ? 'text' : 'password'}
                  value={password}
                  disabled={disabledInputs['masterPwd']}
                  onChange={(e) => handlePasswordChange(e.target.value, setPassword, 'masterPwd')}
                  onKeyDown={(e) => handlePasswordKeyDown(e, 'masterPwd')}
                  placeholder={t.enterStrongPassword}
                  className={`w-full px-4 py-3 ${language === 'fa' ? 'pl-10 pr-4' : 'pr-10 pl-4'} rounded-2xl border ${
                    isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                  } outline-none text-xs font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPwd(!showMasterPwd)}
                  className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300`}
                >
                  {showMasterPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthMeter
                password={password}
                isDarkMode={isDarkMode}
                language={language}
              />
            </div>
          )}
        </div>

        {/* Dead Man's Switch Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<Skull className="w-4 h-4 text-purple-500" />}
            title={t.deadMansSwitch}
            subtitle={t.autoDeleteInactivity}
            checked={hasDeadMans}
            onChange={(val) => setHasDeadMans(val)}
          />
          {hasDeadMans && (
            <div className="pt-2">
              <CustomSelect
                isDarkMode={isDarkMode}
                value={deadMansInterval || 86400}
                onChange={(val) => setDeadMansInterval(Number(val))}
                options={[
                  { value: 3600, label: t.interval1Hour },
                  { value: 86400, label: t.interval24Hours },
                  { value: 604800, label: t.interval7Days },
                ]}
              />
            </div>
          )}
        </div>

        {/* Canary Link Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
            title={t.canaryLink}
            subtitle={t.webhookAlertOnAccess}
            checked={hasCanary}
            onChange={(val) => setHasCanary(val)}
          />
          {hasCanary && (
            <div className="pt-2">
              <input
                type="url"
                value={canaryUrl}
                onChange={(e) => setCanaryUrl(e.target.value)}
                placeholder="https://your-webhook-url.com"
                className={`w-full px-4 py-3 rounded-2xl border ${
                  isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                } outline-none text-xs font-mono`}
              />
            </div>
          )}
        </div>

        {/* Honey Pot Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<HoneyPotIcon className="w-4 h-4 text-yellow-500" />}
            title={t.honeyPotDecoy}
            subtitle={t.decoyForWrongPassword}
            checked={hasHoney}
            onChange={(val) => setHasHoney(val)}
          />
          {hasHoney && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showHoneyPwd ? 'text' : 'password'}
                    value={honeyPwd}
                    disabled={disabledInputs['honeyPwd']}
                    onChange={(e) => handlePasswordChange(e.target.value, setHoneyPwd, 'honeyPwd')}
                    onKeyDown={(e) => handlePasswordKeyDown(e, 'honeyPwd')}
                    placeholder={t.decoyPassword}
                    className={`w-full px-4 py-3 ${language === 'fa' ? 'pl-10 pr-4' : 'pr-10 pl-4'} rounded-2xl border ${
                      isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                    } outline-none text-xs font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowHoneyPwd(!showHoneyPwd)}
                    className={`absolute ${language === 'fa' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300`}
                  >
                    {showHoneyPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter
                  password={honeyPwd}
                  isDarkMode={isDarkMode}
                  language={language}
                />
              </div>
              <textarea
                value={honeyContent}
                onChange={(e) => setHoneyContent(e.target.value)}
                placeholder={t.fakeDecoyPayload}
                rows={3}
                className={`w-full p-3 rounded-2xl border ${
                  isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                } outline-none text-xs resize-none`}
              />
            </div>
          )}
        </div>

        {/* Self Destruct Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<Zap className="w-4 h-4 text-rose-500" />}
            title={t.selfDestructTrigger}
            subtitle={t.panicModeDestruction}
            checked={hasSelfDestruct}
            onChange={(val) => setHasSelfDestruct(val)}
          />
          {hasSelfDestruct && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.tabSwitchLimit}:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={selfDestructHides}
                  onChange={(e) => setSelfDestructHides(parseInt(e.target.value) || 3)}
                  className={`w-20 px-3 py-1.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  } text-center text-xs font-mono`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Time Lock Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<Clock className="w-4 h-4 text-blue-500" />}
            title={t.timeLock}
            subtitle={t.lockedUntilFutureDate}
            checked={hasTimeLock}
            onChange={(val) => setHasTimeLock(val)}
          />
          {hasTimeLock && (
            <div className="pt-2">
              <DateTimePicker
                isDarkMode={isDarkMode}
                language={language}
                value={unlockAt}
                onChange={(val) => setUnlockAt(val)}
              />
            </div>
          )}
        </div>

        {/* Geo-Lock Toggle */}
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-4 md:col-span-2`}>
          <OptionToggle
            isDarkMode={isDarkMode}
            icon={<MapPin className="w-4 h-4 text-teal-500" />}
            title={t.geoLocking}
            subtitle={t.restrictByCountry}
            checked={hasGeoLock}
            onChange={(val) => setHasGeoLock(val)}
          />
          {hasGeoLock && (
            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  const query = e.target.value;
                  setCountrySearch(query);
                  if (!query.trim()) {
                    setCountryResults(COUNTRIES);
                  } else {
                    const q = query.toLowerCase();
                    setCountryResults(COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)));
                  }
                }}
                placeholder={t.searchCountries}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-100 placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                } outline-none text-xs`}
              />
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-1 custom-scrollbar">
                {countryResults.map((c) => {
                  const isSelected = allowedCountries.includes(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setAllowedCountries(allowedCountries.filter(code => code !== c.code));
                        } else {
                          setAllowedCountries([...allowedCountries, c.code]);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : isDarkMode
                          ? 'hover:bg-zinc-900 text-zinc-300'
                          : 'hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Flag code={c.code} className="w-4 h-3 rounded-sm object-cover" />
                        {c.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">{c.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
