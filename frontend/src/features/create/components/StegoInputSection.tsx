import React from 'react';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Language, ContentType } from '../../../types';
import { Dropzone } from '../../../components/Dropzone';
import { CameraCapture } from '../../../components/CameraCapture';
import { getAutoDir, getAutoContainerClass } from '../utils';

interface StegoInputSectionProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  imageAcquisition: 'camera' | 'upload' | null;
  setImageAcquisition: (mode: 'camera' | 'upload' | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChangeDirect: (file: File) => void;
  stegoImage: string | null;
  setStegoImage: (img: string | null) => void;
  stegoCapacity: number;
  message: string;
  setMessage: (msg: string) => void;
  stegoCanvasRef: React.RefObject<HTMLCanvasElement>;
  contentType: ContentType;
  isDarkMode: boolean;
  language: Language;
  t: any;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const StegoInputSection: React.FC<StegoInputSectionProps> = ({
  selectedFile,
  setSelectedFile,
  imageAcquisition,
  setImageAcquisition,
  handleFileSelect,
  handleFileChangeDirect,
  stegoImage,
  setStegoImage,
  stegoCapacity,
  message,
  setMessage,
  stegoCanvasRef,
  contentType,
  isDarkMode,
  language,
  t,
  setStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Acquisition Choice Phase - Selected File is empty */}
      {!selectedFile && !imageAcquisition && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
          {/* Live Camera Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setImageAcquisition('camera')}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 sm:gap-3 transition-all min-h-[110px] sm:min-h-[140px] ${
              isDarkMode
                ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/30 text-zinc-300'
                : 'border-zinc-200 bg-zinc-100/30 hover:border-emerald-500/30 text-zinc-700'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-[13px] font-black uppercase tracking-wider sm:tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                {t.cameraCapture}
              </h4>
            </div>
          </motion.div>

          {/* Standard File Upload Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setImageAcquisition('upload')}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 sm:gap-3 transition-all min-h-[110px] sm:min-h-[140px] ${
              isDarkMode
                ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/30 text-zinc-300'
                : 'border-zinc-200 bg-zinc-100/30 hover:border-emerald-500/30 text-zinc-700'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-[13px] font-black uppercase tracking-wider sm:tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                {t.galleryUpload}
              </h4>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rendering selected flows when selectedFile is still empty */}
      {!selectedFile && imageAcquisition === 'camera' && (
        <div className="space-y-4 animate-fade-in">
          <button
            type="button"
            onClick={() => setImageAcquisition(null)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
              isDarkMode
                ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {t.backToSelection}
          </button>
          <CameraCapture 
            onCapture={(file) => {
              handleFileChangeDirect(file);
            }} 
            isDarkMode={isDarkMode} 
            t={t} 
            setStatus={setStatus} 
          />
        </div>
      )}

      {!selectedFile && imageAcquisition === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          <button
            type="button"
            onClick={() => setImageAcquisition(null)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
              isDarkMode
                ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {t.backToSelection}
          </button>
          <Dropzone 
            onSelect={handleFileSelect} 
            selectedFile={selectedFile} 
            icon={<ImageIcon className="w-10 h-10"/>} 
            accept="image/*" 
            isDarkMode={isDarkMode} 
            label={contentType === 'stego' ? t.selectPngCover : t.image} 
            language={language}
          />
        </div>
      )}

      {/* Interactive Preview Phase - File Selected */}
      {selectedFile && (
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <Dropzone 
            onSelect={(e: any) => {
              if (!e.target.files || e.target.files.length === 0) {
                setSelectedFile(null);
                setStegoImage(null);
                setImageAcquisition(null);
              } else {
                handleFileSelect(e);
              }
            }}
            selectedFile={selectedFile}
            icon={<ImageIcon className="w-10 h-10" />}
            accept="image/*"
            isDarkMode={isDarkMode}
            previewUrl={stegoImage || undefined}
            label={contentType === 'stego' ? t.selectPngCover : t.image}
            language={language}
          />

          {/* Stego Capacity Tracker */}
          {contentType === 'stego' && (
            <div className="space-y-1.5 px-1 animate-fade-in">
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                <span className={language === 'fa' ? 'font-vazir' : ''}>{t.stegoCapacity}</span>
                <span className={new TextEncoder().encode(message).length > stegoCapacity && stegoCapacity > 0 ? 'text-red-500 font-black' : ''}>
                  {Math.round(Math.min(100, (new TextEncoder().encode(message).length / Math.max(1, stegoCapacity)) * 100))}%
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (new TextEncoder().encode(message).length / Math.max(1, stegoCapacity)) * 100)}%` }}
                  className={`h-full ${
                    new TextEncoder().encode(message).length > stegoCapacity && stegoCapacity > 0
                      ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  }`} 
                />
              </div>
              {stegoCapacity > 0 && new TextEncoder().encode(message).length > stegoCapacity && (
                <p className={`text-[10px] text-red-500 font-bold ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}>
                  {t.stegoCapacityExceeded}
                </p>
              )}
            </div>
          )}

          {/* Secret Message Input for Steganography */}
          {contentType === 'stego' && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.stegoPlaceholder}
              dir={getAutoDir(message, language)}
              className={`w-full h-[180px] ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'} border rounded-[32px] p-5 sm:p-8 focus:outline-none text-sm leading-relaxed resize-none transition-smooth ${getAutoContainerClass(message, language)}`}
            />
          )}

          <canvas ref={stegoCanvasRef} className="hidden" />
        </motion.div>
      )}
    </div>
  );
};
