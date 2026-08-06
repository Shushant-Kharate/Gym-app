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
  const onCompleteRef = useRef(onComplete);
  const onTickRef     = useRef(onTick);
  onCompleteRef.current = onComplete;
  onTickRef.current     = onTick;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          // Fire the tick callback (used for 30s reminders, countdown beeps)
          onTickRef.current?.(next, totalSeconds);
          if (next <= 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, totalSeconds]);

  const start    = useCallback(() => setIsRunning(true), []);
  const pause    = useCallback(() => setIsRunning(false), []);

  const reset    = useCallback((newSec) => {
    const s = newSec ?? initialSeconds;
    setIsRunning(false);
    setSecondsLeft(s);
    setTotalSeconds(s);
  }, [initialSeconds]);

  const restart  = useCallback((newSec) => {
    const s = newSec ?? initialSeconds;
    setSecondsLeft(s);
    setTotalSeconds(s);
    setIsRunning(true);
  }, [initialSeconds]);

  /** Add seconds to the remaining time (and ceiling) — live adjustment */
  const addTime = useCallback((sec) => {
    setSecondsLeft(prev => Math.max(1, prev + sec));
    setTotalSeconds(prev => Math.max(1, prev + sec));
  }, []);

  /** Subtract seconds from remaining time (and ceiling) — live adjustment */
  const subtractTime = useCallback((sec) => {
    setSecondsLeft(prev => Math.max(1, prev - sec));
    setTotalSeconds(prev => Math.max(1, prev - sec));
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
