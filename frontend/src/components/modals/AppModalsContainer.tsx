import React from 'react';
import { SelfDestructOverlay } from './SelfDestructOverlay';
import { PasswordWarningModal } from './PasswordWarningModal';
import { ContentWarningModal } from './ContentWarningModal';
import { KeyboardWarningModal } from './KeyboardWarningModal';
import { ShareConfirmModal } from './ShareConfirmModal';
import { ShortcutManager } from '../ShortcutManager';
import { ScreenSecurityGuard } from '../ScreenSecurityGuard';
import { TravelerManualModal } from '../TravelerManualModal';
import { ToastNotification } from '../ToastNotification';
import { Language } from '../../types';

interface AppModalsContainerProps {
  isSelfDestructed: boolean;
  viewData: any;
  hidesCount: number;
  showPasswordWarning: boolean;
  setShowPasswordWarning: (open: boolean) => void;
  showContentWarning: boolean;
  setShowContentWarning: (open: boolean) => void;
  showKeyboardWarning: boolean;
  setShowKeyboardWarning: (open: boolean) => void;
  showSecurityShield: boolean;
  setShowSecurityShield: (open: boolean) => void;
  showTravelerManual: boolean;
  setShowTravelerManual: (open: boolean) => void;
  manualDefaultTab: 'overview' | 'shortcuts';
  startTour: () => void;
  showShareConfirm: boolean;
  setShowShareConfirm: (open: boolean) => void;
  sharePendingContent: string;
  setSharePendingContent: (content: string) => void;
  handleClearEverything: () => void;
  handlePanicWipe?: () => void;
  handleToggleTab: () => void;
  handleOpenTravelerManual: (tab?: 'overview' | 'shortcuts') => void;
  status: any;
  setStatus: (status: any) => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
}

export const AppModalsContainer: React.FC<AppModalsContainerProps> = ({
  isSelfDestructed,
  viewData,
  hidesCount,
  showPasswordWarning,
  setShowPasswordWarning,
  showContentWarning,
  setShowContentWarning,
  showKeyboardWarning,
  setShowKeyboardWarning,
  showSecurityShield,
  setShowSecurityShield,
  showTravelerManual,
  setShowTravelerManual,
  manualDefaultTab,
  startTour,
  showShareConfirm,
  setShowShareConfirm,
  sharePendingContent,
  setSharePendingContent,
  handleClearEverything,
  handlePanicWipe,
  handleToggleTab,
  handleOpenTravelerManual,
  status,
  setStatus,
  isDarkMode,
  language,
  t,
}) => {
  return (
    <>
      {/* Self-Destruct Overlay & Counter */}
      <SelfDestructOverlay
        isSelfDestructed={isSelfDestructed}
        viewData={viewData}
        hidesCount={hidesCount}
        language={language}
        t={t}
      />

      {/* Password Warning Modal Popup */}
      <PasswordWarningModal
        isOpen={showPasswordWarning}
        onClose={() => setShowPasswordWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      {/* Content Warning Modal Popup */}
      <ContentWarningModal
        isOpen={showContentWarning}
        onClose={() => setShowContentWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      {/* Keyboard Layout Warning Modal Popup */}
      <KeyboardWarningModal
        isOpen={showKeyboardWarning}
        onClose={() => setShowKeyboardWarning(false)}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
      />

      <ShortcutManager 
        onClearEverything={handleClearEverything}
        onPanicWipe={handlePanicWipe}
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

      {/* Share Confirmation Modal */}
      <ShareConfirmModal
        isOpen={showShareConfirm}
        onClose={() => {
          setShowShareConfirm(false);
          setSharePendingContent('');
        }}
        sharePendingContent={sharePendingContent}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        setStatus={setStatus}
      />

      {/* Floating Toast Notification System */}
      <ToastNotification
        status={status}
        onClose={() => setStatus(null)}
        isDarkMode={isDarkMode}
        language={language}
      />
    </>
  );
};
