import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { ModalProvider } from './ModalContext';
import { SecurityProvider } from './SecurityContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ModalProvider>
          <SecurityProvider>
            {children}
          </SecurityProvider>
        </ModalProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
