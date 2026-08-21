import React, { createContext, useContext, useState, useEffect } from 'react';
import { driver } from 'driver.js';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useThemeContext } from './ThemeContext';

interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: Record<string, any>;
  dir: 'rtl' | 'ltr';
  startTour: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');
  const { isDarkMode } = useThemeContext();

  useEffect(() => {
    if (language === 'fa') {
      document.documentElement.classList.add('lang-fa');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.classList.remove('lang-fa');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  const t = translations[language] || translations.en;
  const dir: 'rtl' | 'ltr' = language === 'fa' ? 'rtl' : 'ltr';

  const startTour = () => {
    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: isDarkMode ? '#030409' : '#f4f4f5',
      overlayOpacity: 0.85,
      stagePadding: 6,
      popoverClass: `${isDarkMode ? 'driver-popover-dark' : 'driver-popover-light'} ${language === 'fa' ? 'lang-fa' : ''}`,
      nextBtnText: t.tourNext,
      prevBtnText: t.tourPrev,
      doneBtnText: t.tourDone,
      steps: [
        { 
          element: '#content-type-selector', 
          popover: { 
            title: t.tourPayloadFormatsTitle, 
            description: t.tourPayloadFormatsDesc,
            side: "bottom", 
            align: language === 'fa' ? 'end' : 'start' 
          } 
        },
        { 
          element: '#options-grid', 
          popover: { 
            title: t.tourOperationalControlsTitle, 
            description: t.tourOperationalControlsDesc,
            side: "top", 
            align: language === 'fa' ? 'end' : 'start' 
          } 
        },
        { 
          element: '#toggle-honeypot', 
          popover: { 
            title: t.tourHoneypotTitle, 
            description: t.tourHoneypotDesc,
            side: "top", 
            align: language === 'fa' ? 'end' : 'start' 
          } 
        }
      ]
    });
    d.drive();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, startTour }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};
