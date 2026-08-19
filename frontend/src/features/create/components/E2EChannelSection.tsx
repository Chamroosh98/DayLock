import React from 'react';
import { motion } from 'motion/react';
import { Shield, RefreshCw, Key, Zap, Check, Copy } from 'lucide-react';
import { Language } from '../../../types';
import { e2eGenKeypair } from '../../../utils/e2eCrypto';

interface E2EChannelSectionProps {
  e2eKeyPair: { publicKey: string; privateKey: string } | null;
  setE2EKeyPair: React.Dispatch<React.SetStateAction<{ publicKey: string; privateKey: string } | null>>;
  handleCreateE2EChannel: () => void;
  isE2ELoading: boolean;
  e2eChannelDetails: { id: string; expires_at: number } | null;
  isDarkMode: boolean;
  language: Language;
  t: any;
  copyToClipboardWithAutoClear: (text: string, durationMs?: number, onWarn?: (msg: string) => void, lang?: string) => void;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
}

export const E2EChannelSection: React.FC<E2EChannelSectionProps> = ({
  e2eKeyPair,
  setE2EKeyPair,
  handleCreateE2EChannel,
  isE2ELoading,
  e2eChannelDetails,
  isDarkMode,
  language,
  t,
  copyToClipboardWithAutoClear,
  setStatus,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {!e2eKeyPair ? (
        /* Keypair Generation Activation Card */
        <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} text-center space-y-6`}>
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className={`text-base font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
              {t.e2eChannelTitle}
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed max-w-md mx-auto ${language === 'fa' ? 'font-vazir' : ''}`}>
              {t.e2eChannelDesc}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const pair = e2eGenKeypair();
              setE2EKeyPair(pair);
              localStorage.setItem('daylock_e2e_keypair', JSON.stringify(pair));
              setStatus({ type: 'ok', msg: t.e2eKeypairSuccess });
            }}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer ${
              isDarkMode
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
            } ${language === 'fa' ? 'font-vazir text-sm font-bold' : ''}`}
          >
            {t.generateE2EIdentity}
          </motion.button>
        </div>
      ) : (
        /* Keypair Active Card */
        <div className="space-y-6">
          <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-300'} space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} ${language === 'fa' ? 'font-vazir' : ''}`}>
                    {t.yourPublicIdentity}
                  </h5>
                  <p className="text-[9px] font-mono text-emerald-500 font-bold">ACTIVE ECDH-P256 KEY</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.resetE2EConfirm)) {
                    localStorage.removeItem('daylock_e2e_keypair');
                    setE2EKeyPair(null);
                  }
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Revoke Identity"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between gap-3`}>
              <span className="font-mono text-[10px] text-zinc-400 truncate flex-1">{e2eKeyPair.publicKey}</span>
              <button
                type="button"
                onClick={() => {
                  copyToClipboardWithAutoClear(e2eKeyPair.publicKey, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
                  setStatus({ type: 'ok', msg: t.publicKeyCopied });
                }}
                className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Create Channel Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateE2EChannel}
            disabled={isE2ELoading}
            className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400'
                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
            } ${isE2ELoading ? 'opacity-50 cursor-not-allowed' : ''} ${language === 'fa' ? 'font-vazir text-sm font-bold' : ''}`}
          >
            <Zap className="w-4 h-4" />
            <span>{isE2ELoading ? t.spawningChannel : t.spawnE2EChannel}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};
