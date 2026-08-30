// skipMerge.js — Smart Merge algorithm (Section 8 of the spec)
// Given a skipped day A and next scheduled day B, produces a blended session

import { CNS_INTENSITY_ORDER, SESSION_BUDGET_MIN } from '../data/program';

/**
 * Build a Smart Merged session from two program days
 * @param {Object} dayA - the skipped day's program data
 * @param {Object} dayB - the next scheduled training day's program data
 * @returns {Object} merged session object
 */
export function buildMergedSession(dayA, dayB) {
  if (!dayA || dayA.isRest) {
    // Nothing to merge from a rest day — just return B as-is
    return { ...dayB, tag: `Merged: Rest + ${dayB.name}` };
  }
  if (!dayB || dayB.isRest) {
    return { ...dayA, tag: `Merged: ${dayA.name} + Rest` };
  }

  // Step 1: Identify A's primary lift
  const aPrimary = dayA.exercises.find(e => e.isPrimary) ?? dayA.exercises[0];

  // Step 2: Find muscle groups covered by B
  const bMuscleGroups = new Set(
    dayB.exercises.flatMap(e => e.muscleGroups.map(m => m.toLowerCase()))
  );

  // Step 3: Find A's exercises that cover muscle groups NOT in B
  const uniqueAExercises = dayA.exercises.filter(
    e => !e.isPrimary && e.muscleGroups.some(m => !bMuscleGroups.has(m.toLowerCase()))
  );

  // Keep at most 2 unique exercises from A (excluding A's primary which gets special treatment)
  const keptFromA = uniqueAExercises
    .sort((a, b) => (CNS_INTENSITY_ORDER[b.cnsIntensity] ?? 0) - (CNS_INTENSITY_ORDER[a.cnsIntensity] ?? 0))
    .slice(0, 2);

  // Step 4: Build merged exercise list
  // B's primary comes first, A's primary is inserted after warmup (before B's primary if A is more CNS intensive)
  const aCnsScore = CNS_INTENSITY_ORDER[aPrimary.cnsIntensity] ?? 0;
  const bPrimary = dayB.exercises.find(e => e.isPrimary) ?? dayB.exercises[0];
  const bCnsScore = CNS_INTENSITY_ORDER[bPrimary?.cnsIntensity ?? 'low'] ?? 0;

  let mergedExercises = [];

  if (aCnsScore >= bCnsScore) {
    // A's primary is more CNS intensive — do it first
    mergedExercises = [
      aPrimary,
      ...dayB.exercises,
      ...keptFromA,
    ];
  } else {
    // B's primary comes first
    mergedExercises = [
      ...dayB.exercises,
      aPrimary,
      ...keptFromA,
    ];
  }

  // Step 5: Reduce volume by ~35% across all exercises
  mergedExercises = reduceVolume(mergedExercises, 0.35);

  // Step 6: Cap at time budget by dropping low-priority accessories
  mergedExercises = fitToTimeBudget(mergedExercises, SESSION_BUDGET_MIN);

  return {
    dayIndex: dayB.dayIndex,
    name: `${dayA.name} + ${dayB.name}`,
    subtitle: 'Smart Merge',
    type: 'merged',
    isRest: false,
    tag: `Merged: ${dayA.name} + ${dayB.name}`,
    warmup: [...new Set([...(dayA.warmup ?? []), ...(dayB.warmup ?? [])])].slice(0, 6),
    exercises: mergedExercises,
    stretches: [...new Set([...(dayA.stretches ?? []), ...(dayB.stretches ?? [])])].slice(0, 6),
    mergeDetails: {
      dayAName: dayA.name,
      dayBName: dayB.name,
      primaryFromA: aPrimary.name,
      keptFromA: keptFromA.map(e => e.name),
      volumeReductionPercent: 35,
    },
  };
}

/**
 * Reduce set counts across all exercises by reductionFactor (0.35 = 35%)
 * Minimum 2 sets for compound, 2 sets for accessory
 */
export function reduceVolume(exercises, reductionFactor = 0.35) {
  return exercises.map(ex => ({
    ...ex,
    sets: Math.max(
      ex.isPrimary ? 3 : 2,
      Math.round(ex.sets * (1 - reductionFactor))
    ),
  }));
}

/**
 * Estimate session time and drop lowest-priority exercises if over budget
 * Rough time estimate: each exercise = (sets × 2.5min avg) + rest
 * Warmup = 10min, Stretch = 10min
 */
export function fitToTimeBudget(exercises, budgetMinutes = SESSION_BUDGET_MIN) {
  const WARMUP_STRETCH_MIN = 20;
  const estimateExerciseMin = (ex) => ex.sets * 2.5; // avg 2.5 min per set (work + rest)

  let totalMin = WARMUP_STRETCH_MIN + exercises.reduce((sum, ex) => sum + estimateExerciseMin(ex), 0);

  if (totalMin <= budgetMinutes) return exercises;

  // Sort: primaries first, then by CNS intensity desc (isolations dropped first)
  const sorted = [...exercises].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return (CNS_INTENSITY_ORDER[b.cnsIntensity] ?? 0) - (CNS_INTENSITY_ORDER[a.cnsIntensity] ?? 0);
  });

  const kept = [];
  let runningMin = WARMUP_STRETCH_MIN;
  for (const ex of sorted) {
    const exMin = estimateExerciseMin(ex);
    if (runningMin + exMin <= budgetMinutes) {
      kept.push(ex);
      runningMin += exMin;
    }
  }

  // Re-sort back to a sensible order: compounds first, then accessories
  return kept.sort((a, b) => (CNS_INTENSITY_ORDER[b.cnsIntensity] ?? 0) - (CNS_INTENSITY_ORDER[a.cnsIntensity] ?? 0));
}

/**
 * Get the three skip-day options to present to the user
 */
export function getSkipOptions(skippedDay, nextTrainingDay) {
  return [
    {
      id: 'shift',
      label: 'Shift Remaining',
      description: 'Push every upcoming day back by one. Cycle runs a day longer this rotation.',
      icon: 'ArrowRight',
    },
    {
      id: 'skip_log',
      label: 'Skip & Log',
      description: `Log ${skippedDay.name} as skipped and stay on schedule. Those muscle groups are missed this cycle.`,
      icon: 'X',
    },
    {
      id: 'smart_merge',
      label: 'Smart Merge',
      description: `Blend ${skippedDay.name} into ${nextTrainingDay.name} — keeps key exercises from both without doubling volume.`,
      icon: 'Shuffle',
      recommended: true,
    },
  ];
}
