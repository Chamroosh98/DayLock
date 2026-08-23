import React from 'react';
import { Lock } from 'lucide-react';
import { translations } from '../../data/translations';
import { Language } from '../../types';

interface ScreenshotBlockOverlayProps {
  visible: boolean;
  language: Language;
}

export const ScreenshotBlockOverlay: React.FC<ScreenshotBlockOverlayProps> = ({ visible, language }) => {
  if (!visible) return null;
  const t = translations[language] || translations.en;

  return (
    <div 
      dir={language === 'fa' ? 'rtl' : 'ltr'} 
      className={`fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex items-center justify-center ${
        language === 'fa' ? 'font-vazir' : 'font-sans'
      }`}
    >
      <div className="text-center p-6 text-zinc-100 max-w-md">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-lg font-black uppercase tracking-wider">
          {t.screenshotShieldTitle || 'Screenshot Shield Triggered'}
        </h2>
        <p className="text-xs text-zinc-400 mt-2">
          {t.screenshotShieldDesc || 'Display temporarily hidden!'}
        </p>
      </div>
    </div>
  );
};
