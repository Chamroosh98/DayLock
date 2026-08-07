import { gregorianToJalali } from './jalaliConverter';
import { localizeDigitsValue } from './numberConverter';

export const formatExpirationDate = (expiresAtSeconds: number, lang: 'en' | 'fa') => {
  if (!expiresAtSeconds) return '—';
  const d = new Date(expiresAtSeconds * 1000);
  if (isNaN(d.getTime())) return '—';
  if (lang === 'fa') {
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jy}/${jm}/${jd} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return `${d.toLocaleDateString()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatTime = (seconds: number, language: 'en' | 'fa') => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  return localizeDigitsValue(formatted, language);
};

export const getAutoDir = (text: string, language: 'en' | 'fa' = 'en') => {
  if (!text) return language === 'fa' ? 'rtl' : 'ltr';
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRange.test(text) ? 'rtl' : 'ltr';
};

export const getAutoContainerClass = (text: string, language: 'en' | 'fa' = 'en') => {
  const dir = getAutoDir(text, language);
  const fontClass = dir === 'rtl' ? 'font-vazir' : 'font-sans';
  const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';
  return `${fontClass} ${alignClass}`;
};

export const isAsciiChar = (char: string) => {
  const code = char.charCodeAt(0);
  return code >= 32 && code <= 126;
};
