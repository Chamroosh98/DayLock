import { useCallback } from 'react';
import { Language } from '../types';

export function useTextDirection(language: Language) {
  const getAutoDir = useCallback((text: string): 'rtl' | 'ltr' => {
    if (!text) return language === 'fa' ? 'rtl' : 'ltr';
    const arabicRange = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRange.test(text) ? 'rtl' : 'ltr';
  }, [language]);

  const getAutoContainerClass = useCallback((text: string): string => {
    const dir = getAutoDir(text);
    const fontClass = dir === 'rtl' ? 'font-vazir' : 'font-sans';
    const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';
    return `${fontClass} ${alignClass}`;
  }, [getAutoDir]);

  return { getAutoDir, getAutoContainerClass };
}
