import React from 'react';
import { Language, StatusState, ViewErrorState, E2EMessage, E2EKeyPair, DecryptedPayload } from '../../../types';

export type { ViewErrorState, E2EMessage, E2EKeyPair, DecryptedPayload };

export interface ViewTabProps {
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  status: StatusState | null;
  setStatus: (status: StatusState | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (val: string, setter: (v: string) => void, fieldKey: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldKey: string) => void;
  biometricsSupported: boolean;
  e2eKeyPair: E2EKeyPair | null;
  triggerShatterExplosion: (colors: string[]) => void;
  copyToClipboardWithAutoClear: (text: string, timeoutMs: number, onWarning: (msg: string) => void, lang?: string) => Promise<boolean>;
  setSharePendingContent: (content: string) => void;
  setShowShareConfirm: (show: boolean) => void;
  resetTrigger?: number;
  viewInput: string;
  setViewInput: (val: string) => void;
  viewData: any;
  setViewData: (data: any) => void;
  viewError: ViewErrorState | null;
  setViewError: (err: ViewErrorState | null) => void;
  decryptedContent: DecryptedPayload | string | null;
  setDecryptedContent: (content: DecryptedPayload | string | null) => void;
  isSelfDestructed: boolean;
  setIsSelfDestructed: (val: boolean) => void;
  hidesCount: number;
  setHidesCount: React.Dispatch<React.SetStateAction<number>>;
  hasBiometricsForCurrent: boolean;
  setHasBiometricsForCurrent: (val: boolean) => void;
}
