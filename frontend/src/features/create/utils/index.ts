import { Language } from '../../../types';

export const getFileBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const base64 = resultString.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const b64toBlob = (b64: string, type: string) => {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
};

export const getAutoDir = (text: string, language: Language) => {
  if (!text) return language === 'fa' ? 'rtl' : 'ltr';
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRange.test(text) ? 'rtl' : 'ltr';
};

export const getAutoContainerClass = (text: string, language: Language) => {
  const dir = getAutoDir(text, language);
  const fontClass = dir === 'rtl' ? 'font-vazir' : 'font-sans';
  const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';
  return `${fontClass} ${alignClass}`;
};
