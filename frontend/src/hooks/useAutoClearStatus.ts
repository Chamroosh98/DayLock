import { useEffect } from 'react';

export function useAutoClearStatus(
  status: { type: 'ok' | 'err' | 'warn'; msg: string } | null,
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void,
  durationMs: number = 4000
) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus, durationMs]);
}
