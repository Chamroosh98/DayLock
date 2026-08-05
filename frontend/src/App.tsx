import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { ContentType, MainTab, Language } from './types';
import { COUNTRIES } from './data/countries';
import { translations } from './data/translations';
import { CreateTab } from './components/CreateTab';
import { ViewTab } from './components/ViewTab';
import { ShortcutManager } from './components/ShortcutManager';
import { ScreenSecurityGuard } from './components/ScreenSecurityGuard';
import { TravelerManualModal } from './components/TravelerManualModal';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { ToastNotification } from './components/ToastNotification';
import { PasswordWarningModal } from './components/modals/PasswordWarningModal';
import { ContentWarningModal } from './components/modals/ContentWarningModal';
import { KeyboardWarningModal } from './components/modals/KeyboardWarningModal';
import { SelfDestructOverlay } from './components/modals/SelfDestructOverlay';
import { FooterCredit } from './components/FooterCredit';
import { HeaderNavigation } from './components/HeaderNavigation';

import { MainCardHeader } from './components/MainCardHeader';
import { NetworkMapCard } from './components/NetworkMapCard';
import { BottomBlurGradient } from './components/BottomBlurGradient';

import { useDriverTour } from './hooks/useDriverTour';
import { useAppSwipe } from './hooks/useAppSwipe';
import { useJalaliTimeLock } from './hooks/useJalaliTimeLock';
import { useShamirSecret } from './hooks/useShamirSecret';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { usePasswordKeyboardGuard } from './hooks/usePasswordKeyboardGuard';
import { useE2EChannel } from './hooks/useE2EChannel';
import { useCreateOptionsState } from './hooks/useCreateOptionsState';
import { useCreatePayload } from './hooks/useCreatePayload';
import { useViewPayload } from './hooks/useViewPayload';
import { useExpirationWarning } from './hooks/useExpirationWarning';

import { formatExpirationDate } from './utils/dateFormatter';
import { copyToClipboardWithAutoClear, forceClearClipboard } from './utils/clipboardManager';

// Module-level registry to prevent reprocessing the same hash during React 18+ strict mode dual-mounts
const processedHashesSet = new Set<string>();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTrashAnimating, setIsTrashAnimating] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (language === 'fa') {
      document.documentElement.classList.add('lang-fa');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.classList.remove('lang-fa');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showDock, setShowDock] = useState(true);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryResults, setCountryResults] = useState<typeof COUNTRIES>([]);

  useEffect(() => {
    if (countrySearch.trim()) {
      const q = countrySearch.toLowerCase();
      const filtered = COUNTRIES.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) || 
        c.fa.includes(q)
      ).slice(0, 8);
      setCountryResults(filtered);
    } else {
      setCountryResults([]);
    }
  }, [countrySearch]);

  const { startTour } = useDriverTour(isDarkMode, language);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowDock(false);
      } else if (currentScrollY < lastScrollY) {
        setShowDock(true);
      }
      
      if (currentScrollY < 10) {
        setShowDock(true);
      }
      
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[language];
  const [mainTab, setMainTab] = useState<MainTab>('create');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [imageAcquisition, setImageAcquisition] = useState<'camera' | 'upload' | null>(null);

  const { handleTouchStart, handleTouchEnd } = useAppSwipe({
    contentType,
    setContentType,
    setImageAcquisition,
  });

  // Basic Message & Results
  const [message, setMessage] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'ok' | 'err' | 'warn', msg: string } | null>(null);

  // Creation Options State Hook
  const createOpts = useCreateOptionsState();

  // Jalali Time Lock Hook
  const {
    jYear, setJYear,
    jMonth, setJMonth,
    jDay, setJDay,
    jHour, setJHour,
    jMinute, setJMinute,
  } = useJalaliTimeLock({
    language,
    hasTimeLock: createOpts.hasTimeLock,
    setUnlockAt: createOpts.setUnlockAt,
  });

  // Modals & Warnings State
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [showKeyboardWarning, setShowKeyboardWarning] = useState(false);
  const [showTravelerManual, setShowTravelerManual] = useState(false);
  const [manualDefaultTab, setManualDefaultTab] = useState<'overview' | 'shortcuts'>('overview');
  const [showSecurityShield, setShowSecurityShield] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [sharePendingContent, setSharePendingContent] = useState<string>('');

  const handleOpenTravelerManual = (tab: 'overview' | 'shortcuts' = 'overview') => {
    setManualDefaultTab(tab);
    setShowTravelerManual(true);
  };

  // Audio Recorder Hook
  const {
    isRecording, setIsRecording,
    recordingTime, setRecordingTime,
    audioBlob, setAudioBlob,
    formatTime, toggleRecording, resetAudioRecorder,
  } = useAudioRecorder({ t, language, setStatus });

  // Shamir Secret Hook
  const {
    shamirSecret, setShamirSecret,
    shamirTotal, setShamirTotal,
    shamirThreshold, setShamirThreshold,
    shamirShares, setShamirShares,
    shamirCombineInputs, setShamirCombineInputs,
    shamirResult, setShamirResult,
    hoveredShamirTrash, setHoveredShamirTrash,
    handleShamirTotalChangeFA,
    handleShamirThresholdChangeFA,
    handleShamirTotalBlurFA,
    handleShamirThresholdBlurFA,
    handleShamirSplit,
    handleShamirCombine,
    resetShamirState,
  } = useShamirSecret({ t, setStatus });

  // E2E Channel Hook
  const {
    e2eKeyPair, setE2EKeyPair,
    e2eChannelDetails, setE2EChannelDetails,
    e2eRecipientPubInput, setE2ERecipientPubInput,
    e2eMessageText, setE2EMessageText,
    e2eActiveMessages, setE2EActiveMessages,
    isE2ELoading,
    handleCreateE2EChannel,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    resetE2EState,
  } = useE2EChannel({
    language,
    expiresIn: createOpts.expiresIn,
    hasAsnLock: createOpts.hasAsnLock,
    asnMode: createOpts.asnMode,
    asnSelected: createOpts.asnSelected,
    setStatus,
    setResultUrl,
  });

  // Create Payload Handler Hook
  const {
    selectedFile, setSelectedFile,
    stegoImage, setStegoImage,
    stegoCapacity, setStegoCapacity,
    isLoading: isCreateLoading,
    stegoCanvasRef,
    handleFileChangeDirect,
    handleFileSelect,
    isConfigurationValid,
    handleCreate,
    resetCreatePayload,
  } = useCreatePayload({
    t,
    language,
    contentType,
    message,
    audioBlob,
    audioMode: createOpts.audioMode,
    audioWavBytes: createOpts.audioWavBytes,
    audioText: createOpts.audioText,
    audioFilename: createOpts.audioFilename,
    audioEmbedPassword: createOpts.audioEmbedPassword,
    hasPassword: createOpts.hasPassword,
    password: createOpts.password,
    hasHoney: createOpts.hasHoney,
    honeyPwd: createOpts.honeyPwd,
    honeyContent: createOpts.honeyContent,
    expiresIn: createOpts.expiresIn,
    burnAfterRead: createOpts.burnAfterRead,
    maxViews: createOpts.maxViews,
    hasGeoLock: createOpts.hasGeoLock,
    allowedCountries: createOpts.allowedCountries,
    hasDeadMans: createOpts.hasDeadMans,
    deadMansInterval: createOpts.deadMansInterval,
    hasCanary: createOpts.hasCanary,
    canaryUrl: createOpts.canaryUrl,
    hasTimeLock: createOpts.hasTimeLock,
    unlockAt: createOpts.unlockAt,
    hasSelfDestruct: createOpts.hasSelfDestruct,
    selfDestructHides: createOpts.selfDestructHides,
    selfDestructTriggers: createOpts.selfDestructTriggers,
    hasAsnLock: createOpts.hasAsnLock,
    asnMode: createOpts.asnMode,
    asnSelected: createOpts.asnSelected,
    setShowContentWarning,
    setShowPasswordWarning,
    setStatus,
    setResultUrl,
  });

  const triggerShatterExplosion = (colors: string[]) => {
    const isDark = document.documentElement.classList.contains('dark');
    const effectiveColors = colors.map(c => 
      c.toLowerCase() === '#ffffff' || c.toLowerCase() === '#fff'
        ? (isDark ? '#ffffff' : '#1e293b')
        : c
    );
    const card = document.getElementById('active-session-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('trigger-session-explosion', {
        detail: { rect, colors: effectiveColors }
      }));
    } else {
      const rect = {
        x: window.innerWidth / 4,
        y: window.innerHeight / 3,
        width: window.innerWidth / 2,
        height: window.innerHeight / 3
      };
      window.dispatchEvent(new CustomEvent('trigger-session-explosion', {
        detail: { rect, colors: effectiveColors }
      }));
    }
  };

  // View Payload Handler Hook
  const {
    viewInput, setViewInput,
    viewData, setViewData,
    viewPassword, setViewPassword,
    decryptedContent, setDecryptedContent,
    isHoneyView, setIsHoneyView,
    viewError, setViewError,
    isLoading: isViewLoading,
    isDecrypting,
    stegoExtractFile, setStegoExtractFile,
    stegoExtractPassword, setStegoExtractPassword,
    stegoExtractResult, setStegoExtractResult,
    isStegoExtracting,
    biometricsSupported,
    rememberWithBiometrics, setRememberWithBiometrics,
    hasBiometricsForCurrent,
    isSelfDestructed, setIsSelfDestructed,
    hidesCount, setHidesCount,
    handleView,
    performDecryption,
    handleStegoExtract,
    handleBiometricUnlock,
    resetViewPayload,
  } = useViewPayload({
    t,
    language,
    isDarkMode,
    setStatus,
    handleRefreshE2EMessages,
    triggerShatterExplosion,
  });

  // Active Session Expiration Warning Hook (triggers 1 hour before paste expiration)
  useExpirationWarning({
    viewData,
    language,
    t,
    setStatus,
  });

  // Password & Keyboard Guard Hook
  const {
    disabledInputs,
    handlePasswordKeyDown,
    handlePasswordChange,
  } = usePasswordKeyboardGuard({
    mainTab,
    viewData,
    performDecryption,
    viewPassword,
    setShowKeyboardWarning,
  });

  // Trigger clipboard neutralization when decrypted content is closed / cleared
  useEffect(() => {
    if (!decryptedContent) {
      forceClearClipboard();
    }
  }, [decryptedContent]);

  // Auto-clear status (Toast) after 4 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Parse URL Hash on Load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      if (processedHashesSet.has(hash)) {
        try {
          window.history.replaceState("", document.title, window.location.pathname + window.location.search);
        } catch (e) {
          window.location.hash = "";
        }
        return;
      }

      processedHashesSet.add(hash);
      setMainTab('view');
      setViewInput(hash);
      try {
        window.history.replaceState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = "";
      }
    }
  }, [setViewInput]);

  const handleClearEverything = () => {
    setMessage('');
    setResultUrl(null);
    createOpts.resetCreateOptions();
    resetAudioRecorder();
    resetShamirState();
    resetE2EState();
    resetCreatePayload();
    resetViewPayload();
    setStatus({ type: 'ok', msg: "SafePaste environment reset completed!" });
  };

  const handleToggleTab = () => {
    setMainTab((prev) => (prev === 'create' ? 'view' : 'create'));
  };

  return (
    <div dir={language === 'fa' ? 'rtl' : 'ltr'} className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-zinc-50 text-zinc-900'} ${language === 'fa' ? 'font-vazir lang-fa' : 'font-sans'} selection:bg-emerald-500/30 flex flex-col pt-12 pb-20 px-4 sm:px-6 md:pt-12 md:px-12 md:pb-24 lg:pb-16 overflow-x-hidden relative`}>
      <ExplosionOverlay />
      
      {/* Bottom Soft Blur Gradient */}
      <BottomBlurGradient isDarkMode={isDarkMode} />

      {/* Header Navigation: Mobile Floating Dock, Marquee, Desktop Floating Toggles */}
      <HeaderNavigation
        showDock={showDock}
        mainTab={mainTab}
        setMainTab={setMainTab}
        setShowSecurityShield={setShowSecurityShield}
        handleOpenTravelerManual={handleOpenTravelerManual}
        language={language}
        setLanguage={setLanguage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        t={t}
      />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 relative z-10 mt-4 sm:mt-8 lg:mt-4">
        {/* Left Column: Main Creation & View Card */}
        <motion.div 
          id="main-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className={`flex-1 ${isDarkMode ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl'} backdrop-blur-3xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col transition-all duration-500`}>
            
            {/* Header & Main Tabs */}
            <MainCardHeader
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              mainTab={mainTab}
              setMainTab={setMainTab}
              isTrashAnimating={isTrashAnimating}
              setIsTrashAnimating={setIsTrashAnimating}
              contentType={contentType}
              setMessage={setMessage}
              setSelectedFile={setSelectedFile}
              setAudioBlob={setAudioBlob}
              setRecordingTime={setRecordingTime}
              setAudioWavBytes={createOpts.setAudioWavBytes}
              setAudioFilename={createOpts.setAudioFilename}
              setAudioWavCapacity={createOpts.setAudioWavCapacity}
              setAudioWaveformSamples={createOpts.setAudioWaveformSamples}
              setAudioText={createOpts.setAudioText}
              setStegoImage={setStegoImage}
              setPassword={createOpts.setPassword}
              setHasPassword={createOpts.setHasPassword}
              setBurnAfterRead={createOpts.setBurnAfterRead}
              setHasHoney={createOpts.setHasHoney}
              setResultUrl={setResultUrl}
              setStatus={setStatus}
              setViewInput={setViewInput}
              setViewData={setViewData}
              setDecryptedContent={setDecryptedContent}
              setViewPassword={setViewPassword}
            />

            {/* Content Area */}
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
              <AnimatePresence mode="wait">
                {mainTab === 'create' ? (
                  <CreateTab
                    isDarkMode={isDarkMode}
                    language={language}
                    t={t}
                    status={status}
                    setStatus={setStatus}
                    handleTouchStart={handleTouchStart}
                    handleTouchEnd={handleTouchEnd}
                    contentType={contentType}
                    setContentType={setContentType}
                    imageAcquisition={imageAcquisition}
                    setImageAcquisition={setImageAcquisition}
                    message={message}
                    setMessage={setMessage}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    handleFileSelect={handleFileSelect}
                    handleFileChangeDirect={handleFileChangeDirect}
                    stegoImage={stegoImage}
                    setStegoImage={setStegoImage}
                    stegoCapacity={stegoCapacity}
                    stegoCanvasRef={stegoCanvasRef}
                    shamirSecret={shamirSecret}
                    setShamirSecret={setShamirSecret}
                    handleShamirTotalChangeFA={handleShamirTotalChangeFA}
                    handleShamirTotalBlurFA={handleShamirTotalBlurFA}
                    handleShamirThresholdChangeFA={handleShamirThresholdChangeFA}
                    handleShamirThresholdBlurFA={handleShamirThresholdBlurFA}
                    handleShamirSplit={handleShamirSplit}
                    shamirShares={shamirShares}
                    shamirCombineInputs={shamirCombineInputs}
                    setShamirCombineInputs={setShamirCombineInputs}
                    hoveredShamirTrash={hoveredShamirTrash}
                    setHoveredShamirTrash={setHoveredShamirTrash}
                    handleShamirCombine={handleShamirCombine}
                    shamirResult={shamirResult}
                    formatTime={formatTime}
                    recordingTime={recordingTime}
                    toggleRecording={toggleRecording}
                    setAudioFilename={createOpts.setAudioFilename}
                    setAudioWavCapacity={createOpts.setAudioWavCapacity}
                    setAudioWaveformSamples={createOpts.setAudioWaveformSamples}
                    audioFilename={createOpts.audioFilename}
                    audioWaveformSamples={createOpts.audioWaveformSamples}
                    disabledInputs={disabledInputs}
                    handlePasswordChange={handlePasswordChange}
                    handlePasswordKeyDown={handlePasswordKeyDown}
                    shamirTotal={shamirTotal}
                    setShamirTotal={setShamirTotal}
                    shamirThreshold={shamirThreshold}
                    setShamirThreshold={setShamirThreshold}
                    audioMode={createOpts.audioMode}
                    setAudioMode={createOpts.setAudioMode}
                    audioText={createOpts.audioText}
                    setAudioText={createOpts.setAudioText}
                    audioBlob={audioBlob}
                    setAudioBlob={setAudioBlob}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    audioWavBytes={createOpts.audioWavBytes}
                    setAudioWavBytes={createOpts.setAudioWavBytes}
                    audioWavCapacity={createOpts.audioWavCapacity}
                    showAudioEmbedPwd={createOpts.showAudioEmbedPwd}
                    setShowAudioEmbedPwd={createOpts.setShowAudioEmbedPwd}
                    audioEmbedPassword={createOpts.audioEmbedPassword}
                    setAudioEmbedPassword={createOpts.setAudioEmbedPassword}
                    e2eKeyPair={e2eKeyPair}
                    setE2EKeyPair={setE2EKeyPair}
                    e2eChannelDetails={e2eChannelDetails}
                    handleCreateE2EChannel={handleCreateE2EChannel}
                    isE2ELoading={isE2ELoading}
                    burnAfterRead={createOpts.burnAfterRead}
                    setBurnAfterRead={createOpts.setBurnAfterRead}
                    hasPassword={createOpts.hasPassword}
                    setHasPassword={createOpts.setHasPassword}
                    password={createOpts.password}
                    setPassword={createOpts.setPassword}
                    showMasterPwd={createOpts.showMasterPwd}
                    setShowMasterPwd={createOpts.setShowMasterPwd}
                    hasDeadMans={createOpts.hasDeadMans}
                    setHasDeadMans={createOpts.setHasDeadMans}
                    deadMansInterval={createOpts.deadMansInterval}
                    setDeadMansInterval={createOpts.setDeadMansInterval}
                    hasCanary={createOpts.hasCanary}
                    setHasCanary={createOpts.setHasCanary}
                    canaryUrl={createOpts.canaryUrl}
                    setCanaryUrl={createOpts.setCanaryUrl}
                    hasHoney={createOpts.hasHoney}
                    setHasHoney={createOpts.setHasHoney}
                    honeyPwd={createOpts.honeyPwd}
                    setHoneyPwd={createOpts.setHoneyPwd}
                    showHoneyPwd={createOpts.showHoneyPwd}
                    setShowHoneyPwd={createOpts.setShowHoneyPwd}
                    honeyContent={createOpts.honeyContent}
                    setHoneyContent={createOpts.setHoneyContent}
                    hasSelfDestruct={createOpts.hasSelfDestruct}
                    setHasSelfDestruct={createOpts.setHasSelfDestruct}
                    selfDestructHides={createOpts.selfDestructHides}
                    setSelfDestructHides={createOpts.setSelfDestructHides}
                    selfDestructTriggers={createOpts.selfDestructTriggers}
                    setSelfDestructTriggers={createOpts.setSelfDestructTriggers}
                    hasTimeLock={createOpts.hasTimeLock}
                    setHasTimeLock={createOpts.setHasTimeLock}
                    unlockAt={createOpts.unlockAt}
                    setUnlockAt={createOpts.setUnlockAt}
                    jYear={jYear}
                    setJYear={setJYear}
                    jMonth={jMonth}
                    setJMonth={setJMonth}
                    jDay={jDay}
                    setJDay={setJDay}
                    jHour={jHour}
                    setJHour={setJHour}
                    jMinute={jMinute}
                    setJMinute={setJMinute}
                    hasGeoLock={createOpts.hasGeoLock}
                    setHasGeoLock={createOpts.setHasGeoLock}
                    countrySearch={countrySearch}
                    setCountrySearch={setCountrySearch}
                    countryResults={countryResults}
                    setCountryResults={setCountryResults}
                    allowedCountries={createOpts.allowedCountries}
                    setAllowedCountries={createOpts.setAllowedCountries}
                    hasAsnLock={createOpts.hasAsnLock}
                    setHasAsnLock={createOpts.setHasAsnLock}
                    asnMode={createOpts.asnMode}
                    setAsnMode={createOpts.setAsnMode}
                    asnSelected={createOpts.asnSelected}
                    setAsnSelected={createOpts.setAsnSelected}
                    expiresIn={createOpts.expiresIn}
                    setExpiresIn={createOpts.setExpiresIn}
                    maxViews={createOpts.maxViews}
                    setMaxViews={createOpts.setMaxViews}

                    isConfigurationValid={isConfigurationValid}
                    isLoading={isCreateLoading}
                    handleCreate={handleCreate}
                    resultUrl={resultUrl}
                    copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
                  />
                ) : (
                  <ViewTab
                    isDarkMode={isDarkMode}
                    language={language}
                    t={t}
                    status={status}
                    setStatus={setStatus}
                    viewData={viewData}
                    setViewData={setViewData}
                    viewInput={viewInput}
                    setViewInput={setViewInput}
                    viewError={viewError}
                    setViewError={setViewError}
                    viewPassword={viewPassword}
                    setViewPassword={setViewPassword}
                    showViewPwd={createOpts.showViewPwd}
                    setShowViewPwd={createOpts.setShowViewPwd}
                    decryptedContent={decryptedContent}
                    setDecryptedContent={setDecryptedContent}
                    isSelfDestructed={isSelfDestructed}
                    setIsSelfDestructed={setIsSelfDestructed}
                    isHoneyView={isHoneyView}
                    setIsHoneyView={setIsHoneyView}
                    disabledInputs={disabledInputs}
                    handlePasswordChange={handlePasswordChange}
                    handlePasswordKeyDown={handlePasswordKeyDown}
                    isLoading={isViewLoading}
                    handleView={handleView}
                    performDecryption={performDecryption}
                    isDecrypting={isDecrypting}
                    biometricsSupported={biometricsSupported}
                    hasBiometricsForCurrent={hasBiometricsForCurrent}
                    handleBiometricUnlock={handleBiometricUnlock}
                    rememberWithBiometrics={rememberWithBiometrics}
                    setRememberWithBiometrics={setRememberWithBiometrics}
                    stegoExtractFile={stegoExtractFile}
                    setStegoExtractFile={setStegoExtractFile}
                    stegoExtractPassword={stegoExtractPassword}
                    setStegoExtractPassword={setStegoExtractPassword}
                    showStegoExtractPwd={createOpts.showStegoExtractPwd}
                    setShowStegoExtractPwd={createOpts.setShowStegoExtractPwd}
                    isStegoExtracting={isStegoExtracting}
                    handleStegoExtract={handleStegoExtract}
                    stegoExtractResult={stegoExtractResult}
                    contentType={contentType}
                    setContentType={setContentType}
                    e2eKeyPair={e2eKeyPair}
                    setE2EKeyPair={setE2EKeyPair}
                    e2eRecipientPubInput={e2eRecipientPubInput}
                    setE2ERecipientPubInput={setE2ERecipientPubInput}
                    e2eMessageText={e2eMessageText}
                    setE2EMessageText={setE2EMessageText}
                    e2eActiveMessages={e2eActiveMessages}
                    setE2EActiveMessages={setE2EActiveMessages}
                    setE2EChannelDetails={setE2EChannelDetails}
                    handleRefreshE2EMessages={handleRefreshE2EMessages}
                    handleSendE2EMessage={handleSendE2EMessage}
                    triggerShatterExplosion={triggerShatterExplosion}
                    copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
                    formatExpirationDate={formatExpirationDate}
                    setSharePendingContent={setSharePendingContent}
                    setShowShareConfirm={setShowShareConfirm}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Global Network Map & Paste Expiration Metrics Dashboard */}
        <NetworkMapCard isDarkMode={isDarkMode} language={language} setStatus={setStatus} />
      </div>

      {/* Footer Credit */}
      <FooterCredit isDarkMode={isDarkMode} />

      {/* Self-Destruct Overlay & Counter */}
      <SelfDestructOverlay
        isSelfDestructed={isSelfDestructed}
        hidesCount={hidesCount}
        viewData={viewData}
        language={language}
        t={t}
      />

      {/* Warning Modals */}
      <PasswordWarningModal
        isOpen={showPasswordWarning}
        onClose={() => setShowPasswordWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      <ContentWarningModal
        isOpen={showContentWarning}
        onClose={() => setShowContentWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      <KeyboardWarningModal
        isOpen={showKeyboardWarning}
        onClose={() => setShowKeyboardWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      <ShortcutManager 
        onClearEverything={handleClearEverything}
        onToggleTab={handleToggleTab}
        onOpenHelpWithTab={handleOpenTravelerManual}
      />

      <ScreenSecurityGuard 
        isDarkMode={isDarkMode}
        language={language}
        isOpen={showSecurityShield}
        onClose={() => setShowSecurityShield(false)}
      />

      <TravelerManualModal
        isOpen={showTravelerManual}
        onClose={() => setShowTravelerManual(false)}
        language={language}
        isDarkMode={isDarkMode}
        onStartTour={startTour}
        defaultTab={manualDefaultTab}
      />

      {/* Floating Toast Notification System */}
      <ToastNotification
        status={status}
        onClose={() => setStatus(null)}
        isDarkMode={isDarkMode}
        language={language}
      />
    </div>
  );
}
