// program.js — repeatable 7-day fat-loss + muscle-retention plan
// Six training days, one full recovery day, and a 90-minute session ceiling.
// Loading is autoregulated: most work stops at RPE 8 (about 2 reps in reserve).

export const PROGRAM_DAYS = [
  {
    dayIndex: 0,
    name: 'Push A',
    subtitle: 'Bench Strength',
    type: 'strength',
    isRest: false,
    durationMin: 90,
    timePlan: '10 min warmup · 65 min lifting · 10 min easy cardio · 5 min cooldown',
    warmup: [
      'Brisk treadmill or bike — 4 min',
      'Arm circles — 1×15 each direction',
      'Band pull-aparts — 2×15',
      'Bench press ramp-up sets — bar, light, then moderate before working weight',
    ],
    exercises: [
      {
        name: 'Barbell Bench Press',
        sets: 4, reps: '5–6', restSec: 180, rpeTarget: 8,
        suggestedWeightKg: 30,
        muscleGroups: ['chest', 'front delts', 'triceps'],
        isPrimary: true, cnsIntensity: 'high', videoUrl: null,
        notes: 'Leave about 2 reps in reserve. Add weight only after all four sets reach 6 clean reps.',
      },
      {
        name: 'Overhead Press',
        sets: 3, reps: '6–8', restSec: 150, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['front delts', 'lateral delts', 'triceps'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 3, reps: '8–10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['upper chest', 'front delts', 'triceps'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Lateral Raise',
        sets: 3, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 8,
        muscleGroups: ['lateral delts'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Triceps Pushdown',
        sets: 3, reps: '10–12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['triceps'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Optional incline treadmill — 10 min easy Zone 2, only while under 90 min',
      'Chest doorway stretch — 1×30s each side',
      'Overhead triceps stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 1,
    name: 'Pull A',
    subtitle: 'Back Strength',
    type: 'strength',
    isRest: false,
    durationMin: 90,
    timePlan: '10 min warmup · 65 min lifting · 10 min easy cardio · 5 min cooldown',
    warmup: [
      'Easy rower — 4 min',
      'Dead hang — 2×20s',
      'Band pull-aparts — 2×15',
      'Light pulldown and cable-row ramp-up — 1 set each',
    ],
    exercises: [
      {
        name: 'Pull-up / Lat Pulldown',
        sets: 4, reps: '6–8', restSec: 150, rpeTarget: 8,
        suggestedWeightKg: 55,
        muscleGroups: ['lats', 'biceps', 'upper back'],
        isPrimary: true, cnsIntensity: 'medium', videoUrl: null,
        notes: 'Use the pulldown until every pull-up rep can be controlled through a full range.',
      },
      {
        name: 'Seated Cable Row',
        sets: 4, reps: '6–8', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 50,
        muscleGroups: ['rhomboids', 'mid traps', 'lats', 'biceps'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Face Pull',
        sets: 3, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 18,
        muscleGroups: ['rear delts', 'external rotators', 'mid traps'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Barbell Curl',
        sets: 3, reps: '8–10', restSec: 75, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['biceps', 'brachialis'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Hammer Curl',
        sets: 2, reps: '10–12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['biceps', 'brachialis', 'brachioradialis'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Optional incline treadmill — 10 min easy Zone 2, only while under 90 min',
      'Lat stretch — 1×30s each side',
      'Bicep wall stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 2,
    name: 'Legs A',
    subtitle: 'Squat Strength',
    type: 'strength',
    isRest: false,
    durationMin: 90,
    timePlan: '12 min warmup · 70 min lifting · 8 min cooldown',
    warmup: [
      'Bike or treadmill — 5 min',
      'Leg swings — 1×12 each direction per leg',
      'Bodyweight squat — 2×10',
      'Back-squat ramp-up sets — bar, light, then moderate before working weight',
    ],
    exercises: [
      {
        name: 'Back Squat',
        sets: 4, reps: '5–6', restSec: 180, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['quads', 'glutes', 'erectors', 'core'],
        isPrimary: true, cnsIntensity: 'high', videoUrl: null,
        notes: 'Controlled depth and bracing. Stop the set if position breaks down.',
      },
      {
        name: 'Romanian Deadlift',
        sets: 3, reps: '6–8', restSec: 150, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['hamstrings', 'glutes', 'erectors'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Leg Press',
        sets: 3, reps: '8–10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 100,
        muscleGroups: ['quads', 'glutes'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Leg Curl',
        sets: 3, reps: '10–12', restSec: 75, rpeTarget: 8,
        suggestedWeightKg: 35,
        muscleGroups: ['hamstrings'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Standing Calf Raise',
        sets: 3, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 40,
        muscleGroups: ['calves (gastrocnemius)'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Hanging Leg Raise',
        sets: 2, reps: '10–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['core', 'hip flexors'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Seated hamstring stretch — 1×30s each side',
      'Hip flexor lunge stretch — 1×30s each side',
      'Standing calf stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 3,
    name: 'Push B',
    subtitle: 'Chest + Delts Volume',
    type: 'hypertrophy',
    isRest: false,
    durationMin: 90,
    timePlan: '8 min warmup · 65 min lifting · 12 min easy cardio · 5 min cooldown',
    warmup: [
      'Brisk treadmill or bike — 4 min',
      'Arm circles — 1×15 each direction',
      'Band external rotation — 2×12 each side',
      'Light close-grip bench press — 2 ramp-up sets',
    ],
    exercises: [
      {
        name: 'Close-Grip Bench Press',
        sets: 3, reps: '8–10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['triceps', 'chest', 'front delts'],
        isPrimary: true, cnsIntensity: 'medium', videoUrl: null,
        notes: 'Use a comfortable shoulder-width grip; this is the second weekly bench-pattern exposure.',
      },
      {
        name: 'Seated Dumbbell Shoulder Press',
        sets: 3, reps: '8–10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['front delts', 'lateral delts', 'triceps'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Cable Fly',
        sets: 3, reps: '12–15', restSec: 75, rpeTarget: 8,
        suggestedWeightKg: 12,
        muscleGroups: ['chest'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Lateral Raise',
        sets: 3, reps: '15–20', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 6,
        muscleGroups: ['lateral delts'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Triceps Extension',
        sets: 3, reps: '10–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['triceps (long head)'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Push-Up Plus',
        sets: 2, reps: '12–15', restSec: 60, rpeTarget: 7,
        suggestedWeightKg: 0,
        muscleGroups: ['serratus anterior', 'chest'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Optional incline treadmill — 10–12 min easy Zone 2, only while under 90 min',
      'Chest doorway stretch — 1×30s each side',
      'Shoulder cross-body stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 4,
    name: 'Pull B',
    subtitle: 'Back + Rear Delt Volume',
    type: 'hypertrophy',
    isRest: false,
    durationMin: 90,
    timePlan: '8 min warmup · 65 min lifting · 12 min easy cardio · 5 min cooldown',
    warmup: [
      'Easy rower — 4 min',
      'Cat-cow — 1×10',
      'Band pull-aparts — 2×15',
      'Light pulldown and cable-row ramp-up — 1 set each',
    ],
    exercises: [
      {
        name: 'Lat Pulldown',
        sets: 3, reps: '10–12', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 50,
        muscleGroups: ['lats', 'biceps'],
        isPrimary: true, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Seated Cable Row',
        sets: 3, reps: '10–12', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 45,
        muscleGroups: ['rhomboids', 'mid traps', 'lats', 'biceps'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
        notes: 'Use this supported row to keep the lower back fresh for tomorrow’s deadlift.',
      },
      {
        name: 'Straight-Arm Pulldown',
        sets: 2, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['lats', 'teres major'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Rear Delt Fly',
        sets: 3, reps: '15–20', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 8,
        muscleGroups: ['rear delts', 'rhomboids'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Hammer Curl',
        sets: 3, reps: '10–12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['biceps', 'brachialis', 'brachioradialis'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Optional incline treadmill — 10–12 min easy Zone 2, only while under 90 min',
      'Lat stretch — 1×30s each side',
      'Upper trap stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 5,
    name: 'Legs B',
    subtitle: 'Deadlift + Lower Volume',
    type: 'strength',
    isRest: false,
    durationMin: 90,
    timePlan: '12 min warmup · 70 min lifting · 8 min cooldown',
    warmup: [
      'Bike or treadmill — 5 min',
      'Hip circles — 1×12 each direction',
      'Glute bridge — 2×12',
      'Deadlift ramp-up sets — light, moderate, then one near-working set',
    ],
    exercises: [
      {
        name: 'Deadlift',
        sets: 3, reps: '3–5', restSec: 180, rpeTarget: 8,
        suggestedWeightKg: 110,
        muscleGroups: ['posterior chain', 'lats', 'traps', 'glutes', 'erectors'],
        isPrimary: true, cnsIntensity: 'very high', videoUrl: null,
        notes: 'Only three working sets. No grinders; keep roughly 2 reps in reserve.',
      },
      {
        name: 'Hip Thrust',
        sets: 3, reps: '8–10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['glutes', 'hamstrings'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Bulgarian Split Squat',
        sets: 3, reps: '8–10 each leg', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 10,
        muscleGroups: ['quads', 'glutes', 'hip stabilizers'],
        isPrimary: false, cnsIntensity: 'medium', videoUrl: null,
      },
      {
        name: 'Leg Extension',
        sets: 2, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 40,
        muscleGroups: ['quads'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Seated Calf Raise',
        sets: 3, reps: '12–20', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 30,
        muscleGroups: ['calves (soleus)'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
      {
        name: 'Cable Crunch',
        sets: 3, reps: '12–15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['rectus abdominis', 'core'],
        isPrimary: false, cnsIntensity: 'low', videoUrl: null,
      },
    ],
    stretches: [
      'Seated hamstring stretch — 1×30s each side',
      'Knee-to-chest stretch — 1×30s each side',
      'Standing quad stretch — 1×30s each side',
    ],
  },
  {
    dayIndex: 6,
    name: 'Rest',
    subtitle: 'Full Recovery',
    type: 'rest',
    isRest: true,
    durationMin: 0,
    tips: [
      'No lifting today — the cycle restarts with Push A tomorrow',
      'Optional easy walk for 20–40 minutes; do not turn it into hard conditioning',
      'Keep protein and calorie targets consistent',
      'Aim for 7–9 hours of sleep and normal hydration',
      'If fatigue is accumulating, use this day to begin a deload cycle',
    ],
  },
];

export const PROGRAM_CYCLE_LENGTH = PROGRAM_DAYS.length;
export const SESSION_BUDGET_MIN = 90;

function normalizeIndex(idx) {
  const numeric = Number.isInteger(idx) ? idx : 0;
  return ((numeric % PROGRAM_CYCLE_LENGTH) + PROGRAM_CYCLE_LENGTH) % PROGRAM_CYCLE_LENGTH;
}

/** Returns the program day for any repeating cycle index. */
export function getDayByIndex(idx) {
  return PROGRAM_DAYS[normalizeIndex(idx)];
}

/** Returns the next non-rest training day after currentIdx. */
export function getNextTrainingDay(currentIdx) {
  for (let i = 1; i <= PROGRAM_CYCLE_LENGTH; i++) {
    const day = getDayByIndex(currentIdx + i);
    if (!day.isRest) return { day, offset: i };
  }
  return null;
}

/** CNS intensity weight for smart-merge decisions. */
export const CNS_INTENSITY_ORDER = { 'very high': 4, 'high': 3, 'medium': 2, 'low': 1 };
