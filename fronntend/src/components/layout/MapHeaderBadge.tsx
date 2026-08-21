import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MapHeaderBadgeProps {
  isDarkMode: boolean;
}

export const MapHeaderBadge: React.FC<MapHeaderBadgeProps> = ({ isDarkMode }) => {
  return (
    <div dir="ltr" className="p-4 sm:p-8 pb-3 sm:pb-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 ${isDarkMode ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-100'} border rounded-2xl shadow-inner`}>
          <ShieldAlert className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} animate-pulse`} />
          <span className={`text-[8px] sm:text-[9px] font-mono ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-black uppercase tracking-widest`}>
            SOS: HELP IRAN
          </span>
        </div>
      </div>
    </div>
  );
};
