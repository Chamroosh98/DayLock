import React, { useEffect } from 'react';

interface ShortcutManagerProps {
  onClearEverything: () => void;
  onPanicWipe?: () => void;
  onToggleTab: () => void;
  onOpenHelpWithTab: (tab: 'shortcuts') => void;
}

export const ShortcutManager: React.FC<ShortcutManagerProps> = ({
  onClearEverything,
  onPanicWipe,
  onToggleTab,
  onOpenHelpWithTab,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Panic Mode Shortcut: Ctrl + Shift + Backspace (or Cmd + Shift + Backspace on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Backspace' || e.code === 'Backspace')) {
        e.preventDefault();
        e.stopPropagation();
        if (onPanicWipe) {
          onPanicWipe();
        } else {
          onClearEverything();
        }
        return;
      }

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

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClearEverything, onPanicWipe, onToggleTab, onOpenHelpWithTab]);

  return null;
};

