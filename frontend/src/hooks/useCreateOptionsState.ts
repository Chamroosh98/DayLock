import { useState } from 'react';

export const useCreateOptionsState = () => {
  // Passwords & Core Security
  const [password, setPassword] = useState('');
  const [showMasterPwd, setShowMasterPwd] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [expiresIn, setExpiresIn] = useState(86400);

  // Honeypot Decoy
  const [hasHoney, setHasHoney] = useState(false);
  const [honeyPwd, setHoneyPwd] = useState('');
  const [showHoneyPwd, setShowHoneyPwd] = useState(false);
  const [honeyContent, setHoneyContent] = useState('');

  // Password Visibility toggles for sub-modules
  const [showAudioEmbedPwd, setShowAudioEmbedPwd] = useState(false);
  const [showViewPwd, setShowViewPwd] = useState(false);
  const [showStegoExtractPwd, setShowStegoExtractPwd] = useState(false);

  // Geo Lock
  const [hasGeoLock, setHasGeoLock] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);

  // Dead Man's Switch
  const [hasDeadMans, setHasDeadMans] = useState(false);
  const [deadMansInterval, setDeadMansInterval] = useState<number | null>(86400);

  // Canary Token
  const [hasCanary, setHasCanary] = useState(false);
  const [canaryUrl, setCanaryUrl] = useState('');

  // Time Lock
  const [hasTimeLock, setHasTimeLock] = useState(false);
  const [unlockAt, setUnlockAt] = useState<number | null>(null);

  // Self Destruct
  const [hasSelfDestruct, setHasSelfDestruct] = useState(false);
  const [selfDestructHides, setSelfDestructHides] = useState(3);
  const [selfDestructTriggers, setSelfDestructTriggers] = useState<string[]>(['tab']);

  // ASN Lock
  const [hasAsnLock, setHasAsnLock] = useState(false);
  const [asnMode, setAsnMode] = useState<'block' | 'allow'>('block');
  const [asnSelected, setAsnSelected] = useState('');

  // Audio Stego state
  const [audioWavBytes, setAudioWavBytes] = useState<Uint8Array | null>(null);
  const [audioFilename, setAudioFilename] = useState('');
  const [audioText, setAudioText] = useState('');
  const [audioWavCapacity, setAudioWavCapacity] = useState(0);
  const [audioWaveformSamples, setAudioWaveformSamples] = useState<Float32Array | null>(null);
  const [audioWavPayload, setAudioWavPayload] = useState<Uint8Array | null>(null);
  const [audioEmbedPassword, setAudioEmbedPassword] = useState('');
  const [audioMode, setAudioMode] = useState<'record' | 'stego'>('record');

  const resetCreateOptions = () => {
    setPassword('');
    setHasPassword(true);
    setBurnAfterRead(false);
    setMaxViews('');
    setExpiresIn(86400);

    setHasHoney(false);
    setHoneyPwd('');
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

    setHasAsnLock(false);
    setAsnMode('block');
    setAsnSelected('');

    setAudioWavBytes(null);
    setAudioFilename('');
    setAudioText('');
    setAudioWavCapacity(0);
    setAudioWaveformSamples(null);
    setAudioWavPayload(null);
    setAudioEmbedPassword('');
    setAudioMode('record');
  };

  return {
    password, setPassword,
    showMasterPwd, setShowMasterPwd,
    hasPassword, setHasPassword,
    burnAfterRead, setBurnAfterRead,
    maxViews, setMaxViews,
    expiresIn, setExpiresIn,

    hasHoney, setHasHoney,
    honeyPwd, setHoneyPwd,
    showHoneyPwd, setShowHoneyPwd,
    honeyContent, setHoneyContent,

    showAudioEmbedPwd, setShowAudioEmbedPwd,
    showViewPwd, setShowViewPwd,
    showStegoExtractPwd, setShowStegoExtractPwd,

    hasGeoLock, setHasGeoLock,
    allowedCountries, setAllowedCountries,

    hasDeadMans, setHasDeadMans,
    deadMansInterval, setDeadMansInterval,

    hasCanary, setHasCanary,
    canaryUrl, setCanaryUrl,

    hasTimeLock, setHasTimeLock,
    unlockAt, setUnlockAt,

    hasSelfDestruct, setHasSelfDestruct,
    selfDestructHides, setSelfDestructHides,
    selfDestructTriggers, setSelfDestructTriggers,

    hasAsnLock, setHasAsnLock,
    asnMode, setAsnMode,
    asnSelected, setAsnSelected,

    audioWavBytes, setAudioWavBytes,
    audioFilename, setAudioFilename,
    audioText, setAudioText,
    audioWavCapacity, setAudioWavCapacity,
    audioWaveformSamples, setAudioWaveformSamples,
    audioWavPayload, setAudioWavPayload,
    audioEmbedPassword, setAudioEmbedPassword,
    audioMode, setAudioMode,

    resetCreateOptions,
  };
};
