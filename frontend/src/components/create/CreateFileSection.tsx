import React from 'react';
import { Camera, File, Zap } from 'lucide-react';
import { CameraCapture } from '../CameraCapture';
import { Dropzone } from '../Dropzone';
import { Language } from '../../types';

export interface CreateFileSectionProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  imageAcquisition: 'camera' | 'upload' | null;
  setImageAcquisition: (val: 'camera' | 'upload' | null) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChangeDirect: (file: File | null) => void;
}

export const CreateFileSection: React.FC<CreateFileSectionProps> = ({
  isDarkMode,
  language,
  t,
  imageAcquisition,
  setImageAcquisition,
  selectedFile,
  setSelectedFile,
  handleFileSelect,
  handleFileChangeDirect,
}) => {
  return (
    <div className="space-y-4">
      {imageAcquisition === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setImageAcquisition('camera')}
            className={`p-6 rounded-[28px] border ${
              isDarkMode
                ? 'bg-zinc-950/40 border-white/10 hover:border-emerald-500/30 hover:bg-zinc-900/40'
                : 'bg-zinc-50 border-zinc-200 hover:border-emerald-500/30 hover:bg-white'
            } transition-all text-center space-y-3 group flex flex-col items-center justify-center`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {t.cameraCapture}
              </p>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} mt-1`}>
                {t.snapPhoto}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setImageAcquisition('upload')}
            className={`p-6 rounded-[28px] border ${
              isDarkMode
                ? 'bg-zinc-950/40 border-white/10 hover:border-emerald-500/30 hover:bg-zinc-900/40'
                : 'bg-zinc-50 border-zinc-200 hover:border-emerald-500/30 hover:bg-white'
            } transition-all text-center space-y-3 group flex flex-col items-center justify-center`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <File className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {t.fileUpload}
              </p>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} mt-1`}>
                {t.browseOrDrop}
              </p>
            </div>
          </button>
        </div>
      ) : imageAcquisition === 'camera' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.cameraMode}
            </span>
            <button
              type="button"
              onClick={() => setImageAcquisition(null)}
              className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-wider"
            >
              {t.changeMethod}
            </button>
          </div>
          <CameraCapture
            isDarkMode={isDarkMode}
            t={t}
            language={language}
            onCapture={(file) => {
              setSelectedFile(file);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.fileMode}
            </span>
            <button
              type="button"
              onClick={() => setImageAcquisition(null)}
              className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-wider"
            >
              {t.changeMethod}
            </button>
          </div>
          <Dropzone
            isDarkMode={isDarkMode}
            language={language}
            t={t}
            selectedFile={selectedFile}
            onFileSelect={handleFileChangeDirect}
          />
        </div>
      )}
    </div>
  );
};
