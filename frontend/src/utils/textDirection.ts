import { Language } from '../types';

/**
 * Dynamic bidirectional text direction detection helper
 */
export const getAutoDir = (text: string, language?: Language): 'rtl' | 'ltr' => {
  if (!text) return language === 'fa' ? 'rtl' : 'ltr';
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRange.test(text) ? 'rtl' : 'ltr';
};

/**
 * Returns container font and alignment classes based on text direction
 */
export const getAutoContainerClass = (text: string, language?: Language): string => {
  const dir = getAutoDir(text, language);
  const fontClass = dir === 'rtl' ? 'font-vazir' : 'font-sans';
  const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';
  return `${fontClass} ${alignClass}`;
};
