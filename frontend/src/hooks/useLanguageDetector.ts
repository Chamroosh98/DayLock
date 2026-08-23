import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import {
  getInitialLanguage,
  persistLanguage,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage
} from '../utils/languageDetector';

export interface UseLanguageDetectorReturn {
  language: Language;
  setLanguage: (lang: Language | ((prev: Language) => Language)) => void;
  isRtl: boolean;
}

/**
 * Custom hook to manage auto-detected, persisted language state with seamless updates.
 */
export function useLanguageDetector(): UseLanguageDetectorReturn {
  // Synchronous initialization to prevent screen flicker
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage());

  const setLanguage = useCallback((update: Language | ((prev: Language) => Language)) => {
    setLanguageState((prevLang) => {
      const nextLang = typeof update === 'function' ? update(prevLang) : update;
      if (isSupportedLanguage(nextLang)) {
        persistLanguage(nextLang);
        return nextLang;
      }
      return prevLang;
    });
  }, []);

  // Listen for storage events (e.g. cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && isSupportedLanguage(e.newValue)) {
        setLanguageState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    language,
    setLanguage,
    isRtl: language === 'fa',
  };
}
