import React from 'react';

export interface BottomBlurGradientProps {
  isDarkMode: boolean;
}

export const BottomBlurGradient: React.FC<BottomBlurGradientProps> = ({ isDarkMode }) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-[60] lg:hidden ${
        isDarkMode ? 'bg-[#0a0a0c]/75' : 'bg-zinc-50/75'
      }`}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        WebkitMaskImage:
          'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)',
        maskImage:
          'linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0) 100%)',
      }}
    />
  );
};
