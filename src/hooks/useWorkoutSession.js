// useWorkoutSession.js — active session state machine
import { useState, useCallback, useEffect } from 'react';
import {
  saveWorkoutSession, advanceProgramDay, getActiveWorkoutDraft,
  saveActiveWorkoutDraft, clearActiveWorkoutDraft,
} from '../db/storage';
import { suggestNextWeight } from '../logic/progressiveOverload';
import { toLocalDateString } from '../utils/dateUtils';
import { SESSION_BUDGET_MIN } from '../data/program';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function parseRepRange(reps) {
  const numbers = String(reps).match(/\d+/g)?.map(Number) ?? [];
  return {
    min: numbers[0] || 8,
    max: numbers[1] || numbers[0] || 8,
  };
}

/**
 * Initialise an exercise list with suggested weights and empty set tracking
 */
function initExercises(programExercises) {
  return programExercises.map(ex => {
    const suggestion = suggestNextWeight(ex.name, ex.suggestedWeightKg);
    const target = parseRepRange(ex.reps);
    return {
      ...ex,
      targetRepsMin: target.min,
      targetRepsMax: target.max,
      suggestedResult: suggestion,
      sets: Array.from({ length: ex.sets }, () => ({
        weightKg: suggestion.weightKg,
        reps: target.min,
        done: false,
        skipped: false,
      })),
    };
  });
}

export function useWorkoutSession(programDay) {
  const SESSION_BUDGET_SEC = SESSION_BUDGET_MIN * 60;
  const [restoredDraft] = useState(() => {
    const draft = getActiveWorkoutDraft();
    return draft?.programDay?.dayIndex === programDay?.dayIndex ? draft : null;
  });

  const [phase, setPhase] = useState(restoredDraft?.phase ?? 'warmup');
  const [warmupChecks, setWarmupChecks] = useState(
    () => restoredDraft?.warmupChecks ?? (programDay?.warmup ?? []).map(() => false)
  );
  const [stretchChecks, setStretchChecks] = useState(
    () => restoredDraft?.stretchChecks ?? (programDay?.stretches ?? []).map(() => false)
  );
  const [exercises, setExercises] = useState(
    () => restoredDraft?.exercises ?? initExercises(programDay?.exercises ?? [])
  );
  const [currentExIdx, setCurrentExIdx] = useState(restoredDraft?.currentExIdx ?? 0);
  const [restTimer, setRestTimer] = useState(null); // { active, secondsLeft, exerciseName }
  const [sessionStartTime] = useState(() => restoredDraft?.sessionStartTime ?? Date.now());
  const [sessionNotes, setSessionNotes] = useState(restoredDraft?.sessionNotes ?? '');

  useEffect(() => {
    if (phase === 'complete') return;
    saveActiveWorkoutDraft({
      programDay, phase, warmupChecks, stretchChecks, exercises,
      currentExIdx, sessionStartTime, sessionNotes,
    });
  }, [programDay, phase, warmupChecks, stretchChecks, exercises, currentExIdx, sessionStartTime, sessionNotes]);

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
    // The duration passed by WorkoutMode reflects the user's saved settings.
    const exRestSec = restDurationSec;
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
    const completedSetCount = exercises.reduce(
      (total, exercise) => total + exercise.sets.filter(set => set.done).length,
      0
    );
    const session = {
      id: uid(),
      date: toLocalDateString(),
      name: programDay?.name ?? 'Workout',
      tag: programDay?.tag ?? null,
      type: programDay?.type ?? 'workout',
      exercises: exercises.map(ex => ({
        name: ex.name,
        targetReps: ex.reps,
        targetRepsMin: ex.targetRepsMin,
        targetRepsMax: ex.targetRepsMax,
        sets: ex.sets,
      })),
      durationMin,
      isEarly,
      notes: sessionNotes,
    };
    saveWorkoutSession(session);
    clearActiveWorkoutDraft();
    // An accidental empty early exit should not silently skip a program day.
    if (!isEarly || completedSetCount > 0) {
      advanceProgramDay(programDay?.dayIndex);
    }
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
