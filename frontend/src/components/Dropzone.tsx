import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DropzoneProps } from '../types';
import { localizeDigitsValue } from '../utils/numberConverter';
import { translations } from '../data/translations';

export const Dropzone: React.FC<DropzoneProps> = ({ 
  onSelect, 
  selectedFile, 
  icon, 
  accept, 
  label, 
  isDarkMode, 
  previewUrl,
  language
}) => {
  const t = translations[language || 'en'] || translations.en;
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/'))) {
      const url = URL.createObjectURL(selectedFile);
      setInternalPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setInternalPreview(null);
    }
  }, [selectedFile]);

  const displayPreview = previewUrl || internalPreview;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelect({
        target: {
          files: e.dataTransfer.files
        }
      } as any);
    }
  };

  return (
    <div 
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-zinc-950/20 border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all relative overflow-hidden min-h-[285px] group ${
        isDragging
          ? 'border-emerald-500 bg-emerald-500/15 scale-[1.01]'
          : selectedFile 
            ? 'border-emerald-500 bg-emerald-500/5' 
            : (isDarkMode ? 'border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.02]' : 'border-zinc-300 hover:border-emerald-500/50 hover:bg-zinc-50')
      }`}
    >
      <input type="file" ref={inputRef} onChange={onSelect} accept={accept} className="hidden" />
      
      {selectedFile && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect({
              target: {
                files: null
              }
            } as any);
          }}
          className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 group-hover:opacity-100 cursor-pointer ${
            isDarkMode 
              ? 'bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-red-400 hover:bg-zinc-800' 
              : 'bg-white/80 border-zinc-200 text-zinc-600 hover:text-red-600 hover:bg-zinc-100'
          }`}
          title={t.removeFile || "Remove File"}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {displayPreview && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {selectedFile?.type.startsWith('video/') ? (
            <video src={displayPreview} className="w-full h-full object-cover opacity-40 blur-[1px]" muted loop autoPlay />
          ) : (
            <img src={displayPreview} className="w-full h-full object-cover opacity-40 blur-[1px]" alt="Preview" />
          )}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40' : 'bg-gradient-to-t from-white via-white/70 to-white/40'}`} />
        </div>
      )}

      <div className={`relative z-10 p-4 rounded-full transition-all duration-300 ${
        selectedFile 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 scale-110 shadow-lg shadow-emerald-500/10' 
          : 'bg-zinc-500/5 text-zinc-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:text-emerald-500 group-hover:bg-emerald-500/5 group-hover:border-emerald-500/10 border border-transparent'
      }`}>
        {icon}
      </div>

      <div className="relative z-10 text-center max-w-xs sm:max-w-sm px-4 space-y-1.5">
        <p className={`text-xs sm:text-[13px] font-bold tracking-normal leading-relaxed ${
          selectedFile 
            ? (isDarkMode ? 'text-zinc-100 truncate' : 'text-zinc-900 truncate') 
            : (isDarkMode ? 'text-zinc-300 group-hover:text-zinc-100' : 'text-zinc-700 group-hover:text-zinc-950')
        } ${language === 'fa' ? 'font-vazir' : ''}`}>
          {selectedFile ? selectedFile.name : label}
        </p>
        {selectedFile ? (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold ${language === 'fa' ? 'font-vazir' : 'font-mono'}`}>
            {localizeDigitsValue((selectedFile.size / 1024 / 1024).toFixed(2), language || 'en')} {t.mbUnit}
          </div>
        ) : (
          <p className={`text-[9px] sm:text-[10px] tracking-wider text-zinc-500 opacity-80 ${language === 'fa' ? 'font-vazir' : 'uppercase'}`}>
            {t.dragDropHint}
          </p>
        )}
      </div>
    </div>
  );
};
export default Dropzone;
