// useAudio.js — Web Audio API beeps, no external files needed
import { useCallback, useRef } from 'react';
import { getSettings } from '../db/storage';

export function useAudio() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  /**
   * Play a tone: frequency (Hz), duration (s), type, volume (0–1)
   * Returns the scheduled stop time so callers can chain tones.
   */
  const playTone = useCallback((frequency = 880, duration = 0.15, type = 'sine', volume = 0.5, startDelay = 0) => {
    const settings = getSettings();
    if (!settings.audioEnabled) return;
    try {
      const ctx = getCtx();
      const t = ctx.currentTime + startDelay;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, t);
      gainNode.gain.setValueAtTime(volume, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);
      oscillator.start(t);
      oscillator.stop(t + duration);
    } catch (e) {
      // Silently fail — audio is non-critical
    }
  }, []);

  // Short click when checking a set off
  const playSetCheck = useCallback(() => playTone(660, 0.1, 'square', 0.3), [playTone]);

  // Rest timer complete — two ascending beeps
  const playRestComplete = useCallback(() => {
    playTone(880, 0.2, 'sine', 0.7);
    setTimeout(() => playTone(1100, 0.35, 'sine', 0.7), 250);
    setTimeout(() => playTone(1320, 0.4,  'sine', 0.7), 550);
  }, [playTone]);

  // 30-second reminder — gentle mid-rest double-ping so you know half time is done
  const playReminder30s = useCallback(() => {
    playTone(660, 0.12, 'sine', 0.35);
    setTimeout(() => playTone(660, 0.12, 'sine', 0.35), 200);
  }, [playTone]);

  /**
   * Loud countdown tick for the last 10 seconds.
   * Each second gets a sharp, escalating square-wave beep.
   * secondsLeft: the current value (10 → 1)
   */
  const playCountdownTick = useCallback((secondsLeft) => {
    // Pitch rises as count approaches 0 — makes urgency palpable
    const baseFreq = 440 + (10 - secondsLeft) * 60;  // 440 Hz @ 10s → 980 Hz @ 1s
    const vol = 0.35 + (10 - secondsLeft) * 0.06;    // louder as it counts down
    playTone(baseFreq, 0.08, 'square', Math.min(vol, 0.9));
  }, [playTone]);

  // Session complete — triumphant three-note chord
  const playSessionComplete = useCallback(() => {
    playTone(523, 0.3, 'sine', 0.5);  // C5
    setTimeout(() => playTone(659, 0.3, 'sine', 0.5), 150); // E5
    setTimeout(() => playTone(784, 0.5, 'sine', 0.5), 300); // G5
  }, [playTone]);

  // GO! signal — sharp ascending burst when rest timer hits zero
  const playGoSignal = useCallback(() => {
    playTone(880, 0.12, 'square', 0.6);
    setTimeout(() => playTone(1175, 0.12, 'square', 0.7), 100);
    setTimeout(() => playTone(1760, 0.25, 'sawtooth', 0.6), 200);
  }, [playTone]);

  return { playTone, playSetCheck, playRestComplete, playReminder30s, playCountdownTick, playSessionComplete, playGoSignal };
}
