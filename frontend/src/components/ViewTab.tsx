import React from 'react';
import { ContentType, Language } from '../types';
import { ViewSearchInput } from './view/ViewSearchInput';
import { ViewPasswordCard } from './view/ViewPasswordCard';
import { ViewDecryptedResult } from './view/ViewDecryptedResult';
import { ViewE2EChat } from './view/ViewE2EChat';
import { ViewStegoExtract } from './view/ViewStegoExtract';
import { ViewErrorCard } from './view/ViewErrorCard';

export interface ViewTabProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  status: any;
  setStatus: (status: any) => void;
  viewData: any;
  setViewData: (data: any) => void;
  viewInput: string;
  setViewInput: (val: string) => void;
  viewError: any;
  setViewError: (err: any) => void;
  viewPassword: string;
  setViewPassword: (val: string) => void;
  showViewPwd: boolean;
  setShowViewPwd: (val: boolean) => void;
  decryptedContent: any;
  setDecryptedContent: (val: any) => void;
  isSelfDestructed: boolean;
  setIsSelfDestructed: (val: boolean) => void;
  isHoneyView: boolean;
  setIsHoneyView: (val: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
  isLoading: boolean;
  handleView: () => void;
  performDecryption: (data: any, pwd?: string, isFile?: boolean) => void;
  isDecrypting: boolean;
  biometricsSupported: boolean;
  hasBiometricsForCurrent: boolean;
  handleBiometricUnlock: () => void;
  rememberWithBiometrics: boolean;
  setRememberWithBiometrics: (val: boolean) => void;
  stegoExtractFile: File | null;
  setStegoExtractFile: (file: File | null) => void;
  stegoExtractPassword: string;
  setStegoExtractPassword: (val: string) => void;
  showStegoExtractPwd: boolean;
  setShowStegoExtractPwd: (val: boolean) => void;
  isStegoExtracting: boolean;
  handleStegoExtract: () => void;
  stegoExtractResult: string | null;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  e2eKeyPair: any;
  setE2EKeyPair: (val: any) => void;
  e2eRecipientPubInput: string;
  setE2ERecipientPubInput: (val: string) => void;
  e2eMessageText: string;
  setE2EMessageText: (val: string) => void;
  e2eActiveMessages: any[];
  setE2EActiveMessages: (msgs: any[]) => void;
  setE2EChannelDetails: (details: any) => void;
  handleRefreshE2EMessages: (id: string) => void;
  handleSendE2EMessage: (channelId: string, recipientPubKey: string) => void;
  triggerShatterExplosion: (colors?: string[]) => void;
  copyToClipboardWithAutoClear: (content: string, delay: number, onWarn: (msg: string) => void, lang: any) => void;
  formatExpirationDate: (dateStr: string, lang: Language) => string;
  setSharePendingContent: (val: string) => void;
  setShowShareConfirm: (val: boolean) => void;
}

export const ViewTab: React.FC<ViewTabProps> = (props) => {
  const {
    isDarkMode,
    language,
    t,
    viewData,
    viewInput,
    setViewInput,
    viewError,
    viewPassword,
    setViewPassword,
    showViewPwd,
    setShowViewPwd,
    decryptedContent,
    isSelfDestructed,
    isHoneyView,
    disabledInputs,
    handlePasswordChange,
    handlePasswordKeyDown,
    isLoading,
    handleView,
    performDecryption,
    isDecrypting,
    biometricsSupported,
    hasBiometricsForCurrent,
    handleBiometricUnlock,
    rememberWithBiometrics,
    setRememberWithBiometrics,
    stegoExtractFile,
    setStegoExtractFile,
    stegoExtractPassword,
    setStegoExtractPassword,
    showStegoExtractPwd,
    setShowStegoExtractPwd,
    isStegoExtracting,
    handleStegoExtract,
    stegoExtractResult,
    contentType,
    setContentType,
    e2eKeyPair,
    setE2EKeyPair,
    e2eRecipientPubInput,
    setE2ERecipientPubInput,
    e2eMessageText,
    setE2EMessageText,
    e2eActiveMessages,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    triggerShatterExplosion,
    copyToClipboardWithAutoClear,
    formatExpirationDate,
    setSharePendingContent,
    setShowShareConfirm,
    setStatus,
  } = props;

  return (
    <div className="space-y-8">
      {/* Lookup & Search Input Header */}
      <ViewSearchInput
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        viewInput={viewInput}
        setViewInput={setViewInput}
        isLoading={isLoading}
        handleView={handleView}
        setContentType={setContentType}
      />

      {/* Stego Extraction Sub-view */}
      {contentType === 'stego' && (
        <ViewStegoExtract
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          stegoExtractFile={stegoExtractFile}
          setStegoExtractFile={setStegoExtractFile}
          stegoExtractPassword={stegoExtractPassword}
          setStegoExtractPassword={setStegoExtractPassword}
          showStegoExtractPwd={showStegoExtractPwd}
          setShowStegoExtractPwd={setShowStegoExtractPwd}
          isStegoExtracting={isStegoExtracting}
          handleStegoExtract={handleStegoExtract}
          stegoExtractResult={stegoExtractResult}
          disabledInputs={disabledInputs}
          handlePasswordChange={handlePasswordChange}
          handlePasswordKeyDown={handlePasswordKeyDown}
        />
      )}

      {/* View Error Display */}
      {viewError && (
        <ViewErrorCard
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          viewError={viewError}
        />
      )}

      {/* E2E Active Channel Chat */}
      {viewData?.isE2E && (
        <ViewE2EChat
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          e2eKeyPair={e2eKeyPair}
          setE2EKeyPair={setE2EKeyPair}
          e2eRecipientPubInput={e2eRecipientPubInput}
          setE2ERecipientPubInput={setE2ERecipientPubInput}
          e2eMessageText={e2eMessageText}
          setE2EMessageText={setE2EMessageText}
          e2eActiveMessages={e2eActiveMessages}
          setE2EActiveMessages={props.setE2EActiveMessages}
          viewData={viewData}
          handleRefreshE2EMessages={handleRefreshE2EMessages}
          handleSendE2EMessage={handleSendE2EMessage}
          isLoading={isLoading}
        />
      )}

      {/* Password Challenge Prompt */}
      {viewData?.hasPassword && !decryptedContent && !viewData?.isE2E && (
        <ViewPasswordCard
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          viewPassword={viewPassword}
          setViewPassword={setViewPassword}
          showViewPwd={showViewPwd}
          setShowViewPwd={setShowViewPwd}
          disabledInputs={disabledInputs}
          handlePasswordChange={handlePasswordChange}
          handlePasswordKeyDown={handlePasswordKeyDown}
          viewData={viewData}
          performDecryption={performDecryption}
          isDecrypting={isDecrypting}
          biometricsSupported={biometricsSupported}
          hasBiometricsForCurrent={hasBiometricsForCurrent}
          handleBiometricUnlock={handleBiometricUnlock}
          rememberWithBiometrics={rememberWithBiometrics}
          setRememberWithBiometrics={setRememberWithBiometrics}
        />
      )}

      {/* Decrypted Payload Result Display */}
      {decryptedContent && !viewData?.isE2E && (
        <ViewDecryptedResult
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          decryptedContent={decryptedContent}
          viewData={viewData}
          isHoneyView={isHoneyView}
          isSelfDestructed={isSelfDestructed}
          triggerShatterExplosion={triggerShatterExplosion}
          copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
          formatExpirationDate={formatExpirationDate}
          setSharePendingContent={setSharePendingContent}
          setShowShareConfirm={setShowShareConfirm}
          setStatus={setStatus}
        />
      )}
    </div>
  );
};
