import { useState, useEffect } from 'react';
import { Language } from '../types';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('fa');

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    if (language === 'fa') {
      document.documentElement.classList.add('lang-fa');
    } else {
      document.documentElement.classList.remove('lang-fa');
    }
  }, [language]);

  return { language, setLanguage };
}
