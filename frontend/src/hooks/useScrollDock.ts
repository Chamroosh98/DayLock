import { useState, useEffect } from 'react';

export function useScrollDock() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDock, setShowDock] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 100) {
        if (currentScrollY < lastScrollY) {
          setShowDock(true);
        } else if (currentScrollY - lastScrollY > 10) {
          setShowDock(false);
        }
      } else {
        setShowDock(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isScrolled, showDock };
}
