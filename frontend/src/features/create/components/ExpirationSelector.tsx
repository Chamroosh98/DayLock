import React from 'react';
import { Flame } from 'lucide-react';
import { Language } from '../../../types';
import { OptionToggle } from '../../../components/OptionToggle';
import { CustomSelect } from '../../../components/CustomSelect';
import { localizeDigitsValue, toEnglishDigits } from '../../../utils/numberConverter';

export interface ExpirationSelectorProps {
  expiresIn: number;
  setExpiresIn: (v: number) => void;
  maxViews: number | '';
  setMaxViews: (v: number | '') => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
}

export const ExpirationSelector: React.FC<ExpirationSelectorProps> = ({
  expiresIn,
  setExpiresIn,
  maxViews,
  setMaxViews,
  isDarkMode,
  language,
  t,
}) => {
  const expirationOptions = [
    { value: 300, label: t.min5 || '5 Minutes' },
    { value: 1800, label: t.min30 || '30 Minutes' },
    { value: 3600, label: t.hour1 || '1 Hour' },
    { value: 43200, label: t.hours12 || '12 Hours' },
    { value: 86400, label: t.day1 || '1 Day' },
    { value: 604800, label: t.days7 || '7 Days' },
    { value: 2592000, label: t.days30 || '30 Days' },
    { value: 0, label: t.never || 'Never' },
  ];

  return (
    <div className="space-y-4">
      {/* Expiration Dropdown & Max Views Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Expiration Select Box */}
        <div className="space-y-1">
          <label className={`text-[10px] font-bold text-zinc-500 block px-1 ${language === 'fa' ? 'text-right font-vazir' : 'text-left'}`}>
            {t.expiresInLabel || t.expiresIn || 'Expires in'}
          </label>
          <CustomSelect
            id="select-expiration-time"
            value={expiresIn}
            onChange={setExpiresIn}
            options={expirationOptions}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
          />
        </div>

        {/* Max Views Limit Box */}
        <div className="space-y-1">
          <label className={`text-[10px] font-bold text-zinc-500 block px-1 ${language === 'fa' ? 'text-right font-vazir' : 'text-left'}`}>
            {t.maxViewsLabel || t.maxViewsLimit || t.maxViews || 'Max views limit'}
          </label>
          <div className={`w-full h-11 px-2.5 flex items-center justify-between rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <button
              type="button"
              onClick={() => setMaxViews(prev => (prev === '' ? 1 : prev + 1))}
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
            >
              <span className="text-base font-light">+</span>
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9۰-۹]*"
              value={maxViews === '' ? '' : localizeDigitsValue(maxViews, language)}
              onChange={(e) => {
                const standardValue = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                const val = standardValue === '' ? '' : parseInt(standardValue, 10);
                if (val === '' || val > 0) setMaxViews(val);
              }}
              placeholder={t.unlimited || 'Unlimited'}
              className={`w-full min-w-0 bg-transparent text-center text-[11.5px] sm:text-xs outline-none font-bold tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}
            />
            <button
              type="button"
              onClick={() => setMaxViews(prev => (prev === '' || prev <= 1) ? '' : prev - 1)}
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
            >
              <span className="text-base font-light">−</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
