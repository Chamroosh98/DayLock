import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ThemePreference,
  ResolvedTheme,
  getInitialThemeState,
  getSystemTheme,
  resolveTheme,
  applyThemeToDOM,
  persistThemePreference,
  THEME_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
  isValidThemePreference
} from '../utils/themeDetector';

export interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isDarkMode: boolean;
  setTheme: (theme: ThemePreference) => void;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize state based on storage / system preferences with no flash
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const init = getInitialThemeState();
    return init.preference;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const init = getInitialThemeState();
    return init.resolved;
  });

  // Apply theme to DOM and keep state synchronized
  const applyAndSetResolved = useCallback((nextTheme: ThemePreference) => {
    const nextResolved = resolveTheme(nextTheme);
    setResolvedTheme(nextResolved);
    applyThemeToDOM(nextResolved);
  }, []);

  // Update theme preference and persist to localStorage
  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    persistThemePreference(newTheme);
    applyAndSetResolved(newTheme);
  }, [applyAndSetResolved]);

  // Backward-compatible toggleTheme
  const toggleTheme = useCallback(() => {
    const currentResolved = resolveTheme(theme);
    const nextTheme: ThemePreference = currentResolved === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  // Backward-compatible setIsDarkMode
  const setIsDarkMode = useCallback<React.Dispatch<React.SetStateAction<boolean>>>((action) => {
    const currentResolved = resolveTheme(theme);
    const currentIsDark = currentResolved === 'dark';
    const nextIsDark = typeof action === 'function' ? action(currentIsDark) : action;
    const nextTheme: ThemePreference = nextIsDark ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  // Real-time OS Theme Syncing (Listener)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      // Only react if user is using 'system' preference or no explicit preference
      if (theme === 'system') {
        const nextResolved = getSystemTheme();
        setResolvedTheme(nextResolved);
        applyThemeToDOM(nextResolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  // Cross-tab sync for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === THEME_STORAGE_KEY || e.key === LEGACY_THEME_STORAGE_KEY) &&
        isValidThemePreference(e.newValue)
      ) {
        const nextTheme = e.newValue as ThemePreference;
        setThemeState(nextTheme);
        applyAndSetResolved(nextTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyAndSetResolved]);

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isDarkMode,
        setTheme,
        setIsDarkMode,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Convenient alias
export const useTheme = useThemeContext;
