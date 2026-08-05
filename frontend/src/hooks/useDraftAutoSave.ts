import { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';

export interface DraftData {
  contentType?: string;
  message?: string;
  fileData?: string | null;
  filename?: string | null;
  password?: string;
  hasPassword?: boolean;
  burnAfterRead?: boolean;
  expiresIn?: number;
  hasHoney?: boolean;
  honeyPwd?: string;
  honeyContent?: string;
  hasGeoLock?: boolean;
  allowedCountries?: string[];
  savedAt: number;
}

const DRAFT_STORAGE_KEY = 'dlock_creation_draft_v1';

export const useDraftAutoSave = (
  currentState: Omit<DraftData, 'savedAt'>,
  onRestoreState: (draft: DraftData) => void,
  setStatus?: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void,
  language: Language = 'en'
) => {
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftInfo, setDraftInfo] = useState<DraftData | null>(null);
  const isInitialMount = useRef(true);

  // Check if draft exists in local storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed: DraftData = JSON.parse(raw);
        if (parsed && (parsed.message || parsed.password || parsed.fileData || parsed.hasHoney)) {
          setHasDraft(true);
          setDraftInfo(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse creation draft', e);
    }
  }, []);

  // Auto-save form state to local storage when meaningful changes occur
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const { message, fileData, password, hasHoney, honeyPwd, honeyContent, allowedCountries } = currentState;

    // Check if there is anything worth saving
    const hasContent = Boolean(
      (message && message.trim().length > 0) ||
      fileData ||
      password ||
      (hasHoney && (honeyPwd || honeyContent)) ||
      (allowedCountries && allowedCountries.length > 0)
    );

    if (!hasContent) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const draft: DraftData = {
          ...currentState,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setHasDraft(true);
        setDraftInfo(draft);
      } catch (e) {
        console.error('Failed to auto-save draft', e);
      }
    }, 1000); // 1 sec debounce

    return () => clearTimeout(timer);
  }, [currentState]);

  const restoreDraft = useCallback(() => {
    if (!draftInfo) return;
    onRestoreState(draftInfo);
    if (setStatus) {
      setStatus({
        type: 'ok',
        msg: language === 'fa' ? 'پیش‌نویس با موفقیت بازگردانی شد!' : 'Draft successfully restored!',
      });
    }
  }, [draftInfo, onRestoreState, setStatus, language]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setDraftInfo(null);
  }, []);

  return {
    hasDraft,
    draftInfo,
    restoreDraft,
    clearDraft,
  };
};
