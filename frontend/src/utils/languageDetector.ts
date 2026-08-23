import { Language } from '../types';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export const SUPPORTED_LANGUAGES: readonly Language[] = ['fa', 'en', 'ru', 'zh'] as const;

export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Checks if a given string is one of the supported application languages.
 */
export function isSupportedLanguage(lang: string | null | undefined): lang is Language {
  return typeof lang === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

/**
 * Parses and sanitizes a language tag (e.g. "fa-IR", "en-US", "zh_CN", "ru")
 * to standard ISO-639-1 two-letter code.
 */
export function parseLanguageCode(tag: string | null | undefined): string {
  if (!tag) return '';
  return tag.trim().toLowerCase().split(/[-_]/)[0];
}

/**
 * Reads user language preference from localStorage.
 */
export function getStoredLanguage(): Language | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('[LanguageDetector] Unable to read language from localStorage:', error);
  }
  return null;
}

/**
 * Detects language from browser navigator preferences (navigator.languages / navigator.language).
 * Checks primary and fallback language tags in order of priority.
 */
export function detectBrowserLanguage(): Language | null {
  try {
    if (typeof navigator === 'undefined') return null;

    // Collect all candidate tags from navigator.languages and navigator.language
    const candidates: string[] = [];
    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages);
    }
    if (navigator.language) {
      candidates.push(navigator.language);
    }

    for (const rawTag of candidates) {
      const code = parseLanguageCode(rawTag);
      if (isSupportedLanguage(code)) {
        return code;
      }
    }
  } catch (error) {
    console.warn('[LanguageDetector] Unable to detect browser language:', error);
  }
  return null;
}

/**
 * Determines the initial language for the app synchronously:
 * 1. Checks localStorage for a valid saved preference ('app_language').
 * 2. If absent, detects matching browser language from navigator.
 * 3. If unsupported or absent, falls back to English ('en').
 */
export function getInitialLanguage(): Language {
  // 1. Check persisted preference
  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }

  // 2. Detect browser language
  const detected = detectBrowserLanguage();
  if (detected) {
    return detected;
  }

  // 3. Strict fallback to English
  return DEFAULT_LANGUAGE;
}

/**
 * Persists user's language selection to localStorage.
 */
export function persistLanguage(lang: Language): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage && isSupportedLanguage(lang)) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  } catch (error) {
    console.warn('[LanguageDetector] Unable to save language to localStorage:', error);
  }
}
