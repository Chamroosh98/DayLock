import React from 'react';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Language, ContentType } from '../../../types';
import { Dropzone } from '../../../components/Dropzone';
import { CameraCapture } from '../../../components/CameraCapture';
import { getAutoDir, getAutoContainerClass } from '../utils';
import { formatStegoSize } from '../../../utils/imageProcessor';
import { toPersianDigits } from '../../../utils/numberConverter';

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
  const messageBytes = new TextEncoder().encode(message).length;
  const isOverCapacity = stegoCapacity > 0 && messageBytes > stegoCapacity;
  const usagePercentage = stegoCapacity > 0 ? Math.min(100, Math.round((messageBytes / stegoCapacity) * 100)) : 0;
  const remainingBytes = Math.max(0, stegoCapacity - messageBytes);
  const excessBytes = Math.max(0, messageBytes - stegoCapacity);

  return (
    <div className="space-y-6">
      {/* Acquisition Choice Phase - Selected File is empty */}
      {!selectedFile && !imageAcquisition && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
          {/* Live Camera Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setImageAcquisition('camera')}
            title={t.cameraCapture || 'Camera'}
            aria-label={t.cameraCapture || 'Camera'}
            className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center transition-all min-h-[130px] sm:min-h-[160px] group ${
              isDarkMode
                ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-zinc-300'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-emerald-500/40 hover:bg-emerald-50/50 text-zinc-700'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </motion.div>

          {/* Standard File Upload Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setImageAcquisition('upload')}
            title={t.galleryUpload || 'Gallery / Upload'}
            aria-label={t.galleryUpload || 'Gallery / Upload'}
            className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed cursor-pointer text-center flex flex-col items-center justify-center transition-all min-h-[130px] sm:min-h-[160px] group ${
              isDarkMode
                ? 'border-white/10 bg-zinc-950/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-zinc-300'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-emerald-500/40 hover:bg-emerald-50/50 text-zinc-700'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 text-emerald-500 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Rendering selected flows when selectedFile is still empty */}
      {!selectedFile && imageAcquisition === 'camera' && (
        <div className="relative animate-fade-in">
          <button
            type="button"
            onClick={() => setImageAcquisition(null)}
            className={`absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              isDarkMode
                ? 'bg-zinc-900/90 border-white/15 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-white/90 backdrop-blur border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
            title={t.backToSelection || 'Back'}
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
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
        <div className="relative animate-fade-in">
          <button
            type="button"
            onClick={() => setImageAcquisition(null)}
            className={`absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              isDarkMode
                ? 'bg-zinc-900/90 border-white/15 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-white/90 backdrop-blur border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
            title={t.backToSelection || 'Back'}
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
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
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
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

          {/* Stego Capacity Tracker & Live Extent Dashboard */}
          {contentType === 'stego' && (
            <div 
              dir={language === 'fa' ? 'rtl' : 'ltr'} 
              className={`p-4 rounded-2xl sm:rounded-3xl border transition-all ${
                isOverCapacity
                  ? isDarkMode ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50/60 border-red-200'
                  : isDarkMode ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-100/70 border-zinc-200'
              }`}
            >
              {/* Header metrics */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isOverCapacity 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {isOverCapacity ? <AlertTriangle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className={`text-[11px] sm:text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                      {t.stegoCapacity}
                    </span>
                    <span className={`text-[9.5px] sm:text-[10px] ml-1.5 opacity-60 ${language === 'fa' ? 'font-vazir' : ''}`}>
                      ({language === 'fa' ? 'ظرفیت پنهان‌سازی متن در پیکسل‌ها' : 'Max hidden payload in pixels'})
                    </span>
                  </div>
                </div>

                {/* Capacity badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold ${
                    isOverCapacity
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                      : isDarkMode
                      ? 'bg-zinc-800 text-zinc-300 border border-white/10'
                      : 'bg-white text-zinc-700 border border-zinc-200 shadow-2xs'
                  }`}>
                    {language === 'fa' 
                      ? `${toPersianDigits(messageBytes)} / ${toPersianDigits(stegoCapacity)} بایت (${toPersianDigits(usagePercentage)}٪)`
                      : `${messageBytes} / ${stegoCapacity} B (${usagePercentage}%)`}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, usagePercentage)}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    isOverCapacity
                      ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      : usagePercentage > 75
                      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  }`} 
                />
              </div>

              {/* Sub-metrics / Remaining info */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] mt-2 pt-1 font-medium">
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                  {language === 'fa'
                    ? `حداکثر ظرفیت تصویر: ${formatStegoSize(stegoCapacity, language)}`
                    : `Max Image Capacity: ${formatStegoSize(stegoCapacity, language)}`}
                </span>

                {isOverCapacity ? (
                  <span className={`text-red-500 font-bold flex items-center gap-1 ${language === 'fa' ? 'font-vazir' : ''}`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {language === 'fa'
                      ? `${formatStegoSize(excessBytes, language)} مازاد بر ظرفیت`
                      : `${formatStegoSize(excessBytes, language)} over capacity`}
                  </span>
                ) : (
                  <span className={`text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ${language === 'fa' ? 'font-vazir' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'fa'
                      ? `${formatStegoSize(remainingBytes, language)} فضای خالی`
                      : `${formatStegoSize(remainingBytes, language)} remaining`}
                  </span>
                )}
              </div>

              {/* Capacity Exceeded Banner */}
              {isOverCapacity && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2.5 p-2.5 rounded-xl border text-[11px] font-bold ${
                    isDarkMode ? 'bg-red-950/40 border-red-500/40 text-red-300' : 'bg-red-100/80 border-red-300 text-red-700'
                  } ${language === 'fa' ? 'font-vazir text-right' : 'text-left'}`}
                >
                  {t.stegoCapacityExceeded} ({language === 'fa' 
                    ? `متن شما ${formatStegoSize(excessBytes, language)} بیشتر از حداکثر ظرفیت تصویر است. لطفاً متن را کوتاه‌تر کنید یا از تصویر بزرگ‌تری استفاده کنید.`
                    : `Your text is ${formatStegoSize(excessBytes, language)} larger than what this image can hold. Please shorten the text or choose a higher-resolution image.`})
                </motion.div>
              )}
            </div>
          )}

          {/* Secret Message / Caption Input for Steganography */}
          {contentType === 'stego' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                  {language === 'fa' ? 'متن / کپشن محرمانه برای پنهان‌سازی' : 'Secret Message / Caption to Hide'}
                </label>
                <span className={`text-[10px] sm:text-[11px] font-mono ${isOverCapacity ? 'text-red-500 font-bold' : isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {language === 'fa' 
                    ? `${toPersianDigits(message.length)} نویسه | ${toPersianDigits(messageBytes)} بایت` 
                    : `${message.length} chars | ${messageBytes} B`}
                </span>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.stegoPlaceholder}
                dir={getAutoDir(message, language)}
                className={`w-full h-[180px] ${
                  isOverCapacity
                    ? isDarkMode ? 'bg-red-950/20 border-red-500/50 text-zinc-100' : 'bg-red-50/40 border-red-300 text-zinc-800'
                    : isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'
                } border rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 focus:outline-none text-xs sm:text-sm leading-relaxed resize-none transition-smooth ${getAutoContainerClass(message, language)}`}
              />
            </div>
          )}

          <canvas ref={stegoCanvasRef} className="hidden" />
        </motion.div>
      )}
    </div>
  );
};

