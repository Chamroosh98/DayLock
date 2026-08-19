import React from 'react';
import { motion } from 'motion/react';
import { Globe, Clock, Skull, Flame } from 'lucide-react';
import { COUNTRIES, Flag } from '../../../data/countries';
import { Language } from '../../../types';
import { ViewErrorState } from '../types';

interface ViewErrorCardProps {
  viewError: ViewErrorState;
  setViewError: (err: ViewErrorState | null) => void;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  onTerminate?: () => void;
}

export const ViewErrorCard: React.FC<ViewErrorCardProps> = ({
  viewError,
  setViewError,
  isDarkMode,
  language,
  t,
  onTerminate,
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {viewError.type === 'geo' && (
        <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'} flex flex-col items-center gap-4 text-center`}>
          <Globe className="w-12 h-12 text-blue-500" />
          <h3 className="text-lg font-black uppercase tracking-widest text-blue-500">{t.geoBlocked}</h3>
          <p className="text-xs text-zinc-500">{t.yourCountry}: <span className="font-bold text-red-500">{viewError.data.your_country}</span></p>
          <div className="flex flex-wrap justify-center gap-2">
            {(viewError.data.allowed_countries || []).map((cc: string) => {
              const c = COUNTRIES?.find(x => x.code === cc);
              return (
                <span key={cc} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center gap-2">
                  <Flag code={cc} emoji={c?.flag || ''} />
                  <span>✓ {cc}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {viewError.type === 'time' && (
        <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'} flex flex-col items-center gap-4 text-center`}>
          <Clock className="w-12 h-12 text-purple-500" />
          <h3 className="text-lg font-black uppercase tracking-widest text-purple-500">{t.timeLocked}</h3>
          <p className="text-xs text-zinc-500">{t.unlockAt}: <span className="font-bold">{new Date(viewError.data.unlock_at * 1000).toLocaleString()}</span></p>
        </div>
      )}
      {viewError.type === 'dms' && (
        <div className={`p-10 rounded-[32px] border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} flex flex-col items-center gap-4 text-center`}>
          <Skull className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-black uppercase tracking-widest text-red-500">{t.deadMansTriggered}</h3>
          <p className="text-xs text-zinc-500">Content deleted due to inactivity.</p>
        </div>
      )}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTerminate) {
            onTerminate();
          } else {
            setViewError(null);
          }
        }} 
        className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isDarkMode 
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
        }`}
      >
        <Flame className="w-4 h-4 animate-pulse" />
        <span>{t.terminate}</span>
      </motion.button>
    </motion.div>
  );
};
