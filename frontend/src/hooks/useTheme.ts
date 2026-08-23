import { useThemeContext, ThemeContextType } from '../context/ThemeContext';

/**
 * Custom hook to access application theme state, setter, and toggle functions.
 */
export function useTheme(): ThemeContextType {
  return useThemeContext();
}
