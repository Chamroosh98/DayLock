import { useState, useEffect } from 'react';
import { getDigitFromKeyEvent } from '../securityUtils';
import { translations } from '../../../data/translations';
import { Language } from '../../../types';

export const usePinAuth = (
  language: Language,
  isScreenLocked: boolean,
  lockStatus: string,
  setLockStatus: (status: 'idle' | 'verifying' | 'error' | 'success') => void,
  onUnlockSuccess: () => void,
  triggerToast: (msg: string) => void
) => {
  const t = translations[language] || translations.en;

  const [pinCode, setPinCode] = useState<string>(() => localStorage.getItem('vault_app_pin_code') || '');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState(false);

  // PIN Setup Modal State
  const [pinSetupStep, setPinSetupStep] = useState<'idle' | 'enter' | 'confirm'>('idle');
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length >= 4 || lockStatus === 'success') return;
    const newVal = enteredPin + digit;
    setEnteredPin(newVal);

    if (newVal.length === 4) {
      const correctPin = localStorage.getItem('vault_app_pin_code');
      if (newVal === correctPin) {
        setLockStatus('success');
        setTimeout(() => {
          onUnlockSuccess();
          setEnteredPin('');
          setLockStatus('idle');
        }, 500);
      } else {
        setPinError(true);
        setEnteredPin('');
        triggerToast(t.incorrectPinToast || '❌ Incorrect PIN');
        setTimeout(() => setPinError(false), 500);
      }
    }
  };

  const handlePinBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  // Setup PIN Handlers
  const handleSetupDigit = (num: string) => {
    const current = pinSetupStep === 'enter' ? setupPin : setupConfirmPin;
    if (current.length >= 4) return;
    const nextVal = current + num;
    if (pinSetupStep === 'enter') {
      setSetupPin(nextVal);
      if (nextVal.length === 4) {
        setTimeout(() => setPinSetupStep('confirm'), 250);
      }
    } else {
      setSetupConfirmPin(nextVal);
      if (nextVal.length === 4) {
        if (setupPin === nextVal) {
          localStorage.setItem('vault_app_pin_code', nextVal);
          setPinCode(nextVal);
          setPinSetupStep('idle');
          triggerToast(t.pinSetSuccess || '✅ PIN Code successfully saved!');
        } else {
          triggerToast(t.pinMismatch || '❌ PINs do not match. Start over.');
          setSetupPin('');
          setSetupConfirmPin('');
          setPinSetupStep('enter');
        }
      }
    }
  };

  const handleSetupBackspace = () => {
    if (pinSetupStep === 'enter') {
      setSetupPin(prev => prev.slice(0, -1));
    } else {
      setSetupConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleSetupCancel = () => {
    setPinSetupStep('idle');
    setSetupPin('');
    setSetupConfirmPin('');
  };

  const openPinSetup = () => {
    setSetupPin('');
    setSetupConfirmPin('');
    setPinSetupStep('enter');
  };

  // Keyboard and physical Numpad listener for PIN Setup modal
  useEffect(() => {
    if (pinSetupStep === 'idle') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const digit = getDigitFromKeyEvent(e);
      if (digit !== null) {
        e.preventDefault();
        handleSetupDigit(digit);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleSetupBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSetupCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pinSetupStep, setupPin, setupConfirmPin]);

  // Keyboard and physical Numpad listener for Workspace Unlock Screen
  useEffect(() => {
    if (!isScreenLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If setup modal is open, defer to setup listener
      if (pinSetupStep !== 'idle') return;

      const digit = getDigitFromKeyEvent(e);
      if (digit !== null) {
        e.preventDefault();
        if (!pinCode) {
          triggerToast(t.pleaseSetPinFirstToast || '⚠️ Please set a PIN code first');
          return;
        }
        handlePinDigit(digit);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handlePinBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScreenLocked, pinSetupStep, pinCode, enteredPin, t]);

  return {
    pinCode,
    enteredPin,
    pinError,
    pinSetupStep,
    setupPin,
    setupConfirmPin,
    handlePinDigit,
    handlePinBackspace,
    handleSetupDigit,
    handleSetupBackspace,
    handleSetupCancel,
    openPinSetup,
  };
};
