import React from 'react';

interface NoiseJammerOverlayProps {
  active: boolean;
}

export const NoiseJammerOverlay: React.FC<NoiseJammerOverlayProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none opacity-[0.015] select-none mix-blend-overlay overflow-hidden">
      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-500 via-zinc-900 to-black animate-pulse" />
    </div>
  );
};
