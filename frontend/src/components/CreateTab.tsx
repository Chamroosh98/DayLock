import React, { useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Sparkles, Shield } from 'lucide-react';
import { ContentType, Language } from '../types';
import { ContentTypeSelector } from './create/ContentTypeSelector';
import { CreateTextSection } from './create/CreateTextSection';
import { CreateFileSection } from './create/CreateFileSection';
import { CreateStegoSection } from './create/CreateStegoSection';
import { CreateAudioSection } from './create/CreateAudioSection';
import { ShamirSection } from './create/ShamirSection';
import { CreateE2ESection } from './create/CreateE2ESection';
import { SecurityOptionsGrid } from './create/SecurityOptionsGrid';
import { CreationResultCard } from './create/CreationResultCard';
import { DraftAutoSaveBanner } from './DraftAutoSaveBanner';
import { useDraftAutoSave, DraftData } from '../hooks/useDraftAutoSave';
import { COUNTRIES } from '../data/countries';

export interface CreateTabProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  status: any;
  setStatus: (status: any) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  imageAcquisition: 'camera' | 'upload' | null;
  setImageAcquisition: (val: 'camera' | 'upload' | null) => void;
  message: string;
  setMessage: (val: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChangeDirect: (file: File | null) => void;
  stegoImage: string | null;
  setStegoImage: (val: string | null) => void;
  stegoCapacity: number;
  stegoCanvasRef: React.RefObject<HTMLCanvasElement>;
  stegoPassword: string;
  setStegoPassword: (val: string) => void;
  showStegoPwd: boolean;
  setShowStegoPwd: (val: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
  shamirSecret: string;
  setShamirSecret: (val: string) => void;
  shamirTotal: number;
  setShamirTotal: (val: number) => void;
  shamirThreshold: number;
  setShamirThreshold: (val: number) => void;
  handleShamirTotalChangeFA: (val: string) => void;
  handleShamirTotalBlurFA: () => void;
  handleShamirThresholdChangeFA: (val: string) => void;
  handleShamirThresholdBlurFA: () => void;
  handleShamirSplit: () => void;
  shamirShares: string[];
  shamirCombineInputs: string[];
  setShamirCombineInputs: React.Dispatch<React.SetStateAction<string[]>>;
  hoveredShamirTrash: number | null;
  setHoveredShamirTrash: (val: number | null) => void;
  handleShamirCombine: () => void;
  shamirResult: string | null;
  audioMode: 'record' | 'stego';
  setAudioMode: (mode: 'record' | 'stego') => void;
  audioText: string;
  setAudioText: (val: string) => void;
  audioBlob: Blob | null;
  setAudioBlob: (val: Blob | null) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  formatTime: (s: number) => string;
  recordingTime: number;
  toggleRecording: () => void;
  audioWavBytes: Uint8Array | null;
  setAudioWavBytes: (val: Uint8Array | null) => void;
  audioWavCapacity: number;
  setAudioWavCapacity: (val: number) => void;
  audioFilename: string;
  setAudioFilename: (val: string) => void;
  audioWaveformSamples: Float32Array | null;
  setAudioWaveformSamples: (val: Float32Array | null) => void;
  showAudioEmbedPwd: boolean;
  setShowAudioEmbedPwd: (val: boolean) => void;
  audioEmbedPassword: string;
  setAudioEmbedPassword: (val: string) => void;
  e2eKeyPair: any;
  setE2EKeyPair: (val: any) => void;
  e2eChannelDetails: any;
  handleCreateE2EChannel: () => void;
  isE2ELoading: boolean;
  burnAfterRead: boolean;
  setBurnAfterRead: (val: boolean) => void;
  hasPassword: boolean;
  setHasPassword: (val: boolean) => void;
  password: string;
  setPassword: (val: string) => void;
  showMasterPwd: boolean;
  setShowMasterPwd: (val: boolean) => void;
  hasDeadMans: boolean;
  setHasDeadMans: (val: boolean) => void;
  deadMansInterval: number | null;
  setDeadMansInterval: (val: number | null) => void;
  hasCanary: boolean;
  setHasCanary: (val: boolean) => void;
  canaryUrl: string;
  setCanaryUrl: (val: string) => void;
  hasHoney: boolean;
  setHasHoney: (val: boolean) => void;
  honeyPwd: string;
  setHoneyPwd: (val: string) => void;
  showHoneyPwd: boolean;
  setShowHoneyPwd: (val: boolean) => void;
  honeyContent: string;
  setHoneyContent: (val: string) => void;
  hasSelfDestruct: boolean;
  setHasSelfDestruct: (val: boolean) => void;
  selfDestructHides: number;
  setSelfDestructHides: (val: number) => void;
  selfDestructTriggers: string[];
  setSelfDestructTriggers: (val: string[]) => void;
  hasTimeLock: boolean;
  setHasTimeLock: (val: boolean) => void;
  unlockAt: number | null;
  setUnlockAt: (val: number | null) => void;
  jYear: number;
  setJYear: (val: number) => void;
  jMonth: number;
  setJMonth: (val: number) => void;
  jDay: number;
  setJDay: (val: number) => void;
  jHour: number;
  setJHour: (val: number) => void;
  jMinute: number;
  setJMinute: (val: number) => void;
  hasGeoLock: boolean;
  setHasGeoLock: (val: boolean) => void;
  countrySearch: string;
  setCountrySearch: (val: string) => void;
  countryResults: typeof COUNTRIES;
  setCountryResults: (val: typeof COUNTRIES) => void;
  allowedCountries: string[];
  setAllowedCountries: (val: string[]) => void;
  hasAsnLock: boolean;
  setHasAsnLock: (val: boolean) => void;
  asnMode: 'block' | 'allow';
  setAsnMode: (val: 'block' | 'allow') => void;
  asnSelected: string;
  setAsnSelected: (val: string) => void;
  expiresIn: number;
  setExpiresIn: (val: number) => void;
  maxViews: number | '';
  setMaxViews: (val: number | '') => void;
  isConfigurationValid: () => boolean;
  isLoading: boolean;
  handleCreate: () => void;
  resultUrl: string | null;
  copyToClipboardWithAutoClear: (content: string, delay: number, onWarn: (msg: string) => void, lang: any) => void;
}

export const CreateTab: React.FC<CreateTabProps> = (props) => {
  const {
    isDarkMode,
    language,
    t,
    contentType,
    setContentType,
    isConfigurationValid,
    isLoading,
    handleCreate,
    resultUrl,
    copyToClipboardWithAutoClear,
    setStatus,
  } = props;

  // Memoize current draft state for auto-saving
  const draftState = useMemo(
    () => ({
      contentType,
      message: props.message,
      filename: props.selectedFile?.name || props.audioFilename,
      password: props.password,
      hasPassword: props.hasPassword,
      burnAfterRead: props.burnAfterRead,
      expiresIn: props.expiresIn,
      hasHoney: props.hasHoney,
      honeyPwd: props.honeyPwd,
      honeyContent: props.honeyContent,
      hasGeoLock: props.hasGeoLock,
      allowedCountries: props.allowedCountries,
    }),
    [
      contentType,
      props.message,
      props.selectedFile,
      props.audioFilename,
      props.password,
      props.hasPassword,
      props.burnAfterRead,
      props.expiresIn,
      props.hasHoney,
      props.honeyPwd,
      props.honeyContent,
      props.hasGeoLock,
      props.allowedCountries,
    ]
  );

  const handleRestoreState = useCallback(
    (draft: DraftData) => {
      if (draft.contentType) setContentType(draft.contentType as ContentType);
      if (draft.message) props.setMessage(draft.message);
      if (draft.password) props.setPassword(draft.password);
      if (typeof draft.hasPassword === 'boolean') props.setHasPassword(draft.hasPassword);
      if (typeof draft.burnAfterRead === 'boolean') props.setBurnAfterRead(draft.burnAfterRead);
      if (typeof draft.expiresIn === 'number') props.setExpiresIn(draft.expiresIn);
      if (typeof draft.hasHoney === 'boolean') props.setHasHoney(draft.hasHoney);
      if (draft.honeyPwd) props.setHoneyPwd(draft.honeyPwd);
      if (draft.honeyContent) props.setHoneyContent(draft.honeyContent);
      if (typeof draft.hasGeoLock === 'boolean') props.setHasGeoLock(draft.hasGeoLock);
      if (draft.allowedCountries) props.setAllowedCountries(draft.allowedCountries);
    },
    [props, setContentType]
  );

  const { hasDraft, draftInfo, restoreDraft, clearDraft } = useDraftAutoSave(
    draftState,
    handleRestoreState,
    setStatus,
    language
  );

  const handleCreateAndClearDraft = useCallback(() => {
    clearDraft();
    handleCreate();
  }, [clearDraft, handleCreate]);

  return (
    <div className="space-y-8">
      {/* Draft Auto-Save Restore Banner */}
      <DraftAutoSaveBanner
        hasDraft={hasDraft}
        draftInfo={draftInfo}
        onRestore={restoreDraft}
        onDiscard={clearDraft}
        isDarkMode={isDarkMode}
        language={language}
      />

      {/* Content Type Selector */}
      <ContentTypeSelector
        contentType={contentType}
        setContentType={setContentType}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* Main Payload Input Area */}
      <div className="space-y-6">
        {contentType === 'text' && (
          <CreateTextSection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            message={props.message}
            setMessage={props.setMessage}
            handleTouchStart={props.handleTouchStart}
            handleTouchEnd={props.handleTouchEnd}
          />
        )}

        {contentType === 'file' && (
          <CreateFileSection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            imageAcquisition={props.imageAcquisition}
            setImageAcquisition={props.setImageAcquisition}
            selectedFile={props.selectedFile}
            setSelectedFile={props.setSelectedFile}
            handleFileSelect={props.handleFileSelect}
            handleFileChangeDirect={props.handleFileChangeDirect}
          />
        )}

        {contentType === 'stego' && (
          <CreateStegoSection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            stegoImage={props.stegoImage}
            stegoCapacity={props.stegoCapacity}
            stegoCanvasRef={props.stegoCanvasRef}
            handleStegoImageSelect={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  props.setStegoImage(evt.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            message={props.message}
            setMessage={props.setMessage}
            stegoPassword={props.stegoPassword}
            setStegoPassword={props.setStegoPassword}
            showStegoPwd={props.showStegoPwd}
            setShowStegoPwd={props.setShowStegoPwd}
            disabledInputs={props.disabledInputs}
            handlePasswordChange={props.handlePasswordChange}
            handlePasswordKeyDown={props.handlePasswordKeyDown}
            handleTouchStart={props.handleTouchStart}
            handleTouchEnd={props.handleTouchEnd}
          />
        )}

        {contentType === 'audio' && (
          <CreateAudioSection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            audioMode={props.audioMode}
            setAudioMode={props.setAudioMode}
            audioText={props.audioText}
            setAudioText={props.setAudioText}
            audioBlob={props.audioBlob}
            setAudioBlob={props.setAudioBlob}
            isRecording={props.isRecording}
            setIsRecording={props.setIsRecording}
            formatTime={props.formatTime}
            recordingTime={props.recordingTime}
            toggleRecording={props.toggleRecording}
            audioWavBytes={props.audioWavBytes}
            setAudioWavBytes={props.setAudioWavBytes}
            audioWavCapacity={props.audioWavCapacity}
            setAudioWavCapacity={props.setAudioWavCapacity}
            audioFilename={props.audioFilename}
            setAudioFilename={props.setAudioFilename}
            audioWaveformSamples={props.audioWaveformSamples}
            setAudioWaveformSamples={props.setAudioWaveformSamples}
            showAudioEmbedPwd={props.showAudioEmbedPwd}
            setShowAudioEmbedPwd={props.setShowAudioEmbedPwd}
            audioEmbedPassword={props.audioEmbedPassword}
            setAudioEmbedPassword={props.setAudioEmbedPassword}
            message={props.message}
            setMessage={props.setMessage}
            disabledInputs={props.disabledInputs}
            handlePasswordChange={props.handlePasswordChange}
            handlePasswordKeyDown={props.handlePasswordKeyDown}
            handleTouchStart={props.handleTouchStart}
            handleTouchEnd={props.handleTouchEnd}
          />
        )}

        {contentType === 'shamir' && (
          <ShamirSection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            shamirSecret={props.shamirSecret}
            setShamirSecret={props.setShamirSecret}
            shamirTotal={props.shamirTotal}
            setShamirTotal={props.setShamirTotal}
            shamirThreshold={props.shamirThreshold}
            setShamirThreshold={props.setShamirThreshold}
            handleShamirTotalChangeFA={props.handleShamirTotalChangeFA}
            handleShamirTotalBlurFA={props.handleShamirTotalBlurFA}
            handleShamirThresholdChangeFA={props.handleShamirThresholdChangeFA}
            handleShamirThresholdBlurFA={props.handleShamirThresholdBlurFA}
            handleShamirSplit={props.handleShamirSplit}
            shamirShares={props.shamirShares}
            shamirCombineInputs={props.shamirCombineInputs}
            setShamirCombineInputs={props.setShamirCombineInputs}
            hoveredShamirTrash={props.hoveredShamirTrash}
            setHoveredShamirTrash={props.setHoveredShamirTrash}
            handleShamirCombine={props.handleShamirCombine}
            shamirResult={props.shamirResult}
            copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
            setStatus={setStatus}
          />
        )}

        {contentType === 'e2e' && (
          <CreateE2ESection
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            e2eKeyPair={props.e2eKeyPair}
            setE2EKeyPair={props.setE2EKeyPair}
            e2eChannelDetails={props.e2eChannelDetails}
            handleCreateE2EChannel={props.handleCreateE2EChannel}
            isE2ELoading={props.isE2ELoading}
            copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
            setStatus={setStatus}
          />
        )}
      </div>

      {/* Security Options Grid (for non-E2E / non-Shamir or general use) */}
      {contentType !== 'e2e' && contentType !== 'shamir' && (
        <SecurityOptionsGrid
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          burnAfterRead={props.burnAfterRead}
          setBurnAfterRead={props.setBurnAfterRead}
          hasPassword={props.hasPassword}
          setHasPassword={props.setHasPassword}
          password={props.password}
          setPassword={props.setPassword}
          showMasterPwd={props.showMasterPwd}
          setShowMasterPwd={props.setShowMasterPwd}
          hasDeadMans={props.hasDeadMans}
          setHasDeadMans={props.setHasDeadMans}
          deadMansInterval={props.deadMansInterval}
          setDeadMansInterval={props.setDeadMansInterval}
          hasCanary={props.hasCanary}
          setHasCanary={props.setHasCanary}
          canaryUrl={props.canaryUrl}
          setCanaryUrl={props.setCanaryUrl}
          hasHoney={props.hasHoney}
          setHasHoney={props.setHasHoney}
          honeyPwd={props.honeyPwd}
          setHoneyPwd={props.setHoneyPwd}
          showHoneyPwd={props.showHoneyPwd}
          setShowHoneyPwd={props.setShowHoneyPwd}
          honeyContent={props.honeyContent}
          setHoneyContent={props.setHoneyContent}
          hasSelfDestruct={props.hasSelfDestruct}
          setHasSelfDestruct={props.setHasSelfDestruct}
          selfDestructHides={props.selfDestructHides}
          setSelfDestructHides={props.setSelfDestructHides}
          selfDestructTriggers={props.selfDestructTriggers}
          setSelfDestructTriggers={props.setSelfDestructTriggers}
          hasTimeLock={props.hasTimeLock}
          setHasTimeLock={props.setHasTimeLock}
          unlockAt={props.unlockAt}
          setUnlockAt={props.setUnlockAt}
          jYear={props.jYear}
          setJYear={props.setJYear}
          jMonth={props.jMonth}
          setJMonth={props.setJMonth}
          jDay={props.jDay}
          setJDay={props.setJDay}
          jHour={props.jHour}
          setJHour={props.setJHour}
          jMinute={props.jMinute}
          setJMinute={props.setJMinute}
          hasGeoLock={props.hasGeoLock}
          setHasGeoLock={props.setHasGeoLock}
          countrySearch={props.countrySearch}
          setCountrySearch={props.setCountrySearch}
          countryResults={props.countryResults}
          setCountryResults={props.setCountryResults}
          allowedCountries={props.allowedCountries}
          setAllowedCountries={props.setAllowedCountries}
          hasAsnLock={props.hasAsnLock}
          setHasAsnLock={props.setHasAsnLock}
          asnMode={props.asnMode}
          setAsnMode={props.setAsnMode}
          asnSelected={props.asnSelected}
          setAsnSelected={props.setAsnSelected}
          expiresIn={props.expiresIn}
          setExpiresIn={props.setExpiresIn}
          maxViews={props.maxViews}
          setMaxViews={props.setMaxViews}
          disabledInputs={props.disabledInputs}
          handlePasswordChange={props.handlePasswordChange}
          handlePasswordKeyDown={props.handlePasswordKeyDown}
        />
      )}

      {/* Main Submit Button */}
      {contentType !== 'e2e' && contentType !== 'shamir' && (
        <button
          type="button"
          onClick={handleCreateAndClearDraft}
          disabled={!isConfigurationValid() || isLoading}
          className="w-full py-5 rounded-[28px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {t.createEncryptedSecret}
            </>
          )}
        </button>
      )}

      {/* Result URL Display */}
      {resultUrl && (
        <CreationResultCard
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          resultUrl={resultUrl}
          copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
          setStatus={setStatus}
        />
      )}
    </div>
  );
};
