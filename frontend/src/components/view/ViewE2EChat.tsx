import React from 'react';
import { MessageSquare, RefreshCw, Send, Shield, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import { e2eDecrypt, e2eEncrypt } from '../../utils/e2eCrypto';

export interface ViewE2EChatProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  e2eKeyPair: any;
  setE2EKeyPair: (val: any) => void;
  e2eRecipientPubInput: string;
  setE2ERecipientPubInput: (val: string) => void;
  e2eMessageText: string;
  setE2EMessageText: (val: string) => void;
  e2eActiveMessages: any[];
  setE2EActiveMessages: (msgs: any[]) => void;
  viewData: any;
  handleRefreshE2EMessages: (id: string) => void;
  handleSendE2EMessage: (channelId: string, recipientPubKey: string) => void;
  isLoading: boolean;
}

export const ViewE2EChat: React.FC<ViewE2EChatProps> = ({
  isDarkMode,
  language,
  t,
  e2eKeyPair,
  setE2EKeyPair,
  e2eRecipientPubInput,
  setE2ERecipientPubInput,
  e2eMessageText,
  setE2EMessageText,
  e2eActiveMessages,
  viewData,
  handleRefreshE2EMessages,
  handleSendE2EMessage,
  isLoading,
}) => {
  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.e2eRoomActive}</h3>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.channelId}: {viewData.id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleRefreshE2EMessages(viewData.id)}
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-zinc-100 transition-colors"
          title={t.refreshMessages}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {t.recipientPublicKey}
          </label>
          <input
            type="text"
            value={e2eRecipientPubInput}
            onChange={(e) => setE2ERecipientPubInput(e.target.value)}
            placeholder={t.enterPeerPubKey}
            className={`w-full px-4 py-3 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            } outline-none text-xs font-mono`}
          />
        </div>

        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-950/80 border-white/10' : 'bg-zinc-100 border-zinc-200'} border h-64 overflow-y-auto space-y-3 custom-scrollbar`}>
          {e2eActiveMessages.length === 0 ? (
            <p className={`text-center text-xs py-20 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.noMessagesYet}</p>
          ) : (
            e2eActiveMessages.map((msg, idx) => {
              const text = msg.text || msg.content || msg.encryptedPayload || '';
              const isMine = msg.senderPubKey === e2eKeyPair?.publicKey || msg.isMine;
              return (
                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                    isMine ? 'bg-indigo-500 text-white rounded-br-none' : isDarkMode ? 'bg-zinc-900 text-zinc-200 rounded-bl-none' : 'bg-white text-zinc-800 rounded-bl-none'
                  }`}>
                    {text}
                  </div>
                  <span className={`text-[9px] font-mono mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={e2eMessageText}
            onChange={(e) => setE2EMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendE2EMessage(viewData.id, e2eRecipientPubInput);
              }
            }}
            placeholder={t.typeEncryptedMessage}
            className={`w-full px-4 py-3 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            } outline-none text-xs`}
          />
          <button
            type="button"
            onClick={() => handleSendE2EMessage(viewData.id, e2eRecipientPubInput)}
            disabled={!e2eMessageText.trim() || !e2eRecipientPubInput.trim()}
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
