import { gregorianToJalali } from './jalaliConverter';

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
