import { useState, useCallback, useEffect, useRef } from 'react';

export function useUndoableState<T>(initialPresent: T, maxHistory: number = 100) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresentState] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);
  
  // Keep ref for immediate access in event handlers
  const pastRef = useRef(past);
  const presentRef = useRef(present);
  const futureRef = useRef(future);
  
  useEffect(() => {
    pastRef.current = past;
    presentRef.current = present;
    futureRef.current = future;
  }, [past, present, future]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    const newPast = pastRef.current.slice(0, pastRef.current.length - 1);
    
    setPast(newPast);
    setFuture([presentRef.current, ...futureRef.current]);
    setPresentState(previous);
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    const newFuture = futureRef.current.slice(1);
    
    setPast([...pastRef.current, presentRef.current]);
    setFuture(newFuture);
    setPresentState(next);
  }, []);

  const setPresent = useCallback((newPresent: T | ((prev: T) => T)) => {
    const value = typeof newPresent === 'function' ? (newPresent as (prev: T) => T)(presentRef.current) : newPresent;
    if (value === presentRef.current) return;

    setPast(prev => {
      const updated = [...prev, presentRef.current];
      return updated.length > maxHistory ? updated.slice(updated.length - maxHistory) : updated;
    });
    setPresentState(value);
    setFuture([]);
  }, [maxHistory]);

  const resetState = useCallback((newPresent: T) => {
    setPast([]);
    setPresentState(newPresent);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState: setPresent,
    undo,
    redo,
    canUndo,
    canRedo,
    resetState
  };
}
