import React from 'react';
import { SecurityOptionsDrawer } from './SecurityOptionsDrawer';
import { Language, Country } from '../../../types';

export interface OptionsSectionProps {
  burnAfterRead: boolean;
  setBurnAfterRead: (v: boolean) => void;
  expiresIn: number;
  setExpiresIn: (v: number) => void;
  maxViews: number | '';
  setMaxViews: (v: number | '') => void;
  hasPassword: boolean;
  setHasPassword: (v: boolean) => void;
  password: string;
  setPassword: (v: string) => void;
  showMasterPwd: boolean;
  setShowMasterPwd: (v: boolean) => void;
  hasHoney: boolean;
  setHasHoney: (v: boolean) => void;
  honeyPwd: string;
  setHoneyPwd: (v: string) => void;
  showHoneyPwd: boolean;
  setShowHoneyPwd: (v: boolean) => void;
  honeyContent: string;
  setHoneyContent: (v: string) => void;
  hasGeoLock: boolean;
  setHasGeoLock: (v: boolean) => void;
  allowedCountries: string[];
  setAllowedCountries: React.Dispatch<React.SetStateAction<string[]>>;
  countrySearch: string;
  setCountrySearch: (v: string) => void;
  countryResults: Country[];
  hasAsnLock: boolean;
  setHasAsnLock: (v: boolean) => void;
  asnMode: 'block' | 'allow';
  setAsnMode: (v: 'block' | 'allow') => void;
  asnSelected: string;
  setAsnSelected: (v: string) => void;
  hasDeadMans: boolean;
  setHasDeadMans: (v: boolean) => void;
  deadMansInterval: number | null;
  setDeadMansInterval: (v: number | null) => void;
  hasSelfDestruct: boolean;
  setHasSelfDestruct: (v: boolean) => void;
  selfDestructHides: number;
  setSelfDestructHides: (v: number) => void;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: React.Dispatch<React.SetStateAction<string[]>>;
  hasCanary: boolean;
  setHasCanary: (v: boolean) => void;
  canaryUrl: string;
  setCanaryUrl: (v: string) => void;
  hasTimeLock: boolean;
  setHasTimeLock: (v: boolean) => void;
  unlockAt: number | null;
  setUnlockAt: (v: number | null) => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setValue: (v: string) => void, inputId: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => void;
}

export const OptionsSection: React.FC<OptionsSectionProps> = (props) => {
  return (
    <div className="pt-2">
      <SecurityOptionsDrawer {...props} />
    </div>
  );
};
