import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import WorldMap from './WorldMap';
import { PasteExpiryChart } from './PasteExpiryChart';
import { Language } from '../types';

export interface NetworkMapCardProps {
  isDarkMode: boolean;
  language?: Language;
  setStatus?: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const NetworkMapCard: React.FC<NetworkMapCardProps> = ({ isDarkMode, language = 'en', setStatus }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-7 flex flex-col gap-4"
    >
      <div
        className={`flex-1 ${
          isDarkMode
            ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50'
            : 'bg-white border-zinc-200 shadow-xl'
        } backdrop-blur-2xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col relative group transition-all duration-700`}
      >
        {/* Map Header */}
        <div dir="ltr" className="p-4 sm:p-8 pb-3 sm:pb-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 ${
                isDarkMode ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-100'
              } border rounded-2xl shadow-inner`}
            >
              <ShieldAlert
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                } animate-pulse`}
              />
              <span
                className={`text-[8px] sm:text-[9px] font-mono ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                } font-black uppercase tracking-widest`}
              >
                SOS: HELP IRAN
              </span>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="flex-1 relative min-h-[280px] xs:min-h-[320px] sm:min-h-[380px] lg:min-h-[480px] flex items-center justify-center">
          <div
            className={`absolute inset-0 ${
              isDarkMode ? 'opacity-60 group-hover:opacity-80' : 'opacity-60 group-hover:opacity-80'
            } transition-opacity duration-1000`}
          >
            <WorldMap isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>

      {/* D3.js Paste Expiration Metrics Bar Chart Component */}
      <PasteExpiryChart isDarkMode={isDarkMode} language={language} setStatus={setStatus} />
    </motion.div>
  );
};
