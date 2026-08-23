export const toPersianNum = (numStr: string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return numStr.replace(/[0-9]/g, w => farsiDigits[parseInt(w, 10)]);
};

// Universal helper to parse numeric input from standard digits, Numpad keys, and Persian/Arabic keyboards
export const getDigitFromKeyEvent = (e: KeyboardEvent): string | null => {
  // Direct digit keys 0-9
  if (/^[0-9]$/.test(e.key)) return e.key;

  // Persian and Arabic numerals
  const digitsMap: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  if (digitsMap[e.key]) return digitsMap[e.key];

  // Physical Numpad key codes (e.g. Numpad0, Numpad1... Numpad9)
  if (e.code && e.code.startsWith('Numpad')) {
    const num = e.code.replace('Numpad', '');
    if (/^[0-9]$/.test(num)) return num;
  }

  // Top row Digit key codes (e.g. Digit0... Digit9)
  if (e.code && e.code.startsWith('Digit')) {
    const num = e.code.replace('Digit', '');
    if (/^[0-9]$/.test(num)) return num;
  }

  return null;
};
