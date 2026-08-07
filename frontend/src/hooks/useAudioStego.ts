import { useState, useRef, useEffect } from 'react';
import { audioStegoExtract, wavToFloat32, getWavCapacity } from '../utils/audioStego';
import { StatusState } from '../types';

interface UseAudioStegoProps {
  setStatus: (status: StatusState | null) => void;
  t: {
    micDenied: string;
  };
}

export function useAudioStego({ setStatus, t }: UseAudioStegoProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [audioWavBytes, setAudioWavBytes] = useState<Uint8Array | null>(null);
  const [audioFilename, setAudioFilename] = useState('');
  const [audioText, setAudioText] = useState('');
  const [audioWavCapacity, setAudioWavCapacity] = useState(0);
  const [audioWaveformSamples, setAudioWaveformSamples] = useState<Float32Array | null>(null);
  
  const [audioExtractFile, setAudioExtractFile] = useState<File | null>(null);
  const [audioExtractPassword, setAudioExtractPassword] = useState('');
  const [audioExtractResult, setAudioExtractResult] = useState<string | null>(null);
  const [isAudioExtracting, setIsAudioExtracting] = useState(false);
  
  const [audioWavPayload, setAudioWavPayload] = useState<Uint8Array | null>(null);
  const [audioEmbedPassword, setAudioEmbedPassword] = useState('');
  const [audioMode, setAudioMode] = useState<'record' | 'stego'>('record');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (err) {
        setStatus({ type: 'err', msg: t.micDenied });
      }
    }
  };

  const handleAudioWavSelect = async (file: File) => {
    try {
      setAudioFilename(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const wavBytes = new Uint8Array(arrayBuffer);
      setAudioWavBytes(wavBytes);
      const cap = getWavCapacity(wavBytes);
      setAudioWavCapacity(cap);
      const samples = wavToFloat32(wavBytes);
      setAudioWaveformSamples(samples);
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message || "Failed to load WAV audio file." });
    }
  };

  const handleAudioExtract = async () => {
    if (!audioExtractFile) return;
    setIsAudioExtracting(true);
    setStatus({ type: 'warn', msg: "Decoding hidden data from WAV audio cover..." });
    try {
      const arrayBuffer = await audioExtractFile.arrayBuffer();
      const wavBytes = new Uint8Array(arrayBuffer);
      const text = await audioStegoExtract(wavBytes, audioExtractPassword);
      setAudioExtractResult(text);
      setStatus({ type: 'ok', msg: "Steganography message extracted successfully!" });
    } catch (err: any) {
      setAudioExtractResult(null);
      setStatus({ type: 'err', msg: err.message || "Failed to extract message. Ensure the WAV is valid and the password is correct." });
    } finally {
      setIsAudioExtracting(false);
    }
  };

  const resetAudioState = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setAudioWavBytes(null);
    setAudioFilename('');
    setAudioText('');
    setAudioWavCapacity(0);
    setAudioWaveformSamples(null);
    setAudioExtractFile(null);
    setAudioExtractPassword('');
    setAudioExtractResult(null);
    setIsAudioExtracting(false);
    setAudioWavPayload(null);
    setAudioEmbedPassword('');
  };

  return {
    isRecording,
    recordingTime,
    audioBlob,
    audioWavBytes,
    audioFilename,
    audioText,
    setAudioText,
    audioWavCapacity,
    audioWaveformSamples,
    audioExtractFile,
    setAudioExtractFile,
    audioExtractPassword,
    setAudioExtractPassword,
    audioExtractResult,
    isAudioExtracting,
    audioWavPayload,
    audioEmbedPassword,
    setAudioEmbedPassword,
    audioMode,
    setAudioMode,
    toggleRecording,
    handleAudioWavSelect,
    handleAudioExtract,
    resetAudioState,
  };
}
