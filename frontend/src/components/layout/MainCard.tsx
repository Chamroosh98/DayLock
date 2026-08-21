import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentType, MainTab } from '../../types';
import { AppHeader } from './AppHeader';
import { CreateTab } from '../../features/create/CreateTab';
import { ViewTab } from '../../features/view/ViewTab';

interface MainCardProps {
  isDarkMode: boolean;
  language: string;
  t: any;
  mainTab: MainTab;
  setMainTab: React.Dispatch<React.SetStateAction<MainTab>>;
  isTrashAnimating: boolean;
  setIsTrashAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  resetTrigger: number;
  setResetTrigger: React.Dispatch<React.SetStateAction<number>>;
  status: { type: 'ok' | 'err' | 'warn'; msg: string } | null;
  setStatus: React.Dispatch<React.SetStateAction<{ type: 'ok' | 'err' | 'warn'; msg: string } | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setShowPasswordWarning: (show: boolean) => void;
  setShowContentWarning: (show: boolean) => void;
  copyToClipboardWithAutoClear: (text: string, type?: string) => Promise<boolean>;
  contentType: ContentType;
  setContentType: React.Dispatch<React.SetStateAction<ContentType>>;
  imageAcquisition: 'camera' | 'upload' | null;
  setImageAcquisition: React.Dispatch<React.SetStateAction<'camera' | 'upload' | null>>;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  viewInput: string;
  setViewInput: React.Dispatch<React.SetStateAction<string>>;
  viewData: any;
  setViewData: React.Dispatch<React.SetStateAction<any>>;
  viewPassword: string;
  setViewPassword: React.Dispatch<React.SetStateAction<string>>;
  viewError: { type: 'geo' | 'time' | 'dms' | 'generic'; data: any } | null;
  setViewError: React.Dispatch<React.SetStateAction<{ type: 'geo' | 'time' | 'dms' | 'generic'; data: any } | null>>;
  decryptedContent: any;
  setDecryptedContent: React.Dispatch<React.SetStateAction<any>>;
  isSelfDestructed: boolean;
  setIsSelfDestructed: (val: boolean) => void;
  hidesCount: number;
  setHidesCount: React.Dispatch<React.SetStateAction<number>>;
  hasBiometricsForCurrent: boolean;
  setHasBiometricsForCurrent: React.Dispatch<React.SetStateAction<boolean>>;
  biometricsSupported: boolean;
  e2eKeyPair: { publicKey: string; privateKey: string } | null;
  triggerShatterExplosion: (colors: string[]) => void;
  setSharePendingContent: (val: string) => void;
  setShowShareConfirm: (val: boolean) => void;
}

export const MainCard: React.FC<MainCardProps> = ({
  isDarkMode,
  language,
  t,
  mainTab,
  setMainTab,
  isTrashAnimating,
  setIsTrashAnimating,
  setResetTrigger,
  setStatus,
  setViewInput,
  setViewData,
  setDecryptedContent,
  setViewPassword,
  contentType,
  setContentType,
  imageAcquisition,
  setImageAcquisition,
  handleTouchStart,
  handleTouchEnd,
  status,
  isLoading,
  setIsLoading,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  setShowPasswordWarning,
  setShowContentWarning,
  copyToClipboardWithAutoClear,
  resetTrigger,
  viewInput,
  viewData,
  viewError,
  setViewError,
  decryptedContent,
  isSelfDestructed,
  setIsSelfDestructed,
  hidesCount,
  setHidesCount,
  hasBiometricsForCurrent,
  setHasBiometricsForCurrent,
  biometricsSupported,
  e2eKeyPair,
  triggerShatterExplosion,
  setSharePendingContent,
  setShowShareConfirm,
}) => {
  return (
    <motion.div
      id="main-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-5 flex flex-col"
    >
      <div
        className={`flex-1 ${
          isDarkMode
            ? 'bg-zinc-900/60 border-white/20 shadow-2xl shadow-black/50'
            : 'bg-white border-zinc-200 shadow-xl'
        } backdrop-blur-3xl border rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col transition-all duration-500`}
      >
        <AppHeader
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
        />

        {/* Content Area */}
        <div className="p-5 sm:p-8 space-y-5 sm:space-y-8">
          <AnimatePresence mode="wait">
            {mainTab === 'create' ? (
              <CreateTab
                contentType={contentType}
                setContentType={setContentType}
                imageAcquisition={imageAcquisition}
                setImageAcquisition={setImageAcquisition}
                handleTouchStart={handleTouchStart}
                handleTouchEnd={handleTouchEnd}
                isDarkMode={isDarkMode}
                language={language}
                t={t}
                status={status}
                setStatus={setStatus}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                disabledInputs={disabledInputs}
                handlePasswordChange={handlePasswordChange}
                handlePasswordKeyDown={handlePasswordKeyDown}
                setShowPasswordWarning={setShowPasswordWarning}
                setShowContentWarning={setShowContentWarning}
                copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
                resetTrigger={resetTrigger}
              />
            ) : (
              <ViewTab
                viewInput={viewInput}
                setViewInput={setViewInput}
                viewData={viewData}
                setViewData={setViewData}
                viewError={viewError}
                setViewError={setViewError}
                decryptedContent={decryptedContent}
                setDecryptedContent={setDecryptedContent}
                isSelfDestructed={isSelfDestructed}
                setIsSelfDestructed={setIsSelfDestructed}
                hidesCount={hidesCount}
                setHidesCount={setHidesCount}
                hasBiometricsForCurrent={hasBiometricsForCurrent}
                setHasBiometricsForCurrent={setHasBiometricsForCurrent}
                isDarkMode={isDarkMode}
                language={language}
                t={t}
                status={status}
                setStatus={setStatus}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                disabledInputs={disabledInputs}
                handlePasswordChange={handlePasswordChange}
                handlePasswordKeyDown={handlePasswordKeyDown}
                biometricsSupported={biometricsSupported}
                e2eKeyPair={e2eKeyPair}
                triggerShatterExplosion={triggerShatterExplosion}
                copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
                setSharePendingContent={setSharePendingContent}
                setShowShareConfirm={setShowShareConfirm}
                resetTrigger={resetTrigger}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
