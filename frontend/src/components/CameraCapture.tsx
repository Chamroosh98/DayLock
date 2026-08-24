import React, { useRef, useState, useEffect } from 'react';
import { Camera, AlertCircle, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isDarkMode: boolean;
  t: any;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  isDarkMode,
  t,
  setStatus,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically trigger camera on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setCapturedImg(URL.createObjectURL(file));
      onCapture(file);
      setStatus({ type: 'ok', msg: t.clickToSnap || 'Snapshot captured!' });
    }
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`bg-zinc-950/20 border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3.5 sm:gap-4 cursor-pointer transition-all relative overflow-hidden min-h-[210px] sm:min-h-[260px] group ${
          isDarkMode 
            ? 'border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.02]' 
            : 'border-zinc-300 hover:border-emerald-500/50 hover:bg-zinc-50'
        }`}
      >
        <div className="relative z-10 p-4 sm:p-5 rounded-full bg-zinc-500/5 text-zinc-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 border border-transparent transition-all duration-300">
          <Camera className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <div className="relative z-10 text-center max-w-xs sm:max-w-sm px-4">
          <p className={`text-xs sm:text-[13px] font-bold tracking-normal leading-relaxed ${
            isDarkMode ? 'text-zinc-300 group-hover:text-zinc-100' : 'text-zinc-700 group-hover:text-zinc-950'
          }`}>
            {t.cameraCapture || 'Take Photo with Camera'}
          </p>
        </div>
      </div>

      {/* Hidden file selector configured specifically to prompt system camera on touch devices */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleNativeCapture}
        className="hidden"
      />

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[9px] font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {capturedImg && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <img src={capturedImg} className="w-full h-full object-cover" alt="Captured Thumbnail" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} flex items-center gap-1.5`}>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Camera Snapshot Ready
            </p>
            <p className={`text-[8px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} uppercase mt-0.5`}>
              Successfully injected as cover image
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
