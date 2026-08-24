import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Download, Check, X } from 'lucide-react';
import QRCode from 'qrcode';
import { copyToClipboardWithAutoClear } from '../../utils/clipboardManager';
import { Language, StatusState } from '../../types';

interface LinkQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  isDarkMode: boolean;
  language: Language;
  t: any;
  setStatus: (status: StatusState | null) => void;
}

export const LinkQrCodeModal: React.FC<LinkQrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  isDarkMode,
  language,
  t,
  setStatus,
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const isRtl = language === 'fa';

  useEffect(() => {
    if (!isOpen || !url) {
      setQrImageUrl('');
      return;
    }

    QRCode.toDataURL(url, {
      margin: 1,
      width: 440,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        setQrImageUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate QR for result link:', err);
      });
  }, [isOpen, url]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await copyToClipboardWithAutoClear(
        url,
        30000,
        (msg) => setStatus({ type: 'warn', msg }),
        language === 'fa' ? 'fa' : 'en'
      );
      setCopiedLink(true);
      setStatus({ type: 'ok', msg: t.linkCopied || 'Link copied to clipboard!' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrImageUrl) return;
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `DayLock_QR_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus({ type: 'ok', msg: language === 'fa' ? 'کد QR دانلود شد.' : 'QR Code downloaded!' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Minimalist Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative rounded-3xl border p-4 sm:p-5 shadow-2xl z-10 overflow-hidden flex flex-col items-center ${
              isDarkMode
                ? 'bg-zinc-950 border-white/10 text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`absolute top-3 right-3 p-1.5 rounded-full border transition-all cursor-pointer z-20 ${
                isDarkMode
                  ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
              }`}
              aria-label="Close"
              title={t.close || 'Close'}
            >
              <X className="w-4 h-4" />
            </button>

            {/* QR Code Presentation Box */}
            <div className="flex flex-col items-center justify-center mt-2">
              <div
                className={`p-3 sm:p-3.5 bg-white rounded-2xl border ${
                  isDarkMode ? 'border-white/10 shadow-lg' : 'border-zinc-200 shadow-sm'
                }`}
              >
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Secure QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-zinc-400 text-xs animate-pulse font-mono">
                    Generating...
                  </div>
                )}
              </div>

              {/* Minimal Two Action Icons: Copy & Download */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title={t.copyLink || t.copy || 'Copy Link'}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md scale-105'
                      : isDarkMode
                        ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-800'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-zinc-200'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  title={t.downloadQr || 'Download QR'}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-800'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-zinc-200'
                  }`}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
