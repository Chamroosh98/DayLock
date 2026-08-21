import React, { createContext, useContext, useState, useEffect } from 'react';
import { isBiometricsSupported } from '../utils/webAuthn';
import { useModalContext } from './ModalContext';

interface SecurityContextType {
  disabledInputs: Record<string, boolean>;
  setDisabledInputs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handlePasswordChange: (value: string, setValue: (v: string) => void, inputId: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => void;
  
  // Self Destruct
  hasSelfDestruct: boolean;
  setHasSelfDestruct: React.Dispatch<React.SetStateAction<boolean>>;
  selfDestructHides: number;
  setSelfDestructHides: React.Dispatch<React.SetStateAction<number>>;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: React.Dispatch<React.SetStateAction<string[]>>;
  isSelfDestructed: boolean;
  setIsSelfDestructed: React.Dispatch<React.SetStateAction<boolean>>;
  hidesCount: number;
  setHidesCount: React.Dispatch<React.SetStateAction<number>>;

  // Biometrics
  biometricsSupported: boolean;
  rememberWithBiometrics: boolean;
  setRememberWithBiometrics: React.Dispatch<React.SetStateAction<boolean>>;
  hasBiometricsForCurrent: boolean;
  setHasBiometricsForCurrent: React.Dispatch<React.SetStateAction<boolean>>;
  checkBiometricsForViewData: (viewDataId: string | null) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setShowKeyboardWarning } = useModalContext();
  const [disabledInputs, setDisabledInputs] = useState<Record<string, boolean>>({});

  // Self destruct
  const [hasSelfDestruct, setHasSelfDestruct] = useState(false);
  const [selfDestructHides, setSelfDestructHides] = useState(3);
  const [selfDestructTriggers, setSelfDestructTriggers] = useState<string[]>(['tab']);
  const [isSelfDestructed, setIsSelfDestructed] = useState(false);
  const [hidesCount, setHidesCount] = useState(0);

  // Biometrics
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [rememberWithBiometrics, setRememberWithBiometrics] = useState(false);
  const [hasBiometricsForCurrent, setHasBiometricsForCurrent] = useState(false);

  useEffect(() => {
    isBiometricsSupported().then(supported => {
      setBiometricsSupported(supported);
    });
  }, []);

  const checkBiometricsForViewData = (viewDataId: string | null) => {
    if (viewDataId) {
      const hasCred = !!localStorage.getItem(`biometric_cred_${viewDataId}`);
      setHasBiometricsForCurrent(hasCred);
    } else {
      setHasBiometricsForCurrent(false);
    }
  };

  const isAsciiChar = (char: string) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126;
  };

  const triggerKeyboardWarning = (inputId: string) => {
    setShowKeyboardWarning(true);
    
    setDisabledInputs(prev => ({ ...prev, [inputId]: true }));
    
    setTimeout(() => {
      setDisabledInputs(prev => ({ ...prev, [inputId]: false }));
    }, 2000);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => {
    if (disabledInputs[inputId]) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      return;
    }
    if (e.key.length === 1) {
      if (!isAsciiChar(e.key)) {
        e.preventDefault();
        triggerKeyboardWarning(inputId);
      }
    }
  };

  const handlePasswordChange = (
    value: string,
    setValue: (v: string) => void,
    inputId: string
  ) => {
    if (disabledInputs[inputId]) {
      return;
    }
    let hasNonAscii = false;
    let cleanValue = '';
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (isAsciiChar(char)) {
        cleanValue += char;
      } else {
        hasNonAscii = true;
      }
    }
    
    if (hasNonAscii) {
      setValue(cleanValue);
      triggerKeyboardWarning(inputId);
    } else {
      setValue(value);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        disabledInputs,
        setDisabledInputs,
        handlePasswordChange,
        handlePasswordKeyDown,
        hasSelfDestruct,
        setHasSelfDestruct,
        selfDestructHides,
        setSelfDestructHides,
        selfDestructTriggers,
        setSelfDestructTriggers,
        isSelfDestructed,
        setIsSelfDestructed,
        hidesCount,
        setHidesCount,
        biometricsSupported,
        rememberWithBiometrics,
        setRememberWithBiometrics,
        hasBiometricsForCurrent,
        setHasBiometricsForCurrent,
        checkBiometricsForViewData,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};
