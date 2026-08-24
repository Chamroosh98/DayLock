import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Download, Check, Layers } from 'lucide-react';
import QRCode from 'qrcode';
import { copyToClipboardWithAutoClear } from '../utils/clipboardManager';
import { localizeDigitsValue } from '../utils/numberConverter';

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
      margin: 1,
      width: 440,
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

  const isRtl = language === 'fa';

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
      await copyToClipboardWithAutoClear(
        currentConfig,
        30000,
        (msg) => setStatus({ type: 'warn', msg }),
        language === 'fa' ? 'fa' : 'en'
      );
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
      await copyToClipboardWithAutoClear(
        allText,
        30000,
        (msg) => setStatus({ type: 'warn', msg }),
        language === 'fa' ? 'fa' : 'en'
      );
      setStatus({ type: 'ok', msg: t.allConfigsCopied || "All configs copied" });
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus({ type: 'ok', msg: language === 'fa' ? 'کد QR دانلود شد.' : 'QR Code downloaded!' });
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`p-4 sm:p-5 rounded-3xl border flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-50/70 border-zinc-200'
      } space-y-4 mt-4 ${isRtl ? 'font-vazir' : ''}`}
    >
      {/* Multiple Config Selector Tabs (when > 1 config detected) */}
      {extractedConfigs.length > 1 && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} ${isRtl ? 'font-vazir' : ''}`}>
              {t.detectedConfigs || 'Configs'} ({localizeDigitsValue(extractedConfigs.length, language)})
            </span>
            <button
              onClick={handleCopyAllConfigs}
              className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{t.copyAllConfigs || 'Copy All'}</span>
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
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? `bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md`
                        : `bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm`
                      : isDarkMode
                        ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                  <span className="text-[10px] font-black tracking-wide leading-none">{name}</span>
                  <span className="text-[8px] opacity-75 font-mono leading-none uppercase">{protocol}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Code Presentation Box */}
      <div className="flex flex-col items-center justify-center">
        <div 
          className={`p-3 sm:p-3.5 bg-white rounded-2xl border ${
            isDarkMode ? 'border-white/10 shadow-lg' : 'border-zinc-200 shadow-sm'
          }`}
        >
          {secretQrUrl ? (
            <img src={secretQrUrl} className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg" alt="VPN QR Code" />
          ) : (
            <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-zinc-400 text-xs font-mono animate-pulse">
              Generating...
            </div>
          )}
        </div>

        {/* Minimal Two Action Icons: Copy & Download */}
        <div className="flex items-center justify-center gap-3 mt-3.5">
          <button
            type="button"
            onClick={handleCopy}
            title={t.copyConfigOnly || t.copy || 'Copy'}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              copiedOverlay
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-md scale-105'
                : isDarkMode
                  ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-zinc-100 shadow-sm'
            }`}
          >
            {copiedOverlay ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title={t.downloadQr || 'Download QR'}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-800'
                : 'bg-white border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-zinc-100 shadow-sm'
            }`}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
