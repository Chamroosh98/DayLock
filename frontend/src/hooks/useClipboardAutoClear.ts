import { useEffect, useCallback } from 'react';
import { copyToClipboardWithAutoClear, forceClearClipboard } from '../utils/clipboardManager';
import { Language } from '../types';

export function useClipboardAutoClear(
  decryptedContent: any,
  language: Language,
  setStatus?: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void
) {
  // Trigger clipboard neutralization when decrypted content is closed / cleared
  useEffect(() => {
    if (!decryptedContent) {
      forceClearClipboard();
    }
  }, [decryptedContent]);

  const copyWithAutoClear = useCallback(
    (text: string, durationMs = 30000, messageOverride?: string) => {
      copyToClipboardWithAutoClear(
        text,
        durationMs,
        (msg) => {
          if (setStatus) {
            setStatus({ type: 'warn', msg: messageOverride || msg });
          }
        },
        language
      );
    },
    [language, setStatus]
  );

  return { copyWithAutoClear, forceClearClipboard };
}
