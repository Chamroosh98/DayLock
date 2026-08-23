export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'app_theme';
export const LEGACY_THEME_STORAGE_KEY = 'theme';

/**
 * Checks if a string is a valid ThemePreference.
 */
export function isValidThemePreference(val: unknown): val is ThemePreference {
  return val === 'light' || val === 'dark' || val === 'system';
}

/**
 * Checks if a string is a resolved theme ('light' | 'dark').
 */
export function isResolvedTheme(val: unknown): val is ResolvedTheme {
  return val === 'light' || val === 'dark';
}

/**
 * Gets user theme preference from localStorage.
 * Checks 'app_theme' first, falling back to legacy 'theme' if available.
 */
export function getStoredThemePreference(): ThemePreference | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemePreference(stored)) {
      return stored;
    }
    // Fallback to legacy key
    const legacy = window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (isValidThemePreference(legacy)) {
      return legacy;
    }
  } catch (error) {
    console.warn('[ThemeDetector] Unable to read theme from localStorage:', error);
  }
  return null;
}

/**
 * Queries the current system/OS color scheme preference.
 */
export function getSystemTheme(): ResolvedTheme {
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (error) {
    console.warn('[ThemeDetector] Unable to check matchMedia:', error);
  }
  return 'dark'; // Sensible default
}

/**
 * Resolves a ThemePreference ('light' | 'dark' | 'system') to actual 'light' | 'dark'.
 */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

/**
 * Applies the resolved theme to the DOM (class on documentElement and data-theme).
 * Executes immediately to prevent FOUC / visual flash.
 */
export function applyThemeToDOM(theme: ResolvedTheme): void {
  try {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  } catch (error) {
    console.warn('[ThemeDetector] Unable to apply theme to DOM:', error);
  }
}

/**
 * Persists theme preference to localStorage.
 */
export function persistThemePreference(preference: ThemePreference): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage && isValidThemePreference(preference)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      // Keep legacy key synced for maximum compatibility
      const resolved = resolveTheme(preference);
      window.localStorage.setItem(LEGACY_THEME_STORAGE_KEY, resolved);
    }
  } catch (error) {
    console.warn('[ThemeDetector] Unable to persist theme preference:', error);
  }
}

/**
 * Synchronously computes initial theme state:
 * 1. Checks localStorage for saved 'app_theme' / 'theme'
 * 2. If 'system' or absent, detects OS preference via matchMedia
 * 3. Applies class to DOM immediately
 */
export function getInitialThemeState(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  isDarkMode: boolean;
} {
  const stored = getStoredThemePreference();
  const preference: ThemePreference = stored || 'system';
  const resolved = resolveTheme(preference);
  
  // Apply to DOM immediately
  applyThemeToDOM(resolved);

  return {
    preference,
    resolved,
    isDarkMode: resolved === 'dark'
  };
}
