import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, RefreshCw, Flame } from 'lucide-react';
import { Language, E2EMessage, E2EKeyPair } from '../../../types';

interface E2EChatBoardProps {
  viewData: any;
  isDarkMode: boolean;
  language: Language;
  t: Record<string, any>;
  e2eRecipientPubInput: string;
  setE2ERecipientPubInput: (v: string) => void;
  e2eKeyPair: E2EKeyPair | null;
  e2eActiveMessages: E2EMessage[];
  setE2EActiveMessages: (msgs: E2EMessage[]) => void;
  e2eMessageText: string;
  setE2EMessageText: (text: string) => void;
  handleRefreshE2EMessages: (channelId: string) => void;
  handleSendE2EMessage: (channelId: string, pubKey: string) => void;
  triggerShatterExplosion: (colors: string[]) => void;
  setViewData: (data: any) => void;
  setE2EChannelDetails: (details: any) => void;
  onTerminate?: () => void;
}

export const E2EChatBoard: React.FC<E2EChatBoardProps> = ({
  viewData,
  isDarkMode,
  language,
  t,
  e2eRecipientPubInput,
  setE2ERecipientPubInput,
  e2eKeyPair,
  e2eActiveMessages,
  setE2EActiveMessages,
  e2eMessageText,
  setE2EMessageText,
  handleRefreshE2EMessages,
  handleSendE2EMessage,
  triggerShatterExplosion,
  setViewData,
  setE2EChannelDetails,
  onTerminate,
}) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      {/* Chat Header */}
      <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-white border-zinc-200'} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                {t.e2eBoard || 'E2E Board'}
              </h5>
              <p className="text-[9px] font-mono text-zinc-500 mt-0.5 truncate">
                Channel: {viewData.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRefreshE2EMessages(viewData.id)}
            className="w-full sm:w-auto py-2.5 sm:p-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold sm:font-normal"
            title={t.refreshChat || "Refresh Chat"}
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span className="sm:hidden uppercase tracking-widest text-[9px] font-black">{t.refreshChat || 'Refresh Chat'}</span>
          </button>
        </div>

        {/* Peer Public Key Input for chat pairing */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 px-1">
            {t.peerPublicId}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text"
              value={e2eRecipientPubInput}
              onChange={(e) => setE2ERecipientPubInput(e.target.value)}
              placeholder={t.pastePeerPublicIdPlaceholder}
              className={`w-full sm:flex-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-200' : 'bg-white border-zinc-200'} rounded-xl p-3 text-[10px] font-mono outline-none border focus:border-indigo-500/50`}
            />
            {viewData.e2e_public_key && viewData.e2e_public_key !== e2eKeyPair?.publicKey && (
              <button
                type="button"
                onClick={() => setE2ERecipientPubInput(viewData.e2e_public_key)}
                className={`w-full sm:w-auto px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-500/20 transition-all cursor-pointer text-center ${language === 'fa' ? 'font-vazir' : ''}`}
              >
                {t.useChannelId}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} h-[300px] sm:h-[350px] overflow-y-auto space-y-3.5 flex flex-col`}>
        {e2eActiveMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-indigo-500/40 animate-pulse mb-2 shrink-0" />
            <p className={`text-[10px] uppercase font-bold tracking-widest text-zinc-500 ${language === 'fa' ? 'font-vazir text-[11px]' : ''}`}>
              {t.noMessagesYet}
            </p>
            <p className={`text-[9px] text-zinc-600 mt-1 ${language === 'fa' ? 'font-vazir text-[10px]' : ''}`}>
              {t.startConversationBelow}
            </p>
          </div>
        ) : (
          e2eActiveMessages.map((msg, i) => {
            const isSystem = msg.text.startsWith('[Encrypted:') || msg.text.startsWith('[Decryption Failed:') || msg.text.startsWith('[رمزگذاری شده:') || msg.text.startsWith('[خطا در رمزگشایی:');
            return (
              <motion.div 
                key={msg.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`p-3 px-4 rounded-2xl text-xs max-w-[85%] ${
                  isSystem 
                    ? 'bg-zinc-800/15 text-zinc-500 border border-zinc-800/25 self-center text-center font-mono text-[9px] my-1 rounded-xl' 
                    : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 self-start text-left rounded-tl-none'
                } shadow-sm`}
              >
                <p className="leading-relaxed break-words">{msg.text}</p>
                <p className="text-[8px] font-mono text-zinc-500 mt-1.5 text-right select-none">
                  {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                </p>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Chat input box */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="text"
          value={e2eMessageText}
          onChange={(e) => setE2EMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendE2EMessage(viewData.id, e2eRecipientPubInput);
          }}
          placeholder={t.typeEncryptedMessagePlaceholder}
          className={`flex-1 ${isDarkMode ? 'bg-zinc-950/40 border-white/10 text-zinc-200 placeholder:text-zinc-650' : 'bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-400'} border rounded-2xl p-3.5 text-xs outline-none transition-all focus:border-indigo-500/50`}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSendE2EMessage(viewData.id, e2eRecipientPubInput)}
          disabled={!e2eRecipientPubInput}
          className="w-full sm:w-auto py-3.5 px-6 bg-indigo-500 text-white font-black tracking-widest text-[10px] uppercase rounded-2xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/15 disabled:opacity-40 shrink-0 cursor-pointer text-center flex items-center justify-center gap-2"
        >
          {t.send}
        </motion.button>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTerminate) {
            onTerminate();
          } else {
            triggerShatterExplosion(['#6366f1', '#4f46e5', '#818cf8', '#1e1b4b', isDarkMode ? '#ffffff' : '#1e293b']);
            setViewData(null);
            setE2EActiveMessages([]);
            setE2EChannelDetails(null);
            try {
              (window as any).secureClearClipboard?.();
            } catch (_) {}
          }
        }} 
        className={`w-full py-3.5 px-5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isDarkMode 
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-black hover:border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]' 
            : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
        }`}
      >
        <Flame className="w-4 h-4 animate-pulse" />
        <span>{t.terminate}</span>
      </motion.button>
    </motion.div>
  );
};
