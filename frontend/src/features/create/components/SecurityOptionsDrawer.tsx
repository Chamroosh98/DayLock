import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Globe, Skull, Bird, Clock, ShieldAlert, Shield, Flame, Bomb,
  Search, Eye, EyeOff, Plus, X, AlertCircle, RadioTower
} from 'lucide-react';
import { Language, Country } from '../../../types';
import { OptionToggle } from '../../../components/OptionToggle';
import { SecuritySnapCarousel, SecurityCarouselCardItem } from '../../../components/SecuritySnapCarousel';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { Flag, COUNTRIES } from '../../../data/countries';
import { HoneyPotIcon } from '../../../components/HoneyPotIcon';
import { ExpirationSelector } from './ExpirationSelector';
import { toPersianDigits, toEnglishDigits } from '../../../utils/numberConverter';

export interface SecurityOptionsDrawerProps {
  burnAfterRead: boolean;
  setBurnAfterRead: (v: boolean) => void;
  expiresIn: number;
  setExpiresIn: (v: number) => void;
  maxViews: number | '';
  setMaxViews: (v: number | '') => void;
  hasPassword: boolean;
  setHasPassword: (v: boolean) => void;
  password: string;
  setPassword: (v: string) => void;
  showMasterPwd: boolean;
  setShowMasterPwd: (v: boolean) => void;
  hasHoney: boolean;
  setHasHoney: (v: boolean) => void;
  honeyPwd: string;
  setHoneyPwd: (v: string) => void;
  showHoneyPwd: boolean;
  setShowHoneyPwd: (v: boolean) => void;
  honeyContent: string;
  setHoneyContent: (v: string) => void;
  hasGeoLock: boolean;
  setHasGeoLock: (v: boolean) => void;
  allowedCountries: string[];
  setAllowedCountries: React.Dispatch<React.SetStateAction<string[]>>;
  countrySearch: string;
  setCountrySearch: (v: string) => void;
  countryResults: Country[];
  hasAsnLock: boolean;
  setHasAsnLock: (v: boolean) => void;
  asnMode: 'block' | 'allow';
  setAsnMode: (v: 'block' | 'allow') => void;
  asnSelected: string;
  setAsnSelected: (v: string) => void;
  hasDeadMans: boolean;
  setHasDeadMans: (v: boolean) => void;
  deadMansInterval: number | null;
  setDeadMansInterval: (v: number | null) => void;
  hasSelfDestruct: boolean;
  setHasSelfDestruct: (v: boolean) => void;
  selfDestructHides: number;
  setSelfDestructHides: (v: number) => void;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: React.Dispatch<React.SetStateAction<string[]>>;
  hasCanary: boolean;
  setHasCanary: (v: boolean) => void;
  canaryUrl: string;
  setCanaryUrl: (v: string) => void;
  hasTimeLock: boolean;
  setHasTimeLock: (v: boolean) => void;
  unlockAt: number | null;
  setUnlockAt: (v: number | null) => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setValue: (v: string) => void, inputId: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => void;
}

export const SecurityOptionsDrawer: React.FC<SecurityOptionsDrawerProps> = ({
  burnAfterRead,
  setBurnAfterRead,
  expiresIn,
  setExpiresIn,
  maxViews,
  setMaxViews,
  hasPassword,
  setHasPassword,
  password,
  setPassword,
  showMasterPwd,
  setShowMasterPwd,
  hasHoney,
  setHasHoney,
  honeyPwd,
  setHoneyPwd,
  showHoneyPwd,
  setShowHoneyPwd,
  honeyContent,
  setHoneyContent,
  hasGeoLock,
  setHasGeoLock,
  allowedCountries,
  setAllowedCountries,
  countrySearch,
  setCountrySearch,
  countryResults,
  hasAsnLock,
  setHasAsnLock,
  asnMode,
  setAsnMode,
  asnSelected,
  setAsnSelected,
  hasDeadMans,
  setHasDeadMans,
  deadMansInterval,
  setDeadMansInterval,
  hasSelfDestruct,
  setHasSelfDestruct,
  selfDestructHides,
  setSelfDestructHides,
  selfDestructTriggers,
  setSelfDestructTriggers,
  hasCanary,
  setHasCanary,
  canaryUrl,
  setCanaryUrl,
  hasTimeLock,
  setHasTimeLock,
  unlockAt,
  setUnlockAt,
  isDarkMode,
  language,
  t,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  const securityCarouselItems: SecurityCarouselCardItem[] = [
    {
      id: 'toggle-password-protection',
      active: hasPassword,
      onClick: () => setHasPassword(!hasPassword),
      icon: <Lock className="w-4 h-4" />,
      title: t.passwordLock,
      variant: 'default',
    },
    {
      id: 'opt-burn',
      active: burnAfterRead,
      onClick: () => setBurnAfterRead(!burnAfterRead),
      icon: <Flame className="w-4 h-4" />,
      title: t.burnOnRead,
      variant: 'danger',
    },
    {
      id: 'toggle-geolock',
      active: hasGeoLock,
      onClick: () => setHasGeoLock(!hasGeoLock),
      icon: <Globe className="w-4 h-4" />,
      title: t.geoLock,
      variant: 'cyan',
    },
    {
      id: 'toggle-self-destruct',
      active: hasSelfDestruct,
      onClick: () => setHasSelfDestruct(!hasSelfDestruct),
      icon: <Bomb className="w-4 h-4" />,
      title: t.autoSelfDestruct,
      variant: 'danger',
    },
    {
      id: 'toggle-time-lock',
      active: hasTimeLock,
      onClick: () => setHasTimeLock(!hasTimeLock),
      icon: <Clock className="w-4 h-4" />,
      title: t.timeLock,
      variant: 'purple',
    },
    {
      id: 'toggle-canary-token',
      active: hasCanary,
      onClick: () => setHasCanary(!hasCanary),
      icon: <Bird className="w-4 h-4" />,
      title: t.canaryToken,
      variant: 'blue',
    },
    {
      id: 'toggle-asn-lock',
      active: hasAsnLock,
      onClick: () => setHasAsnLock(!hasAsnLock),
      icon: <RadioTower className="w-4 h-4" />,
      title: t.asnLock,
      variant: 'indigo',
    },
    {
      id: 'toggle-deadmans-switch',
      active: hasDeadMans,
      onClick: () => setHasDeadMans(!hasDeadMans),
      icon: <Skull className="w-4 h-4" />,
      title: t.deadMansSwitch,
      variant: 'danger',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Mobile: Horizontal Snap Carousel (Zero Truncation, Snap-X Mandatory, Peek-Ahead) */}
      <div className="block sm:hidden">
        <SecuritySnapCarousel
          items={securityCarouselItems}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      {/* Tablet & Desktop: 2x4 Compact Grid */}
      <div className="hidden sm:grid grid-cols-2 gap-2.5">
        <OptionToggle
          id="toggle-password-protection"
          active={hasPassword}
          onClick={() => setHasPassword(!hasPassword)}
          icon={<Lock className="w-4 h-4" />}
          title={t.passwordLock}
          isDarkMode={isDarkMode}
          language={language}
          variant="default"
        />
        <OptionToggle
          id="opt-burn"
          active={burnAfterRead}
          onClick={() => setBurnAfterRead(!burnAfterRead)}
          icon={<Flame className="w-4 h-4" />}
          title={t.burnOnRead}
          isDarkMode={isDarkMode}
          language={language}
          variant="danger"
        />
        <OptionToggle
          id="toggle-geolock"
          active={hasGeoLock}
          onClick={() => setHasGeoLock(!hasGeoLock)}
          icon={<Globe className="w-4 h-4" />}
          title={t.geoLock}
          isDarkMode={isDarkMode}
          language={language}
          variant="cyan"
        />
        <OptionToggle
          id="toggle-self-destruct"
          active={hasSelfDestruct}
          onClick={() => setHasSelfDestruct(!hasSelfDestruct)}
          icon={<Bomb className="w-4 h-4" />}
          title={t.autoSelfDestruct}
          isDarkMode={isDarkMode}
          language={language}
          variant="danger"
        />
        <OptionToggle
          id="toggle-time-lock"
          active={hasTimeLock}
          onClick={() => setHasTimeLock(!hasTimeLock)}
          icon={<Clock className="w-4 h-4" />}
          title={t.timeLock}
          isDarkMode={isDarkMode}
          language={language}
          variant="purple"
        />
        <OptionToggle
          id="toggle-canary-token"
          active={hasCanary}
          onClick={() => setHasCanary(!hasCanary)}
          icon={<Bird className="w-4 h-4" />}
          title={t.canaryToken}
          isDarkMode={isDarkMode}
          language={language}
          variant="blue"
        />
        <OptionToggle
          id="toggle-asn-lock"
          active={hasAsnLock}
          onClick={() => setHasAsnLock(!hasAsnLock)}
          icon={<RadioTower className="w-4 h-4" />}
          title={t.asnLock}
          isDarkMode={isDarkMode}
          language={language}
          variant="indigo"
        />
        <OptionToggle
          id="toggle-deadmans-switch"
          active={hasDeadMans}
          onClick={() => setHasDeadMans(!hasDeadMans)}
          icon={<Skull className="w-4 h-4" />}
          title={t.deadMansSwitch}
          isDarkMode={isDarkMode}
          language={language}
          variant="danger"
        />
      </div>

      {/* Expiration Dropdown & Max Views Row */}
      <ExpirationSelector
        expiresIn={expiresIn}
        setExpiresIn={setExpiresIn}
        maxViews={maxViews}
        setMaxViews={setMaxViews}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      {/* Geofencing Drawer */}
      <AnimatePresence>
        {hasGeoLock && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
                {t.allowedGeoLocations}
              </label>

              <div className="relative">
                <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-zinc-500 ${language === 'fa' ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t.searchCountry}
                  dir={language === 'fa' ? 'rtl' : 'ltr'}
                  className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-2xl ${language === 'fa' ? 'pr-10 pl-4 text-right font-vazir placeholder:text-right' : 'pl-10 pr-4 text-left font-sans placeholder:text-left'} py-3 text-xs outline-none focus:border-cyan-500/50`}
                />

                {countryResults.length > 0 && (
                  <div className={`absolute z-30 left-0 right-0 mt-2 p-1.5 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} space-y-1`}>
                    {countryResults.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          if (!allowedCountries.includes(c.code)) {
                            setAllowedCountries([...allowedCountries, c.code]);
                          }
                          setCountrySearch('');
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${isDarkMode ? 'hover:bg-white/5 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'} ${language === 'fa' ? 'text-right font-vazir' : 'text-left font-sans'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Flag code={c.code} className="w-4 h-3 rounded-sm object-cover" />
                          <span>{language === 'fa' ? c.fa : c.name}</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                {(allowedCountries || []).map((code) => {
                  const countryObj = COUNTRIES?.find(c => c.code === code);
                  return (
                    <div key={code} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                      <Flag code={code} className="w-3.5 h-2.5 rounded-sm object-cover" />
                      <span className={language === 'fa' ? 'font-vazir' : ''}>{language === 'fa' ? countryObj?.fa || code : countryObj?.name || code}</span>
                      <button
                        type="button"
                        onClick={() => setAllowedCountries(allowedCountries.filter(c => c !== code))}
                        className="hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASN Lock Drawer */}
      <AnimatePresence>
        {hasAsnLock && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                  {t.asnNetworkRestriction}
                </label>
                <div className="flex gap-1 p-0.5 rounded-xl bg-zinc-900 border border-white/5" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setAsnMode('block')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${asnMode === 'block' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-zinc-500'}`}
                  >
                    Block
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsnMode('allow')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${asnMode === 'allow' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500'}`}
                  >
                    Allow
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={asnSelected}
                onChange={(e) => setAsnSelected(e.target.value)}
                placeholder="AS15169, AS13335 (comma separated)..."
                dir="ltr"
                className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-2xl p-3 text-xs outline-none focus:border-indigo-500/50 font-mono ${language === 'fa' ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dead Man's Switch Drawer */}
      <AnimatePresence>
        {hasDeadMans && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
                {t.inactivityTriggerInterval}
              </label>
              <div className="grid grid-cols-3 gap-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                {[
                  { label: t.preset24h, sec: 86400 },
                  { label: t.preset7d, sec: 604800 },
                  { label: t.preset30d, sec: 2592000 },
                ].map((preset) => (
                  <button
                    key={preset.sec}
                    type="button"
                    onClick={() => setDeadMansInterval(preset.sec)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      deadMansInterval === preset.sec
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : isDarkMode
                        ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950'
                    } ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Self Destruct Drawer */}
      <AnimatePresence>
        {hasSelfDestruct && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                  {t.maxHidesLimit}
                </label>
                <input
                  type={language === 'fa' ? 'text' : 'number'}
                  min={1}
                  max={10}
                  value={language === 'fa' ? toPersianDigits(selfDestructHides) : selfDestructHides}
                  onChange={(e) => {
                    const eng = toEnglishDigits(e.target.value);
                    setSelfDestructHides(parseInt(eng) || 3);
                  }}
                  dir="ltr"
                  className={`w-16 ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-xl p-2 text-center text-xs ${language === 'fa' ? 'font-vazir' : 'font-mono'} font-bold`}
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <label className={`text-[8px] font-black uppercase tracking-widest text-zinc-500 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
                  {t.destructionTriggerEvents}
                </label>
                <div className="flex gap-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                  {[
                    { id: 'tab', label: t.tabBlur },
                    { id: 'print', label: t.printScreenshot },
                  ].map((trig) => {
                    const active = selfDestructTriggers.includes(trig.id);
                    return (
                      <button
                        key={trig.id}
                        type="button"
                        onClick={() => {
                          if (active) {
                            if (selfDestructTriggers.length > 1) {
                              setSelfDestructTriggers(selfDestructTriggers.filter(t => t !== trig.id));
                            }
                          } else {
                            setSelfDestructTriggers([...selfDestructTriggers, trig.id]);
                          }
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                          active
                            ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : isDarkMode
                            ? 'bg-zinc-900 border-white/5 text-zinc-500'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        } ${language === 'fa' ? 'font-vazir' : ''}`}
                      >
                        {trig.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canary Webhook Drawer */}
      <AnimatePresence>
        {hasCanary && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-2`}>
              <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
                {t.canaryAlertWebhook}
              </label>
              <input
                type="url"
                value={canaryUrl}
                onChange={(e) => setCanaryUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-2xl p-3.5 text-xs outline-none focus:border-blue-500/50 font-mono`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Lock Drawer */}
      <AnimatePresence>
        {hasTimeLock && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`}>
              <DateTimePicker
                value={unlockAt}
                onChange={setUnlockAt}
                isDarkMode={isDarkMode}
                language={language}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Lock & Duress Honeypot Drawer */}
      <AnimatePresence>
        {hasPassword && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-1">
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                id="master-password-input"
                type={showMasterPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value, setPassword, 'master-password-input')}
                onKeyDown={(e) => handlePasswordKeyDown(e, 'master-password-input')}
                disabled={disabledInputs['master-password-input']}
                dir="ltr"
                placeholder={t.passwordPlaceholder || t.masterPasswordPlaceholder}
                className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-sm'} border rounded-2xl pl-10 pr-10 py-3 min-h-[46px] text-xs placeholder:text-[11.5px] sm:placeholder:text-xs outline-none focus:border-emerald-500/50 transition-all text-left placeholder:text-left ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
              />
              <button
                type="button"
                onClick={() => setShowMasterPwd(!showMasterPwd)}
                className="absolute right-3.5 text-zinc-400 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {showMasterPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* HoneyPot Decoy Option Toggle */}
            <div className={`flex justify-start pt-1`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <OptionToggle
                id="toggle-honeypot"
                active={hasHoney}
                onClick={() => setHasHoney(!hasHoney)}
                icon={<HoneyPotIcon className="w-4 h-4" />}
                title={t.honeyPotDecoy}
                isDarkMode={isDarkMode}
                language={language}
                variant="warning"
              />
            </div>

            {hasHoney && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border ${
                  isDarkMode
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-amber-50/50 border-amber-300 text-amber-950'
                } space-y-4`}
                dir={language === 'fa' ? 'rtl' : 'ltr'}
              >
                {/* Honey Decoy Password */}
                <div className="space-y-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider text-amber-500/90 block px-1 ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>
                    {t.honeyDecoyPasswordLabel}
                  </label>
                  <div className="relative flex items-center">
                    <HoneyPotIcon className="w-4 h-4 absolute left-3.5 text-amber-500 pointer-events-none" />
                    <input
                      id="honey-password-input"
                      type={showHoneyPwd ? 'text' : 'password'}
                      value={honeyPwd}
                      onChange={(e) => handlePasswordChange(e.target.value, setHoneyPwd, 'honey-password-input')}
                      onKeyDown={(e) => handlePasswordKeyDown(e, 'honey-password-input')}
                      disabled={disabledInputs['honey-password-input']}
                      dir="ltr"
                      placeholder={t.decoyPasswordPlaceholder}
                      className={`w-full ${
                        isDarkMode
                          ? 'bg-zinc-900/80 border-amber-500/30 text-amber-100 placeholder:text-zinc-500'
                          : 'bg-white border-amber-200 text-amber-950 placeholder:text-zinc-400'
                      } border rounded-full pl-10 pr-10 py-3 min-h-[46px] text-xs outline-none focus:border-amber-500 transition-all text-left placeholder:text-left ${
                        language === 'fa' ? 'font-vazir' : 'font-sans'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowHoneyPwd(!showHoneyPwd)}
                      className="absolute right-3.5 text-amber-500 hover:text-amber-400 p-1 cursor-pointer"
                    >
                      {showHoneyPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Honey Decoy Payload */}
                <div className="space-y-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider text-amber-500/90 block px-1 ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>
                    {t.honeyDecoyPayloadLabel}
                  </label>
                  <textarea
                    value={honeyContent}
                    onChange={(e) => setHoneyContent(e.target.value)}
                    dir={language === 'fa' ? 'rtl' : 'ltr'}
                    placeholder={t.decoyContentPlaceholder}
                    className={`w-full h-24 ${
                      isDarkMode
                        ? 'bg-zinc-900/80 border-amber-500/30 text-amber-100 placeholder:text-zinc-500'
                        : 'bg-white border-amber-200 text-amber-950 placeholder:text-zinc-400'
                    } border rounded-2xl p-3.5 text-xs outline-none resize-none focus:border-amber-500 transition-all ${language === 'fa' ? 'font-vazir text-right placeholder:text-right' : 'text-left placeholder:text-left'}`}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
