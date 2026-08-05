import { useEffect, useRef } from 'react';
import { Language } from '../types';

export interface UseExpirationWarningProps {
  viewData: any;
  language: Language;
  t: any;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const useExpirationWarning = ({
  viewData,
  language,
  t,
  setStatus,
}: UseExpirationWarningProps) => {
  // Set of paste IDs for which an expiration notification has already been shown
  const notifiedPasteIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!viewData || !viewData.expires_at || !viewData.id) {
      return;
    }

    const pasteId = viewData.id;
    const expiresAtSec = typeof viewData.expires_at === 'number'
      ? viewData.expires_at
      : parseInt(viewData.expires_at, 10);

    if (isNaN(expiresAtSec)) {
      return;
    }

    const checkExpiration = () => {
      if (notifiedPasteIdsRef.current.has(pasteId)) {
        return;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const remainingSec = expiresAtSec - nowSec;

      // Trigger warning toast if paste expires in 1 hour (3600s) or less, but is not expired yet
      if (remainingSec > 0 && remainingSec <= 3600) {
        notifiedPasteIdsRef.current.add(pasteId);
        setStatus({
          type: 'warn',
          msg: t.expiringSoonToast || (
            language === 'fa'
              ? 'هشدار: پاست فعال شما کمتر از ۱ ساعت دیگر منقضی می‌شود!'
              : 'Warning: Your active paste session will expire in less than 1 hour!'
          ),
        });
      }
    };

    // Run immediate check on load / update of viewData
    checkExpiration();

    // Periodically check every 15 seconds while session is active
    const intervalId = setInterval(checkExpiration, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [viewData, language, t, setStatus]);

  const resetNotifiedPastes = () => {
    notifiedPasteIdsRef.current.clear();
  };

  return {
    resetNotifiedPastes,
  };
};
