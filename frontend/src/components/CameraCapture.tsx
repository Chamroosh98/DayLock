import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Sparkles, Check } from 'lucide-react';

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
  const [isLive, setIsLive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close live camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setErrorMsg(null);
    setCapturedImg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLive(true);
    } catch (err: any) {
      console.error('Error starting live camera stream: ', err);
      setErrorMsg(t.cameraPermissionDenied || 'Live camera access denied or unsupported.');
      // Trigger native fallback click
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsLive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().getTime();
          const file = new File([blob], `camera_snap_${timestamp}.png`, { type: 'image/png' });
          setCapturedImg(URL.createObjectURL(blob));
          onCapture(file);
          setStatus({ type: 'ok', msg: t.clickToSnap || 'Snapshot captured!' });
          stopCamera();
        }
      }, 'image/png');
    }
  };

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
    <div className={`p-5 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15">
            <Camera className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {t.cameraCapture}
            </h4>
            <p className={`text-[8px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} mt-0.5 uppercase tracking-wider`}>
              {t.clickToSnap}
            </p>
          </div>
        </div>
      </div>

      {isLive ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black border border-white/10 aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Shutter overlay */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
              <button
                type="button"
                onClick={captureFrame}
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg transition-transform active:scale-90"
                title={t.shutter}
              >
                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-5 h-5 bg-black rounded-full" />
                </div>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-transform active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={startCamera}
            className={`flex-1 py-3 px-4 rounded-2xl border ${
              isDarkMode 
                ? 'bg-zinc-950/40 border-white/15 text-zinc-300 hover:text-white hover:bg-zinc-900/50' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            } text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
          >
            <Camera className="w-4 h-4 text-emerald-500" />
            {t.startLiveCamera}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-3 px-4 rounded-2xl border ${
              isDarkMode 
                ? 'bg-zinc-950/40 border-white/15 text-zinc-300 hover:text-white hover:bg-zinc-900/50' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            } text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            {t.systemCamera}
          </button>
        </div>
      )}

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

      {capturedImg && !isLive && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <img src={capturedImg} className="w-full h-full object-cover" alt="Captured Thumbnail" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} flex items-center gap-1.5`}>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Camera Snapshot Ready
            </p>
            <p className={`text-[8px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} uppercase mt-0.5`}>Successfully injected as cover image</p>
          </div>
        </div>
      )}
    </div>
  );
};
