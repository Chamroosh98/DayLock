import { useState, useRef } from 'react';

export interface UseStegoStateOptions {
  initialImageAcquisition?: 'camera' | 'upload' | null;
}

/**
 * Custom Hook: useStegoState
 * Encapsulates image steganography carrier selection / payload embedding / extraction,
 * and image steganography canvas / capacity state.
 */
export function useStegoState(options: UseStegoStateOptions = {}) {
  const [imageAcquisition, setImageAcquisition] = useState<'camera' | 'upload' | null>(
    options.initialImageAcquisition ?? null
  );
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [stegoCapacity, setStegoCapacity] = useState<number>(0);
  const stegoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const resetStegoState = () => {
    setImageAcquisition(null);
    setStegoImage(null);
    setStegoCapacity(0);
  };

  return {
    imageAcquisition,
    setImageAcquisition,
    stegoImage,
    setStegoImage,
    stegoCapacity,
    setStegoCapacity,
    stegoCanvasRef,
    resetStegoState,
  };
}
