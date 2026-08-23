import { useState, useEffect } from 'react';

export const useWorkspaceLock = (
  blurActive: boolean,
  biometricLockActive: boolean,
  lockMethod: 'biometric' | 'pin',
  biometricsSupported: boolean,
  isEnrolled: boolean,
  lockStatus: string,
  handleBiometricUnlock: () => void
) => {
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  useEffect(() => {
    if (!blurActive) {
      setIsScreenLocked(false);
      return;
    }

    const lockApp = () => {
      if (!biometricLockActive) return;

      const hasPin = !!localStorage.getItem('vault_app_pin_code');
      const hasBiometric = !!localStorage.getItem('vault_app_biometric_cred');

      if (lockMethod === 'biometric' && hasBiometric) {
        setIsScreenLocked(true);
      } else if (lockMethod === 'pin' && hasPin) {
        setIsScreenLocked(true);
      }
    };

    const handleBlur = () => {
      lockApp();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lockApp();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    if (document.visibilityState === 'hidden') {
      lockApp();
    }

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [blurActive, biometricLockActive, lockMethod]);

  // Auto-prompt when user returns to focus the window (only for biometric method)
  useEffect(() => {
    if (isScreenLocked && lockMethod === 'biometric' && biometricsSupported && isEnrolled && biometricLockActive) {
      const handleWindowFocus = () => {
        if (lockStatus === 'idle') {
          handleBiometricUnlock();
        }
      };
      window.addEventListener('focus', handleWindowFocus);
      return () => {
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [isScreenLocked, biometricsSupported, isEnrolled, lockStatus, biometricLockActive, lockMethod, handleBiometricUnlock]);

  const unlockScreen = () => {
    setIsScreenLocked(false);
  };

  return { isScreenLocked, unlockScreen };
};
