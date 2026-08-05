let activeClearTimeout: NodeJS.Timeout | null = null;
let lastCopiedValue: string | null = null;

/**
 * Copies sensitive text to the clipboard and schedules an automatic
 * neutralization of that content after a specified timeout (default 30 seconds).
 */
export const copyToClipboardWithAutoClear = async (
  text: string,
  timeoutMs: number = 30000,
  onClearNotify?: (msg: string) => void,
  language: 'en' | 'fa' = 'en'
): Promise<boolean> => {
  try {
    let success = false;
    
    // Clear any existing auto-clear timer
    if (activeClearTimeout) {
      clearTimeout(activeClearTimeout);
      activeClearTimeout = null;
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, trying fallback:', err);
      }
    }

    // Fallback: document.execCommand('copy')
    if (!success) {
      try {
        const activeEl = document.activeElement;
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        input.style.top = '0';
        input.style.left = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        success = document.execCommand('copy');
        document.body.removeChild(input);
        if (activeEl instanceof HTMLElement) activeEl.focus();
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    if (!success) {
      return false;
    }

    lastCopiedValue = text;

    // Check if shields copy protection is enabled (if false, DO NOT schedule auto-clear)
    const copyActiveInShield = localStorage.getItem('vault_security_copy') !== 'false';
    if (!copyActiveInShield) {
      // If copy protection is disabled (Shield is Off), we do NOT clear the clipboard automatically!
      return true;
    }

    // Set auto-clear timeout
    activeClearTimeout = setTimeout(async () => {
      try {
        let shouldClear = true;
        
        // Attempt to read the current clipboard to see if the user has already copied something else.
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const currentClip = await navigator.clipboard.readText();
            if (currentClip !== text && currentClip !== lastCopiedValue) {
              shouldClear = false;
            }
          }
        } catch (_) {
          // If reading is blocked by permissions, we default to clearing for safety.
          shouldClear = true;
        }

        if (shouldClear) {
          let cleared = false;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
              await navigator.clipboard.writeText('🔒 [Vault Protected Data Cleared]');
              cleared = true;
            } catch (_) {}
          }
          if (!cleared) {
            try {
              const activeEl = document.activeElement;
              const input = document.createElement('textarea');
              input.value = '🔒 [Vault Protected Data Cleared]';
              input.style.position = 'fixed';
              input.style.opacity = '0';
              document.body.appendChild(input);
              input.focus();
              input.select();
              document.execCommand('copy');
              document.body.removeChild(input);
              if (activeEl instanceof HTMLElement) activeEl.focus();
              cleared = true;
            } catch (_) {}
          }

          if (onClearNotify) {
            onClearNotify(
              language === 'fa'
                ? '📋 داده‌های کپی شده به طور خودکار از حافظه موقت (Clipboard) پاک شدند.'
                : '📋 Copied secure data automatically neutralized from clipboard.'
            );
          }
        }
      } catch (e) {
        console.warn('Auto-clear clipboard failed:', e);
      }
    }, timeoutMs);

    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Instantly neutralizes the clipboard contents.
 */
export const forceClearClipboard = async (): Promise<boolean> => {
  if (activeClearTimeout) {
    clearTimeout(activeClearTimeout);
    activeClearTimeout = null;
  }

  // Only clear if copy protection shield is actually enabled!
  const copyActiveInShield = localStorage.getItem('vault_security_copy') !== 'false';
  if (!copyActiveInShield) {
    return true;
  }

  try {
    let success = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText('🔒 [Vault Protected Data Cleared]');
        success = true;
      } catch (_) {}
    }
    if (!success) {
      try {
        const activeEl = document.activeElement;
        const input = document.createElement('textarea');
        input.value = '🔒 [Vault Protected Data Cleared]';
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        if (activeEl instanceof HTMLElement) activeEl.focus();
        success = true;
      } catch (_) {}
    }
    return success;
  } catch (err) {
    console.warn('Manual clipboard clear failed:', err);
  }
  return false;
};
