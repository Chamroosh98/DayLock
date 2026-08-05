import React from 'react';
import { Copy, Key, MessageSquare, RefreshCw, Sparkles, Shield } from 'lucide-react';
import { Language } from '../../types';
import { e2eGenKeypair } from '../../utils/e2eCrypto';

export interface CreateE2ESectionProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  e2eKeyPair: any;
  setE2EKeyPair: (val: any) => void;
  e2eChannelDetails: any;
  handleCreateE2EChannel: () => void;
  isE2ELoading: boolean;
  copyToClipboardWithAutoClear: (content: string, delay: number, onWarn: (msg: string) => void, lang: any) => void;
  setStatus: (status: any) => void;
}

export const CreateE2ESection: React.FC<CreateE2ESectionProps> = ({
  isDarkMode,
  language,
  t,
  e2eKeyPair,
  setE2EKeyPair,
  e2eChannelDetails,
  handleCreateE2EChannel,
  isE2ELoading,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.e2eEncryptedChat}</h3>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.e2eDesc}</p>
          </div>
        </div>

        {!e2eKeyPair ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.generateKeysFirst}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.ephemeralKeypairDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const kp = e2eGenKeypair();
                setE2EKeyPair(kp);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              {t.generateE2EKeys}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-100 border-zinc-200'} border space-y-3`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {t.yourPublicKey}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const kp = e2eGenKeypair();
                    setE2EKeyPair(kp);
                  }}
                  className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t.regenerate}
                </button>
              </div>
              <p className="font-mono text-[10px] break-all p-3 rounded-xl bg-zinc-950/40 text-indigo-300 border border-white/5">
                {e2eKeyPair.publicKey}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateE2EChannel}
              disabled={isE2ELoading}
              className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isE2ELoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {t.createE2ERoom}
            </button>

            {e2eChannelDetails && (
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} border space-y-3`}>
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t.e2eRoomCreated}
                </p>
                <div className="space-y-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {t.channelId}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={e2eChannelDetails.id}
                      className={`w-full p-2.5 rounded-xl font-mono text-xs ${
                        isDarkMode ? 'bg-zinc-950 text-emerald-400' : 'bg-white text-emerald-700'
                      } border border-emerald-500/20 outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        copyToClipboardWithAutoClear(
                          e2eChannelDetails.id,
                          10000,
                          (msg) => setStatus({ type: 'warning', text: msg }),
                          language
                        );
                      }}
                      className="p-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
