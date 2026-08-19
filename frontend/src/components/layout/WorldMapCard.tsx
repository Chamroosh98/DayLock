import React from 'react';
import { motion } from 'motion/react';
import WorldMap from '../WorldMap';
import { MapHeaderBadge } from './MapHeaderBadge';

interface WorldMapCardProps {
  isDarkMode: boolean;
}

export const WorldMapCard: React.FC<WorldMapCardProps> = ({ isDarkMode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-7 flex flex-col"
    >
      <div className={`flex-1 ${isDarkMode ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl'} backdrop-blur-2xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col relative group transition-all duration-700`}>
        {/* Map Header */}
        <MapHeaderBadge isDarkMode={isDarkMode} />

        {/* Map Component */}
        <div className="flex-1 relative min-h-[280px] xs:min-h-[320px] sm:min-h-[450px] lg:min-h-[650px] flex items-center justify-center">
          <div className={`absolute inset-0 ${isDarkMode ? 'opacity-60 group-hover:opacity-80' : 'opacity-60 group-hover:opacity-80'} transition-opacity duration-1000`}>
            <WorldMap isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
