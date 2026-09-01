export interface ValidationParams {
  contentType: string;
  message: string;
  selectedFile: File | null;
  audioMode: 'record' | 'stego';
  audioBlob: Blob | null;
  audioWavBytes: Uint8Array | null;
  audioText: string;
  hasPassword: boolean;
  password: string;
  hasHoney: boolean;
  honeyPwd: string;
  honeyContent: string;
  hasGeoLock: boolean;
  allowedCountries: string[];
  hasDeadMans: boolean;
  deadMansInterval: number;
  hasCanary: boolean;
  canaryUrl: string;
  hasTimeLock: boolean;
  unlockAt: number | null;
  hasSelfDestruct: boolean;
  selfDestructHides: number;
  selfDestructTriggers: string[];
  hasShamir?: boolean;
  shamirThreshold?: number;
  shamirTotal?: number;
  t: Record<string, string>;
}

export const validateCreateConfiguration = (params: ValidationParams): string | null => {
  const {
    contentType,
    message,
    selectedFile,
    audioMode,
    audioBlob,
    audioWavBytes,
    audioText,
    hasPassword,
    password,
    hasHoney,
    honeyPwd,
    honeyContent,
    hasGeoLock,
    allowedCountries,
    hasDeadMans,
    deadMansInterval,
    hasCanary,
    canaryUrl,
    hasTimeLock,
    unlockAt,
    hasSelfDestruct,
    selfDestructHides,
    selfDestructTriggers,
    hasShamir,
    shamirThreshold = 3,
    shamirTotal = 5,
    t
  } = params;

  if (contentType === 'text' && !message.trim()) return t.contentWarningDesc || "Please enter text message.";
  if (contentType === 'file' && !selectedFile) return t.selectFileWarning || t.contentWarningDesc || "Please select a file.";
  if (contentType === 'image' && !selectedFile) return t.selectImageWarning || t.contentWarningDesc || "Please select an image.";
  if (contentType === 'stego') {
    if (!selectedFile) return t.stegoSelectCoverFirst || "Please select a cover image.";
    if (!message.trim()) return t.stegoEnterMessageFirst || "Please enter the secret message to hide.";
  }
  if (contentType === 'audio') {
    if (audioMode === 'record' && !audioBlob) return t.recordAudioFirst || "Please record audio first.";
    if (audioMode === 'stego') {
      if (!audioWavBytes) return t.loadWavAudioFirst || "Please load a WAV audio file.";
      if (!audioText.trim()) return t.enterAudioSecretMessage || "Please enter secret message for audio.";
    }
  }
  if (hasShamir) {
    if (shamirThreshold < 2 || shamirTotal < shamirThreshold) {
      return t.thresholdNotMet || "Invalid Shamir threshold configuration";
    }
  } else if (contentType !== 'stego' && hasPassword && !password) {
    return t.invalidPassword || "Password is required.";
  }
  if (hasHoney && (!honeyPwd || !honeyContent.trim())) return t.honeyPotIncomplete || "HoneyPot decoy configuration is incomplete.";
  if (hasGeoLock && allowedCountries.length === 0) return t.geoLockCountryRequired || "Please select at least one country for Geo-Lock.";
  if (hasDeadMans && !deadMansInterval) return t.deadMansIntervalRequired || "Please specify Dead Man interval.";
  if (hasCanary && !canaryUrl.trim()) return t.canaryUrlRequired || "Please enter Canary token webhook URL.";
  if (hasTimeLock && !unlockAt) return t.timeLockTimeRequired || "Please specify Time-Lock unlock time.";
  if (hasSelfDestruct && (!selfDestructHides || selfDestructHides <= 0 || selfDestructTriggers.length === 0)) {
    return t.selfDestructConfigIncomplete || "Self-destruct configuration is incomplete.";
  }

  return null;
};
