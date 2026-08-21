import React from 'react';
import { File } from 'lucide-react';
import { Dropzone } from '../../../components/Dropzone';
import { Language } from '../../../types';

interface FileInputSectionProps {
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  isDarkMode: boolean;
  language: Language;
  t: any;
}

export const FileInputSection: React.FC<FileInputSectionProps> = ({
  handleFileSelect,
  selectedFile,
  isDarkMode,
  language,
  t,
}) => {
  return (
    <Dropzone 
      onSelect={handleFileSelect} 
      selectedFile={selectedFile} 
      icon={<File className="w-10 h-10"/>} 
      isDarkMode={isDarkMode} 
      label={t.file} 
      language={language} 
    />
  );
};
