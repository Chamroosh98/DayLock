import { useState, useEffect, useCallback, useRef } from 'react';
import { isBiometricsSupported, registerBiometrics, verifyBiometrics } from '../../../utils/webAuthn';
import { translations } from '../../../data/translations';
import { Language } from '../../../types';

export const useBiometricAuth = (
  language: Language,
  triggerToast: (msg: string) => void,
  onUnlockSuccess: () => void,
  setLockMethod: (val: 'biometric' | 'pin') => void
) => {
  const t = translations[language] || translations.en;
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [lockStatus, setLockStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');

  const onUnlockSuccessRef = useRef(onUnlockSuccess);
  onUnlockSuccessRef.current = onUnlockSuccess;
  const triggerToastRef = useRef(triggerToast);
  triggerToastRef.current = triggerToast;
  const tRef = useRef(t);
  tRef.current = t;

  // Check hardware biometric support on mount
  useEffect(() => {
    isBiometricsSupported().then(supported => {
      setBiometricsSupported(supported);
      const storedCred = localStorage.getItem('vault_app_biometric_cred');
      setIsEnrolled(!!storedCred);
    });
  }, []);

  // Listen to external request to enable biometrics
  useEffect(() => {
    const handleEnableBiometrics = async () => {
      try {
        const isSupp = await isBiometricsSupported();
        if (!isSupp) {
          triggerToastRef.current(tRef.current.biometricNotSupportedToast || '⚠️ Biometrics not supported on this browser');
          return;
        }
        const newCredId = await registerBiometrics('app-lock');
        if (newCredId) {
          localStorage.setItem('vault_app_biometric_cred', newCredId);
          setIsEnrolled(true);
          setLockMethod('biometric');
          localStorage.setItem('vault_app_lock_method', 'biometric');
          triggerToastRef.current(tRef.current.fingerprintEnabledSuccess || '✅ Fingerprint lock activated!');
        }
      } catch (err: any) {
        triggerToastRef.current(
          err?.name === 'NotAllowedError'
            ? (tRef.current.fingerprintCanceledToast || '❌ Fingerprint registration canceled')
            : `❌ ${tRef.current.biometricEnrollErrorToast || 'Error'}: ${err?.message || 'Failed'}`
        );
      }
    };
    window.addEventListener('vault-enable-biometrics', handleEnableBiometrics);
    return () => window.removeEventListener('vault-enable-biometrics', handleEnableBiometrics);
  }, [setLockMethod]);

  // Handle biometric unlock / verification
  const handleBiometricUnlock = useCallback(async () => {
    setLockStatus(currentStatus => {
      if (currentStatus === 'verifying') return currentStatus;
      return currentStatus;
    });

    const credId = localStorage.getItem('vault_app_biometric_cred');

    if (!credId) {
      // First-time enrollment registration
      setLockStatus('verifying');
      try {
        const isSupp = await isBiometricsSupported();
        if (!isSupp) {
          setLockStatus('error');
          triggerToastRef.current(tRef.current.biometricNotSupportedToast || '⚠️ Biometrics not supported on this browser');
          return;
        }
        const newCredId = await registerBiometrics('app-lock');
        if (newCredId) {
          localStorage.setItem('vault_app_biometric_cred', newCredId);
          setIsEnrolled(true);
          setLockStatus('success');
          triggerToastRef.current(tRef.current.fingerprintEnrolledToast || '✅ Fingerprint registered successfully!');
          setTimeout(() => {
            onUnlockSuccessRef.current();
            setLockStatus('idle');
          }, 500);
        } else {
          setLockStatus('error');
        }
      } catch (err: any) {
        console.error("Enrollment failed:", err);
        setLockStatus('error');
        triggerToastRef.current(`❌ ${tRef.current.biometricVerifyErrorToast || 'Biometric error'}: ${err?.message || 'Canceled'}`);
      }
      return;
    }

    // Already enrolled, verify
    setLockStatus('verifying');
    try {
      const verified = await verifyBiometrics(credId);
      if (verified) {
        setLockStatus('success');
        triggerToastRef.current(tRef.current.biometricUnlockedToast || '✅ Biometric unlocked successfully!');
        setTimeout(() => {
          onUnlockSuccessRef.current();
          setLockStatus('idle');
        }, 400);
      } else {
        setLockStatus('error');
        triggerToastRef.current(tRef.current.biometricAuthFailedToast || '❌ Biometric authentication failed!');
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setLockStatus('error');
      triggerToastRef.current(`❌ ${tRef.current.biometricScanFailedToast || 'Biometric scan failed'}: ${err?.message || 'Access error'}`);
    }
  }, []);

  // Helper to test or register biometrics from Settings Modal
  const handleEnrollBiometricsFromSettings = useCallback(async () => {
    try {
      const isSupp = await isBiometricsSupported();
      if (!isSupp) {
        triggerToastRef.current(tRef.current.biometricNotSupportedEnvToast || '⚠️ Biometric sensors are not supported on this browser/environment.');
        return;
      }
      const newCredId = await registerBiometrics('app-lock');
      if (newCredId) {
        localStorage.setItem('vault_app_biometric_cred', newCredId);
        setIsEnrolled(true);
        triggerToastRef.current(tRef.current.fingerprintEnrolledToast || '✅ Biometric authentication enrolled successfully!');
      }
    } catch (err: any) {
      triggerToastRef.current(`❌ ${tRef.current.biometricEnrollErrorToast || 'Biometric enrollment error'}: ${err?.message || 'Canceled'}`);
    }
  }, []);

  return {
    biometricsSupported,
    isEnrolled,
    lockStatus,
    setLockStatus,
    handleBiometricUnlock,
    handleEnrollBiometricsFromSettings,
  };
};
