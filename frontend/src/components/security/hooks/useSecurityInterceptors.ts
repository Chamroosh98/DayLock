import { useState, useEffect } from 'react';
import { translations } from '../../../data/translations';
import { Language } from '../../../types';

export const useSecurityInterceptors = (
  language: Language,
  keysActive: boolean,
  printActive: boolean,
  copyActive: boolean,
  triggerToast: (msg: string) => void
) => {
  const t = translations[language] || translations.en;
  const [tempBlur, setTempBlur] = useState<boolean>(false);

  // 1. Copy toast event listener from components
  useEffect(() => {
    const handleCopyEvent = (e: any) => {
      const { text, selfDestructSec } = e.detail || {};
      if (selfDestructSec) {
        triggerToast(`📋 ${t.copiedSelfDestruct || 'Copied! Clears from clipboard in'} ${selfDestructSec}s`);
      } else if (text) {
        triggerToast(`📋 ${t.copiedToClipboard || 'Copied to clipboard!'}`);
      }
    };
    window.addEventListener('vault-copy-toast', handleCopyEvent);
    return () => window.removeEventListener('vault-copy-toast', handleCopyEvent);
  }, [t, triggerToast]);

  // 2. Keyboard Interceptor (PrintScreen, Save, Print blocking)
  useEffect(() => {
    if (!keysActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key intercept
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setTempBlur(true);
        triggerToast(t.printScreenBlockedToast || '⚠️ PrintScreen blocked! Vault visual shielding active.');
        
        // Scrub clipboard
        try {
          navigator.clipboard.writeText('');
        } catch (_) {}

        setTimeout(() => setTempBlur(false), 2000);
      }

      // Ctrl + P or Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerToast(t.directPrintBlockedToast || '❌ Direct document printing is blocked.');
      }

      // Ctrl + S or Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerToast(t.localCloneBlockedToast || '❌ Local document cloning is blocked.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keysActive, t, triggerToast]);

  // 3. Print Spool Block (CSS injection)
  useEffect(() => {
    if (!printActive) return;

    const style = document.createElement('style');
    style.id = 'print-security-shield';
    style.innerHTML = `
      @media print {
        body { display: none !important; }
        html { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const element = document.getElementById('print-security-shield');
      if (element) {
        element.remove();
      }
    };
  }, [printActive]);

  // 4. Block Selection & Right-Click scraper hooks
  useEffect(() => {
    if (!copyActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow right clicks on text inputs, but block globally elsewhere
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      e.preventDefault();
      
      // If it is within a text view container or decrypted payload, don't show the warning toast
      if (target.closest('.no-whistle-menu')) return;
      
      triggerToast(t.rightClickBlockedToast || '🔒 Menu access blocked!');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [copyActive, t, triggerToast]);

  return { tempBlur };
};
