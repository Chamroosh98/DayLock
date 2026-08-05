import { useState, useRef, useEffect } from 'react';
import { localizeDigitsValue } from '../utils/numberConverter';
import { Language } from '../types';

export interface UseAudioRecorderProps {
  t: any;
  language: Language;
  setStatus: (status: any) => void;
}

export const useAudioRecorder = ({ t, language, setStatus }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    return localizeDigitsValue(formatted, language);
  };

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
          stream.getTracks().forEach((track) => track.stop());
        };
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (err) {
        setStatus({ type: 'err', msg: t.micDenied });
      }
    }
  };

  const resetAudioRecorder = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  return {
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    audioBlob,
    setAudioBlob,
    formatTime,
    toggleRecording,
    resetAudioRecorder,
  };
};
