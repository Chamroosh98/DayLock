import React from 'react';
import { motion } from 'motion/react';
import { CreateTabProps } from './types';
import { useCreateLogic } from './hooks/useCreateLogic';
import { CreateTabHeader } from './components/CreateTabHeader';
import { TextInputSection } from './components/TextInputSection';
import { FileInputSection } from './components/FileInputSection';
import { StegoInputSection } from './components/StegoInputSection';
import { ShamirSection } from './components/ShamirSection';
import { AudioSection } from './components/AudioSection';
import { E2EChannelSection } from './components/E2EChannelSection';
import { OptionsSection } from './components/OptionsSection';
import { CreateActionButton } from './components/CreateActionButton';
import { ResultLinkCard } from './components/ResultLinkCard';
import { StegoResultCard } from './components/StegoResultCard';

export const CreateTab: React.FC<CreateTabProps> = (props) => {
  const {
    contentType,
    setContentType,
    imageAcquisition,
    setImageAcquisition,
    handleTouchStart,
    handleTouchEnd,
    isDarkMode,
    language,
    t,
    status,
    setStatus,
    isLoading,
    setIsLoading,
    disabledInputs,
    handlePasswordChange,
    handlePasswordKeyDown,
    setShowPasswordWarning,
    setShowContentWarning,
    copyToClipboardWithAutoClear,
  } = props;

  const {
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
    showAudioEmbedPwd,
    setShowAudioEmbedPwd,
    honeyContent,
    setHoneyContent,
    hasGeoLock,
    setHasGeoLock,
    allowedCountries,
    setAllowedCountries,
    countrySearch,
    setCountrySearch,
    countryResults,
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
    selectedFile,
    setSelectedFile,
    isRecording,
    recordingTime,
    audioBlob,
    setAudioBlob,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    resultUrl,
    setResultUrl,
    stegoResultFile,
    setStegoResultFile,
    hasAsnLock,
    setHasAsnLock,
    asnMode,
    setAsnMode,
    asnSelected,
    setAsnSelected,
    audioWavBytes,
    setAudioWavBytes,
    audioFilename,
    setAudioFilename,
    audioText,
    setAudioText,
    audioWavCapacity,
    setAudioWavCapacity,
    audioWaveformSamples,
    setAudioWaveformSamples,
    audioEmbedPassword,
    setAudioEmbedPassword,
    audioMode,
    setAudioMode,
    e2eKeyPair,
    setE2EKeyPair,
    e2eChannelDetails,
    isE2ELoading,
    stegoCanvasRef,
    formatTime,
    toggleRecording,
    handleFileChangeDirect,
    handleFileSelect,
    isConfigurationValid,
    handleCreateE2EChannel,
    handleCreate,
    resetCreateForm
  } = useCreateLogic(props);

  return (
    <motion.div
      key="create"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content Type Header */}
      <CreateTabHeader
        contentType={contentType}
        setContentType={setContentType}
        setImageAcquisition={setImageAcquisition}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      {/* Primary Payload Section depending on Selected Content Type */}
      <div id="create-content-input-section">
        {contentType === 'text' && (
          <TextInputSection
            message={message}
            setMessage={setMessage}
            undoMessage={undoMessage}
            redoMessage={redoMessage}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            setStatus={setStatus}
          />
        )}

        {contentType === 'file' && (
          <FileInputSection
            handleFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
          />
        )}

        {contentType === 'stego' && (
          <StegoInputSection
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            imageAcquisition={imageAcquisition}
            setImageAcquisition={setImageAcquisition}
            handleFileSelect={handleFileSelect}
            handleFileChangeDirect={handleFileChangeDirect}
            stegoImage={stegoImage}
            setStegoImage={setStegoImage}
            stegoCapacity={stegoCapacity}
            message={message}
            setMessage={setMessage}
            stegoCanvasRef={stegoCanvasRef}
            contentType={contentType}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            setStatus={setStatus}
          />
        )}

        {contentType === 'audio' && (
          <AudioSection
            audioMode={audioMode}
            setAudioMode={setAudioMode}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            recordingTime={recordingTime}
            formatTime={formatTime}
            audioBlob={audioBlob}
            audioFilename={audioFilename}
            setAudioFilename={setAudioFilename}
            audioWavBytes={audioWavBytes}
            setAudioWavBytes={setAudioWavBytes}
            audioWavCapacity={audioWavCapacity}
            setAudioWavCapacity={setAudioWavCapacity}
            audioWaveformSamples={audioWaveformSamples}
            setAudioWaveformSamples={setAudioWaveformSamples}
            audioText={audioText}
            setAudioText={setAudioText}
            audioEmbedPassword={audioEmbedPassword}
            setAudioEmbedPassword={setAudioEmbedPassword}
            showAudioEmbedPwd={showAudioEmbedPwd}
            setShowAudioEmbedPwd={setShowAudioEmbedPwd}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            disabledInputs={disabledInputs}
            handlePasswordChange={handlePasswordChange}
            handlePasswordKeyDown={handlePasswordKeyDown}
            setStatus={setStatus}
          />
        )}

        {contentType === 'e2e' && (
          <E2EChannelSection
            e2eKeyPair={e2eKeyPair}
            setE2EKeyPair={setE2EKeyPair}
            handleCreateE2EChannel={handleCreateE2EChannel}
            isE2ELoading={isE2ELoading}
            e2eChannelDetails={e2eChannelDetails}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
            setStatus={setStatus}
          />
        )}
      </div>

      {/* Options & Encryption for standard payload types */}
      {!resultUrl && !stegoResultFile && ['text', 'file', 'stego', 'audio'].includes(contentType) && (
        <>
          <OptionsSection
            burnAfterRead={burnAfterRead}
            setBurnAfterRead={setBurnAfterRead}
            expiresIn={expiresIn}
            setExpiresIn={setExpiresIn}
            maxViews={maxViews}
            setMaxViews={setMaxViews}
            hasPassword={hasPassword}
            setHasPassword={setHasPassword}
            password={password}
            setPassword={setPassword}
            showMasterPwd={showMasterPwd}
            setShowMasterPwd={setShowMasterPwd}
            hasHoney={hasHoney}
            setHasHoney={setHasHoney}
            honeyPwd={honeyPwd}
            setHoneyPwd={setHoneyPwd}
            showHoneyPwd={showHoneyPwd}
            setShowHoneyPwd={setShowHoneyPwd}
            honeyContent={honeyContent}
            setHoneyContent={setHoneyContent}
            hasGeoLock={hasGeoLock}
            setHasGeoLock={setHasGeoLock}
            allowedCountries={allowedCountries}
            setAllowedCountries={setAllowedCountries}
            countrySearch={countrySearch}
            setCountrySearch={setCountrySearch}
            countryResults={countryResults}
            hasAsnLock={hasAsnLock}
            setHasAsnLock={setHasAsnLock}
            asnMode={asnMode}
            setAsnMode={setAsnMode}
            asnSelected={asnSelected}
            setAsnSelected={setAsnSelected}
            hasDeadMans={hasDeadMans}
            setHasDeadMans={setHasDeadMans}
            deadMansInterval={deadMansInterval}
            setDeadMansInterval={setDeadMansInterval}
            hasSelfDestruct={hasSelfDestruct}
            setHasSelfDestruct={setHasSelfDestruct}
            selfDestructHides={selfDestructHides}
            setSelfDestructHides={setSelfDestructHides}
            selfDestructTriggers={selfDestructTriggers}
            setSelfDestructTriggers={setSelfDestructTriggers}
            hasCanary={hasCanary}
            setHasCanary={setHasCanary}
            canaryUrl={canaryUrl}
            setCanaryUrl={setCanaryUrl}
            hasTimeLock={hasTimeLock}
            setHasTimeLock={setHasTimeLock}
            unlockAt={unlockAt}
            setUnlockAt={setUnlockAt}
            hasShamir={hasShamir}
            setHasShamir={setHasShamir}
            shamirThreshold={shamirThreshold}
            setShamirThreshold={setShamirThreshold}
            shamirTotal={shamirTotal}
            setShamirTotal={setShamirTotal}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            disabledInputs={disabledInputs}
            handlePasswordChange={handlePasswordChange}
            handlePasswordKeyDown={handlePasswordKeyDown}
          />

          {/* Create Encryption Submit Button */}
          <CreateActionButton
            handleCreate={handleCreate}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            password={password}
          />
        </>
      )}

      {/* Generated Result URL Link Box */}
      {resultUrl && (
        <ResultLinkCard
          resultUrl={resultUrl}
          setResultUrl={setResultUrl}
          resetCreateForm={resetCreateForm}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          shamirShares={shamirShares}
          copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
          setStatus={setStatus}
        />
      )}

      {/* Generated Stego Result Download Box */}
      {stegoResultFile && (
        <StegoResultCard
          stegoResultFile={stegoResultFile}
          setStegoResultFile={setStegoResultFile}
          resetCreateForm={resetCreateForm}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
        />
      )}
    </motion.div>
  );
};
