import React, { useRef, useCallback } from 'react';
import { Language } from '../types';
import {
  SecurityToast,
  ScreenshotBlockOverlay,
  NoiseJammerOverlay,
  ScreenLockOverlay,
  PinSetupModal,
  SecurityShieldsModal,
  useSecurityToast,
  useSecuritySettings,
  useBiometricAuth,
  usePinAuth,
  useWorkspaceLock,
  useSecurityInterceptors,
} from './security';

interface ScreenSecurityGuardProps {
  isDarkMode: boolean;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenSecurityGuard: React.FC<ScreenSecurityGuardProps> = ({
  isDarkMode,
  language,
  isOpen,
  onClose,
}) => {
  // 1. Toast notifications
  const { toastMessage, triggerToast } = useSecurityToast();

  // 2. Shield configurations and profiles
  const {
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
  } = useSecuritySettings(language, triggerToast);

  // 3. Callback ref for screen unlocking
  const unlockScreenRef = useRef<() => void>(() => {});
  const handleUnlockSuccess = useCallback(() => {
    unlockScreenRef.current();
  }, []);

  // 4. Biometric authentication
  const {
    biometricsSupported,
    isEnrolled,
    lockStatus,
    setLockStatus,
    handleBiometricUnlock,
    handleEnrollBiometricsFromSettings,
  } = useBiometricAuth(language, triggerToast, handleUnlockSuccess, setLockMethod);

  // 5. Workspace App Lock lifecycle
  const { isScreenLocked, unlockScreen } = useWorkspaceLock(
    blurActive,
    biometricLockActive,
    lockMethod,
    biometricsSupported,
    isEnrolled,
    lockStatus,
    handleBiometricUnlock
  );
  unlockScreenRef.current = unlockScreen;

  // 6. PIN Authentication & Setup
  const {
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
  } = usePinAuth(language, isScreenLocked, lockStatus, setLockStatus, unlockScreen, triggerToast);

  // 7. Security Interceptors (PrintScreen, Keyboard hooks, Print Spool, Copy/Context blockers)
  const { tempBlur } = useSecurityInterceptors(
    language,
    keysActive,
    printActive,
    copyActive,
    triggerToast
  );

  return (
    <>
      {/* Noise Jammer background overlay */}
      <NoiseJammerOverlay active={noiseActive} />

      {/* Temp blur when PrintScreen is triggered */}
      <ScreenshotBlockOverlay visible={tempBlur} language={language} />

      {/* Multitasking & App Switcher Shield Overlay (Biometric / PIN Lock) */}
      <ScreenLockOverlay
        isScreenLocked={isScreenLocked}
        biometricsSupported={biometricsSupported}
        isEnrolled={isEnrolled}
        lockStatus={lockStatus}
        pinError={pinError}
        enteredPin={enteredPin}
        pinCode={pinCode}
        language={language}
        onUnlock={handleBiometricUnlock}
        onPinDigit={handlePinDigit}
        onPinBackspace={handlePinBackspace}
        triggerToast={triggerToast}
      />

      {/* Security Shields Configuration Modal */}
      <SecurityShieldsModal
        isOpen={isOpen}
        onClose={onClose}
        isDarkMode={isDarkMode}
        language={language}
        blurActive={blurActive}
        setBlurActive={setBlurActive}
        keysActive={keysActive}
        setKeysActive={setKeysActive}
        printActive={printActive}
        setPrintActive={setPrintActive}
        copyActive={copyActive}
        setCopyActive={setCopyActive}
        noiseActive={noiseActive}
        setNoiseActive={setNoiseActive}
        biometricLockActive={biometricLockActive}
        setBiometricLockActive={setBiometricLockActive}
        lockMethod={lockMethod}
        setLockMethod={setLockMethod}
        biometricsSupported={biometricsSupported}
        isEnrolled={isEnrolled}
        pinCode={pinCode}
        onEnrollBiometrics={handleEnrollBiometricsFromSettings}
        onOpenPinSetup={openPinSetup}
        onPresetHigh={presetHigh}
        onPresetStandard={presetStandard}
        onPresetNone={presetNone}
      />

      {/* Interactive 4-Digit PIN Setup Keypad Modal */}
      <PinSetupModal
        isDarkMode={isDarkMode}
        pinSetupStep={pinSetupStep}
        setupPin={setupPin}
        setupConfirmPin={setupConfirmPin}
        language={language}
        onSetupDigit={handleSetupDigit}
        onSetupBackspace={handleSetupBackspace}
        onSetupCancel={handleSetupCancel}
      />

      {/* Security Shield Notification Toast */}
      <SecurityToast toastMessage={toastMessage} language={language} isDarkMode={isDarkMode} />
    </>
  );
};
export default ScreenSecurityGuard;
