import { useState, useEffect, useCallback } from 'react';
import { CreateTabProps } from '../types';
import { useVaultState } from '../../../hooks/useVaultState';
import { useVoiceRecording } from './useVoiceRecording';
import { useShamirSecretSharing } from './useShamirSecretSharing';
import { useStegoState } from './useStegoState';
import { useAudioStegoState } from './useAudioStegoState';
import { useE2EChannelState } from './useE2EChannelState';
import { useCountryFilter } from './useCountryFilter';
import { validateCreateConfiguration } from './useCreateValidation';
import { executeEncryption } from './useEncryptionExecutor';

export const useCreateLogic = (props: CreateTabProps) => {
  const {
    contentType,
    language,
    t,
    setStatus,
    setIsLoading,
    setShowPasswordWarning,
    setShowContentWarning,
    copyToClipboardWithAutoClear,
    resetTrigger
  } = props;

  const vault = useVaultState({ language, initialContentType: contentType });
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const countryFilter = useCountryFilter();
  const voice = useVoiceRecording(language, setStatus, t);
  const shamir = useShamirSecretSharing(setIsLoading, setStatus, t);
  const stego = useStegoState(language, setStatus, t, vault.setSelectedFile, vault.setStegoImage, vault.setStegoCapacity);
  const audio = useAudioStegoState();
  const e2e = useE2EChannelState(
    vault.expiresIn,
    vault.hasAsnLock,
    vault.asnMode,
    vault.asnSelected,
    language,
    t,
    setStatus,
    setResultUrl,
    copyToClipboardWithAutoClear
  );

  const resetCreateForm = useCallback(() => {
    vault.setMessage('');
    vault.setPassword('');
    vault.setHasPassword(true);
    vault.setBurnAfterRead(false);
    vault.setMaxViews('');
    vault.setExpiresIn(86400);
    vault.setHasHoney(false);
    vault.setHoneyPwd('');
    vault.setHoneyContent('');
    vault.setHasGeoLock(false);
    vault.setAllowedCountries([]);
    countryFilter.setCountrySearch('');
    vault.setHasDeadMans(false);
    vault.setDeadMansInterval(86400);
    vault.setHasCanary(false);
    vault.setCanaryUrl('');
    vault.setHasTimeLock(false);
    vault.setUnlockAt(null);
    vault.setHasSelfDestruct(false);
    vault.setSelfDestructHides(3);
    vault.setSelfDestructTriggers(['tab']);
    vault.setSelectedFile(null);
    vault.setStegoImage(null);
    setResultUrl(null);
    
    vault.setHasAsnLock(false);
    vault.setAsnMode('block');
    vault.setAsnSelected('');

    voice.resetRecording();
    shamir.resetShamir();
    stego.resetStegoResult();
    audio.resetAudioStego();
    e2e.resetE2E();
  }, [vault, countryFilter, voice, shamir, stego, audio, e2e]);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      resetCreateForm();
    }
  }, [resetTrigger, resetCreateForm]);

  const validateConfiguration = useCallback((): string | null => {
    return validateCreateConfiguration({
      contentType,
      message: vault.message,
      selectedFile: vault.selectedFile,
      audioMode: audio.audioMode,
      audioBlob: voice.audioBlob,
      audioWavBytes: audio.audioWavBytes,
      audioText: audio.audioText,
      hasPassword: vault.hasPassword,
      password: vault.password,
      hasHoney: vault.hasHoney,
      honeyPwd: vault.honeyPwd,
      honeyContent: vault.honeyContent,
      hasGeoLock: vault.hasGeoLock,
      allowedCountries: vault.allowedCountries,
      hasDeadMans: vault.hasDeadMans,
      deadMansInterval: vault.deadMansInterval,
      hasCanary: vault.hasCanary,
      canaryUrl: vault.canaryUrl,
      hasTimeLock: vault.hasTimeLock,
      unlockAt: vault.unlockAt,
      hasSelfDestruct: vault.hasSelfDestruct,
      selfDestructHides: vault.selfDestructHides,
      selfDestructTriggers: vault.selfDestructTriggers,
      hasShamir: vault.hasShamir,
      shamirThreshold: vault.shamirThreshold,
      shamirTotal: vault.shamirTotal,
      t
    });
  }, [contentType, vault, audio, voice, t]);

  const isConfigurationValid = useCallback(() => {
    return validateConfiguration() === null;
  }, [validateConfiguration]);

  const handleCreate = async () => {
    await executeEncryption({
      contentType,
      message: vault.message,
      selectedFile: vault.selectedFile,
      audioMode: audio.audioMode,
      audioBlob: voice.audioBlob,
      audioWavBytes: audio.audioWavBytes,
      audioText: audio.audioText,
      audioFilename: audio.audioFilename,
      audioEmbedPassword: audio.audioEmbedPassword,
      password: vault.password,
      hasPassword: vault.hasPassword,
      hasShamir: vault.hasShamir,
      shamirThreshold: vault.shamirThreshold,
      shamirTotal: vault.shamirTotal,
      setShamirShares: vault.setShamirShares,
      stegoCapacity: vault.stegoCapacity,
      expiresIn: vault.expiresIn,
      burnAfterRead: vault.burnAfterRead,
      maxViews: vault.maxViews,
      hasHoney: vault.hasHoney,
      honeyPwd: vault.honeyPwd,
      honeyContent: vault.honeyContent,
      hasGeoLock: vault.hasGeoLock,
      allowedCountries: vault.allowedCountries,
      hasDeadMans: vault.hasDeadMans,
      deadMansInterval: vault.deadMansInterval,
      hasCanary: vault.hasCanary,
      canaryUrl: vault.canaryUrl,
      hasTimeLock: vault.hasTimeLock,
      unlockAt: vault.unlockAt,
      hasSelfDestruct: vault.hasSelfDestruct,
      selfDestructHides: vault.selfDestructHides,
      selfDestructTriggers: vault.selfDestructTriggers,
      hasAsnLock: vault.hasAsnLock,
      asnMode: vault.asnMode,
      asnSelected: vault.asnSelected,
      language,
      t,
      setStatus,
      setIsLoading,
      setStegoResultFile: stego.setStegoResultFile,
      setResultUrl,
      setShowContentWarning,
      setShowPasswordWarning,
      validateConfiguration
    });
  };

  return {
    ...vault,
    countrySearch: countryFilter.countrySearch,
    setCountrySearch: countryFilter.setCountrySearch,
    countryResults: countryFilter.countryResults,
    resultUrl,
    setResultUrl,
    showAudioEmbedPwd: audio.showAudioEmbedPwd,
    setShowAudioEmbedPwd: audio.setShowAudioEmbedPwd,
    hoveredShamirTrash: shamir.hoveredShamirTrash,
    setHoveredShamirTrash: shamir.setHoveredShamirTrash,
    shamirSecret: shamir.shamirSecret,
    setShamirSecret: shamir.setShamirSecret,
    shamirTotal: shamir.shamirTotal,
    setShamirTotal: shamir.setShamirTotal,
    shamirThreshold: shamir.shamirThreshold,
    setShamirThreshold: shamir.setShamirThreshold,
    shamirShares: shamir.shamirShares,
    setShamirShares: shamir.setShamirShares,
    shamirCombineInputs: shamir.shamirCombineInputs,
    setShamirCombineInputs: shamir.setShamirCombineInputs,
    shamirResult: shamir.shamirResult,
    setShamirResult: shamir.setShamirResult,
    isRecording: voice.isRecording,
    recordingTime: voice.recordingTime,
    audioBlob: voice.audioBlob,
    setAudioBlob: voice.setAudioBlob,
    stegoResultFile: stego.stegoResultFile,
    setStegoResultFile: stego.setStegoResultFile,
    audioWavBytes: audio.audioWavBytes,
    setAudioWavBytes: audio.setAudioWavBytes,
    audioFilename: audio.audioFilename,
    setAudioFilename: audio.setAudioFilename,
    audioText: audio.audioText,
    setAudioText: audio.setAudioText,
    audioWavCapacity: audio.audioWavCapacity,
    setAudioWavCapacity: audio.setAudioWavCapacity,
    audioWaveformSamples: audio.audioWaveformSamples,
    setAudioWaveformSamples: audio.setAudioWaveformSamples,
    audioEmbedPassword: audio.audioEmbedPassword,
    setAudioEmbedPassword: audio.setAudioEmbedPassword,
    audioMode: audio.audioMode,
    setAudioMode: audio.setAudioMode,
    e2eKeyPair: e2e.e2eKeyPair,
    setE2EKeyPair: e2e.setE2EKeyPair,
    e2eChannelDetails: e2e.e2eChannelDetails,
    setE2EChannelDetails: e2e.setE2EChannelDetails,
    isE2ELoading: e2e.isE2ELoading,
    stegoCanvasRef: stego.stegoCanvasRef,
    formatTime: voice.formatTime,
    toggleRecording: voice.toggleRecording,
    handleFileChangeDirect: stego.handleFileChangeDirect,
    handleFileSelect: stego.handleFileSelect,
    handleShamirTotalChangeFA: shamir.handleShamirTotalChangeFA,
    handleShamirThresholdChangeFA: shamir.handleShamirThresholdChangeFA,
    handleShamirTotalBlurFA: shamir.handleShamirTotalBlurFA,
    handleShamirThresholdBlurFA: shamir.handleShamirThresholdBlurFA,
    handleShamirSplit: shamir.handleShamirSplit,
    handleShamirCombine: shamir.handleShamirCombine,
    isConfigurationValid,
    handleCreateE2EChannel: e2e.handleCreateE2EChannel,
    handleCreate,
    resetCreateForm
  };
};
