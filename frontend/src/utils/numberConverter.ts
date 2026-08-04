/**
 * Utility to convert English numerals into Persian numerals and vice-versa
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const PERSIAN_MAP = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
const ARABIC_MAP  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

/**
 * Replaces all English digits (0-9) in any string or number with Persian digits.
 */
export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Replaces Persian/Arabic digits with English digits.
 */
export function toEnglishDigits(input: string): string {
  let out = input;
  for (let i = 0; i < 10; i++) {
    out = out.replace(PERSIAN_MAP[i], String(i)).replace(ARABIC_MAP[i], String(i));
  }
  return out;
}

/**
 * Localizes a number or string based on current language
 */
export function localizeDigitsValue(input: string | number | undefined | null, language: string): string {
  if (language === 'fa') {
    return toPersianDigits(input);
  }
  return String(input ?? '');
}

