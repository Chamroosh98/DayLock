import { Language } from '../types';
import { toPersianDigits } from './numberConverter';

export interface ProcessedImage {
  pngFile: File;
  pngBytes: Uint8Array;
  width: number;
  height: number;
  dataUrl: string;
  capacityBytes: number;
}

/**
 * Converts any image file (PNG, JPG, JPEG, WEBP, BMP, Camera snapshot) into a standard,
 * uncompressed lossless PNG Uint8Array and File, calculating exact LSB steganography capacity.
 */
export const convertImageToPng = async (
  source: File | Blob | string,
  originalFilename = 'cover.png'
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }

    img.onload = () => {
      try {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }

        const width = img.naturalWidth || img.width || 640;
        const height = img.naturalHeight || img.height || 480;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Canvas 2D context creation failed');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');

        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate PNG blob from image canvas'));
            return;
          }

          const arrayBuffer = await blob.arrayBuffer();
          const pngBytes = new Uint8Array(arrayBuffer);
          const cleanName = originalFilename.replace(/\.[^/.]+$/, '') + '.png';
          const pngFile = new File([blob], cleanName, { type: 'image/png' });
          const capacityBytes = calculateStegoCapacity(width, height);

          resolve({
            pngFile,
            pngBytes,
            width,
            height,
            dataUrl,
            capacityBytes,
          });
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for steganography conversion'));
    };
  });
};

/**
 * Calculates theoretical LSB capacity in bytes for an image with dimensions (width x height).
 * Uses 3 bits per pixel (R, G, B channels - leaving Alpha intact).
 * Subtracts 52 bytes for metadata header ([MAGIC:4][LEN:4][IV:12][SALT:32]).
 */
export const calculateStegoCapacity = (width: number, height: number): number => {
  const totalBits = width * height * 3;
  const availableBytes = Math.floor(totalBits / 8);
  const HEADER_SIZE = 52;
  return Math.max(0, availableBytes - HEADER_SIZE);
};

/**
 * Formats byte numbers into human-readable strings (e.g. 1.2 KB, 350 B) with localization support.
 */
export const formatStegoSize = (bytes: number, language: Language = 'en'): string => {
  if (bytes <= 0) {
    const zeroStr = language === 'fa' ? '۰ بایت' : '0 B';
    return zeroStr;
  }

  let formatted = '';
  if (bytes < 1024) {
    formatted = language === 'fa' ? `${bytes} بایت` : `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1);
    formatted = language === 'fa' ? `${kb} کیلوبایت` : `${kb} KB`;
  } else {
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    formatted = language === 'fa' ? `${mb} مگابایت` : `${mb} MB`;
  }

  return language === 'fa' ? toPersianDigits(formatted) : formatted;
};
