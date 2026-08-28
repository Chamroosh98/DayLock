import { useState } from 'react';

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
  const [e2eChannelDetails, setE2EChannelDetails] = useState<{ id: string; expires_at: number } | null>(null);
  const [isE2ELoading, setIsE2ELoading] = useState(false);

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

      setE2EChannelDetails({ id: data.id, expires_at: data.expires_at });
      
      const shareUrl = `${window.location.origin}/#e2e-${data.id}`;
      setResultUrl(shareUrl);
      setStatus({ type: 'ok', msg: t.e2eChannelSpawned || "E2E Channel spawned! Link copied to clipboard." });
      copyToClipboardWithAutoClear(shareUrl, 30000, (msg) => setStatus({ type: 'warn', msg }), language);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsE2ELoading(false);
    }
  };

  const resetE2E = () => {
    setE2EChannelDetails(null);
  };

  return {
    e2eKeyPair,
    setE2EKeyPair,
    e2eChannelDetails,
    setE2EChannelDetails,
    isE2ELoading,
    handleCreateE2EChannel,
    resetE2E
  };
};
