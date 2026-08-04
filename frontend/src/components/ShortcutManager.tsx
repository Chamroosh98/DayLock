import React, { useEffect } from 'react';

interface ShortcutManagerProps {
  onClearEverything: () => void;
  onToggleTab: () => void;
  onOpenHelpWithTab: (tab: 'shortcuts') => void;
}

export const ShortcutManager: React.FC<ShortcutManagerProps> = ({
  onClearEverything,
  onToggleTab,
  onOpenHelpWithTab,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Delete
      if (e.ctrlKey && e.key === 'Delete') {
        e.preventDefault();
        onClearEverything();
      }

      // Check for Alt + T or Ctrl + q
      if ((e.altKey && e.key.toLowerCase() === 't') || (e.ctrlKey && e.key.toLowerCase() === 'q')) {
        e.preventDefault();
        onToggleTab();
      }

      // Check for '?' to toggle help panel (when not in inputs)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        onOpenHelpWithTab('shortcuts');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClearEverything, onToggleTab, onOpenHelpWithTab]);

  return null;
};
