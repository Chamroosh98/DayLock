import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, RefreshCw, Key, Zap, Check, Copy, QrCode } from 'lucide-react';
import { Language, E2EMessage } from '../../../types';
import { e2eGenKeypair } from '../../../utils/e2eCrypto';
import { LinkQrCodeModal } from '../../../components/modals/LinkQrCodeModal';
import { E2EChatBoard } from '../../view/components/E2EChatBoard';

interface E2EChannelSectionProps {
  e2eKeyPair: { publicKey: string; privateKey: string } | null;
  setE2EKeyPair: React.Dispatch<React.SetStateAction<{ publicKey: string; privateKey: string } | null>>;
  handleCreateE2EChannel: () => void;
  isE2ELoading: boolean;
  e2eChannelDetails: { id: string; expires_at: number; e2e_public_key?: string } | null;
  isDarkMode: boolean;
  language: Language;
  t: any;
  copyToClipboardWithAutoClear: (text: string, durationMs?: number, onWarn?: (msg: string) => void, lang?: string) => void;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
  e2eRecipientPubInput?: string;
  setE2ERecipientPubInput?: (v: string) => void;
  e2eMessageText?: string;
  setE2EMessageText?: (text: string) => void;
  e2eActiveMessages?: E2EMessage[];
  setE2EActiveMessages?: (msgs: E2EMessage[]) => void;
  handleRefreshE2EMessages?: (channelId: string) => void;
  handleSendE2EMessage?: (channelId: string, pubKey: string) => void;
  resetE2E?: () => void;
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
  e2eRecipientPubInput = '',
  setE2ERecipientPubInput = () => {},
  e2eMessageText = '',
  setE2EMessageText = () => {},
  e2eActiveMessages = [],
  setE2EActiveMessages = () => {},
  handleRefreshE2EMessages = () => {},
  handleSendE2EMessage = () => {},
  resetE2E = () => {},
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopyKey = () => {
    if (!e2eKeyPair?.publicKey) return;
    copyToClipboardWithAutoClear(e2eKeyPair.publicKey, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    setStatus({ type: 'ok', msg: t.publicKeyCopied || 'Public Key copied to clipboard!' });
  };

  // If channel is already spawned, display the active chat board directly
  if (e2eChannelDetails) {
    return (
      <div className="space-y-6 animate-fade-in">
        <E2EChatBoard
          viewData={{
            id: e2eChannelDetails.id,
            expires_at: e2eChannelDetails.expires_at,
            is_e2e_channel: true,
            e2e_public_key: e2eKeyPair?.publicKey
          }}
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          e2eRecipientPubInput={e2eRecipientPubInput}
          setE2ERecipientPubInput={setE2ERecipientPubInput}
          e2eKeyPair={e2eKeyPair}
          e2eActiveMessages={e2eActiveMessages}
          setE2EActiveMessages={setE2EActiveMessages}
          e2eMessageText={e2eMessageText}
          setE2EMessageText={setE2EMessageText}
          handleRefreshE2EMessages={handleRefreshE2EMessages}
          handleSendE2EMessage={handleSendE2EMessage}
          onTerminate={resetE2E}
          copyToClipboardWithAutoClear={copyToClipboardWithAutoClear}
          setStatus={setStatus}
        />
      </div>
    );
  }

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
            onClick={async () => {
              const pair = await e2eGenKeypair();
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
            <div className={`flex items-center justify-between ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${language === 'fa' ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
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

            {/* Clickable Public Key Box with inline Copy and QR Code Actions */}
            <div
              onClick={handleCopyKey}
              className={`group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-950/80 border-white/10 hover:border-emerald-500/40 shadow-inner' 
                  : 'bg-white border-zinc-200 hover:border-emerald-400 shadow-sm'
              }`}
              title="Click to copy public key"
            >
              <div className={`flex items-center justify-between gap-2.5 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
                <span 
                  dir="ltr"
                  className="font-mono text-[10px] sm:text-[11px] text-emerald-400 break-all select-all font-medium tracking-tight leading-relaxed flex-1"
                >
                  {e2eKeyPair.publicKey}
                </span>
                <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
                  {/* Copy Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyKey();
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      copiedKey
                        ? 'bg-emerald-500 text-black shadow-md'
                        : isDarkMode
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={copiedKey ? (t.copied || 'Copied') : (t.copyPublicKey || t.copy || 'Copy')}
                    aria-label={t.copyPublicKey || t.copy || 'Copy'}
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* QR Code Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQrModal(true);
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${
                      isDarkMode
                        ? 'bg-zinc-900 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/30'
                        : 'bg-zinc-100 text-zinc-700 hover:text-emerald-700 hover:bg-emerald-50 border-zinc-200 hover:border-emerald-300'
                    }`}
                    title={t.qrCode || 'QR Code'}
                    aria-label={t.qrCode || 'QR Code'}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Create Channel Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateE2EChannel}
            disabled={isE2ELoading}
            dir={language === 'fa' ? 'rtl' : 'ltr'}
            className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
              language === 'fa' ? 'flex-row-reverse' : ''
            } ${
              isDarkMode
                ? 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400'
                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
            } ${isE2ELoading ? 'opacity-50 cursor-not-allowed' : ''} ${language === 'fa' ? 'font-vazir text-sm font-bold' : ''}`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>{isE2ELoading ? t.spawningChannel : t.spawnE2EChannel}</span>
          </motion.button>

          {/* Public Key QR Code Modal */}
          {e2eKeyPair?.publicKey && (
            <LinkQrCodeModal
              isOpen={showQrModal}
              onClose={() => setShowQrModal(false)}
              url={e2eKeyPair.publicKey}
              isDarkMode={isDarkMode}
              language={language}
              t={t}
              setStatus={setStatus}
            />
          )}
        </div>
      )}
    </div>
  );
};
