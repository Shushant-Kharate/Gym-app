// useTimer.js — countdown timer hook with live duration adjustment
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {number} initialSeconds - total seconds to count down from
 * @param {Function} onComplete   - called when timer reaches 0
 * @param {boolean}  autoStart    - start immediately
 * @param {Function} onTick       - called every second with (secondsLeft, totalSeconds)
 */
export function useTimer(initialSeconds, onComplete, autoStart = false, onTick = null) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);   // adjustable ceiling
  const [isRunning, setIsRunning] = useState(autoStart);

  const intervalRef   = useRef(null);
  const endTimeRef    = useRef(null);
  const lastTickRef   = useRef(initialSeconds);
  const onCompleteRef = useRef(onComplete);
  const onTickRef     = useRef(onTick);
  onCompleteRef.current = onComplete;
  onTickRef.current     = onTick;

  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) endTimeRef.current = Date.now() + secondsLeft * 1000;
      intervalRef.current = setInterval(() => {
        const next = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(next);
        if (next !== lastTickRef.current) {
          lastTickRef.current = next;
          onTickRef.current?.(next, totalSeconds);
        }
        if (next <= 0) {
          clearInterval(intervalRef.current);
          endTimeRef.current = null;
          setIsRunning(false);
          onCompleteRef.current?.();
        }
      }, 250);
    } else {
      clearInterval(intervalRef.current);
      endTimeRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, totalSeconds, secondsLeft]);

  const start    = useCallback(() => {
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  }, [secondsLeft]);
  const pause    = useCallback(() => setIsRunning(false), []);

  const reset    = useCallback((newSec) => {
    const s = newSec ?? initialSeconds;
    setIsRunning(false);
    setSecondsLeft(s);
    setTotalSeconds(s);
    endTimeRef.current = null;
    lastTickRef.current = s;
  }, [initialSeconds]);

  const restart  = useCallback((newSec) => {
    const s = newSec ?? initialSeconds;
    setSecondsLeft(s);
    setTotalSeconds(s);
    endTimeRef.current = Date.now() + s * 1000;
    lastTickRef.current = s;
    setIsRunning(true);
  }, [initialSeconds]);

  /** Add seconds to the remaining time (and ceiling) — live adjustment */
  const addTime = useCallback((sec) => {
    setSecondsLeft(prev => Math.max(1, prev + sec));
    setTotalSeconds(prev => Math.max(1, prev + sec));
    if (endTimeRef.current) endTimeRef.current += sec * 1000;
  }, []);

  /** Subtract seconds from remaining time (and ceiling) — live adjustment */
  const subtractTime = useCallback((sec) => {
    setSecondsLeft(prev => Math.max(1, prev - sec));
    setTotalSeconds(prev => Math.max(1, prev - sec));
    if (endTimeRef.current) endTimeRef.current = Math.max(Date.now() + 1000, endTimeRef.current - sec * 1000);
  }, []);

  const minutes  = Math.floor(secondsLeft / 60);
  const seconds  = secondsLeft % 60;
  const display  = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return {
    secondsLeft, totalSeconds, minutes, seconds, display, progress,
    isRunning, start, pause, reset, restart, addTime, subtractTime,
  };
}
