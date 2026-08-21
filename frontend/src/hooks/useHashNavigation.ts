import { useEffect } from 'react';
import { MainTab } from '../types';

const processedHashesSet = new Set<string>();

export function useHashNavigation(
  setMainTab: (tab: MainTab) => void,
  setViewInput: (hash: string) => void
) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      if (processedHashesSet.has(hash)) {
        try {
          window.history.replaceState("", document.title, window.location.pathname + window.location.search);
        } catch (e) {
          window.location.hash = "";
        }
        return;
      }

      processedHashesSet.add(hash);
      setMainTab('view');
      setViewInput(hash);
      // Clean hash from browser address bar immediately for security so refresh won't reload it!
      try {
        window.history.replaceState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = "";
      }
    }
  }, [setMainTab, setViewInput]);
}
