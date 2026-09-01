import { useState, useEffect } from 'react';
import { translations } from '../../../data/translations';
import { Language } from '../../../types';

export const useSecuritySettings = (language: Language, triggerToast: (msg: string) => void) => {
  const t = translations[language] || translations.en;

  // 1. Multitasking Blur Shield (Enabled by default)
  const [blurActive, setBlurActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_blur');
    return saved !== null ? saved === 'true' : true;
  });

  // 2. Keyboard Intercept Shield (Enabled by default)
  const [keysActive, setKeysActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_keys');
    return saved !== null ? saved === 'true' : true;
  });

  // 3. Print Spool Blocker (Enabled by default)
  const [printActive, setPrintActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_print');
    return saved !== null ? saved === 'true' : true;
  });

  // 4. Copy & Selection Blocker (Enabled by default)
  const [copyActive, setCopyActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_copy');
    return saved !== null ? saved === 'true' : true;
  });

  // 5. Codec Video Recording Jammer (Disabled by default)
  const [noiseActive, setNoiseActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_noise');
    return saved !== null ? saved === 'true' : false;
  });

  // 6. Multitasking Biometric / PIN Lock Shield (Enabled by default)
  const [biometricLockActive, setBiometricLockActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('vault_security_biometric');
    return saved !== null ? saved === 'true' : true;
  });

  // Lock Method preference ('biometric' | 'pin')
  const [lockMethod, setLockMethod] = useState<'biometric' | 'pin'>(() => {
    const saved = localStorage.getItem('vault_app_lock_method');
    return (saved as 'biometric' | 'pin') || 'pin';
  });

  // Sync settings with LocalStorage
  useEffect(() => {
    localStorage.setItem('vault_security_blur', String(blurActive));
  }, [blurActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_keys', String(keysActive));
  }, [keysActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_print', String(printActive));
  }, [printActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_copy', String(copyActive));
  }, [copyActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_noise', String(noiseActive));
  }, [noiseActive]);

  useEffect(() => {
    localStorage.setItem('vault_security_biometric', String(biometricLockActive));
  }, [biometricLockActive]);

  const presetHigh = () => {
    setBlurActive(true);
    setKeysActive(true);
    setPrintActive(true);
    setCopyActive(true);
    setBiometricLockActive(true);
    setNoiseActive(true);
    triggerToast(t.presetMaxToast || 'Security Level set to Maximum Protection!');
  };

  const presetStandard = () => {
    setBlurActive(true);
    setKeysActive(true);
    setPrintActive(true);
    setCopyActive(true);
    setBiometricLockActive(false);
    setNoiseActive(false);
    triggerToast(t.presetStandardToast || 'Standard Protection Profile enabled.');
  };

  const presetNone = () => {
    setBlurActive(false);
    setKeysActive(false);
    setPrintActive(false);
    setCopyActive(false);
    setBiometricLockActive(false);
    setNoiseActive(false);
    triggerToast(t.presetOffToast || 'All protective shields disabled!');
  };

  return {
    blurActive,
    setBlurActive,
    keysActive,
    setKeysActive,
    printActive,
    setPrintActive,
    copyActive,
    setCopyActive,
    noiseActive,
    setNoiseActive,
    biometricLockActive,
    setBiometricLockActive,
    lockMethod,
    setLockMethod,
    presetHigh,
    presetStandard,
    presetNone,
  };
};
