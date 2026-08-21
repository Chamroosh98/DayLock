import { useState, useEffect } from 'react';
import { toEnglishDigits } from '../utils/numberConverter';
import { StatusState } from '../types';

interface UseShamirProps {
  setStatus: (status: StatusState | null) => void;
  t: {
    shamirSplit: string;
    shamirCombine: string;
    invalidPassword: string;
  };
}

export function useShamir({ setStatus, t }: UseShamirProps) {
  const [shamirSecret, setShamirSecret] = useState('');
  const [shamirTotal, setShamirTotal] = useState(5);
  const [shamirThreshold, setShamirThreshold] = useState(3);
  const [shamirShares, setShamirShares] = useState<string[]>([]);
  const [shamirCombineInputs, setShamirCombineInputs] = useState<string[]>(['', '', '']);
  const [shamirResult, setShamirResult] = useState<string | null>(null);
  const [hoveredShamirTrash, setHoveredShamirTrash] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setShamirCombineInputs(prev => {
      if (shamirThreshold > prev.length) {
        const extra = Array(shamirThreshold - prev.length).fill('');
        return [...prev, ...extra];
      } else if (shamirThreshold < prev.length) {
        return prev.slice(0, shamirThreshold);
      }
      return prev;
    });
  }, [shamirThreshold]);

  const handleShamirTotalChangeFA = (valStr: string) => {
    const eng = toEnglishDigits(valStr);
    const parsed = parseInt(eng, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(15, parsed));
      setShamirTotal(clamped);
      if (shamirThreshold > clamped) {
        setShamirThreshold(Math.max(2, clamped));
      }
    } else if (valStr === '') {
      setShamirTotal(0);
    }
  };

  const handleShamirThresholdChangeFA = (valStr: string) => {
    const eng = toEnglishDigits(valStr);
    const parsed = parseInt(eng, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(2, Math.min(shamirTotal || 15, parsed));
      setShamirThreshold(clamped);
    } else if (valStr === '') {
      setShamirThreshold(0);
    }
  };

  const handleShamirTotalBlurFA = () => {
    if (shamirTotal < 3) {
      setShamirTotal(3);
    }
    if (shamirThreshold > shamirTotal) {
      setShamirThreshold(shamirTotal);
    }
  };

  const handleShamirThresholdBlurFA = () => {
    if (shamirThreshold < 2) {
      setShamirThreshold(2);
    } else if (shamirThreshold > shamirTotal) {
      setShamirThreshold(shamirTotal);
    }
  };

  const handleShamirSplit = async () => {
    if (!shamirSecret) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/shamir/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: shamirSecret, total: shamirTotal, threshold: shamirThreshold })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShamirShares(data.shares);
      setStatus({ type: 'ok', msg: t.shamirSplit });
    } catch (err: any) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShamirCombine = async () => {
    const validShares = shamirCombineInputs
      .filter(s => s.trim())
      .map(s => toEnglishDigits(s));
    if (validShares.length < 2) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/shamir/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: validShares })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShamirResult(data.secret);
      setStatus({ type: 'ok', msg: t.shamirCombine });
    } catch (err: any) {
      setStatus({ type: 'err', msg: t.invalidPassword });
    } finally {
      setIsLoading(false);
    }
  };

  const resetShamirState = () => {
    setShamirSecret('');
    setShamirShares([]);
    setShamirResult(null);
  };

  return {
    shamirSecret,
    setShamirSecret,
    shamirTotal,
    setShamirTotal,
    shamirThreshold,
    setShamirThreshold,
    shamirShares,
    setShamirShares,
    shamirCombineInputs,
    setShamirCombineInputs,
    shamirResult,
    setShamirResult,
    hoveredShamirTrash,
    setHoveredShamirTrash,
    isLoading,
    handleShamirTotalChangeFA,
    handleShamirThresholdChangeFA,
    handleShamirTotalBlurFA,
    handleShamirThresholdBlurFA,
    handleShamirSplit,
    handleShamirCombine,
    resetShamirState,
  };
}
