import React, { useRef } from 'react';
import { ContentType } from '../types';

export interface UseAppSwipeProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  setImageAcquisition: (val: 'camera' | 'upload' | null) => void;
}

export const useAppSwipe = ({
  contentType,
  setContentType,
  setImageAcquisition,
}: UseAppSwipeProps) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName.toLowerCase() === 'textarea' ||
      target.tagName.toLowerCase() === 'input' ||
      target.tagName.toLowerCase() === 'select' ||
      target.closest('.no-swipe') ||
      target.closest('.leaflet-container') ||
      target.closest('button') ||
      target.closest('[role="slider"]')
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      const tabs: ContentType[] = ['text', 'file', 'stego', 'audio', 'shamir', 'e2e'];
      const currentIndex = tabs.indexOf(contentType);

      if (diffX > 0) {
        if (currentIndex < tabs.length - 1) {
          const nextTab = tabs[currentIndex + 1];
          setContentType(nextTab);
          if (nextTab === 'stego') setImageAcquisition(null);
        }
      } else {
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1];
          setContentType(prevTab);
          if (prevTab === 'stego') setImageAcquisition(null);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
};
