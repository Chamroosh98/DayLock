import { LanguageManual } from '../../travelerManual';
import { enManual } from './en';
import { faManual } from './fa';
import { ruManual } from './ru';
import { zhManual } from './zh';

export { enManual, faManual, ruManual, zhManual };

export const travelerManualMap: Record<'en' | 'fa' | 'ru' | 'zh', LanguageManual> = {
  en: enManual,
  fa: faManual,
  ru: ruManual,
  zh: zhManual
};
