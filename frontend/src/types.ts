import React from 'react';

export * from './types/app';

export type ContentType = 'text' | 'file' | 'voice' | 'image' | 'stego' | 'shamir' | 'audio' | 'e2e';
export type MainTab = 'create' | 'view';
export type Language = 'en' | 'fa' | 'ru' | 'zh';

export interface Country {
  code: string;
  name: string;
  fa: string;
  flag: string;
}

export interface MetaItemProps {
  label: string;
  value: any;
  isDarkMode?: boolean;
  language?: string;
  iconType?: 'views' | 'expires' | 'maxViews';
}

export interface TypeTabProps {
  id?: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  text: string;
  isDarkMode: boolean;
}

export interface OptionToggleProps {
  id?: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  isDarkMode: boolean;
  language?: string;
  variant?: 'default' | 'danger' | 'warning' | 'cyan' | 'purple' | 'blue' | 'indigo';
}

export interface CustomSelectProps {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  isDarkMode: boolean;
  language?: string;
}

export interface DropzoneProps {
  onSelect: (e: any) => void;
  selectedFile: File | null;
  icon: React.ReactNode;
  accept?: string;
  label?: string;
  isDarkMode: boolean;
  previewUrl?: string | null;
  language?: string;
}

export interface TrashIconProps {
  animate: boolean;
}
