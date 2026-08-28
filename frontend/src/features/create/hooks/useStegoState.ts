import React, { useState, useRef } from 'react';
import { Language } from '../../../types';
import { convertImageToPng, calculateStegoCapacity, formatStegoSize } from '../../../utils/imageProcessor';

export const useStegoState = (
  language: Language,
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string }) => void,
  t: Record<string, string>,
  setSelectedFile: (file: File | null) => void,
  setStegoImage: (img: string | null) => void,
  setStegoCapacity: (cap: number) => void
) => {
  const [stegoResultFile, setStegoResultFile] = useState<{ blob: Blob; url: string; filename: string } | null>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChangeDirect = async (file: File) => {
    setSelectedFile(file);

    // Architectural limits warning
    if (file.type.startsWith('image/')) {
      if (file.size > 25 * 1024 * 1024) {
        setStatus({ type: 'warn', msg: t.imageSizeWarning || "Image exceeds 25 MB. Processing might take a few moments." });
      }
    } else {
      if (file.size > 25 * 1024 * 1024) {
        setStatus({ type: 'warn', msg: t.fileSizeWarning || "File size exceeds 25 MB. In-browser encryption may experience latency." });
      }
    }

    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) {
      try {
        const processed = await convertImageToPng(file, file.name);
        setSelectedFile(processed.pngFile);
        setStegoImage(processed.dataUrl);
        setStegoCapacity(processed.capacityBytes);

        if (stegoCanvasRef.current) {
          const ctx = stegoCanvasRef.current.getContext('2d');
          stegoCanvasRef.current.width = processed.width;
          stegoCanvasRef.current.height = processed.height;
          const img = new Image();
          img.onload = () => ctx?.drawImage(img, 0, 0);
          img.src = processed.dataUrl;
        }

        const capStr = formatStegoSize(processed.capacityBytes, language);
        setStatus({
          type: 'ok',
          msg: `${t.imageLoadedSuccess || 'Image loaded successfully'} (${t.stegoCapacity || 'Capacity'}: ${capStr})`
        });
      } catch (err: any) {
        console.error("Error processing cover image:", err);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setStegoImage(event.target?.result as string);
            const cap = calculateStegoCapacity(img.width, img.height);
            setStegoCapacity(cap);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileChangeDirect(e.target.files[0]);
    }
  };

  const resetStegoResult = () => {
    if (stegoResultFile?.url) {
      URL.revokeObjectURL(stegoResultFile.url);
    }
    setStegoResultFile(null);
  };

  return {
    stegoResultFile,
    setStegoResultFile,
    stegoCanvasRef,
    handleFileChangeDirect,
    handleFileSelect,
    resetStegoResult
  };
};
