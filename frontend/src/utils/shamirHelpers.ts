import { toEnglishDigits } from './numberConverter';

export interface ParsedShareInfo {
  isValid: boolean;
  cleanShare: string;
  shareIndex: number | null;
  bitCount: number | null;
}

/**
 * Validates and extracts metadata from a Shamir Secret Sharing hex share.
 */
export function parseShamirShare(rawInput: string): ParsedShareInfo {
  if (!rawInput) {
    return { isValid: false, cleanShare: '', shareIndex: null, bitCount: null };
  }

  // Normalize digits (Persian/Arabic to English) and trim spaces
  const clean = toEnglishDigits(rawInput.trim()).toLowerCase().replace(/\s+/g, '');

  // Must be hexadecimal and at least 4 characters
  const isHex = /^[0-9a-f]+$/.test(clean);
  if (!isHex || clean.length < 4) {
    return { isValid: false, cleanShare: clean, shareIndex: null, bitCount: null };
  }

  try {
    const bitsHex = clean.charAt(0);
    const bitCount = parseInt(bitsHex, 16);
    const idHex = clean.substring(1, 3);
    const shareIndex = parseInt(idHex, 16);

    const isValid = !isNaN(shareIndex) && shareIndex > 0 && shareIndex <= 255;
    return {
      isValid,
      cleanShare: clean,
      shareIndex: isValid ? shareIndex : null,
      bitCount: !isNaN(bitCount) ? bitCount : null,
    };
  } catch {
    return { isValid: false, cleanShare: clean, shareIndex: null, bitCount: null };
  }
}
