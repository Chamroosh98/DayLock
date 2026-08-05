import React, { useState } from 'react';
import { MainTab } from '../types';

export interface UsePasswordKeyboardGuardProps {
  mainTab: MainTab;
  viewData: any;
  performDecryption: (data: any, pwd: string, isFile: boolean) => void;
  viewPassword: string;
  setShowKeyboardWarning: (show: boolean) => void;
}

export const usePasswordKeyboardGuard = ({
  mainTab,
  viewData,
  performDecryption,
  viewPassword,
  setShowKeyboardWarning,
}: UsePasswordKeyboardGuardProps) => {
  const [disabledInputs, setDisabledInputs] = useState<Record<string, boolean>>({});

  const isAsciiChar = (char: string) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126;
  };

  const triggerKeyboardWarning = (inputId: string) => {
    setShowKeyboardWarning(true);
    setDisabledInputs((prev) => ({ ...prev, [inputId]: true }));

    setTimeout(() => {
      setDisabledInputs((prev) => ({ ...prev, [inputId]: false }));
    }, 2000);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => {
    if (disabledInputs[inputId]) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      if (mainTab === 'view' && viewData) {
        performDecryption(viewData, viewPassword, viewData.isFile);
      }
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

  return {
    disabledInputs,
    handlePasswordKeyDown,
    handlePasswordChange,
  };
};
