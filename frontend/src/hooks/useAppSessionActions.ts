import React from 'react';
import { MainTab } from '../types';
import { forceClearClipboard } from '../utils/clipboardManager';
import { triggerHapticFeedback } from '../utils/haptics';

interface UseAppSessionActionsParams {
  setResetTrigger: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<{ type: 'ok' | 'err' | 'warn'; msg: string } | null>>;
  setViewInput: React.Dispatch<React.SetStateAction<string>>;
  setViewData: React.Dispatch<React.SetStateAction<any>>;
  setViewPassword: React.Dispatch<React.SetStateAction<string>>;
  setDecryptedContent: React.Dispatch<React.SetStateAction<any>>;
  setViewError: React.Dispatch<React.SetStateAction<any>>;
  setHasBiometricsForCurrent: React.Dispatch<React.SetStateAction<boolean>>;
  setSharePendingContent: React.Dispatch<React.SetStateAction<string>>;
  setShowShareConfirm: (val: boolean) => void;
  setShowContentWarning: (val: boolean) => void;
  setShowPasswordWarning: (val: boolean) => void;
  setShowKeyboardWarning: (val: boolean) => void;
  setIsTrashAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  setMainTab: React.Dispatch<React.SetStateAction<MainTab>>;
  t: any;
}

export function useAppSessionActions({
  setResetTrigger,
  setStatus,
  setViewInput,
  setViewData,
  setViewPassword,
  setDecryptedContent,
  setViewError,
  setHasBiometricsForCurrent,
  setSharePendingContent,
  setShowShareConfirm,
  setShowContentWarning,
  setShowPasswordWarning,
  setShowKeyboardWarning,
  setIsTrashAnimating,
  setMainTab,
  t,
}: UseAppSessionActionsParams) {
  const handleClearEverything = () => {
    setResetTrigger((prev) => prev + 1);
    setStatus(null);
    setViewInput('');
    setViewData(null);
    setViewPassword('');
    setDecryptedContent(null);
    setViewError(null);
    forceClearClipboard();
    try {
      (window as any).secureClearClipboard?.();
    } catch (_) {}
  };

  const handlePanicWipe = () => {
    // 1. Clear all React volatile states
    setResetTrigger((prev) => prev + 1);
    setViewInput('');
    setViewData(null);
    setViewPassword('');
    setDecryptedContent(null);
    setViewError(null);
    setHasBiometricsForCurrent(false);
    setSharePendingContent('');
    setShowShareConfirm(false);
    setShowContentWarning(false);
    setShowPasswordWarning(false);
    setShowKeyboardWarning(false);
    setIsTrashAnimating(true);
    setTimeout(() => setIsTrashAnimating(false), 900);

    // 3. Purge volatile clipboard data and session storage
    forceClearClipboard();
    try {
      sessionStorage.clear();
      // Keep app settings like theme and language intact, but clean any cached biometric keys or paste fragments
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('biometric_cred_') || key.startsWith('vault_draft_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) {}

    // 4. Trigger tactile emergency vibration feedback
    triggerHapticFeedback('warning');

    // 5. Silently clear any active status notification (no popup)
    setStatus(null);
  };

  const handleToggleTab = () => {
    setMainTab((prev) => (prev === 'create' ? 'view' : 'create'));
  };

  return {
    handleClearEverything,
    handlePanicWipe,
    handleToggleTab,
  };
}
