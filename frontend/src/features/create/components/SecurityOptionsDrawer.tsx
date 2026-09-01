import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Globe, Skull, Bird, Clock, ShieldAlert, Shield, Flame, Bomb,
  Search, Eye, EyeOff, Plus, X, AlertCircle, RadioTower, Zap
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
  hasShamir?: boolean;
  setHasShamir?: (v: boolean) => void;
  shamirThreshold?: number;
  setShamirThreshold?: (v: number) => void;
  shamirTotal?: number;
  setShamirTotal?: (v: number) => void;
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
  hasShamir = false,
  setHasShamir,
  shamirThreshold = 3,
  setShamirThreshold,
  shamirTotal = 5,
  setShamirTotal,
  isDarkMode,
  language,
  t,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  const [tempThreshold, setTempThreshold] = React.useState<string>(String(shamirThreshold));
  const [tempTotal, setTempTotal] = React.useState<string>(String(shamirTotal));

  React.useEffect(() => {
    setTempThreshold(String(shamirThreshold));
  }, [shamirThreshold]);

  React.useEffect(() => {
    setTempTotal(String(shamirTotal));
  }, [shamirTotal]);

  const securityCarouselItems: SecurityCarouselCardItem[] = [
    {
      id: 'toggle-password-protection',
      active: hasPassword && !hasShamir,
      onClick: () => {
        if (hasShamir) {
          setHasShamir?.(false);
          setHasPassword(true);
        } else {
          setHasPassword(!hasPassword);
        }
      },
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
    <div id="options-grid" className="space-y-4">
      {/* Mobile: Horizontal Snap Carousel (Zero Truncation, Snap-X Mandatory, Peek-Ahead) */}
      <div className="block sm:hidden">
        <SecuritySnapCarousel
          items={securityCarouselItems}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      {/* Tablet & Desktop: 2-column Compact Grid */}
      <div className="hidden sm:grid grid-cols-2 gap-2.5">
        <OptionToggle
          id="toggle-password-protection"
          active={hasPassword && !hasShamir}
          onClick={() => {
            if (hasShamir) {
              setHasShamir?.(false);
              setHasPassword(true);
            } else {
              setHasPassword(!hasPassword);
            }
          }}
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
              <div className="flex items-center gap-2 px-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.12, 1],
                    filter: ["drop-shadow(0 0 0px rgba(6,182,212,0))", "drop-shadow(0 0 8px rgba(6,182,212,0.8))", "drop-shadow(0 0 0px rgba(6,182,212,0))"]
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="w-4 h-4 text-cyan-400 flex items-center justify-center shrink-0"
                >
                  <Globe className="w-4 h-4" />
                </motion.div>
                <label className={`font-bold text-cyan-400 dark:text-cyan-300 block ${language === 'fa' ? 'font-vazir text-right text-[11px] sm:text-xs' : 'text-[11px] sm:text-xs tracking-wide'}`}>
                  {t.allowedGeoLocations}
                </label>
              </div>

              <div className="space-y-2">
                <div className="relative w-full">
                  <Search className={`w-3.5 h-3.5 md:w-4 md:h-4 absolute top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none ${language === 'fa' ? 'right-2.5 sm:right-3' : 'left-2.5 sm:left-3'}`} />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={t.searchCountry}
                    dir={language === 'fa' ? 'rtl' : 'ltr'}
                    className={`w-full h-8 sm:h-9 md:h-10 ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-xl sm:rounded-2xl ${language === 'fa' ? 'pr-7.5 sm:pr-8.5 pl-3 text-right font-vazir placeholder:text-right text-[10px] sm:text-[11px] md:text-xs placeholder:text-[9.5px] sm:placeholder:text-[10px] md:placeholder:text-[11px]' : 'pl-7.5 sm:pl-8.5 pr-3 text-left font-sans placeholder:text-left text-[10px] sm:text-[11px] md:text-xs placeholder:text-[9.5px] sm:placeholder:text-[10.5px] md:placeholder:text-[11.5px]'} outline-none focus:border-cyan-500/50 transition-all`}
                  />
                </div>

                {countryResults.length > 0 && (
                  <div className={`max-h-44 overflow-y-auto p-1.5 rounded-xl border shadow-inner ${isDarkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-zinc-50 border-zinc-200'} space-y-1 scrollbar-thin`}>
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
                        className={`w-full p-2 sm:p-2.5 rounded-lg flex items-center justify-between text-[11px] sm:text-xs transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-zinc-200' : 'hover:bg-white text-zinc-800 shadow-xs'} ${language === 'fa' ? 'text-right font-vazir' : 'text-left font-sans'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Flag code={c.code} emoji={c.flag} className="w-4 h-3 rounded-xs object-cover shrink-0" />
                          <span className="font-medium">{language === 'fa' ? c.fa : c.name}</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                {(allowedCountries || []).map((code) => {
                  const countryObj = COUNTRIES?.find(c => c.code === code);
                  return (
                    <div key={code} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-[13px] font-medium">
                      <Flag code={code} emoji={countryObj?.flag} className="w-3.5 h-2.5 rounded-sm object-cover" />
                      <span className={language === 'fa' ? 'font-vazir' : ''}>{language === 'fa' ? countryObj?.fa || code : countryObj?.name || code}</span>
                      <button
                        type="button"
                        onClick={() => setAllowedCountries(allowedCountries.filter(c => c !== code))}
                        className="hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
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
              <div className="flex items-center gap-2 px-1">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.15, 1],
                    filter: ["drop-shadow(0 0 0px rgba(99,102,241,0))", "drop-shadow(0 0 8px rgba(99,102,241,0.8))", "drop-shadow(0 0 0px rgba(99,102,241,0))"]
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-4 h-4 text-indigo-400 flex items-center justify-center shrink-0"
                >
                  <RadioTower className="w-4 h-4" />
                </motion.div>
                <label className={`text-[11px] sm:text-xs font-bold text-indigo-400 dark:text-indigo-300 ${language === 'fa' ? 'font-vazir text-right' : 'tracking-wide'}`}>
                  {t.asnNetworkRestriction}
                </label>
              </div>

              <div className={`flex gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-zinc-200'} border w-full sm:w-fit transition-colors`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  onClick={() => setAsnMode('block')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-all text-center ${language === 'fa' ? 'font-vazir' : ''} ${
                    asnMode === 'block'
                      ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30 shadow-sm'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {t.asnBlock}
                </button>
                <button
                  type="button"
                  onClick={() => setAsnMode('allow')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 sm:py-1 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-all text-center ${language === 'fa' ? 'font-vazir' : ''} ${
                    asnMode === 'allow'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {t.asnAllow}
                </button>
              </div>

              <input
                type="text"
                value={asnSelected}
                onChange={(e) => setAsnSelected(e.target.value)}
                placeholder="AS15169, AS13335 (comma separated)..."
                dir="ltr"
                className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-2xl p-3 text-xs sm:text-sm placeholder:text-[10.5px] sm:placeholder:text-xs outline-none focus:border-indigo-500/50 ${asnSelected ? 'font-mono' : 'font-sans'} text-left placeholder:text-left`}
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
              <div className="flex items-center gap-2 px-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <motion.div 
                  animate={{ 
                  scale: [1, 1.15, 1],
                  filter: ["drop-shadow(0 0 0px rgba(239,68,68,0))", "drop-shadow(0 0 10px rgba(239,68,68,0.8))", "drop-shadow(0 0 0px rgba(239,68,68,0))"]
                  }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="w-4 h-4 text-red-400 flex items-center justify-center shrink-0"
                >
                  <Skull className="w-4 h-4" />
                </motion.div>
                <label className={`text-[11px] sm:text-xs font-bold text-red-400 dark:text-red-300 ${language === 'fa' ? 'font-vazir text-right' : 'tracking-wide'}`}>
                  {t.inactivityTriggerInterval}
                </label>
              </div>
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
                    className={`py-2 px-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center leading-tight min-h-[44px] ${
                      deadMansInterval === preset.sec
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-sm'
                        : isDarkMode
                        ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950'
                    } ${language === 'fa' ? 'font-vazir' : 'font-sans'}`}
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
            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-[24px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              {/* Row 1: Max Hides Limit */}
              <div className="flex items-center justify-between gap-2" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.18, 1],
                      filter: ["drop-shadow(0 0 0px rgba(239,68,68,0))", "drop-shadow(0 0 10px rgba(239,68,68,0.9))", "drop-shadow(0 0 0px rgba(239,68,68,0))"]
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    className="w-4 h-4 text-red-400 flex items-center justify-center shrink-0"
                  >
                    <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.div>
                  <label className={`text-[10px] sm:text-[11px] md:text-xs font-bold text-red-400 dark:text-red-300 truncate whitespace-nowrap ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                    {t.maxHidesLimit}
                  </label>
                </div>
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
                  className={`w-11 sm:w-13 h-7 sm:h-8 ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-lg sm:rounded-xl px-1.5 text-center text-[10.5px] sm:text-[11px] ${language === 'fa' ? 'font-vazir' : 'font-mono'} font-bold shrink-0`}
                />
              </div>

              {/* Row 2: Destruction Trigger Events */}
              <div className={`space-y-2 pt-2.5 border-t ${isDarkMode ? 'border-white/10' : 'border-zinc-200/80'}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-4 h-4 text-zinc-400 flex items-center justify-center shrink-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.div>
                  <label className={`text-[9.5px] sm:text-[10.5px] md:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ${language === 'fa' ? 'font-vazir text-right' : ''}`}>
                    {t.destructionTriggerEvents}
                  </label>
                </div>
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
                        className={`flex-1 py-1.5 px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-semibold leading-tight border transition-all cursor-pointer text-center flex items-center justify-center min-h-[34px] sm:min-h-[36px] ${
                          active
                            ? 'bg-red-500/20 border-red-500/30 text-red-400 shadow-sm'
                            : isDarkMode
                            ? 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
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
            <div className={`p-5 rounded-[28px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-3`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2 px-1">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.15, 1],
                    filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 8px rgba(59,130,246,0.8))", "drop-shadow(0 0 0px rgba(59,130,246,0))"]
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="w-4 h-4 text-blue-400 flex items-center justify-center shrink-0"
                >
                  <Bird className="w-4 h-4" />
                </motion.div>
                <label className={`text-[11px] sm:text-xs font-bold text-blue-400 dark:text-blue-300 ${language === 'fa' ? 'font-vazir text-right' : 'tracking-wide'}`}>
                  {t.canaryAlertWebhook}
                </label>
              </div>
              <input
                type="url"
                value={canaryUrl}
                onChange={(e) => setCanaryUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                dir="ltr"
                className={`w-full ${isDarkMode ? 'bg-zinc-900 border-white/10 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'} border rounded-2xl p-3.5 text-xs sm:text-sm placeholder:text-[10.5px] sm:placeholder:text-xs outline-none focus:border-blue-500/50 ${canaryUrl ? 'font-mono' : 'font-sans'} text-left placeholder:text-left`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Lock Drawer */}
      <AnimatePresence>
        {hasTimeLock && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
            <DateTimePicker
              value={unlockAt}
              onChange={setUnlockAt}
              isDarkMode={isDarkMode}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Lock & Duress Honeypot / Shamir Multi-Custody Drawer */}
      <AnimatePresence>
        {(hasPassword || hasShamir) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-1">
            {!hasShamir && (
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
            )}

            {/* Sub-Options: HoneyPot Decoy & Shamir Secret Sharing */}
            <div className="grid grid-cols-2 gap-2.5 pt-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
              <OptionToggle
                id="toggle-honeypot"
                active={hasHoney && !hasShamir}
                onClick={() => {
                  if (hasShamir) {
                    setHasShamir?.(false);
                    setHasPassword(true);
                  }
                  setHasHoney(!hasHoney);
                }}
                icon={<HoneyPotIcon className="w-4 h-4" />}
                title={t.honeyPotDecoy}
                isDarkMode={isDarkMode}
                language={language}
                variant="warning"
              />
              <OptionToggle
                id="toggle-shamir-lock"
                active={hasShamir}
                onClick={() => {
                  const nextShamir = !hasShamir;
                  setHasShamir?.(nextShamir);
                  if (nextShamir) {
                    setHasPassword(false);
                    setPassword('');
                    setHasHoney(false);
                  } else {
                    setHasPassword(true);
                  }
                }}
                icon={<Zap className="w-4 h-4" />}
                title={t.shamirLock || 'Shamir'}
                isDarkMode={isDarkMode}
                language={language}
                variant="purple"
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
                  <label className={`text-[10px] sm:text-[11px] font-bold text-amber-500 block px-1 ${language === 'fa' ? 'font-vazir text-right' : 'text-left tracking-wider uppercase'}`}>
                    {t.honeyDecoyPasswordLabel}
                  </label>
                  <div className="relative flex items-center">
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
                      } border rounded-full pl-4 pr-10 py-3 min-h-[46px] text-xs outline-none focus:border-amber-500 transition-all text-left placeholder:text-left placeholder:text-[10px] sm:placeholder:text-[11px] ${
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
                  <label className={`text-[10px] sm:text-[11px] font-bold text-amber-500 block px-1 ${language === 'fa' ? 'font-vazir text-right' : 'text-left tracking-wider uppercase'}`}>
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
                    } border rounded-2xl p-3.5 text-xs outline-none resize-none focus:border-amber-500 transition-all placeholder:text-[10px] sm:placeholder:text-[11px] ${language === 'fa' ? 'font-vazir text-right placeholder:text-right' : 'text-left placeholder:text-left'}`}
                  />
                </div>
              </motion.div>
            )}

            {/* Shamir Secret Sharing Configuration */}
            {hasShamir && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-[28px] border ${
                  isDarkMode ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50/50 border-purple-300 text-purple-950'
                } space-y-4`}
                dir={language === 'fa' ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-2 px-1" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      filter: [
                        'drop-shadow(0 0 0px rgba(168,85,247,0))',
                        'drop-shadow(0 0 8px rgba(168,85,247,0.8))',
                        'drop-shadow(0 0 0px rgba(168,85,247,0))',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="w-4 h-4 text-purple-400 flex items-center justify-center shrink-0"
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                      }`}
                    >
                      {t.shamirLock || 'Shamir'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      {t.shamirLockDesc || 'Multi-Party threshold custody protection'}
                    </span>
                  </div>
                </div>

                {/* Threshold (K) and Total Shares (N) Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      className={`text-[10px] sm:text-[11px] font-bold text-purple-400 block px-1 ${
                        language === 'fa' ? 'font-vazir text-right' : 'text-left tracking-wider uppercase'
                      }`}
                    >
                      {t.shamirThresholdLabel || 'THRESHOLD (K)'}
                    </label>
                    <input
                      type="text"
                      value={language === 'fa' ? toPersianDigits(tempThreshold) : tempThreshold}
                      onChange={(e) => {
                        const raw = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                        setTempThreshold(raw);
                        if (raw !== '') {
                          const num = parseInt(raw, 10);
                          if (!isNaN(num) && num >= 2 && num <= (shamirTotal || 20)) {
                            setShamirThreshold?.(num);
                          }
                        }
                      }}
                      onBlur={() => {
                        const num = parseInt(tempThreshold, 10);
                        const validTotal = shamirTotal || 5;
                        let finalVal = 3;
                        if (isNaN(num) || num < 2) {
                          finalVal = 2;
                        } else if (num > validTotal) {
                          finalVal = validTotal;
                        } else {
                          finalVal = num;
                        }
                        setTempThreshold(String(finalVal));
                        setShamirThreshold?.(finalVal);
                      }}
                      className={`w-full ${
                        isDarkMode
                          ? 'bg-zinc-900/80 border-purple-500/30 text-purple-200 placeholder:text-zinc-500'
                          : 'bg-white border-purple-200 text-purple-950 placeholder:text-zinc-400'
                      } border rounded-full px-4 py-3 min-h-[46px] text-xs font-mono text-center outline-none focus:border-purple-500 transition-all ${
                        language === 'fa' ? 'font-vazir' : 'font-sans'
                      }`}
                    />
                    <span className="text-[9px] text-zinc-500 block px-2">
                      {t.shamirThresholdHint || 'Minimum shares required to decrypt'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className={`text-[10px] sm:text-[11px] font-bold text-purple-400 block px-1 ${
                        language === 'fa' ? 'font-vazir text-right' : 'text-left tracking-wider uppercase'
                      }`}
                    >
                      {t.shamirTotalLabel || 'TOTAL SHARES (N)'}
                    </label>
                    <input
                      type="text"
                      value={language === 'fa' ? toPersianDigits(tempTotal) : tempTotal}
                      onChange={(e) => {
                        const raw = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                        setTempTotal(raw);
                        if (raw !== '') {
                          const num = parseInt(raw, 10);
                          if (!isNaN(num) && num >= 2 && num <= 20) {
                            setShamirTotal?.(num);
                            if (shamirThreshold && shamirThreshold > num) {
                              setShamirThreshold?.(num);
                              setTempThreshold(String(num));
                            }
                          }
                        }
                      }}
                      onBlur={() => {
                        const num = parseInt(tempTotal, 10);
                        let finalVal = 5;
                        if (isNaN(num) || num < 2) {
                          finalVal = 2;
                        } else if (num > 20) {
                          finalVal = 20;
                        } else {
                          finalVal = num;
                        }
                        setTempTotal(String(finalVal));
                        setShamirTotal?.(finalVal);
                        if (shamirThreshold && shamirThreshold > finalVal) {
                          setShamirThreshold?.(finalVal);
                          setTempThreshold(String(finalVal));
                        }
                      }}
                      className={`w-full ${
                        isDarkMode
                          ? 'bg-zinc-900/80 border-purple-500/30 text-purple-200 placeholder:text-zinc-500'
                          : 'bg-white border-purple-200 text-purple-950 placeholder:text-zinc-400'
                      } border rounded-full px-4 py-3 min-h-[46px] text-xs font-mono text-center outline-none focus:border-purple-500 transition-all ${
                        language === 'fa' ? 'font-vazir' : 'font-sans'
                      }`}
                    />
                    <span className="text-[9px] text-zinc-500 block px-2">
                      {t.shamirTotalHint || 'Total shares to generate and distribute'}
                    </span>
                  </div>
                </div>

                {/* Informational description box */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    isDarkMode
                      ? 'bg-purple-950/20 border-purple-500/20 text-purple-300'
                      : 'bg-purple-50 border-purple-200 text-purple-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Zap className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                    <span className={`text-[11px] leading-relaxed ${language === 'fa' ? 'font-vazir' : ''}`}>
                      {t.shamirSharesDesc
                        ?.replace('{k}', language === 'fa' ? toPersianDigits(shamirThreshold) : String(shamirThreshold))
                        ?.replace('{n}', language === 'fa' ? toPersianDigits(shamirTotal) : String(shamirTotal)) ||
                        `Distribute each share to a trusted custodian. Any ${shamirThreshold} of ${shamirTotal} shares will be required to decrypt.`}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
