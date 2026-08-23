import React from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Sparkles, File, Download, Headphones, Mic, Flame, CheckCircle2 } from 'lucide-react';
import { DecryptedPayloadShield } from '../../../components/DecryptedPayloadShield';
import { QrCodeHub } from '../../../components/QrCodeHub';
import { SecurityStatusBadge } from './SecurityStatusBadge';
import { getAutoDir, getAutoContainerClass, localizeDigitsValue } from '../utils';
import { Language } from '../../../types';

export interface DecryptedPayloadRendererProps {
  viewData: any;
  decryptedContent: any;
  isHoneyView: boolean;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  setStatus: (status: any) => void;
  setSharePendingContent: (content: string) => void;
  setShowShareConfirm: (show: boolean) => void;
  copyToClipboardWithAutoClear: (
    text: string,
    timeoutMs: number,
    onWarning: (msg: string) => void,
    lang?: string
  ) => Promise<boolean>;
  triggerShatterExplosion: (colors: string[]) => void;
  setViewData: (data: any) => void;
  setDecryptedContent: (content: any) => void;
  setViewInput: (val: string) => void;
  setIsHoneyView: (val: boolean) => void;
  setViewPassword: (val: string) => void;
  onTerminate?: () => void;
}

export const DecryptedPayloadRenderer: React.FC<DecryptedPayloadRendererProps> = ({
  viewData,
  decryptedContent,
  isHoneyView,
  isDarkMode,
  language,
  t,
  setStatus,
  setSharePendingContent,
  setShowShareConfirm,
  copyToClipboardWithAutoClear,
  triggerShatterExplosion,
  setViewData,
  setDecryptedContent,
  setViewInput,
  setIsHoneyView,
  setViewPassword,
  onTerminate,
}) => {
  const isFa = language === 'fa';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Security Status Badge & Metadata */}
      <SecurityStatusBadge
        viewData={viewData}
        isDarkMode={isDarkMode}
        language={language}
        t={t}
        isHoneyView={isHoneyView}
      />

      {/* Main Text Content Payload Rendering */}
      {typeof decryptedContent === 'string' ? (
        <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
          <div className="space-y-4">
            <div
              className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-zinc-950/60 border-white/10 shadow-2xl shadow-black/40' 
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              {/* Header / Action Bar */}
              <div
                dir={isFa ? 'rtl' : 'ltr'}
                className={`flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 border-b ${
                  isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className={`text-[10px] sm:text-[11px] font-bold text-emerald-500 ${isFa ? 'font-vazir' : 'uppercase tracking-wider font-sans'}`}>
                    {t.decryptedMessage || t.stegoHiddenMessage || 'Decrypted Payload'}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setSharePendingContent(decryptedContent);
                      setShowShareConfirm(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={t.share}
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await copyToClipboardWithAutoClear(
                          decryptedContent,
                          30000,
                          (msg) => setStatus({ type: 'warn', msg }),
                          isFa ? 'fa' : 'en'
                        );
                        setStatus({ type: 'ok', msg: t.contentCopied });
                      } catch (err) {
                        console.error('Failed to copy', err);
                      }
                    }}
                    className="p-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={t.copy}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Reading Content Area */}
              <div
                dir={getAutoDir(decryptedContent)}
                className={`p-4 sm:p-6 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words select-text ${
                  isDarkMode ? 'text-zinc-100' : 'text-zinc-800'
                } ${getAutoContainerClass(decryptedContent)}`}
              >
                {decryptedContent}
              </div>
            </div>

            {/* QR Code and Mobile Sharing Hub inside the shield */}
            {!isHoneyView && (
              <QrCodeHub
                decryptedContent={decryptedContent}
                isDarkMode={isDarkMode}
                t={t}
                setStatus={setStatus}
                language={language}
              />
            )}
          </div>
        </DecryptedPayloadShield>
      ) : decryptedContent.kind === 'stego' ? null : (
        <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
          <div className="space-y-4">
            <div
              className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-white/10' : 'bg-white border-zinc-200'
              } flex flex-col items-center justify-center gap-5 shadow-2xl`}
            >
              {decryptedContent.kind === 'image' || decryptedContent.type?.startsWith('image/') ? (
                <div className="relative group">
                  <img src={decryptedContent.url} className="max-h-72 rounded-2xl shadow-2xl border border-white/10" alt="Decrypted Payload" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <File className="w-8 h-8 text-emerald-500" />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm sm:text-base font-bold tracking-tight">{decryptedContent.name}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono mt-1 tracking-widest`}>
                  {decryptedContent.type} • {localizeDigitsValue((viewData.size / 1024 / 1024).toFixed(2), language)} {t.mbUnit}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = decryptedContent.url;
                  a.download = decryptedContent.name;
                  a.click();
                }}
                className="px-8 py-3 bg-emerald-500 text-black rounded-xl font-bold tracking-wide text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> {t.downloadAsset}
              </motion.button>
            </div>

            {!isHoneyView && (
              <QrCodeHub
                decryptedContent={decryptedContent}
                isDarkMode={isDarkMode}
                t={t}
                setStatus={setStatus}
                language={language}
              />
            )}
          </div>
        </DecryptedPayloadShield>
      )}

      {/* Steganography Extra Text Output */}
      {decryptedContent.kind === 'stego' && decryptedContent.stegoText && (
        <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-zinc-950/60 border-white/10 shadow-2xl shadow-black/40' 
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              {/* Header Bar */}
              <div
                dir={isFa ? 'rtl' : 'ltr'}
                className={`flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 border-b ${
                  isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className={`text-[10px] sm:text-[11px] font-bold text-emerald-500 ${isFa ? 'font-vazir' : 'uppercase tracking-wider font-sans'}`}>
                    {t.stegoHiddenMessage || 'Extracted Message'}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    await copyToClipboardWithAutoClear(
                      decryptedContent.stegoText, 
                      30000, 
                      (msg) => setStatus({ type: 'warn', msg }), 
                      language
                    );
                    setStatus({ type: 'ok', msg: t.contentCopied || t.linkCopied });
                  }}
                  className="p-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title={t.copy}
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              {/* Content Area */}
              <div
                dir={getAutoDir(decryptedContent.stegoText)}
                className={`p-4 sm:p-6 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words select-text ${
                  isDarkMode ? 'text-zinc-100' : 'text-zinc-800'
                } ${isFa ? 'font-vazir text-right' : 'font-sans text-left'}`}
              >
                {decryptedContent.stegoText}
              </div>
            </motion.div>

            {/* QR Code and Mobile Sharing Hub inside shield */}
            {!isHoneyView && (
              <QrCodeHub
                decryptedContent={decryptedContent.stegoText}
                isDarkMode={isDarkMode}
                t={t}
                setStatus={setStatus}
                language={language}
              />
            )}
          </div>
        </DecryptedPayloadShield>
      )}

      {/* Audio / WAV Stego Audio Player */}
      {decryptedContent.kind === 'audio' && (
        <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-emerald-500/20' : 'bg-white border-emerald-200'
              } space-y-4 shadow-xl`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                    {t.decryptedWavAudio}
                  </h5>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    {decryptedContent.name || 'stego.wav'}
                  </p>
                </div>
              </div>
              <audio controls className="w-full mt-2" src={decryptedContent.url || `data:audio/wav;base64,${decryptedContent.base64}`} />
            </motion.div>

            {!isHoneyView && (
              <QrCodeHub
                decryptedContent={decryptedContent}
                isDarkMode={isDarkMode}
                t={t}
                setStatus={setStatus}
                language={language}
              />
            )}
          </div>
        </DecryptedPayloadShield>
      )}

      {/* Voice Message Player */}
      {decryptedContent.kind === 'voice' && (
        <DecryptedPayloadShield isDarkMode={isDarkMode} language={language}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${
                isDarkMode ? 'bg-zinc-950/60 border-emerald-500/20' : 'bg-white border-emerald-200'
              } space-y-4 shadow-xl`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                    {t.decryptedVoiceMsg}
                  </h5>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    {decryptedContent.name || 'voice.webm'}
                  </p>
                </div>
              </div>
              <audio controls className="w-full mt-2" src={decryptedContent.url || `data:audio/webm;base64,${decryptedContent.base64}`} />
            </motion.div>

            {!isHoneyView && (
              <QrCodeHub
                decryptedContent={decryptedContent}
                isDarkMode={isDarkMode}
                t={t}
                setStatus={setStatus}
                language={language}
              />
            )}
          </div>
        </DecryptedPayloadShield>
      )}

      {/* Terminate Session Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          if (onTerminate) {
            onTerminate();
          } else {
            triggerShatterExplosion(['#10b981', '#059669', '#34d399', '#022c22', isDarkMode ? '#ffffff' : '#1e293b']);
            setViewData(null);
            setDecryptedContent(null);
            setViewInput('');
            setStatus(null);
            setIsHoneyView(false);
            setViewPassword('');
            try {
              (window as any).secureClearClipboard?.();
            } catch (_) {}
          }
        }}
        className={`w-full py-3 px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
          language === 'fa' ? 'font-vazir' : 'font-sans uppercase tracking-wider'
        } ${
          isDarkMode
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 hover:border-rose-400/50 shadow-sm'
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 shadow-sm'
        }`}
      >
        <Flame className="w-4 h-4 text-rose-400" />
        <span>{t.terminate}</span>
      </motion.button>
    </motion.div>
  );
};
