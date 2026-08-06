// analyticsCalc.js — exercise volume analytics & PR tracking
import { getWorkoutSessions } from '../db/storage';

/**
 * Get volume history for a specific exercise across all sessions
 * Volume = Σ(weight × reps) for completed sets
 * Returns [{ date, volume, maxWeight, bestSet: { weightKg, reps } }]
 */
export function getExerciseVolumeHistory(exerciseName) {
  const sessions = getWorkoutSessions();
  const history = [];

  for (const session of sessions) {
    const ex = session.exercises?.find(
      e => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (!ex) continue;

    const completedSets = (ex.sets ?? []).filter(s => s.done && !s.skipped);
    if (completedSets.length === 0) continue;

    const volume = completedSets.reduce((sum, s) => sum + (s.weightKg || 0) * (s.reps || 0), 0);
    const maxWeight = Math.max(...completedSets.map(s => s.weightKg || 0));
    const bestSet = completedSets.reduce((best, s) => {
      const v = (s.weightKg || 0) * (s.reps || 0);
      return v > (best.weightKg || 0) * (best.reps || 0) ? s : best;
    }, completedSets[0]);

    history.push({
      date: session.date,
      volume: Math.round(volume),
      maxWeight,
      bestSet: { weightKg: bestSet.weightKg, reps: bestSet.reps },
      setsCompleted: completedSets.length,
    });
  }

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get total session volume trend across all sessions
 * Returns [{ date, name, totalVolume, duration }]
 */
export function getSessionVolumeTrend() {
  const sessions = getWorkoutSessions();
  return sessions.map(session => {
    const totalVolume = (session.exercises ?? []).reduce((sum, ex) => {
      const exVol = (ex.sets ?? [])
        .filter(s => s.done && !s.skipped)
        .reduce((s, set) => s + (set.weightKg || 0) * (set.reps || 0), 0);
      return sum + exVol;
    }, 0);

    return {
      date: session.date,
      label: session.date.slice(5), // MM-DD for chart axis
      name: session.name ?? 'Workout',
      totalVolume: Math.round(totalVolume),
      duration: session.durationMin ?? 0,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get PR board — best weight for every exercise ever logged
 * Returns [{ name, weightKg, reps, date, volume }]
 */
export function getPRBoard() {
  const sessions = getWorkoutSessions();
  const prMap = new Map();

  for (const session of sessions) {
    for (const ex of (session.exercises ?? [])) {
      const completedSets = (ex.sets ?? []).filter(s => s.done && !s.skipped);
      for (const set of completedSets) {
        const current = prMap.get(ex.name);
        if (!current || set.weightKg > current.weightKg) {
          prMap.set(ex.name, {
            name: ex.name,
            weightKg: set.weightKg,
            reps: set.reps,
            date: session.date,
            volume: Math.round(set.weightKg * set.reps),
          });
        }
      }
    }
  }

  return [...prMap.values()].sort((a, b) => b.weightKg - a.weightKg);
}

/**
 * Get normalized lift comparison for Squat, Bench, Deadlift
 * Returns [{ lift, weight, normalized }] where normalized is 0–100 relative to max
 */
export function getLiftRadar() {
  const prs = getPRBoard();
  const targets = [
    { key: 'back squat', label: 'Squat' },
    { key: 'barbell bench press', label: 'Bench' },
    { key: 'deadlift', label: 'Deadlift' },
    { key: 'overhead press', label: 'OHP' },
    { key: 'bent-over row', label: 'Row' },
  ];

  const results = targets.map(t => {
    const pr = prs.find(p => p.name.toLowerCase().includes(t.key));
    return { lift: t.label, weight: pr?.weightKg ?? 0 };
  });

  const maxWeight = Math.max(...results.map(r => r.weight), 1);
  return results.map(r => ({
    ...r,
    normalized: Math.round((r.weight / maxWeight) * 100),
  }));
}

/**
 * Get all unique exercise names from session history
 */
export function getExerciseNames() {
  const sessions = getWorkoutSessions();
  const names = new Set();
  for (const session of sessions) {
    for (const ex of (session.exercises ?? [])) {
      names.add(ex.name);
    }
  }
  return [...names].sort();
}
