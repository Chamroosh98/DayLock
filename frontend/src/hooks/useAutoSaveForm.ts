import { useEffect } from 'react';

const DRAFT_STORAGE_KEY = 'daylock_create_form_draft';

export interface FormDraftData {
  contentType?: string;
  message?: string;
  expiresIn?: number;
  burnAfterRead?: boolean;
  maxViews?: number;
  hasPassword?: boolean;
  hasHoney?: boolean;
  hasGeoLock?: boolean;
  hasTimeLock?: boolean;
  hasDeadMans?: boolean;
  hasCanary?: boolean;
  hasSelfDestruct?: boolean;
}

export function useAutoSaveForm<T extends FormDraftData>(
  formData: T,
  restoreCallback?: (draft: T) => void
) {
  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && restoreCallback) {
        const parsed = JSON.parse(saved);
        restoreCallback(parsed);
      }
    } catch (e) {
      console.error('Failed to restore form draft :', e);
    }
  }, []);

  // Save draft on form changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error('Failed to auto-save form draft :', e);
    }
  }, [formData]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear form draft :', e);
    }
  };

  return { clearDraft };
}
