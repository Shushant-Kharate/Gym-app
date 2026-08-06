// useWorkoutSession.js — active session state machine
import { useState, useCallback } from 'react';
import { saveWorkoutSession, advanceProgramDay } from '../db/storage';
import { suggestNextWeight } from '../logic/progressiveOverload';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Initialise an exercise list with suggested weights and empty set tracking
 */
function initExercises(programExercises) {
  return programExercises.map(ex => {
    const suggestion = suggestNextWeight(ex.name, ex.suggestedWeightKg);
    return {
      ...ex,
      targetRepsMin: parseInt(String(ex.reps).split('–')[0]) || parseInt(ex.reps) || 8,
      suggestedResult: suggestion,
      sets: Array.from({ length: ex.sets }, () => ({
        weightKg: suggestion.weightKg,
        reps: parseInt(String(ex.reps).split('–')[0]) || 8,
        done: false,
        skipped: false,
      })),
    };
  });
}

export function useWorkoutSession(programDay) {
  const SESSION_BUDGET_SEC = 7200; // 2 hours

  const [phase, setPhase] = useState('warmup');   // warmup | workout | stretch | complete
  const [warmupChecks, setWarmupChecks] = useState(
    () => (programDay?.warmup ?? []).map(() => false)
  );
  const [stretchChecks, setStretchChecks] = useState(
    () => (programDay?.stretches ?? []).map(() => false)
  );
  const [exercises, setExercises] = useState(() => initExercises(programDay?.exercises ?? []));
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [restTimer, setRestTimer] = useState(null); // { active, secondsLeft, exerciseName }
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionNotes, setSessionNotes] = useState('');

  // ─── Warmup ────────────────────────────────────────────────────────────────
  const toggleWarmup = useCallback((idx) => {
    setWarmupChecks(prev => prev.map((v, i) => i === idx ? !v : v));
  }, []);

  const completeWarmup = useCallback(() => setPhase('workout'), []);

  // ─── Stretch ───────────────────────────────────────────────────────────────
  const toggleStretch = useCallback((idx) => {
    setStretchChecks(prev => prev.map((v, i) => i === idx ? !v : v));
  }, []);

  // ─── Sets ──────────────────────────────────────────────────────────────────
  const checkSet = useCallback((exIdx, setIdx, restDurationSec) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const newSets = ex.sets.map((s, si) => si === setIdx ? { ...s, done: true } : s);
      return { ...ex, sets: newSets };
    }));
    // Start rest timer — prefer per-exercise restSec from program data, fall back to caller's duration
    const exRestSec = exercises[exIdx]?.restSec ?? restDurationSec;
    setRestTimer({ active: true, durationSec: exRestSec, total: exRestSec, started: Date.now(), exerciseName: exercises[exIdx]?.name });
  }, [exercises]);

  const skipSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const newSets = ex.sets.map((s, si) => si === setIdx ? { ...s, skipped: true } : s);
      return { ...ex, sets: newSets };
    }));
  }, []);

  const updateSetWeight = useCallback((exIdx, setIdx, weightKg) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const newSets = ex.sets.map((s, si) => si === setIdx ? { ...s, weightKg } : s);
      return { ...ex, sets: newSets };
    }));
  }, []);

  const updateSetReps = useCallback((exIdx, setIdx, reps) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const newSets = ex.sets.map((s, si) => si === setIdx ? { ...s, reps } : s);
      return { ...ex, sets: newSets };
    }));
  }, []);

  const dismissRestTimer = useCallback(() => setRestTimer(null), []);

  // ─── Exercise navigation ───────────────────────────────────────────────────
  const isCurrentExerciseComplete = useCallback(() => {
    const ex = exercises[currentExIdx];
    if (!ex) return true;
    return ex.sets.every(s => s.done || s.skipped);
  }, [exercises, currentExIdx]);

  const nextExercise = useCallback(() => {
    if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(i => i + 1);
      setRestTimer(null);
    } else {
      setPhase('stretch');
    }
  }, [currentExIdx, exercises.length]);

  const completeStretch = useCallback(() => setPhase('complete'), []);

  // ─── Save session ──────────────────────────────────────────────────────────
  const saveSession = useCallback((isEarly = false) => {
    const durationMin = Math.round((Date.now() - sessionStartTime) / 60000);
    const session = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      name: programDay?.name ?? 'Workout',
      tag: programDay?.tag ?? null,
      type: programDay?.type ?? 'workout',
      exercises: exercises.map(ex => ({
        name: ex.name,
        targetReps: ex.reps,
        sets: ex.sets,
      })),
      durationMin,
      isEarly,
      notes: sessionNotes,
    };
    saveWorkoutSession(session);
    advanceProgramDay();
    return session;
  }, [exercises, programDay, sessionStartTime, sessionNotes]);

  return {
    phase, setPhase,
    warmupChecks, toggleWarmup, completeWarmup,
    stretchChecks, toggleStretch, completeStretch,
    exercises, currentExIdx,
    checkSet, skipSet, updateSetWeight, updateSetReps,
    isCurrentExerciseComplete,
    nextExercise,
    restTimer, dismissRestTimer,
    sessionStartTime,
    sessionNotes, setSessionNotes,
    saveSession,
    SESSION_BUDGET_SEC,
  };
}
