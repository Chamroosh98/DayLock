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

const STEGO_HEADER_SIZE = 56;

/** Max canvas edge length for budget / 32-bit Chrome devices. */
export function getMaxImageEdge(): number {
  const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof dm === 'number' && dm <= 2) return 1024;
  if (typeof dm === 'number' && dm <= 4) return 1280;
  if (/Android/i.test(navigator.userAgent)) return 1280;
  return 1920;
}

/** Argon2id m_cost in KiB. Stored in ciphertext / SCR2 stego header. */
export function argonMCostKiB(): number {
  const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof dm === 'number' && dm <= 2) return 8192;
  if (typeof dm === 'number' && dm <= 4) return 16384;
  if (/Android/i.test(navigator.userAgent)) return 16384;
  return 32768;
}

export function revokeIfBlobUrl(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function scaledSize(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Converts any image file into a downscaled lossless PNG without toDataURL
 * (avoids a UTF-16 PNG string + full-res RGBA on 32-bit Android Chrome).
 */
export const convertImageToPng = async (
  source: File | Blob | string,
  originalFilename = 'cover.png'
): Promise<ProcessedImage> => {
  const maxEdge = getMaxImageEdge();
  let objectUrl: string | null = null;
  let bitmap: ImageBitmap | null = null;

  try {
    if (typeof createImageBitmap === 'function' && typeof source !== 'string') {
      try {
        bitmap = await createImageBitmap(source);
      } catch {
        bitmap = null;
      }
    }

    const drawToPng = async (
      img: CanvasImageSource,
      natW: number,
      natH: number
    ): Promise<ProcessedImage> => {
      const { width, height } = scaledSize(natW, natH, maxEdge);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        throw new Error('Canvas 2D context creation failed');
      }
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to generate PNG blob from image canvas'))),
          'image/png'
        );
      });

      canvas.width = 0;
      canvas.height = 0;

      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);
      const cleanName = originalFilename.replace(/\.[^/.]+$/, '') + '.png';
      const pngFile = new File([blob], cleanName, { type: 'image/png' });
      const dataUrl = URL.createObjectURL(blob);

      return {
        pngFile,
        pngBytes,
        width,
        height,
        dataUrl,
        capacityBytes: calculateStegoCapacity(width, height),
      };
    };

    if (bitmap) {
      const processed = await drawToPng(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      bitmap = null;
      return processed;
    }

    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      if (typeof source === 'string') {
        img.src = source;
      } else {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      }

      img.onload = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        const natW = img.naturalWidth || img.width || 640;
        const natH = img.naturalHeight || img.height || 480;
        drawToPng(img, natW, natH).then(resolve).catch(reject);
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for steganography conversion'));
      };
    });
  } finally {
    if (bitmap) bitmap.close();
  }
};

/**
 * Calculates theoretical LSB capacity in bytes for an image with dimensions (width x height).
 * Uses 3 bits per pixel (R, G, B channels - leaving Alpha intact).
 * Subtracts 56 bytes for SCR2 metadata ([MAGIC:4][LEN:4][MCOST:4][IV:12][SALT:32]).
 */
export const calculateStegoCapacity = (width: number, height: number): number => {
  const totalBits = width * height * 3;
  const availableBytes = Math.floor(totalBits / 8);
  return Math.max(0, availableBytes - STEGO_HEADER_SIZE);
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
