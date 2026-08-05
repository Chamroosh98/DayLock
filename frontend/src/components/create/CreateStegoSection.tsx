import React from 'react';
import { Eye, EyeOff, ImageIcon, Lock } from 'lucide-react';
import { Language } from '../../types';

export interface CreateStegoSectionProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  stegoImage: string | null;
  stegoCapacity: number;
  stegoCanvasRef: React.RefObject<HTMLCanvasElement>;
  handleStegoImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  message: string;
  setMessage: (val: string) => void;
  stegoPassword: string;
  setStegoPassword: (val: string) => void;
  showStegoPwd: boolean;
  setShowStegoPwd: (val: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

export const CreateStegoSection: React.FC<CreateStegoSectionProps> = ({
  isDarkMode,
  language,
  t,
  stegoImage,
  stegoCapacity,
  stegoCanvasRef,
  handleStegoImageSelect,
  message,
  setMessage,
  stegoPassword,
  setStegoPassword,
  showStegoPwd,
  setShowStegoPwd,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  handleTouchStart,
  handleTouchEnd,
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.stegoImageUpload}</h3>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.stegoDesc}</p>
          </div>
        </div>

        <canvas ref={stegoCanvasRef} className="hidden" />

        <div className="relative">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleStegoImageSelect}
            className="hidden"
            id="stego-image-input"
          />
          <label
            htmlFor="stego-image-input"
            className={`flex flex-col items-center justify-center p-8 rounded-[24px] border-2 border-dashed ${
              isDarkMode ? 'border-white/10 hover:border-amber-500/40 bg-zinc-900/20' : 'border-zinc-200 hover:border-amber-500/40 bg-zinc-50'
            } cursor-pointer transition-all group`}
          >
            {stegoImage ? (
              <div className="space-y-3 text-center">
                <img src={stegoImage} alt="Stego Cover" className="max-h-48 rounded-xl mx-auto shadow-md border border-white/10" />
                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{t.stegoImageSelected}</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-amber-500 group-hover:scale-110 transition-transform" />
                <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{t.selectCoverImage}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.pngRecommended}</p>
              </div>
            )}
          </label>
        </div>

        {stegoImage && (
          <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-100 border-zinc-200'} border flex items-center justify-between`}>
            <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.capacity}:</span>
            <span className={`text-xs font-mono font-bold ${message.length <= stegoCapacity ? 'text-emerald-500' : 'text-red-500'}`}>
              {message.length} / {stegoCapacity} {t.bytes}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {t.hiddenMessage}
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
              type={showStegoPwd ? 'text' : 'password'}
              value={stegoPassword}
              disabled={disabledInputs['stegoPwd']}
              onChange={(e) => handlePasswordChange(e.target.value, setStegoPassword, 'stegoPwd')}
              onKeyDown={(e) => handlePasswordKeyDown(e, 'stegoPwd')}
              placeholder={t.optionalPassword}
              className={`w-full px-4 py-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
              } outline-none text-xs`}
            />
            <button
              type="button"
              onClick={() => setShowStegoPwd(!showStegoPwd)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showStegoPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
