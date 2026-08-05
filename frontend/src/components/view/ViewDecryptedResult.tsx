import React from 'react';
import { Copy, Download, Flame, Headphones, Share2, Sparkles, Volume2 } from 'lucide-react';
import { MetaItem } from '../MetaItem';
import { DecryptedPayloadShield } from '../DecryptedPayloadShield';
import { BurnFuseCountdown } from '../BurnFuseCountdown';
import { Language } from '../../types';
import { getAutoDir, getAutoContainerClass } from '../../utils/textDirection';

export interface ViewDecryptedResultProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  decryptedContent: any;
  viewData: any;
  isHoneyView: boolean;
  isSelfDestructed: boolean;
  triggerShatterExplosion: (colors?: string[]) => void;
  copyToClipboardWithAutoClear: (content: string, delay: number, onWarn: (msg: string) => void, lang: any) => void;
  formatExpirationDate: (dateStr: string, lang: Language) => string;
  setSharePendingContent: (val: string) => void;
  setShowShareConfirm: (val: boolean) => void;
  setStatus: (status: any) => void;
}

export const ViewDecryptedResult: React.FC<ViewDecryptedResultProps> = ({
  isDarkMode,
  language,
  t,
  decryptedContent,
  viewData,
  isHoneyView,
  isSelfDestructed,
  triggerShatterExplosion,
  copyToClipboardWithAutoClear,
  formatExpirationDate,
  setSharePendingContent,
  setShowShareConfirm,
  setStatus,
}) => {
  if (!decryptedContent) return null;

  const isText = typeof decryptedContent === 'string';
  const isFile = typeof decryptedContent === 'object' && decryptedContent?.fileData;
  const isAudio = typeof decryptedContent === 'object' && decryptedContent?.audioData;

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${
      isHoneyView
        ? 'bg-amber-950/20 border-amber-500/30'
        : isDarkMode
        ? 'bg-emerald-950/20 border-emerald-500/30'
        : 'bg-emerald-50 border-emerald-200'
    } space-y-6 shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
            isHoneyView ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isHoneyView ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isHoneyView ? t.decoyPayloadUnlocked : t.decryptedSuccessfully}
            </h3>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t.payloadSafelyDecrypted}
            </p>
          </div>
        </div>

        {isText && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSharePendingContent(decryptedContent);
                setShowShareConfirm(true);
              }}
              className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors"
              title={t.share}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                copyToClipboardWithAutoClear(
                  decryptedContent,
                  10000,
                  (msg) => setStatus({ type: 'warning', text: msg }),
                  language
                );
              }}
              className="p-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors font-bold"
              title={t.copySecret}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {(viewData?.burnAfterRead || viewData?.burn_after_read) && (
        <BurnFuseCountdown
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          durationSeconds={60}
          onExpire={() => {
            triggerShatterExplosion(['#ef4444', '#dc2626', '#f87171', '#7f1d1d']);
          }}
        />
      )}

      <DecryptedPayloadShield isDarkMode={isDarkMode} language={language} t={t}>
        {isText && (
          <div
            dir={getAutoDir(decryptedContent, language)}
            className={`p-6 rounded-2xl ${
              isDarkMode ? 'bg-zinc-950/80 text-zinc-100 border-white/10' : 'bg-white text-zinc-900 border-zinc-200'
            } border font-mono text-xs leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto ${getAutoContainerClass(decryptedContent, language)}`}
          >
            {decryptedContent}
          </div>
        )}

        {isFile && (
          <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-zinc-200'} border text-center space-y-4`}>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {decryptedContent.fileName}
            </p>
            <a
              href={decryptedContent.fileData}
              download={decryptedContent.fileName}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              {t.downloadFile}
            </a>
          </div>
        )}

        {isAudio && (
          <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-zinc-200'} border space-y-4`}>
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-500" />
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.voiceNote}</p>
            </div>
            <audio src={decryptedContent.audioData} controls className="w-full h-8" />
            {decryptedContent.audioText && (
              <p className={`text-xs p-3 rounded-xl ${isDarkMode ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-50 text-zinc-700'}`}>
                {decryptedContent.audioText}
              </p>
            )}
          </div>
        )}
      </DecryptedPayloadShield>

      {viewData && (
        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-white border-zinc-200'} border grid grid-cols-2 sm:grid-cols-3 gap-3`}>
          <MetaItem
            isDarkMode={isDarkMode}
            label={t.expiresAt}
            value={formatExpirationDate(viewData.expiresAt, language)}
          />
          <MetaItem
            isDarkMode={isDarkMode}
            label={t.viewsRemaining}
            value={viewData.remainingViews ?? t.unlimited}
          />
          <MetaItem
            isDarkMode={isDarkMode}
            label={t.burnAfterRead}
            value={viewData.burnAfterRead ? t.yes : t.no}
          />
        </div>
      )}
    </div>
  );
};
