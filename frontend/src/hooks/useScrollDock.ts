import { useState, useEffect } from 'react';

export function useScrollDock() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDock, setShowDock] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowDock(false);
      } else if (currentScrollY < lastScrollY) {
        setShowDock(true);
      }

      if (currentScrollY < 10) {
        setShowDock(true);
      }

      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    isScrolled,
    showDock,
    setShowDock,
  };
}
