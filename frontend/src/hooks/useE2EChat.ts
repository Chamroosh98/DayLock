import { useState } from 'react';
import { Language, StatusState } from '../types';
import { e2eGenerateKeyPair, e2eEncrypt, e2eDecrypt } from '../utils/e2eCrypto';
import { copyToClipboardWithAutoClear } from '../utils/clipboardManager';

interface UseE2EChatProps {
  language: Language;
  setStatus: (status: StatusState | null) => void;
  setResultUrl: (url: string | null) => void;
  expiresIn: number;
  hasAsnLock: boolean;
  asnMode: 'block' | 'allow';
  asnSelected: string;
}

export function useE2EChat({
  language,
  setStatus,
  setResultUrl,
  expiresIn,
  hasAsnLock,
  asnMode,
  asnSelected,
}: UseE2EChatProps) {
  const [e2eKeyPair, setE2EKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(() => {
    const saved = localStorage.getItem('daylock_e2e_keypair');
    return saved ? JSON.parse(saved) : null;
  });
  const [e2eChannelDetails, setE2EChannelDetails] = useState<{ id: string; expires_at: number } | null>(null);
  const [e2eRecipientPubInput, setE2ERecipientPubInput] = useState('');
  const [e2eMessageText, setE2EMessageText] = useState('');
  const [e2eActiveMessages, setE2EActiveMessages] = useState<any[]>([]);
  const [isE2ELoading, setIsE2ELoading] = useState(false);

  const handleGenerateE2EKeyPair = async () => {
    try {
      const kp = await e2eGenerateKeyPair();
      setE2EKeyPair(kp);
      localStorage.setItem('daylock_e2e_keypair', JSON.stringify(kp));
      setStatus({ type: 'ok', msg: language === 'fa' ? 'کلیدهای RSA-2048 با موفقیت تولید شدند' : 'E2E RSA-2048 identity generated!' });
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message || 'Failed to generate E2E keys' });
    }
  };

  const handleCreateE2EChannel = async () => {
    if (!e2eKeyPair) return;
    setIsE2ELoading(true);
    setStatus({ type: 'warn', msg: "Registering secure E2E Channel on backend..." });
    try {
      const payload = {
        is_e2e_channel: true,
        e2e_public_key: e2eKeyPair.publicKey,
        expires_in: expiresIn,
        block_asns: hasAsnLock && asnMode === 'block' ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
        allow_asns: hasAsnLock && asnMode === 'allow' ? asnSelected.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to establish E2E Channel.");

      setE2EChannelDetails({ id: data.id, expires_at: data.expires_at });
      
      const shareUrl = `${window.location.origin}/#e2e-${data.id}`;
      setResultUrl(shareUrl);
      setStatus({ type: 'ok', msg: "E2E Channel spawned! Link copied to clipboard." });
      copyToClipboardWithAutoClear(shareUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsE2ELoading(false);
    }
  };

  const handleRefreshE2EMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/paste/${channelId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load channel messages.");
      }
      const channelData = await res.json();
      
      const decryptedMsgs = [];
      if (channelData.e2e_messages && Array.isArray(channelData.e2e_messages)) {
        for (const msg of channelData.e2e_messages) {
          let text = language === 'fa'
            ? "[خطا در رمزگشایی: عدم تطابق کلید خصوصی]"
            : "[Decryption Failed: Private key mismatch]";
          if (e2eKeyPair) {
            try {
              text = await e2eDecrypt(
                e2eKeyPair.privateKey,
                msg.ephemeral_pub,
                msg.nonce,
                msg.ciphertext
              );
            } catch (cryptoErr) {
              // decryption failed
            }
          } else {
            text = language === 'fa'
              ? "[رمزگذاری شده: برای رمزگشایی ابتدا هویت E2E بسازید]"
              : "[Encrypted: Generate E2E identity to decrypt]";
          }
          decryptedMsgs.push({
            id: msg.id,
            text,
            timestamp: msg.timestamp
          });
        }
      }
      setE2EActiveMessages(decryptedMsgs);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendE2EMessage = async (channelId: string, recipientPubKey: string) => {
    if (!e2eMessageText.trim()) return;
    try {
      const encPayload = await e2eEncrypt(recipientPubKey, e2eMessageText);
      const res = await fetch(`/api/paste/${channelId}/e2e`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e2e_message: encPayload })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to deliver message.");
      }
      setE2EMessageText('');
      await handleRefreshE2EMessages(channelId);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    }
  };

  const resetE2EState = () => {
    setE2EChannelDetails(null);
    setE2ERecipientPubInput('');
    setE2EMessageText('');
    setE2EActiveMessages([]);
  };

  return {
    e2eKeyPair,
    setE2EKeyPair,
    e2eChannelDetails,
    setE2EChannelDetails,
    e2eRecipientPubInput,
    setE2ERecipientPubInput,
    e2eMessageText,
    setE2EMessageText,
    e2eActiveMessages,
    setE2EActiveMessages,
    isE2ELoading,
    handleGenerateE2EKeyPair,
    handleCreateE2EChannel,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    resetE2EState,
  };
}
