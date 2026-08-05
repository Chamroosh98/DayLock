import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, Copy, Download, Check, Zap, Layers } from 'lucide-react';
import QRCode from 'qrcode';
import { copyToClipboardWithAutoClear } from '../utils/clipboardManager';

interface QrCodeHubProps {
  decryptedContent: any;
  isDarkMode: boolean;
  t: any;
  setStatus: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
  language: string;
}

// Centralized list of supported protocols for QR-code rendering.
const ALLOWED_VPN_SCHEMES = [
  'vless',
  'vmess',
  'ss',
  'ssr',
  'trojan',
  'shadowrocket',
  'sing-box',
  'clash',
  'tg',
  'warp',
  'wireguard',
  'tuic',
  'hysteria',
  'hysteria2',
  'juicity',
  'nekobox',
  'socks',
  'socks5'
];

const AnonymousIcon = ({ className = "w-5 h-5 text-emerald-400" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Hat top */}
    <path d="M2 10h20" />
    <path d="M6 10V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" />
    {/* Glasses */}
    <circle cx="8" cy="16" r="2.5" />
    <circle cx="16" cy="16" r="2.5" />
    <path d="M10.5 16h3" />
    <path d="M14 13.5h2" />
    <path d="M8 13.5H10" />
  </svg>
);

const extractVpnConfigs = (content: any): string[] => {
  if (typeof content !== 'string') return [];
  
  const lines = content.split(/[\n\r\t,;]+/);
  const configs: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const hasScheme = ALLOWED_VPN_SCHEMES.some(scheme => trimmed.toLowerCase().startsWith(`${scheme}://`));
    if (hasScheme) {
      configs.push(trimmed);
    } else {
      const words = trimmed.split(/\s+/);
      for (const word of words) {
        const wordTrimmed = word.trim();
        const wordHasScheme = ALLOWED_VPN_SCHEMES.some(scheme => wordTrimmed.toLowerCase().startsWith(`${scheme}://`));
        if (wordHasScheme) {
          configs.push(wordTrimmed);
        }
      }
    }
  }
  
  return Array.from(new Set(configs));
};

const getVpnName = (config: string, index: number): string => {
  try {
    const hashIndex = config.indexOf('#');
    if (hashIndex !== -1) {
      const name = config.substring(hashIndex + 1);
      if (name) return decodeURIComponent(name).trim();
    }
  } catch (e) {
    console.error(e);
  }
  
  const protocol = config.split('://')[0].toUpperCase();
  return `${protocol} #${index + 1}`;
};

const getProtocolColor = (config: string) => {
  const protocol = config.split('://')[0].toLowerCase();
  switch (protocol) {
    case 'vless': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', activeBg: 'bg-emerald-500/10' };
    case 'vmess': return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', activeBg: 'bg-indigo-500/10' };
    case 'trojan': return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', activeBg: 'bg-amber-500/10' };
    case 'ss':
    case 'ssr':
    case 'shadowrocket': return { text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/5', activeBg: 'bg-pink-500/10' };
    case 'tg': return { text: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/5', activeBg: 'bg-sky-500/10' };
    default: return { text: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/5', activeBg: 'bg-teal-500/10' };
  }
};

export const QrCodeHub: React.FC<QrCodeHubProps> = ({
  decryptedContent,
  isDarkMode,
  t,
  setStatus,
  language,
}) => {
  const [selectedConfigIndex, setSelectedConfigIndex] = useState<number>(0);
  const [secretQrUrl, setSecretQrUrl] = useState<string>('');
  const [copiedOverlay, setCopiedOverlay] = useState(false);

  const extractedConfigs = useMemo(() => extractVpnConfigs(decryptedContent), [decryptedContent]);
  const isVpnConfig = extractedConfigs.length > 0;

  // Auto reset index if out of bounds
  useEffect(() => {
    if (selectedConfigIndex >= extractedConfigs.length) {
      setSelectedConfigIndex(0);
    }
  }, [extractedConfigs, selectedConfigIndex]);

  useEffect(() => {
    if (!isVpnConfig || extractedConfigs.length === 0) {
      setSecretQrUrl('');
      return;
    }

    const currentConfig = extractedConfigs[selectedConfigIndex];
    if (!currentConfig) return;

    QRCode.toDataURL(currentConfig, {
      margin: 2,
      width: 420,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(url => {
      setSecretQrUrl(url);
    }).catch(err => {
      console.error("Failed to generate content QR", err);
    });

  }, [extractedConfigs, selectedConfigIndex, isVpnConfig]);

  if (!decryptedContent || !isVpnConfig) return null;

  const currentConfig = extractedConfigs[selectedConfigIndex] || '';

  const getFormattedDateTime = () => {
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  };

  const handleCopy = async () => {
    if (!currentConfig) return;

    try {
      await copyToClipboardWithAutoClear(currentConfig, 30000, (msg) => setStatus({ type: 'warn', msg }), language === 'fa' ? 'fa' : 'en');
      setCopiedOverlay(true);
      setStatus({ type: 'ok', msg: t.copySuccess || "Content copied to clipboard" });
      setTimeout(() => setCopiedOverlay(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyAllConfigs = async () => {
    if (extractedConfigs.length === 0) return;
    
    try {
      const allText = extractedConfigs.join('\n');
      await copyToClipboardWithAutoClear(allText, 30000, (msg) => setStatus({ type: 'warn', msg }), language === 'fa' ? 'fa' : 'en');
      setStatus({ type: 'ok', msg: language === 'fa' ? "تمام کانفیگ‌ها در حافظه کپی شدن!!" : "All configurations copied to clipboard!" });
    } catch (err) {
      console.error("Failed to copy all configs", err);
    }
  };

  const handleDownload = () => {
    if (!secretQrUrl || !currentConfig) return;

    const currentName = getVpnName(currentConfig, selectedConfigIndex);
    const sanitizedName = currentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestampName = `securepaste_${sanitizedName}_${getFormattedDateTime()}.png`;

    const a = document.createElement('a');
    a.href = secretQrUrl;
    a.download = timestampName;
    a.click();
  };

  const handleCopyQrImage = async () => {
    if (!secretQrUrl) return;
    try {
      const response = await fetch(secretQrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setStatus({ type: 'ok', msg: language === 'fa' ? "تصویر کد QR کپی شد!" : "QR Image copied to clipboard!" });
    } catch (err) {
      handleDownload();
    }
  };

  return (
    <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/20 border-white/5' : 'bg-zinc-50/50 border-zinc-200'} space-y-6 mt-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[6px] rounded-2xl" />
            <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border ${
              isDarkMode 
                ? 'bg-zinc-900 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400' 
                : 'bg-white border-emerald-500/40 shadow-[0_4px_12px_rgba(16,185,129,0.1)] text-emerald-600'
            }`}>
              <AnonymousIcon className="w-5.5 h-5.5 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.qrCode}</h3>
            <p className={`text-[9px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'} mt-0.5 leading-snug`}>
              {language === 'fa' 
                ? 'برای وارد کردن مستقیم کانفیگ VPN در موبایل خود، اسکن کن.' 
                : 'Scan to import the VPN configuration directly to your device.'}
            </p>
          </div>
        </div>
      </div>

      {/* Multiple Config Selector Tabs */}
      {extractedConfigs.length > 1 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {language === 'fa' ? 'کانفیگ‌های شناسایی شده' : 'Detected Configurations'} ({extractedConfigs.length})
            </span>
            <button
              onClick={handleCopyAllConfigs}
              className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {language === 'fa' ? 'کپی همه کانفیگ‌ها' : 'Copy All Configs'}
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {extractedConfigs.map((config, idx) => {
              const name = getVpnName(config, idx);
              const protocol = config.split('://')[0].toUpperCase();
              const isSelected = idx === selectedConfigIndex;
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedConfigIndex(idx)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? `bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5`
                        : `bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md`
                      : isDarkMode
                        ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-zinc-500'} ${isSelected ? 'animate-pulse' : ''}`} />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black tracking-wide leading-none">{name}</span>
                    <span className={`text-[8px] opacity-75 font-mono leading-none mt-1 uppercase tracking-wider`}>{protocol}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Visual presentation */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
        <div className="flex flex-col items-center gap-2">
          <div 
            onClick={handleCopy}
            title={language === 'fa' ? "برای کپی کردن کانفیگ کلیک کن" : "Click to Copy Config"}
            className={`group relative p-4 rounded-3xl border ${isDarkMode ? 'bg-white border-white/10' : 'bg-white border-zinc-200'} shadow-2xl cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-[1.03] active:scale-95`}
          >
            {secretQrUrl ? (
              <img src={secretQrUrl} className="w-40 h-40 object-contain rounded-xl" alt="Content QR" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-zinc-400 text-xs">Generating...</div>
            )}

            {/* Hover overlay with CTA to Copy */}
            <div className="absolute inset-x-0 bottom-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center py-1.5 gap-0.5">
              <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Copy className="w-2.5 h-2.5" />
                {language === 'fa' ? "کپی مستقیم کانفیگ" : "Copy Config Only"}
              </span>
            </div>

            {/* Click feedback overlay */}
            {copiedOverlay && (
              <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center gap-1 animate-fade-in">
                <Check className="w-8 h-8 text-black animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black">Copied!</span>
              </div>
            )}
          </div>
          <span className={`text-[8.5px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} select-none uppercase tracking-widest`}>
            {language === 'fa' ? "برای کپی روی QR کلیک کن" : "Click QR to Copy Data"}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyQrImage}
            className={`px-5 py-3 ${isDarkMode ? 'bg-zinc-900 border-white/5 text-zinc-200 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'} border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Copy className="w-3.5 h-3.5 text-emerald-500" />
            {t.copyQr}
          </button>

          <button
            onClick={handleDownload}
            className={`px-5 py-3 ${isDarkMode ? 'bg-zinc-900 border-white/5 text-zinc-200 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'} border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            {t.downloadQr}
          </button>
        </div>
      </div>
    </div>
  );
};
