import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ContentType, Language } from '../types';
import { gregorianToJalali, jalaliToGregorian } from '../utils/jalaliConverter';
import { useUndoableState } from './useUndoableState';

export interface UseVaultStateOptions {
  language?: Language;
  initialContentType?: ContentType;
}

export interface VaultState {
  // Content Type
  contentType: ContentType;
  setContentType: Dispatch<SetStateAction<ContentType>>;

  // Passphrases & Core Secret
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  undoMessage: () => void;
  redoMessage: () => void;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  showMasterPwd: boolean;
  setShowMasterPwd: Dispatch<SetStateAction<boolean>>;
  hasPassword: boolean;
  setHasPassword: Dispatch<SetStateAction<boolean>>;

  // Expiration & Burn Settings
  burnAfterRead: boolean;
  setBurnAfterRead: Dispatch<SetStateAction<boolean>>;
  maxViews: number | '';
  setMaxViews: Dispatch<SetStateAction<number | ''>>;
  expiresIn: number;
  setExpiresIn: Dispatch<SetStateAction<number>>;

  // Honeypot / Decoy Settings
  hasHoney: boolean;
  setHasHoney: Dispatch<SetStateAction<boolean>>;
  honeyPwd: string;
  setHoneyPwd: Dispatch<SetStateAction<string>>;
  showHoneyPwd: boolean;
  setShowHoneyPwd: Dispatch<SetStateAction<boolean>>;
  honeyContent: string;
  setHoneyContent: Dispatch<SetStateAction<string>>;

  // Country / Geo Constraints
  hasGeoLock: boolean;
  setHasGeoLock: Dispatch<SetStateAction<boolean>>;
  allowedCountries: string[];
  setAllowedCountries: Dispatch<SetStateAction<string[]>>;

  // Dead Man's Switch & Canary
  hasDeadMans: boolean;
  setHasDeadMans: Dispatch<SetStateAction<boolean>>;
  deadMansInterval: number | null;
  setDeadMansInterval: Dispatch<SetStateAction<number | null>>;
  hasCanary: boolean;
  setHasCanary: Dispatch<SetStateAction<boolean>>;
  canaryUrl: string;
  setCanaryUrl: Dispatch<SetStateAction<string>>;

  // Time Lock & Jalali Date Picker
  hasTimeLock: boolean;
  setHasTimeLock: Dispatch<SetStateAction<boolean>>;
  unlockAt: number | null;
  setUnlockAt: Dispatch<SetStateAction<number | null>>;
  jYear: number;
  setJYear: Dispatch<SetStateAction<number>>;
  jMonth: number;
  setJMonth: Dispatch<SetStateAction<number>>;
  jDay: number;
  setJDay: Dispatch<SetStateAction<number>>;
  jHour: number;
  setJHour: Dispatch<SetStateAction<number>>;
  jMinute: number;
  setJMinute: Dispatch<SetStateAction<number>>;

  // Self-Destruct Settings
  hasSelfDestruct: boolean;
  setHasSelfDestruct: Dispatch<SetStateAction<boolean>>;
  selfDestructHides: number;
  setSelfDestructHides: Dispatch<SetStateAction<number>>;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: Dispatch<SetStateAction<string[]>>;

  // Shamir Secret Sharing (Multi-Party Custody)
  hasShamir: boolean;
  setHasShamir: Dispatch<SetStateAction<boolean>>;
  shamirThreshold: number;
  setShamirThreshold: Dispatch<SetStateAction<number>>;
  shamirTotal: number;
  setShamirTotal: Dispatch<SetStateAction<number>>;
  shamirShares: string[];
  setShamirShares: Dispatch<SetStateAction<string[]>>;

  // Network / ASN Lock Settings
  hasAsnLock: boolean;
  setHasAsnLock: Dispatch<SetStateAction<boolean>>;
  asnMode: 'block' | 'allow';
  setAsnMode: Dispatch<SetStateAction<'block' | 'allow'>>;
  asnSelected: string;
  setAsnSelected: Dispatch<SetStateAction<string>>;

  // File & Steganography State
  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  stegoImage: string | null;
  setStegoImage: Dispatch<SetStateAction<string | null>>;
  stegoCapacity: number;
  setStegoCapacity: Dispatch<SetStateAction<number>>;

  // Actions
  resetVaultState: () => void;
}

/**
 * Custom Hook: useVaultState
 * Encapsulates form creation state including passphrases, content type,
 * country constraints, self-destruct settings, honeypot decoys, time locks,
 * dead man's switches, and file/steganography inputs.
 */
export function useVaultState(options: UseVaultStateOptions = {}): VaultState {
  const { language = 'en', initialContentType = 'text' } = options;

  // Content Type Selection
  const [contentType, setContentType] = useState<ContentType>(initialContentType);

  // Core Secret & Passphrase (with Undo/Redo history support for Ctrl+Z)
  const {
    state: message,
    setState: setMessage,
    undo: undoMessage,
    redo: redoMessage,
    resetState: resetMessage
  } = useUndoableState<string>('');
  const [password, setPassword] = useState('');
  const [showMasterPwd, setShowMasterPwd] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  // Expiration & View Controls
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [expiresIn, setExpiresIn] = useState<number>(86400);

  // Honeypot Decoy
  const [hasHoney, setHasHoney] = useState(false);
  const [honeyPwd, setHoneyPwd] = useState('');
  const [showHoneyPwd, setShowHoneyPwd] = useState(false);
  const [honeyContent, setHoneyContent] = useState('');

  // Country / Geo-Lock Constraints
  const [hasGeoLock, setHasGeoLock] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);

  // Dead Man's Switch & Canary
  const [hasDeadMans, setHasDeadMans] = useState(false);
  const [deadMansInterval, setDeadMansInterval] = useState<number | null>(86400);
  const [hasCanary, setHasCanary] = useState(false);
  const [canaryUrl, setCanaryUrl] = useState('');

  // Time Lock & Jalali Date Picker
  const [hasTimeLock, setHasTimeLock] = useState(false);
  const [unlockAt, setUnlockAt] = useState<number | null>(null);

  const [jYear, setJYear] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [jy] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jy;
  });
  const [jMonth, setJMonth] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jm;
  });
  const [jDay, setJDay] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, , jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jd;
  });
  const [jHour, setJHour] = useState<number>(() => new Date().getHours());
  const [jMinute, setJMinute] = useState<number>(() => new Date().getMinutes());

  // Sync Jalali picker with unlockAt timestamp if Jalali date lock is enabled
  useEffect(() => {
    if (language === 'fa' && hasTimeLock) {
      try {
        const [gy, gm, gd] = jalaliToGregorian(jYear, jMonth, jDay);
        const gDate = new Date(gy, gm - 1, gd, jHour, jMinute, 0);
        setUnlockAt(Math.floor(gDate.getTime() / 1000));
      } catch (err) {
        console.error('Error converting Jalali to Gregorian:', err);
      }
    }
  }, [jYear, jMonth, jDay, jHour, jMinute, language, hasTimeLock]);

  // Self-Destruct Settings
  const [hasSelfDestruct, setHasSelfDestruct] = useState(false);
  const [selfDestructHides, setSelfDestructHides] = useState<number>(3);
  const [selfDestructTriggers, setSelfDestructTriggers] = useState<string[]>(['tab']);

  // Shamir Secret Sharing (Multi-Party Custody)
  const [hasShamir, setHasShamir] = useState(false);
  const [shamirThreshold, setShamirThreshold] = useState<number>(3);
  const [shamirTotal, setShamirTotal] = useState<number>(5);
  const [shamirShares, setShamirShares] = useState<string[]>([]);

  // Network / ASN Lock
  const [hasAsnLock, setHasAsnLock] = useState(false);
  const [asnMode, setAsnMode] = useState<'block' | 'allow'>('block');
  const [asnSelected, setAsnSelected] = useState('');

  // File & Steganography Attachments
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [stegoCapacity, setStegoCapacity] = useState<number>(0);

  // Reset form helper
  const resetVaultState = () => {
    resetMessage('');
    setPassword('');
    setShowMasterPwd(false);
    setHasPassword(true);
    setBurnAfterRead(false);
    setMaxViews('');
    setExpiresIn(86400);
    setHasHoney(false);
    setHoneyPwd('');
    setShowHoneyPwd(false);
    setHoneyContent('');
    setHasGeoLock(false);
    setAllowedCountries([]);
    setHasDeadMans(false);
    setDeadMansInterval(86400);
    setHasCanary(false);
    setCanaryUrl('');
    setHasTimeLock(false);
    setUnlockAt(null);
    setHasSelfDestruct(false);
    setSelfDestructHides(3);
    setSelfDestructTriggers(['tab']);
    setHasShamir(false);
    setShamirThreshold(3);
    setShamirTotal(5);
    setShamirShares([]);
    setHasAsnLock(false);
    setAsnMode('block');
    setAsnSelected('');
    setSelectedFile(null);
    setStegoImage(null);
    setStegoCapacity(0);
  };

  return {
    contentType,
    setContentType,
    message,
    setMessage,
    undoMessage,
    redoMessage,
    password,
    setPassword,
    showMasterPwd,
    setShowMasterPwd,
    hasPassword,
    setHasPassword,
    burnAfterRead,
    setBurnAfterRead,
    maxViews,
    setMaxViews,
    expiresIn,
    setExpiresIn,
    hasHoney,
    setHasHoney,
    honeyPwd,
    setHoneyPwd,
    showHoneyPwd,
    setShowHoneyPwd,
    honeyContent,
    setHoneyContent,
    hasGeoLock,
    setHasGeoLock,
    allowedCountries,
    setAllowedCountries,
    hasDeadMans,
    setHasDeadMans,
    deadMansInterval,
    setDeadMansInterval,
    hasCanary,
    setHasCanary,
    canaryUrl,
    setCanaryUrl,
    hasTimeLock,
    setHasTimeLock,
    unlockAt,
    setUnlockAt,
    jYear,
    setJYear,
    jMonth,
    setJMonth,
    jDay,
    setJDay,
    jHour,
    setJHour,
    jMinute,
    setJMinute,
    hasSelfDestruct,
    setHasSelfDestruct,
    selfDestructHides,
    setSelfDestructHides,
    selfDestructTriggers,
    setSelfDestructTriggers,
    hasShamir,
    setHasShamir,
    shamirThreshold,
    setShamirThreshold,
    shamirTotal,
    setShamirTotal,
    shamirShares,
    setShamirShares,
    hasAsnLock,
    setHasAsnLock,
    asnMode,
    setAsnMode,
    asnSelected,
    setAsnSelected,
    selectedFile,
    setSelectedFile,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    setStegoCapacity,
    resetVaultState,
  };
}
