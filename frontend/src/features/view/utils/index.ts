import { formatExpirationDate, getAutoDir, getAutoContainerClass } from '../../../utils/formatters';
import { localizeDigitsValue } from '../../../utils/numberConverter';

export { formatExpirationDate, getAutoDir, getAutoContainerClass, localizeDigitsValue };

export const parseViewUrl = (inputStr: string): { isUrl: boolean; cleanUrl: string } => {
  const cleanStr = inputStr.trim();
  const isUrl = (cleanStr.startsWith('http://') || cleanStr.startsWith('https://') || (cleanStr.includes('.') && !cleanStr.includes('#') && !cleanStr.includes(':'))) && !cleanStr.includes('#');
  let cleanUrl = cleanStr;
  if (isUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return { isUrl, cleanUrl };
};
