import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, FolderArchive } from 'lucide-react';
import { ViewTabProps } from './types';
import { useViewLogic } from './hooks/useViewLogic';
import { ViewInputForm } from './components/ViewInputForm';
import { ViewErrorCard } from './components/ViewErrorCard';
import { SecurityLimitationModal } from './components/SecurityLimitationModal';
import { E2EChatBoard } from './components/E2EChatBoard';
import { PasswordProtectedCard } from './components/PasswordProtectedCard';
import { DecryptedViewContent } from './components/DecryptedViewContent';
import { StegoExtractSection } from './components/StegoExtractSection';

export const ViewTab: React.FC<ViewTabProps> = (props) => {
  const [activeMode, setActiveMode] = useState<'link' | 'file'>('link');
  const [showLimitationModal, setShowLimitationModal] = useState(false);

  const {
    viewInput,
    setViewInput,
    viewData,
    setViewData,
    viewError,
    setViewError,
    decryptedContent,
    setDecryptedContent,
    isDarkMode,
    language,
    t,
    status,
    setStatus,
    isLoading,
    disabledInputs,
    handlePasswordChange,
    handlePasswordKeyDown,
    biometricsSupported,
    hasBiometricsForCurrent,
    e2eKeyPair,
    triggerShatterExplosion,
    copyToClipboardWithAutoClear,
    setSharePendingContent,
    setShowShareConfirm,
  } = props;

  const {
    viewPassword,
    setViewPassword,
    showViewPwd,
    setShowViewPwd,
    isDecrypting,
    isHoneyView,
    setIsHoneyView,
    rememberWithBiometrics,
    setRememberWithBiometrics,
    stegoExtractFile,
    setStegoExtractFile,
    stegoExtractPassword,
    setStegoExtractPassword,
    showStegoExtractPwd,
    setShowStegoExtractPwd,
    stegoExtractResult,
    isStegoExtracting,
    contentType,
    setContentType,
    e2eRecipientPubInput,
    setE2ERecipientPubInput,
    e2eActiveMessages,
    setE2EActiveMessages,
    e2eMessageText,
    setE2EMessageText,
    setE2EChannelDetails,
    handleView,
    handleStegoExtract,
    performDecryption,
    handleBiometricUnlock,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    handleTerminateSession,
  } = useViewLogic(props);

  React.useEffect(() => {
    if (viewError) {
      setShowLimitationModal(true);
    }
  }, [viewError]);

  const isFa = language === 'fa';

  return (
    <motion.div key="view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
      {/* Security Limitation Pop-up Modal */}
      <SecurityLimitationModal
        isOpen={showLimitationModal && !!viewError}
        onClose={() => setShowLimitationModal(false)}
        viewError={viewError}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        onRetry={handleView}
        onTerminate={handleTerminateSession}
      />

      {/* Top Segmented Mode Switcher (Visible before data is loaded) */}
      {!viewData && !viewError && !decryptedContent && (
        <div className="flex justify-center">
          <div className={`p-1.5 rounded-full flex items-center gap-1.5 border shadow-sm ${
            isDarkMode ? 'bg-zinc-950/60 border-white/10' : 'bg-zinc-100/90 border-zinc-200'
          }`}>
            {/* Mode A: Link Decrypt */}
            <button
              type="button"
              onClick={() => setActiveMode('link')}
              className={`relative px-5 py-2 rounded-full text-xs font-black tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                activeMode === 'link'
                  ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-950')
                  : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')
              }`}
            >
              {activeMode === 'link' && (
                <motion.div
                  layoutId="viewModeTabHighlight"
                  className={`absolute inset-0 rounded-full border shadow-sm ${
                    isDarkMode 
                      ? 'bg-emerald-500/15 border-emerald-500/30' 
                      : 'bg-white border-emerald-200/80 shadow-emerald-500/10'
                  }`}
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span className={isFa ? 'font-vazir' : 'font-sans'}>
                  {t.modeLinkDecrypt || 'Link'}
                </span>
              </span>
            </button>

            {/* Mode B: Binary / Stego File */}
            <button
              type="button"
              onClick={() => setActiveMode('file')}
              className={`relative px-5 py-2 rounded-full text-xs font-black tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                activeMode === 'file'
                  ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-950')
                  : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')
              }`}
            >
              {activeMode === 'file' && (
                <motion.div
                  layoutId="viewModeTabHighlight"
                  className={`absolute inset-0 rounded-full border shadow-sm ${
                    isDarkMode 
                      ? 'bg-emerald-500/15 border-emerald-500/30' 
                      : 'bg-white border-emerald-200/80 shadow-emerald-500/10'
                  }`}
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <FolderArchive className="w-3.5 h-3.5" />
                <span className={isFa ? 'font-vazir' : 'font-sans'}>
                  {t.modeBinaryStego || 'File'}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {viewError ? (
        <ViewErrorCard
          viewError={viewError}
          setViewError={setViewError}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          onTerminate={handleTerminateSession}
          onRetry={handleView}
        />
      ) : !viewData ? (
        <AnimatePresence mode="wait">
          {activeMode === 'link' ? (
            <ViewInputForm
              key="mode-link-form"
              viewInput={viewInput}
              setViewInput={setViewInput}
              handleView={handleView}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              status={status}
              setStatus={setStatus}
              disabledInputs={disabledInputs}
              handlePasswordChange={handlePasswordChange}
              handlePasswordKeyDown={handlePasswordKeyDown}
            />
          ) : (
            <StegoExtractSection
              key="mode-file-form"
              contentType={contentType}
              setContentType={setContentType}
              stegoExtractFile={stegoExtractFile}
              setStegoExtractFile={setStegoExtractFile}
              stegoExtractPassword={stegoExtractPassword}
              setStegoExtractPassword={setStegoExtractPassword}
              showStegoExtractPwd={showStegoExtractPwd}
              setShowStegoExtractPwd={setShowStegoExtractPwd}
              handleStegoExtract={handleStegoExtract}
              isStegoExtracting={isStegoExtracting}
              stegoExtractResult={stegoExtractResult}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              disabledInputs={disabledInputs}
              handlePasswordChange={handlePasswordChange}
              handlePasswordKeyDown={handlePasswordKeyDown}
              copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
              setStatus={setStatus}
              handleTerminate={handleTerminateSession}
            />
          )}
        </AnimatePresence>
      ) : (
        <div id="active-session-card" className="space-y-8">
          {viewData.is_e2e_channel ? (
            <E2EChatBoard
              viewData={viewData}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              e2eRecipientPubInput={e2eRecipientPubInput}
              setE2ERecipientPubInput={setE2ERecipientPubInput}
              e2eKeyPair={e2eKeyPair}
              e2eActiveMessages={e2eActiveMessages}
              setE2EActiveMessages={setE2EActiveMessages}
              e2eMessageText={e2eMessageText}
              setE2EMessageText={setE2EMessageText}
              handleRefreshE2EMessages={handleRefreshE2EMessages}
              handleSendE2EMessage={handleSendE2EMessage}
              triggerShatterExplosion={triggerShatterExplosion}
              setViewData={setViewData}
              setE2EChannelDetails={setE2EChannelDetails}
              onTerminate={handleTerminateSession}
            />
          ) : viewData.has_password && !decryptedContent ? (
            <PasswordProtectedCard
              viewData={viewData}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              biometricsSupported={biometricsSupported}
              hasBiometricsForCurrent={hasBiometricsForCurrent}
              handleBiometricUnlock={handleBiometricUnlock}
              viewPassword={viewPassword}
              setViewPassword={setViewPassword}
              showViewPwd={showViewPwd}
              setShowViewPwd={setShowViewPwd}
              performDecryption={performDecryption}
              isDecrypting={isDecrypting}
              rememberWithBiometrics={rememberWithBiometrics}
              setRememberWithBiometrics={setRememberWithBiometrics}
              triggerShatterExplosion={triggerShatterExplosion}
              setViewData={setViewData}
              setDecryptedContent={setDecryptedContent}
              setViewInput={setViewInput}
              setStatus={setStatus}
              disabledInputs={disabledInputs}
              handlePasswordChange={handlePasswordChange}
              handlePasswordKeyDown={handlePasswordKeyDown}
              status={status}
              onTerminate={handleTerminateSession}
            />
          ) : decryptedContent ? (
            <DecryptedViewContent
              viewData={viewData}
              decryptedContent={decryptedContent}
              isHoneyView={isHoneyView}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              setStatus={setStatus}
              setSharePendingContent={setSharePendingContent}
              setShowShareConfirm={setShowShareConfirm}
              copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
              triggerShatterExplosion={triggerShatterExplosion}
              setViewData={setViewData}
              setDecryptedContent={setDecryptedContent}
              setViewInput={setViewInput}
              setIsHoneyView={setIsHoneyView}
              setViewPassword={setViewPassword}
              onTerminate={handleTerminateSession}
            />
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

