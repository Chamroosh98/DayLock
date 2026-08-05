import React from 'react';
import { Eye, EyeOff, Headphones, Mic, Square, Volume2 } from 'lucide-react';
import { Language } from '../../types';
import { getWavCapacity, wavToFloat32 } from '../../utils/audioStego';

export interface CreateAudioSectionProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  audioMode: 'record' | 'stego';
  setAudioMode: (mode: 'record' | 'stego') => void;
  audioText: string;
  setAudioText: (val: string) => void;
  audioBlob: Blob | null;
  setAudioBlob: (val: Blob | null) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  formatTime: (s: number) => string;
  recordingTime: number;
  toggleRecording: () => void;
  audioWavBytes: Uint8Array | null;
  setAudioWavBytes: (val: Uint8Array | null) => void;
  audioWavCapacity: number;
  setAudioWavCapacity: (val: number) => void;
  audioFilename: string;
  setAudioFilename: (val: string) => void;
  audioWaveformSamples: Float32Array | null;
  setAudioWaveformSamples: (val: Float32Array | null) => void;
  showAudioEmbedPwd: boolean;
  setShowAudioEmbedPwd: (val: boolean) => void;
  audioEmbedPassword: string;
  setAudioEmbedPassword: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

export const CreateAudioSection: React.FC<CreateAudioSectionProps> = ({
  isDarkMode,
  language,
  t,
  audioMode,
  setAudioMode,
  audioText,
  setAudioText,
  audioBlob,
  setAudioBlob,
  isRecording,
  setIsRecording,
  formatTime,
  recordingTime,
  toggleRecording,
  audioWavBytes,
  setAudioWavBytes,
  audioWavCapacity,
  setAudioWavCapacity,
  audioFilename,
  setAudioFilename,
  audioWaveformSamples,
  setAudioWaveformSamples,
  showAudioEmbedPwd,
  setShowAudioEmbedPwd,
  audioEmbedPassword,
  setAudioEmbedPassword,
  message,
  setMessage,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  handleTouchStart,
  handleTouchEnd,
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-1.5 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/60 border-white/10' : 'bg-zinc-100 border-zinc-200'} grid grid-cols-2 gap-2`}>
        <button
          type="button"
          onClick={() => setAudioMode('record')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            audioMode === 'record'
              ? 'bg-emerald-500 text-black shadow-md'
              : isDarkMode
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Mic className="w-4 h-4" />
          {t.voiceNote}
        </button>
        <button
          type="button"
          onClick={() => setAudioMode('stego')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            audioMode === 'stego'
              ? 'bg-amber-500 text-black shadow-md'
              : isDarkMode
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Headphones className="w-4 h-4" />
          {t.audioSteganography}
        </button>
      </div>

      {audioMode === 'record' ? (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6 text-center`}>
          <div className="space-y-2">
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.recordVoiceNote}</h3>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.voiceNoteDesc}</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${
                isRecording
                  ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                  : 'bg-emerald-500/20 border-emerald-500 text-emerald-500 hover:scale-105'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="font-mono text-xl font-bold tracking-wider text-emerald-500">
              {formatTime(recordingTime)}
            </span>
          </div>

          {audioBlob && (
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-100 border-zinc-200'} border space-y-3`}>
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-8" />
            </div>
          )}

          <div className="space-y-2 text-right">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.additionalNoteOptional}
            </label>
            <textarea
              value={audioText}
              onChange={(e) => setAudioText(e.target.value)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              placeholder={t.optionalMessageText}
              rows={3}
              className={`w-full p-4 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
              } outline-none text-xs resize-none shadow-inner`}
            />
          </div>
        </div>
      ) : (
        <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.wavAudioStego}</h3>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.embedInWavDesc}</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="audio/wav,audio/x-wav"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAudioFilename(file.name);
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const buf = evt.target?.result as ArrayBuffer;
                    if (buf) {
                      const bytes = new Uint8Array(buf);
                      setAudioWavBytes(bytes);
                      setAudioWavCapacity(getWavCapacity(bytes));
                      const samples = wavToFloat32(bytes);
                      setAudioWaveformSamples(samples);
                    }
                  };
                  reader.readAsArrayBuffer(file);
                }
              }}
              className="hidden"
              id="wav-audio-input"
            />
            <label
              htmlFor="wav-audio-input"
              className={`flex flex-col items-center justify-center p-8 rounded-[24px] border-2 border-dashed ${
                isDarkMode ? 'border-white/10 hover:border-amber-500/40 bg-zinc-900/20' : 'border-zinc-200 hover:border-amber-500/40 bg-zinc-50'
              } cursor-pointer transition-all group`}
            >
              {audioWavBytes ? (
                <div className="space-y-2 text-center">
                  <Volume2 className="w-8 h-8 mx-auto text-amber-500" />
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{audioFilename}</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{t.wavFileLoaded}</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Volume2 className="w-8 h-8 mx-auto text-amber-500 group-hover:scale-110 transition-transform" />
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{t.selectWavFile}</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.wavOnlyFormat}</p>
                </div>
              )}
            </label>
          </div>

          {audioWavBytes && (
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-100 border-zinc-200'} border flex items-center justify-between`}>
              <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.capacity}:</span>
              <span className={`text-xs font-mono font-bold ${message.length <= audioWavCapacity ? 'text-emerald-500' : 'text-red-500'}`}>
                {message.length} / {audioWavCapacity} {t.bytes}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.secretPayloadText}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              placeholder={t.enterHiddenMessage}
              rows={4}
              className={`w-full p-4 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
              } outline-none text-xs resize-none shadow-inner`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.stegoPasswordOptional}
            </label>
            <div className="relative">
              <input
                type={showAudioEmbedPwd ? 'text' : 'password'}
                value={audioEmbedPassword}
                disabled={disabledInputs['audioPwd']}
                onChange={(e) => handlePasswordChange(e.target.value, setAudioEmbedPassword, 'audioPwd')}
                onKeyDown={(e) => handlePasswordKeyDown(e, 'audioPwd')}
                placeholder={t.optionalPassword}
                className={`w-full px-4 py-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                } outline-none text-xs`}
              />
              <button
                type="button"
                onClick={() => setShowAudioEmbedPwd(!showAudioEmbedPwd)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
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
