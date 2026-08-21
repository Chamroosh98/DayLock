import React from 'react';
import { motion } from 'motion/react';
import { TrashIconProps } from '../types';

export const TrashIcon: React.FC<TrashIconProps> = ({ animate }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.g
        animate={animate ? { y: -3, rotate: -15, x: 1 } : { y: 0, rotate: 0, x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <path d="M3 6h18" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </motion.g>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <motion.line
        x1="10"
        y1="11"
        x2="10"
        y2="17"
        animate={animate ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
      />
      <motion.line
        x1="14"
        y1="11"
        x2="14"
        y2="17"
        animate={animate ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
      />
    </svg>
  );
};
