import React from 'react';

export const HoneyPotIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Dipper stick */}
    <path d="M15 3 L19 7" strokeWidth="2.5" />
    <circle cx="19" cy="7" r="1.5" fill="currentColor" />
    
    {/* Jar top lid */}
    <rect x="6" y="6" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
    <rect x="6" y="6" width="12" height="3" rx="1.5" />
    
    {/* Jar body */}
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" fill="currentColor" opacity="0.05" />
    <path d="M5 9 C5 13, 6 21, 12 21 C18 21, 19 13, 19 9 Z" />
    
    {/* Label on the jar */}
    <rect x="9" y="11" width="6" height="4" rx="1" fill="currentColor" opacity="0.15" />
    <text x="12" y="14" fontSize="5" fontWeight="bold" textAnchor="middle" stroke="none" fill="currentColor" className="font-sans">H</text>
  </svg>
);
