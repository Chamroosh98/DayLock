import { Language } from '../types';
import { travelerManualMap } from './i18n/manual';

export interface ManualStep {
  title: string;
  badge: string;
  description: string;
  points: string[];
  tip: string;
}

export interface OverviewCard {
  title: string;
  description: string;
}

export interface LanguageManual {
  title: string;
  subtitle: string;
  startTourBtn: string;
  closeBtn: string;
  tabs: {
    overview: string;
    coreModes: string;
    advancedModes: string;
    evasion: string;
    emergency: string;
    perimeter: string;
    shortcuts: string;
  };
  overviewHeading: string;
  overviewText: string;
  overviewCards: OverviewCard[];
  quickNote: string;
  warningText: string;
  steps: {
    coreModes: ManualStep;
    advancedModes: ManualStep;
    evasion: ManualStep;
    emergency: ManualStep;
    perimeter: ManualStep;
  };
}

export const travelerManual: Record<Language, LanguageManual> = travelerManualMap;
