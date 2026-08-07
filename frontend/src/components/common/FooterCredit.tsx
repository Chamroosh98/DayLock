import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface FooterCreditProps {
  isDarkMode: boolean;
}

export const FooterCredit: React.FC<FooterCreditProps> = ({ isDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 2 }}
      className="mt-8 mb-4 lg:mb-6 flex flex-col items-center justify-center gap-4 text-center select-none"
    >
      <div className={`h-px w-32 ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-black/5 to-transparent'}`} />
      
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div dir="ltr" className="flex items-center justify-center gap-1.5 text-zinc-500/80 dark:text-zinc-600/80 text-center text-[10px] font-bold tracking-wide">
          <span className="uppercase tracking-widest text-[9px] font-black opacity-80">
            Powered By :
          </span>
          <span>
            Shervina
          </span>
          <Heart className="w-3 h-3 text-zinc-500/40 fill-zinc-500/10 shrink-0" />
          <span>
            (IRAN's Girl)
          </span>
        </div>
      </div>
    </motion.div>
  );
};
