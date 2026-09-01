import { useState, useEffect, useCallback, useRef } from 'react';
import { e2eDecryptMessageList, e2ePrepareOutboundMessage } from '../../../utils/e2eCrypto';
import { E2EMessage } from '../../../types';

export const useE2EChannelState = (
  expiresIn: number,
  hasAsnLock: boolean,
  asnMode: 'block' | 'allow',
  asnSelected: string,
  language: string,
  t: Record<string, string>,
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string }) => void,
  setResultUrl: (url: string | null) => void,
  copyToClipboardWithAutoClear: (text: string, timeoutMs: number, onNotify: (msg: string) => void, lang?: string) => void
) => {
  const [e2eKeyPair, setE2EKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(() => {
    try {
      const saved = localStorage.getItem('daylock_e2e_keypair');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.publicKey === 'string' && parsed.publicKey.length > 0 && typeof parsed.privateKey === 'string') {
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem('daylock_e2e_keypair');
    }
    return null;
  });

  const [e2eChannelDetails, setE2EChannelDetails] = useState<{ id: string; expires_at: number; e2e_public_key?: string } | null>(() => {
    try {
      const saved = sessionStorage.getItem('daylock_active_e2e_channel');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return null;
  });

  const [e2eRecipientPubInput, setE2ERecipientPubInput] = useState('');
  const [e2eMessageText, setE2EMessageText] = useState('');
  const [e2eActiveMessages, setE2EActiveMessages] = useState<E2EMessage[]>([]);
  const [isE2ELoading, setIsE2ELoading] = useState(false);

  const e2eKeyPairRef = useRef(e2eKeyPair);
  e2eKeyPairRef.current = e2eKeyPair;
  const tRef = useRef(t);
  tRef.current = t;
  const languageRef = useRef(language);
  languageRef.current = language;

  const handleRefreshE2EMessages = useCallback(async (channelId: string) => {
    if (!channelId) return;
    try {
      const res = await fetch(`/api/paste/${channelId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load channel messages.");
      }
      const channelData = await res.json();
      const decrypted = await e2eDecryptMessageList(
        channelData.e2e_messages,
        e2eKeyPairRef.current,
        tRef.current,
        languageRef.current
      );
      setE2EActiveMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(decrypted)) {
          return prev;
        }
        return decrypted;
      });
    } catch (err: any) {
      console.error("Failed to refresh E2E messages:", err);
    }
  }, []);

  const handleSendE2EMessage = async (channelId: string, recipientPubKey: string) => {
    if (!e2eMessageText.trim()) return;
    try {
      const encPayload = await e2ePrepareOutboundMessage(
        recipientPubKey.trim(),
        e2eMessageText.trim(),
        e2eKeyPair?.publicKey
      );
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

  const handleCreateE2EChannel = async () => {
    if (!e2eKeyPair) return;
    setIsE2ELoading(true);
    setStatus({ type: 'warn', msg: t.e2eRegisteringChannel || "Registering secure E2E Channel on backend..." });
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
      if (!res.ok) throw new Error(data.error || t.e2eChannelFailed || "Failed to establish E2E Channel.");

      const channelObj = { id: data.id, expires_at: data.expires_at, e2e_public_key: e2eKeyPair.publicKey };
      setE2EChannelDetails(channelObj);
      sessionStorage.setItem('daylock_active_e2e_channel', JSON.stringify(channelObj));
      
      const shareUrl = `${window.location.origin}/#e2e-${data.id}`;
      setResultUrl(shareUrl);
      setStatus({ type: 'ok', msg: t.e2eChannelSpawned || "E2E Channel spawned! Link copied to clipboard." });
      copyToClipboardWithAutoClear(shareUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
      
      // Immediately refresh messages
      handleRefreshE2EMessages(data.id);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsE2ELoading(false);
    }
  };

  // Auto-polling for active E2E channel in CreateTab
  useEffect(() => {
    const channelId = e2eChannelDetails?.id;
    if (!channelId) return;
    handleRefreshE2EMessages(channelId);
    const interval = setInterval(() => {
      handleRefreshE2EMessages(channelId);
    }, 2500);
    return () => clearInterval(interval);
  }, [e2eChannelDetails?.id, handleRefreshE2EMessages]);

  const resetE2E = () => {
    setE2EChannelDetails(null);
    sessionStorage.removeItem('daylock_active_e2e_channel');
    setE2EActiveMessages([]);
    setE2EMessageText('');
    setE2ERecipientPubInput('');
    setResultUrl(null);
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
    handleCreateE2EChannel,
    handleRefreshE2EMessages,
    handleSendE2EMessage,
    resetE2E
  };
};
