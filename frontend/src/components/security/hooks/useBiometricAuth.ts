import { useState, useEffect } from 'react';
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
          triggerToast(t.biometricNotSupportedToast || '⚠️ Biometrics not supported on this browser');
          return;
        }
        const newCredId = await registerBiometrics('app-lock');
        if (newCredId) {
          localStorage.setItem('vault_app_biometric_cred', newCredId);
          setIsEnrolled(true);
          setLockMethod('biometric');
          localStorage.setItem('vault_app_lock_method', 'biometric');
          triggerToast(t.fingerprintEnabledSuccess || '✅ Fingerprint lock activated!');
        }
      } catch (err: any) {
        triggerToast(
          err?.name === 'NotAllowedError'
            ? (t.fingerprintCanceledToast || '❌ Fingerprint registration canceled')
            : `❌ ${t.biometricEnrollErrorToast || 'Error'}: ${err?.message || 'Failed'}`
        );
      }
    };
    window.addEventListener('vault-enable-biometrics', handleEnableBiometrics);
    return () => window.removeEventListener('vault-enable-biometrics', handleEnableBiometrics);
  }, [t, setLockMethod, triggerToast]);

  // Handle biometric unlock / verification
  const handleBiometricUnlock = async () => {
    if (lockStatus === 'verifying') return;
    const credId = localStorage.getItem('vault_app_biometric_cred');

    if (!credId) {
      // First-time enrollment registration
      setLockStatus('verifying');
      try {
        const isSupp = await isBiometricsSupported();
        if (!isSupp) {
          setLockStatus('error');
          triggerToast(t.biometricNotSupportedToast || '⚠️ Biometrics not supported on this browser');
          return;
        }
        const newCredId = await registerBiometrics('app-lock');
        if (newCredId) {
          localStorage.setItem('vault_app_biometric_cred', newCredId);
          setIsEnrolled(true);
          setLockStatus('success');
          triggerToast(t.fingerprintEnrolledToast || '✅ Fingerprint registered successfully!');
          setTimeout(() => {
            onUnlockSuccess();
            setLockStatus('idle');
          }, 500);
        } else {
          setLockStatus('error');
        }
      } catch (err: any) {
        console.error("Enrollment failed:", err);
        setLockStatus('error');
        triggerToast(`❌ ${t.biometricVerifyErrorToast || 'Biometric error'}: ${err?.message || 'Canceled'}`);
      }
      return;
    }

    // Already enrolled, verify
    setLockStatus('verifying');
    try {
      const verified = await verifyBiometrics(credId);
      if (verified) {
        setLockStatus('success');
        triggerToast(t.biometricUnlockedToast || '✅ Biometric unlocked successfully!');
        setTimeout(() => {
          onUnlockSuccess();
          setLockStatus('idle');
        }, 400);
      } else {
        setLockStatus('error');
        triggerToast(t.biometricAuthFailedToast || '❌ Biometric authentication failed!');
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setLockStatus('error');
      triggerToast(`❌ ${t.biometricScanFailedToast || 'Biometric scan failed'}: ${err?.message || 'Access error'}`);
    }
  };

  // Helper to test or register biometrics from Settings Modal
  const handleEnrollBiometricsFromSettings = async () => {
    try {
      const isSupp = await isBiometricsSupported();
      if (!isSupp) {
        triggerToast(t.biometricNotSupportedEnvToast || '⚠️ Biometric sensors are not supported on this browser/environment.');
        return;
      }
      const newCredId = await registerBiometrics('app-lock');
      if (newCredId) {
        localStorage.setItem('vault_app_biometric_cred', newCredId);
        setIsEnrolled(true);
        triggerToast(t.fingerprintEnrolledToast || '✅ Biometric authentication enrolled successfully!');
      }
    } catch (err: any) {
      triggerToast(`❌ ${t.biometricEnrollErrorToast || 'Biometric enrollment error'}: ${err?.message || 'Canceled'}`);
    }
  };

  return {
    biometricsSupported,
    isEnrolled,
    lockStatus,
    setLockStatus,
    handleBiometricUnlock,
    handleEnrollBiometricsFromSettings,
  };
};
