import { useState } from 'react';

export const useAudioStegoState = () => {
  const [showAudioEmbedPwd, setShowAudioEmbedPwd] = useState(false);
  const [audioWavBytes, setAudioWavBytes] = useState<Uint8Array | null>(null);
  const [audioFilename, setAudioFilename] = useState('');
  const [audioText, setAudioText] = useState('');
  const [audioWavCapacity, setAudioWavCapacity] = useState(0);
  const [audioWaveformSamples, setAudioWaveformSamples] = useState<Float32Array | null>(null);
  const [audioEmbedPassword, setAudioEmbedPassword] = useState('');
  const [audioMode, setAudioMode] = useState<'record' | 'stego'>('record');

  const resetAudioStego = () => {
    setShowAudioEmbedPwd(false);
    setAudioWavBytes(null);
    setAudioFilename('');
    setAudioText('');
    setAudioWavCapacity(0);
    setAudioWaveformSamples(null);
    setAudioEmbedPassword('');
  };

  return {
    showAudioEmbedPwd,
    setShowAudioEmbedPwd,
    audioWavBytes,
    setAudioWavBytes,
    audioFilename,
    setAudioFilename,
    audioText,
    setAudioText,
    audioWavCapacity,
    setAudioWavCapacity,
    audioWaveformSamples,
    setAudioWaveformSamples,
    audioEmbedPassword,
    setAudioEmbedPassword,
    audioMode,
    setAudioMode,
    resetAudioStego
  };
};
