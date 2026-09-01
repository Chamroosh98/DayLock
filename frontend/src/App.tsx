import React, { useState, useEffect } from 'react';
import { ContentType, MainTab } from './types';
import {
  MarqueeHeader,
  FloatingSystemPanel,
  MobileDock,
  FooterCredit,
  MainCard,
  WorldMapCard,
} from './components/layout';
import { AppModalsContainer } from './components/modals/AppModalsContainer';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { copyToClipboardWithAutoClear } from './utils/clipboardManager';
import { triggerShatterExplosion } from './utils/sessionExplosion';
import { useThemeContext } from './context/ThemeContext';
import { useLanguageContext } from './context/LanguageContext';
import { useModalContext } from './context/ModalContext';
import { useSecurityContext } from './context/SecurityContext';
import { useScrollDock } from './hooks/useScrollDock';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { useAutoClearStatus } from './hooks/useAutoClearStatus';
import { useClipboardAutoClear } from './hooks/useClipboardAutoClear';
import { useHashNavigation } from './hooks/useHashNavigation';
import { useAppSessionActions } from './hooks/useAppSessionActions';

export default function App() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const { isDarkMode, setIsDarkMode } = useThemeContext();
  const { language, setLanguage, t, startTour } = useLanguageContext();
  const {
    showShareConfirm,
    setShowShareConfirm,
    sharePendingContent,
    setSharePendingContent,
    showContentWarning,
    setShowContentWarning,
    showPasswordWarning,
    setShowPasswordWarning,
    showKeyboardWarning,
    setShowKeyboardWarning,
    showTravelerManual,
    setShowTravelerManual,
    manualDefaultTab,
    handleOpenTravelerManual,
    showSecurityShield,
    setShowSecurityShield,
  } = useModalContext();
  const {
    disabledInputs,
    handlePasswordChange,
    handlePasswordKeyDown,
    isSelfDestructed,
    setIsSelfDestructed,
    hidesCount,
    setHidesCount,
    biometricsSupported,
    checkBiometricsForViewData,
  } = useSecurityContext();

  const [isTrashAnimating, setIsTrashAnimating] = useState(false);
  const { showDock } = useScrollDock();

  const [mainTab, setMainTab] = useState<MainTab>('create');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [imageAcquisition, setImageAcquisition] = useState<'camera' | 'upload' | null>(null);

  // Touch Swipe Gesture State and Handlers for tab navigation
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture({
    contentType,
    setContentType,
    setImageAcquisition,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err' | 'warn'; msg: string } | null>(null);

  // View State
  const [viewInput, setViewInput] = useState('');
  const [viewData, setViewData] = useState<any>(null);
  const [viewPassword, setViewPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [viewError, setViewError] = useState<{ type: 'geo' | 'time' | 'dms' | 'generic'; data: any } | null>(null);
  const [hasBiometricsForCurrent, setHasBiometricsForCurrent] = useState(false);

  // Extracted Custom Non-UI Hooks
  useAutoClearStatus(status, setStatus);
  useClipboardAutoClear(decryptedContent, language, setStatus);
  useHashNavigation(setMainTab, setViewInput);

  useEffect(() => {
    checkBiometricsForViewData(viewData?.id || null);
  }, [viewData?.id, checkBiometricsForViewData]);

  // E2E Keypair state initialized for channel operations
  const [e2eKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(() => {
    const saved = localStorage.getItem('daylock_e2e_keypair');
    return saved ? JSON.parse(saved) : null;
  });

  const { handleClearEverything, handlePanicWipe, handleToggleTab } = useAppSessionActions({
    setResetTrigger,
    setStatus,
    setViewInput,
    setViewData,
    setViewPassword,
    setDecryptedContent,
    setViewError,
    setHasBiometricsForCurrent,
    setSharePendingContent,
    setShowShareConfirm,
    setShowContentWarning,
    setShowPasswordWarning,
    setShowKeyboardWarning,
    setIsTrashAnimating,
    setMainTab,
    t,
  });

  return (
    <div dir={language === 'fa' ? 'rtl' : 'ltr'} className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-zinc-50 text-zinc-900'} ${language === 'fa' ? 'font-vazir lang-fa text-right' : 'font-sans text-left'} selection:bg-emerald-500/30 flex flex-col pt-12 pb-20 px-4 sm:px-6 md:pt-12 md:px-12 md:pb-24 lg:pb-16 overflow-x-hidden relative`}>
      <ExplosionOverlay />

      <MobileDock
        isDarkMode={isDarkMode}
        language={language}
        mainTab={mainTab}
        setMainTab={setMainTab}
        showDock={showDock}
        setShowSecurityShield={setShowSecurityShield}
        handleOpenTravelerManual={handleOpenTravelerManual}
        onPanicWipe={handlePanicWipe}
        setLanguage={setLanguage}
        setIsDarkMode={setIsDarkMode}
        t={t}
      />

      <MarqueeHeader
        isDarkMode={isDarkMode}
        t={t}
      />

      <FloatingSystemPanel
        isDarkMode={isDarkMode}
        language={language}
        setShowSecurityShield={setShowSecurityShield}
        handleOpenTravelerManual={handleOpenTravelerManual}
        onPanicWipe={handlePanicWipe}
        setLanguage={setLanguage}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 relative z-10 mt-4 sm:mt-8 lg:mt-4">
        <MainCard
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          mainTab={mainTab}
          setMainTab={setMainTab}
          isTrashAnimating={isTrashAnimating}
          setIsTrashAnimating={setIsTrashAnimating}
          setResetTrigger={setResetTrigger}
          setStatus={setStatus}
          setViewInput={setViewInput}
          setViewData={setViewData}
          setDecryptedContent={setDecryptedContent}
          setViewPassword={setViewPassword}
          contentType={contentType}
          setContentType={setContentType}
          imageAcquisition={imageAcquisition}
          setImageAcquisition={setImageAcquisition}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          status={status}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          disabledInputs={disabledInputs}
          handlePasswordChange={handlePasswordChange}
          handlePasswordKeyDown={handlePasswordKeyDown}
          setShowPasswordWarning={setShowPasswordWarning}
          setShowContentWarning={setShowContentWarning}
          copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
          resetTrigger={resetTrigger}
          viewInput={viewInput}
          viewData={viewData}
          viewError={viewError}
          setViewError={setViewError}
          decryptedContent={decryptedContent}
          isSelfDestructed={isSelfDestructed}
          setIsSelfDestructed={setIsSelfDestructed}
          hidesCount={hidesCount}
          setHidesCount={setHidesCount}
          hasBiometricsForCurrent={hasBiometricsForCurrent}
          setHasBiometricsForCurrent={setHasBiometricsForCurrent}
          biometricsSupported={biometricsSupported}
          e2eKeyPair={e2eKeyPair}
          triggerShatterExplosion={triggerShatterExplosion}
          setSharePendingContent={setSharePendingContent}
          setShowShareConfirm={setShowShareConfirm}
        />

        {/* Right Column: Global Network Map */}
        <WorldMapCard isDarkMode={isDarkMode} />
      </div>

      {/* Footer Credit */}
      <FooterCredit isDarkMode={isDarkMode} />

      {/* Modals & Overlays Container */}
      <AppModalsContainer
        isSelfDestructed={isSelfDestructed}
        viewData={viewData}
        hidesCount={hidesCount}
        showPasswordWarning={showPasswordWarning}
        setShowPasswordWarning={setShowPasswordWarning}
        showContentWarning={showContentWarning}
        setShowContentWarning={setShowContentWarning}
        showKeyboardWarning={showKeyboardWarning}
        setShowKeyboardWarning={setShowKeyboardWarning}
        showSecurityShield={showSecurityShield}
        setShowSecurityShield={setShowSecurityShield}
        showTravelerManual={showTravelerManual}
        setShowTravelerManual={setShowTravelerManual}
        manualDefaultTab={manualDefaultTab}
        startTour={startTour}
        showShareConfirm={showShareConfirm}
        setShowShareConfirm={setShowShareConfirm}
        sharePendingContent={sharePendingContent}
        setSharePendingContent={setSharePendingContent}
        handleClearEverything={handleClearEverything}
        handlePanicWipe={handlePanicWipe}
        handleToggleTab={handleToggleTab}
        handleOpenTravelerManual={handleOpenTravelerManual}
        status={status}
        setStatus={setStatus}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />
    </div>
  );
}
