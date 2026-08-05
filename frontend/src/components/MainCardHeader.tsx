import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { MainTab, Language, ContentType } from '../types';
import { TrashIcon } from './TrashIcon';

export interface MainCardHeaderProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  isTrashAnimating: boolean;
  setIsTrashAnimating: (val: boolean) => void;
  contentType: ContentType;
  setMessage: (val: string) => void;
  setSelectedFile: (file: File | null) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setRecordingTime: (time: number) => void;
  setAudioWavBytes: (bytes: Uint8Array | null) => void;
  setAudioFilename: (fn: string) => void;
  setAudioWavCapacity: (cap: number) => void;
  setAudioWaveformSamples: (samples: Float32Array | null) => void;
  setAudioText: (text: string) => void;
  setStegoImage: (img: string | null) => void;
  setPassword: (pwd: string) => void;
  setHasPassword: (has: boolean) => void;
  setBurnAfterRead: (burn: boolean) => void;
  setHasHoney: (honey: boolean) => void;
  setResultUrl: (url: string | null) => void;
  setStatus: (status: any) => void;
  setViewInput: (input: string) => void;
  setViewData: (data: any) => void;
  setDecryptedContent: (content: any) => void;
  setViewPassword: (pwd: string) => void;
}

export const MainCardHeader: React.FC<MainCardHeaderProps> = ({
  isDarkMode,
  language,
  t,
  mainTab,
  setMainTab,
  isTrashAnimating,
  setIsTrashAnimating,
  contentType,
  setMessage,
  setSelectedFile,
  setAudioBlob,
  setRecordingTime,
  setAudioWavBytes,
  setAudioFilename,
  setAudioWavCapacity,
  setAudioWaveformSamples,
  setAudioText,
  setStegoImage,
  setPassword,
  setHasPassword,
  setBurnAfterRead,
  setHasHoney,
  setResultUrl,
  setStatus,
  setViewInput,
  setViewData,
  setDecryptedContent,
  setViewPassword,
}) => {
  const handleClearTab = () => {
    setIsTrashAnimating(true);
    setTimeout(() => setIsTrashAnimating(false), 800);

    if (mainTab === 'create') {
      if (contentType === 'text') setMessage('');
      if (contentType === 'file') setSelectedFile(null);
      if (contentType === 'audio') {
        setAudioBlob(null);
        setRecordingTime(0);
        setAudioWavBytes(null);
        setAudioFilename('');
        setAudioWavCapacity(0);
        setAudioWaveformSamples(null);
        setAudioText('');
      }
      if (contentType === 'image') setSelectedFile(null);
      if (contentType === 'stego') {
        setMessage('');
        setSelectedFile(null);
        setStegoImage(null);
      }
      setPassword('');
      setHasPassword(false);
      setBurnAfterRead(false);
      setHasHoney(false);
      setResultUrl(null);
      setStatus(null);
    } else {
      setViewInput('');
      setViewData(null);
      setDecryptedContent(null);
      setStatus(null);
      setViewPassword('');
    }
  };

  return (
    <>
      {/* Header top bar */}
      <div
        className={`p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between border-b ${
          isDarkMode ? 'border-white/10' : 'border-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 ${
              isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            } rounded-2xl flex items-center justify-center border shadow-inner shrink-0`}
          >
            <Shield
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1
                className={`text-lg sm:text-xl ${
                  language === 'fa'
                    ? 'font-vazir font-bold'
                    : 'lg:font-display lg:italic lg:tracking-tight font-sans font-black tracking-wide'
                }`}
              >
                {t.title}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setIsTrashAnimating(true)}
            onMouseLeave={() => setIsTrashAnimating(false)}
            onClick={handleClearTab}
            className={`p-2.5 rounded-xl transition-colors ${
              isDarkMode
                ? 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <TrashIcon animate={isTrashAnimating} />
          </motion.button>
        </div>
      </div>

      {/* Main Tabs - Desktop Only */}
      <div
        className={`hidden lg:flex p-1.5 border-b ${
          isDarkMode ? 'bg-zinc-950/20 border-white/10' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <button
          onClick={() => setMainTab('create')}
          className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${
            mainTab === 'create'
              ? isDarkMode
                ? 'bg-white/5 text-emerald-400 shadow-inner'
                : 'bg-white text-emerald-600 shadow-sm'
              : isDarkMode
              ? 'text-zinc-400 hover:text-zinc-300'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t.create}
        </button>
        <button
          onClick={() => setMainTab('view')}
          className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${
            mainTab === 'view'
              ? isDarkMode
                ? 'bg-white/5 text-emerald-400 shadow-inner'
                : 'bg-white text-emerald-600 shadow-sm'
              : isDarkMode
              ? 'text-zinc-400 hover:text-zinc-300'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t.view}
        </button>
      </div>
    </>
  );
};
