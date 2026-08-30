// progressiveOverload.js — deterministic weight suggestion logic
// No AI involved — pure math based on last session's performance

import { getWorkoutSessions } from '../db/storage.js';

/**
 * Suggest weight for next session
 * Logic:
 *   - If all sets reached the top of the prescribed rep range → +2.5kg
 *   - Otherwise hold the same weight and build reps first
 *   - If no history → return the program's default suggested weight
 */
export function suggestNextWeight(exerciseName, defaultWeightKg) {
  const sessions = getWorkoutSessions();
  // Find last session that included this exercise
  let lastExercise = null;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises?.find(
      e => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (ex) { lastExercise = ex; break; }
  }

  if (!lastExercise) {
    return {
      weightKg: defaultWeightKg,
      rationale: 'No history — using program default',
      isFirst: true,
    };
  }

  const progressionTarget = lastExercise.targetRepsMax ?? lastExercise.targetRepsMin ?? 0;
  const allSetsComplete = lastExercise.sets.every(s => s.done && s.reps >= progressionTarget);
  const lastWeight = lastExercise.sets[0]?.weightKg ?? defaultWeightKg;

  if (allSetsComplete) {
    return {
      weightKg: lastWeight + 2.5,
      rationale: `Top of rep range reached (${lastWeight}kg) → +2.5kg`,
      delta: 2.5,
    };
  } else {
    return {
      weightKg: lastWeight,
      rationale: `Build reps before adding load — hold at ${lastWeight}kg`,
      delta: 0,
    };
  }
}

/**
 * Detect if the squat/bench gap vs deadlift is widening
 * Returns flag if deadlift is growing faster than squat or bench
 */
export function detectLiftImbalance(sessions) {
  const getProgression = (name) => {
    const lifts = sessions
      .map(s => s.exercises?.find(e => e.name.toLowerCase().includes(name.toLowerCase())))
      .filter(Boolean)
      .map(e => e.sets?.[0]?.weightKg ?? 0)
      .filter(w => w > 0);
    if (lifts.length < 2) return null;
    return {
      start: lifts[0],
      current: lifts[lifts.length - 1],
      delta: lifts[lifts.length - 1] - lifts[0],
    };
  };

  const dl = getProgression('deadlift');
  const sq = getProgression('squat');
  const bp = getProgression('bench');

  if (!dl || (!sq && !bp)) return null;

  const flags = [];
  if (sq && dl.delta > 0 && sq.delta < dl.delta * 0.5) {
    flags.push(`Squat (+${sq.delta}kg) is lagging behind deadlift (+${dl.delta}kg). Consider adding a third squat session or more volume.`);
  }
  if (bp && dl.delta > 0 && bp.delta < dl.delta * 0.5) {
    flags.push(`Bench (+${bp.delta}kg) is lagging behind deadlift (+${dl.delta}kg). This is expected but monitor it.`);
  }

  return flags.length > 0 ? flags : null;
}

/**
 * Get PRs for a given exercise across all sessions
 */
export function getExercisePR(exerciseName) {
  const sessions = getWorkoutSessions();
  let maxWeight = 0;
  let prDate = null;
  for (const session of sessions) {
    const ex = session.exercises?.find(
      e => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (ex) {
      const w = Math.max(...(ex.sets?.map(s => s.weightKg) ?? [0]));
      if (w > maxWeight) { maxWeight = w; prDate = session.date; }
    }
  }
  return maxWeight > 0 ? { weightKg: maxWeight, date: prDate } : null;
}

/**
 * Estimate 1-Rep Max using the Epley formula
 * 1RM = weight × (1 + reps / 30)
 * Only valid for reps 1–15; returns null for bodyweight (0kg) or >15 reps
 */
export function calc1RM(weightKg, reps) {
  if (!weightKg || weightKg <= 0 || !reps || reps <= 0) return null;
  if (reps === 1) return { value: weightKg, formula: `1RM = ${weightKg}kg (actual single)` };
  if (reps > 15) return null; // Epley loses accuracy above 15 reps
  const oneRM = Math.round(weightKg * (1 + reps / 30) * 10) / 10;
  return {
    value: oneRM,
    formula: `${weightKg}kg × (1 + ${reps}/30) = ${oneRM}kg`,
  };
}

/**
 * Calculate training load targets as percentages of 1RM
 * Returns targets for common intensity zones
 */
export function calcLoadTargets(oneRepMax) {
  if (!oneRepMax || oneRepMax <= 0) return null;
  return [
    { pct: 90, label: 'Heavy Singles', kg: Math.round(oneRepMax * 0.90 * 2) / 2 },
    { pct: 85, label: 'Strength', kg: Math.round(oneRepMax * 0.85 * 2) / 2 },
    { pct: 80, label: 'Power', kg: Math.round(oneRepMax * 0.80 * 2) / 2 },
    { pct: 70, label: 'Hypertrophy', kg: Math.round(oneRepMax * 0.70 * 2) / 2 },
    { pct: 60, label: 'Endurance', kg: Math.round(oneRepMax * 0.60 * 2) / 2 },
  ];
}
