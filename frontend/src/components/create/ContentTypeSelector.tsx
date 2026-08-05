import React from 'react';
import { FileText, File, Image as ImageIcon, Headphones, Zap, MessageSquare } from 'lucide-react';
import { ContentType } from '../../types';
import { TypeTab } from '../TypeTab';

interface ContentTypeSelectorProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  setImageAcquisition: (val: any) => void;
  isDarkMode: boolean;
  t: any;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  setContentType,
  setImageAcquisition,
  isDarkMode,
  t,
}) => {
  return (
    <div id="content-type-selector">
      {/* Content Type Selector - Mobile Inline (Swipe-friendly) */}
      <div className="block md:hidden overflow-x-auto scrollbar-none py-1 -mx-2 px-2">
        <div className="flex gap-1.5 min-w-max">
          {[
            { id: 'text', label: t.text, icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'file', label: t.file, icon: <File className="w-3.5 h-3.5" /> },
            { id: 'stego', label: t.image, icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'audio', label: t.audio, icon: <Headphones className="w-3.5 h-3.5" /> },
            { id: 'shamir', label: t.shamir, icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'e2e', label: t.e2e, icon: <MessageSquare className="w-3.5 h-3.5" /> },
          ].map((item) => {
            const isActive = contentType === item.id;
            return (
              <button
                id={`type-tab-${item.id}`}
                key={item.id}
                type="button"
                onClick={() => {
                  setContentType(item.id as ContentType);
                  if (item.id === 'stego') setImageAcquisition(null);
                }}
                className={`flex flex-row items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-[28.5vw] shrink-0 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-zinc-900 text-white border border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.06)]'
                      : 'bg-white text-zinc-900 border border-emerald-500/30 shadow-sm'
                    : isDarkMode
                    ? 'bg-zinc-900/30 text-zinc-500 border border-white/5 hover:text-zinc-300'
                    : 'bg-zinc-100/50 text-zinc-500 border border-zinc-200/50 hover:text-zinc-700'
                }`}
              >
                <span className={isActive ? 'text-emerald-500 shrink-0' : 'text-zinc-400 shrink-0'}>
                  {item.icon}
                </span>
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Type Tabs - Desktop */}
      <div className={`hidden md:block p-1.5 rounded-3xl border ${isDarkMode ? 'bg-zinc-950/40 border-white/5' : 'bg-zinc-100/70 border-zinc-200/85'} shadow-inner`}>
        <div className="grid grid-cols-6 items-center w-full">
          <TypeTab id="type-tab-text" active={contentType === 'text'} onClick={() => setContentType('text')} icon={<FileText/>} text={t.text} isDarkMode={isDarkMode} />
          <TypeTab id="type-tab-file" active={contentType === 'file'} onClick={() => setContentType('file')} icon={<File/>} text={t.file} isDarkMode={isDarkMode} />
          <TypeTab id="type-tab-stego" active={contentType === 'stego'} onClick={() => {
            setContentType('stego');
            setImageAcquisition(null);
          }} icon={<ImageIcon/>} text={t.image} isDarkMode={isDarkMode} />
          <TypeTab id="type-tab-audio" active={contentType === 'audio'} onClick={() => setContentType('audio')} icon={<Headphones/>} text={t.audio} isDarkMode={isDarkMode} />
          <TypeTab id="type-tab-shamir" active={contentType === 'shamir'} onClick={() => setContentType('shamir')} icon={<Zap/>} text={t.shamir} isDarkMode={isDarkMode} />
          <TypeTab id="type-tab-e2e" active={contentType === 'e2e'} onClick={() => setContentType('e2e')} icon={<MessageSquare/>} text={t.e2e} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};
