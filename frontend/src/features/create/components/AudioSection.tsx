import React from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Volume2, Eye, EyeOff, Headphones, FileText, Lock } from 'lucide-react';
import { Language } from '../../../types';
import { Dropzone } from '../../../components/Dropzone';
import { getAutoDir, getAutoContainerClass } from '../utils';

interface AudioSectionProps {
  audioMode: 'record' | 'stego';
  setAudioMode: (mode: 'record' | 'stego') => void;
  isRecording: boolean;
  toggleRecording: () => void;
  recordingTime: number;
  formatTime: (sec: number) => string;
  audioBlob: Blob | null;
  audioFilename: string;
  setAudioFilename: (fn: string) => void;
  audioWavBytes: Uint8Array | null;
  setAudioWavBytes: (bytes: Uint8Array | null) => void;
  audioWavCapacity: number;
  setAudioWavCapacity: (cap: number) => void;
  audioWaveformSamples: Float32Array | null;
  setAudioWaveformSamples: (samples: Float32Array | null) => void;
  audioText: string;
  setAudioText: (text: string) => void;
  audioEmbedPassword: string;
  setAudioEmbedPassword: (pwd: string) => void;
  showAudioEmbedPwd: boolean;
  setShowAudioEmbedPwd: (show: boolean) => void;
  isDarkMode: boolean;
  language: Language;
  t: any;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setValue: (v: string) => void, inputId: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, inputId: string) => void;
}

export const AudioSection: React.FC<AudioSectionProps> = ({
  audioMode,
  setAudioMode,
  isRecording,
  toggleRecording,
  recordingTime,
  formatTime,
  audioBlob,
  audioFilename,
  setAudioFilename,
  audioWavBytes,
  setAudioWavBytes,
  audioWavCapacity,
  setAudioWavCapacity,
  audioWaveformSamples,
  setAudioWaveformSamples,
  audioText,
  setAudioText,
  audioEmbedPassword,
  setAudioEmbedPassword,
  showAudioEmbedPwd,
  setShowAudioEmbedPwd,
  isDarkMode,
  language,
  t,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Audio Sub-Mode Switcher Tabs */}
      <div className={`p-1 rounded-2xl border flex gap-1 ${isDarkMode ? 'bg-zinc-950/60 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
        <button
          type="button"
          onClick={() => setAudioMode('record')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            audioMode === 'record'
              ? isDarkMode
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{t.liveVoiceRecord}</span>
        </button>
        <button
          type="button"
          onClick={() => setAudioMode('stego')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            audioMode === 'stego'
              ? isDarkMode
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>{t.wavAudioStego}</span>
        </button>
      </div>

      {audioMode === 'record' ? (
        /* Voice Recorder View */
        <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} flex flex-col items-center justify-center gap-6 text-center`}>
          <div className="relative">
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-red-500/20"
              />
            )}
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : isDarkMode
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl font-black font-mono tracking-wider ${isRecording ? 'text-red-500 animate-pulse' : isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {formatTime(recordingTime)}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} ${language === 'fa' ? 'font-vazir' : ''}`}>
              {isRecording ? t.recording : audioBlob ? t.audioRecorded : t.clickToRecord}
            </p>
          </div>

          {audioBlob && !isRecording && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 mt-2">
              <audio src={URL.createObjectURL(audioBlob)} controls className="h-10 rounded-xl" />
            </motion.div>
          )}
        </div>
      ) : (
        /* WAV Audio Steganography Embedder */
        <div className="space-y-5 animate-fade-in">
          {/* WAV Cover Dropzone */}
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
              {t.selectWavCoverStep}
            </label>
            {!audioWavBytes ? (
              <Dropzone
                onSelect={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAudioFilename(file.name);
                    const buf = await file.arrayBuffer();
                    const bytes = new Uint8Array(buf);
                    setAudioWavBytes(bytes);
                    const cap = (await import('../../../utils/audioStego')).getWavCapacity(bytes);
                    setAudioWavCapacity(cap);
                    const floatSamples = (await import('../../../utils/audioStego')).wavToFloat32(bytes);
                    setAudioWaveformSamples(floatSamples);
                  }
                }}
                selectedFile={null}
                icon={<Headphones className="w-10 h-10" />}
                accept="audio/wav,audio/x-wav"
                isDarkMode={isDarkMode}
                label={t.uploadWavUncompressed}
                language={language}
              />
            ) : (
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/40 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-300'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{audioFilename}</h5>
                      <p className="text-[9px] font-mono text-zinc-500">{(audioWavBytes.length / 1024).toFixed(1)} KB • Capacity: {audioWavCapacity} chars</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioWavBytes(null);
                      setAudioFilename('');
                      setAudioWavCapacity(0);
                      setAudioWaveformSamples(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    {t.deleteItem || 'Remove'}
                  </button>
                </div>

                {/* Animated PCM Waveform Visualization Canvas */}
                {audioWaveformSamples && (
                  <div className="h-12 w-full bg-black/40 rounded-xl overflow-hidden p-1 flex items-center justify-center gap-0.5 border border-white/5">
                    {Array.from({ length: 48 }).map((_, idx) => {
                      const sampleIdx = Math.floor((idx / 48) * audioWaveformSamples.length);
                      const amp = Math.abs(audioWaveformSamples[sampleIdx] || 0);
                      const heightPercent = Math.max(10, Math.min(100, amp * 100 * 2));
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-emerald-500/70 rounded-full transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stego Secret Payload Field */}
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
              {t.secretEmbedStep}
            </label>
            <textarea
              value={audioText}
              onChange={(e) => setAudioText(e.target.value)}
              placeholder={t.secretEmbedPlaceholder}
              dir={getAutoDir(audioText, language)}
              className={`w-full h-28 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-500'} border rounded-2xl p-4 focus:outline-none text-xs leading-relaxed resize-none transition-smooth ${getAutoContainerClass(audioText, language)}`}
            />
            {audioWavCapacity > 0 && (
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-400 px-1">
                <span>Usage</span>
                <span>{audioText.length} / {audioWavCapacity} chars</span>
              </div>
            )}
          </div>

          {/* Audio Stego Embedding Key/Password */}
          <div className="space-y-2">
            <label className={`text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 ${language === 'fa' ? 'font-vazir text-right block' : ''}`}>
              {t.audioStegoPasswordStep}
            </label>
            <div className="relative">
              <input
                id="audio-embed-password-input"
                type={showAudioEmbedPwd ? 'text' : 'password'}
                value={audioEmbedPassword}
                onChange={(e) => handlePasswordChange(e.target.value, setAudioEmbedPassword, 'audio-embed-password-input')}
                onKeyDown={(e) => handlePasswordKeyDown(e, 'audio-embed-password-input')}
                disabled={disabledInputs['audio-embed-password-input']}
                dir="ltr"
                placeholder={t.audioStegoPasswordPlaceholder}
                className={`w-full ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'} border rounded-2xl p-3.5 pr-10 pl-4 text-xs outline-none focus:border-emerald-500/50 transition-all text-left placeholder:text-left`}
              />
              <button
                type="button"
                onClick={() => setShowAudioEmbedPwd(!showAudioEmbedPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                {showAudioEmbedPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
