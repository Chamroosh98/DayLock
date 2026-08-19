import React from 'react';
import { ContentType, Language } from '../../../types';

export interface CreateTabProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  imageAcquisition: 'camera' | 'upload' | null;
  setImageAcquisition: (mode: 'camera' | 'upload' | null) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  status: { type: 'ok' | 'err' | 'warn'; msg: string } | null;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setValue: (v: string) => void, inputId: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => void;
  setShowPasswordWarning: (show: boolean) => void;
  setShowContentWarning: (show: boolean) => void;
  copyToClipboardWithAutoClear: (text: string, durationMs?: number, onWarn?: (msg: string) => void, lang?: string) => void;
  resetTrigger?: number;
}
