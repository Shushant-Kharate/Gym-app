// program.js — 14-day workout program (full rewrite July 2026)
// Based on user's research doc + strength/hypertrophy/retest/specialist split
// DL 110kg, Squat 60kg, Bench 30kg — verify before Day 2/3 lock these numbers in
// restSec added per-exercise from the plan's prescribed rest intervals

export const PROGRAM_DAYS = [

  // ─────────────────────────────────────────────────────────────────────────────
  // WEEK 1
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Day 1: Push A — Chest / Front Delt / Triceps — Strength ─────────────────
  {
    dayIndex: 0,
    name: 'Push A',
    subtitle: 'Strength',
    type: 'strength',
    isRest: false,
    warmup: [
      'Arm circles — 2×15 each direction',
      'Band pull-aparts — 2×15',
      'Push-up — 2×10 (bodyweight, build rhythm)',
      'Bar-only bench press — ×10 (technique groove)',
    ],
    exercises: [
      {
        name: 'Barbell Bench Press',
        sets: 4, reps: '6–8', restSec: 150, rpeTarget: 9,
        suggestedWeightKg: 30,
        muscleGroups: ['chest', 'front delts', 'triceps'],
        isPrimary: true, cnsIntensity: 'high',
        videoUrl: null,
        notes: 'Primary push. Do NOT grind — stop at RPE 9. Use spotter or pins.',
      },
      {
        name: 'Overhead Press',
        sets: 3, reps: '8', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['front delts', 'lateral delts', 'triceps'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 3, reps: '8–10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['upper chest', 'front delts'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Lateral Raise',
        sets: 3, reps: '12–15', restSec: 60, rpeTarget: 9,
        suggestedWeightKg: 8,
        muscleGroups: ['lateral delts'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Triceps Pushdown',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['triceps'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Chest doorway stretch — 2×30s each side',
      'Overhead triceps stretch — 2×30s each side',
      'Shoulder cross-body stretch — 2×30s each side',
    ],
  },

  // ─── Day 2: Pull A — Lats / Rhomboids / Biceps — Strength ───────────────────
  {
    dayIndex: 1,
    name: 'Pull A',
    subtitle: 'Strength',
    type: 'strength',
    isRest: false,
    warmup: [
      'Cat-cow — 2×10',
      'Band pull-aparts — 2×15',
      'Dead hang — 2×20s',
      'Empty-bar Romanian deadlift — ×10 (hip-hinge groove)',
      'Light deadlift ramp-up: bar × 5, then 2 progressive heavier sets before working weight',
    ],
    exercises: [
      {
        name: 'Deadlift',
        sets: 4, reps: '5', restSec: 180, rpeTarget: 8,
        suggestedWeightKg: 110,
        muscleGroups: ['posterior chain', 'lats', 'traps', 'glutes', 'erectors'],
        isPrimary: true, cnsIntensity: 'very high',
        videoUrl: null,
        notes: 'Only heavy DL session. Stop at RPE 8 — do NOT grind. Bracing cue: fill belly 360° before each rep.',
      },
      {
        name: 'Pull-up / Lat Pulldown',
        sets: 4, reps: '8', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 55,
        muscleGroups: ['lats', 'biceps', 'upper back'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Pull-ups if able; lat pulldown otherwise.',
      },
      {
        name: 'Seated Cable Row',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 50,
        muscleGroups: ['rhomboids', 'mid traps', 'biceps'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Face Pull',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 18,
        muscleGroups: ['rear delts', 'external rotators'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Barbell Curl',
        sets: 3, reps: '10', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['biceps', 'brachialis'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Lat stretch (arm overhead, lean sideways) — 2×30s each side',
      'Child\'s pose — 1×45s',
      'Bicep wall stretch — 2×20s each side',
      'Seated forward fold (hamstrings / lower back) — 1×45s',
    ],
  },

  // ─── Day 3: Legs A — Quads / Glutes — Strength ───────────────────────────────
  {
    dayIndex: 2,
    name: 'Legs A',
    subtitle: 'Strength',
    type: 'strength',
    isRest: false,
    warmup: [
      'Bodyweight squats — 2×15',
      'Leg swings front-back and side-side — 10 each direction',
      'Walking lunges — 2×10',
      'Bar-only squat — ×10 (depth check)',
      'Ramp-up sets: light → moderate before working weight',
    ],
    exercises: [
      {
        name: 'Back Squat',
        sets: 5, reps: '5', restSec: 180, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['quads', 'glutes', 'erectors', 'core'],
        isPrimary: true, cnsIntensity: 'high',
        videoUrl: null,
        notes: 'Primary squat session. Heaviest of the cycle — stop at RPE 8, never grind.',
      },
      {
        name: 'Leg Press',
        sets: 3, reps: '10', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 100,
        muscleGroups: ['quads', 'glutes'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Leg Extension',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 40,
        muscleGroups: ['quads'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Standing Calf Raise',
        sets: 4, reps: '15', restSec: 60, rpeTarget: 9,
        suggestedWeightKg: 40,
        muscleGroups: ['calves (gastrocnemius)'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Hanging Leg Raise',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['core', 'hip flexors'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Standing quad stretch — 2×30s each side',
      'Standing calf stretch on wall — 2×30s each side',
      'Seated hamstring stretch — 2×30s each side',
      'Hip flexor lunge stretch — 2×30s each side',
    ],
  },

  // ─── Day 4: Shoulders + Stabilizers (rotator cuff, serratus, levator scapulae) ──
  {
    dayIndex: 3,
    name: 'Shoulders + Stabilizers',
    subtitle: 'Corrective',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Arm circles — 2×15 each direction',
      'Band external rotations — ×15 each side',
      'Scapular push-ups — 2×10',
      'Light shrugs — ×15',
    ],
    exercises: [
      {
        name: 'Seated Dumbbell Shoulder Press',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['front delts', 'lateral delts', 'triceps'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Side-Lying External Rotation',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 7,
        suggestedWeightKg: 3,
        muscleGroups: ['rotator cuff (infraspinatus, teres minor)'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Corrective — slow and controlled, never swing.',
      },
      {
        name: 'Band Internal Rotation',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 7,
        suggestedWeightKg: 0,
        muscleGroups: ['rotator cuff (subscapularis)'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Use light resistance band. Elbow fixed at 90°.',
      },
      {
        name: 'Push-Up Plus',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 7,
        suggestedWeightKg: 0,
        muscleGroups: ['serratus anterior', 'chest'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'At the top of each push-up, protract scapulae maximally (round upper back).',
      },
      {
        name: 'Shrug',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 30,
        muscleGroups: ['upper traps', 'levator scapulae'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Cross-body shoulder stretch — 2×30s each side',
      'Sleeper stretch (internal rotation) — 2×20s each side',
      'Upper trap stretch (ear to shoulder, gentle) — 2×20s each side',
    ],
  },

  // ─── Day 5: Posterior Chain + Core (hamstrings, erectors, obliques) ───────────
  {
    dayIndex: 4,
    name: 'Posterior Chain + Core',
    subtitle: 'Accessory',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Cat-cow — 2×10',
      'Bird dog — 2×10 each side',
      'Glute bridges — 2×15',
      'Bodyweight Romanian deadlift — ×10 (hip-hinge groove)',
    ],
    exercises: [
      {
        name: 'Romanian Deadlift',
        sets: 3, reps: '8', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['hamstrings', 'glutes', 'erectors'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Hinge at hip, keep bar close to shins. Feel hamstring stretch at bottom.',
      },
      {
        name: 'Back Extension',
        sets: 3, reps: '12', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['erector spinae', 'glutes'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Leg Curl',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 35,
        muscleGroups: ['hamstrings'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Cable Crunch',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['rectus abdominis', 'core'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Side Plank',
        sets: 2, reps: '30s/side', restSec: 45, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['obliques', 'core', 'glute medius'],
        isPrimary: false, cnsIntensity: 'low',
        isTimed: true, durationSec: 30,
        videoUrl: null,
      },
    ],
    stretches: [
      'Seated hamstring stretch — 2×30s each side',
      'Cobra stretch (lower back extension) — 1×30s',
      'Knee-to-chest stretch — 2×20s each side',
      'Standing side bend (obliques) — 2×20s each side',
    ],
  },

  // ─── Day 6: Arms + Forearms + Traps (only dedicated forearm/trap slot) ─────────
  {
    dayIndex: 5,
    name: 'Arms + Forearms + Traps',
    subtitle: 'Accessory',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Arm circles — 2×15 each direction',
      'Wrist circles + wrist flexor/extensor stretch prep — 2×10 each',
      'Light band curls — ×15',
      'Bodyweight dips — 2×8',
    ],
    exercises: [
      {
        name: 'Close-Grip Bench Press',
        sets: 3, reps: '8', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['triceps', 'chest'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Grip slightly narrower than shoulder width. Elbows tucked.',
      },
      {
        name: 'Hammer Curl',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 14,
        muscleGroups: ['biceps', 'brachialis', 'brachioradialis'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Dip',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['triceps', 'chest', 'front delts'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Use assisted machine if bodyweight is too challenging.',
      },
      {
        name: 'Wrist Curl / Reverse Wrist Curl',
        sets: 2, reps: '15 each', restSec: 45, rpeTarget: 7,
        suggestedWeightKg: 8,
        muscleGroups: ['forearm flexors', 'forearm extensors'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Do 15 wrist curls, then flip and do 15 reverse wrist curls = 1 set.',
      },
      {
        name: 'Rear Delt Fly',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 8,
        muscleGroups: ['rear delts', 'rhomboids'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Triceps overhead stretch — 2×30s each side',
      'Bicep wall stretch — 2×20s each side',
      'Wrist flexor stretch (palm down, press back) — 2×20s each',
      'Wrist extensor stretch (palm up, press down) — 2×20s each',
      'Upper trap stretch — 2×20s each side',
    ],
  },

  // ─── Day 7: Rest ──────────────────────────────────────────────────────────────
  {
    dayIndex: 6,
    name: 'Rest',
    subtitle: 'Recovery',
    type: 'rest',
    isRest: true,
    tips: [
      'Light walk 20–30 min optional',
      'Focus on hitting protein target today (most people under-eat on rest days)',
      'Prioritise sleep — aim for 7–9 hours',
      'Optional: 5–10 min gentle mobility (hip circles, cat-cow, shoulder rolls)',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WEEK 2
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Day 8: Push B — Chest / Delts — Hypertrophy ─────────────────────────────
  {
    dayIndex: 7,
    name: 'Push B',
    subtitle: 'Hypertrophy',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Arm circles — 2×15 each direction',
      'Band pull-aparts — 2×15',
      'Push-up — 2×10',
      'Light dumbbell press — ×12 (build to working weight)',
    ],
    exercises: [
      {
        name: 'Incline Dumbbell Press',
        sets: 4, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 16,
        muscleGroups: ['upper chest', 'front delts'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Incline push primary. Full stretch at bottom, squeeze at top.',
      },
      {
        name: 'Cable Fly',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 9,
        suggestedWeightKg: 12,
        muscleGroups: ['chest'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Flat Dumbbell Press',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 18,
        muscleGroups: ['chest', 'triceps', 'front delts'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Dumbbell Front Raise',
        sets: 2, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 6,
        muscleGroups: ['front delts'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Triceps Extension',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['triceps (long head)'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Chest doorway stretch — 2×30s each side',
      'Shoulder cross-body stretch — 2×30s each side',
      'Triceps overhead stretch — 2×30s each side',
    ],
  },

  // ─── Day 9: Pull B — Back / Biceps — Hypertrophy ─────────────────────────────
  {
    dayIndex: 8,
    name: 'Pull B',
    subtitle: 'Hypertrophy',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Cat-cow — 2×10',
      'Band pull-aparts — 2×15',
      'Dead hang — 2×20s',
      'Light lat pulldown — ×12 (technique warm-up)',
    ],
    exercises: [
      {
        name: 'Lat Pulldown',
        sets: 4, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 50,
        muscleGroups: ['lats', 'biceps'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Pull to upper chest, squeeze lats at bottom, control the eccentric.',
      },
      {
        name: 'Bent-Over Row',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 50,
        muscleGroups: ['rhomboids', 'lats', 'mid traps'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
      },
      {
        name: 'Straight-Arm Pulldown',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 20,
        muscleGroups: ['lats', 'teres major'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Chin-Up',
        sets: 3, reps: '8', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['biceps', 'lats'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Supinated (underhand) grip. Use assisted machine if needed.',
      },
      {
        name: 'Rear Delt Fly',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 8,
        muscleGroups: ['rear delts', 'rhomboids'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Lat stretch (arm overhead, lean sideways) — 2×30s each side',
      'Child\'s pose — 1×45s',
      'Bicep wall stretch — 2×20s each side',
    ],
  },

  // ─── Day 10: Legs B — Quads machine-emphasis — Hypertrophy ──────────────────
  {
    dayIndex: 9,
    name: 'Legs B',
    subtitle: 'Hypertrophy',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Bodyweight squats — 2×15',
      'Leg swings front-back and side-side — 10 each direction',
      'Walking lunges — 2×10',
      'Light squat ramp-up (bar only, then light plates)',
    ],
    exercises: [
      {
        name: 'Back Squat',
        sets: 4, reps: '8', restSec: 120, rpeTarget: 7,
        suggestedWeightKg: 50,
        muscleGroups: ['quads', 'glutes', 'core'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Second squat touch — moderate load, more volume. NOT max effort.',
      },
      {
        name: 'Leg Extension',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 40,
        muscleGroups: ['quads'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Leg Press',
        sets: 3, reps: '12', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 90,
        muscleGroups: ['quads', 'glutes'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Seated Calf Raise',
        sets: 4, reps: '15', restSec: 60, rpeTarget: 9,
        suggestedWeightKg: 30,
        muscleGroups: ['calves (soleus)'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Cable Crunch',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 25,
        muscleGroups: ['rectus abdominis', 'core'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
    ],
    stretches: [
      'Standing quad stretch — 2×30s each side',
      'Standing calf stretch on wall — 2×30s each side',
      'Seated hamstring stretch — 2×30s each side',
    ],
  },

  // ─── Day 11: Glutes + Hip Stabilizers (adductors, glute medius/minimus) ───────
  {
    dayIndex: 10,
    name: 'Glutes + Hip Stabilizers',
    subtitle: 'Specialist',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Glute bridges — 2×15',
      'Lateral band walk (light) — ×10 steps each way',
      'Bodyweight sumo squat — 2×12',
      'Hip circles — 10 each side',
    ],
    exercises: [
      {
        name: 'Hip Thrust',
        sets: 3, reps: '10', restSec: 90, rpeTarget: 8,
        suggestedWeightKg: 60,
        muscleGroups: ['glutes', 'hamstrings'],
        isPrimary: true, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Drive through heels, squeeze glutes hard at lockout. Pause 1s at top.',
      },
      {
        name: 'Lateral Band Walk',
        sets: 3, reps: '15 steps each way', restSec: 45, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['glute medius', 'glute minimus', 'TFL'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Use resistance band around ankles/knees. Stay low throughout.',
      },
      {
        name: 'Copenhagen Plank',
        sets: 2, reps: '20s each side', restSec: 45, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['adductors', 'core'],
        isPrimary: false, cnsIntensity: 'low',
        isTimed: true, durationSec: 20,
        videoUrl: null,
        notes: 'Side plank variation with top leg on bench. Keep hips level.',
      },
      {
        name: 'Sumo Squat',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 30,
        muscleGroups: ['adductors', 'glutes', 'quads'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Single-Leg Squat / Lunge',
        sets: 3, reps: '10 each leg', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 8,
        muscleGroups: ['glutes', 'quads', 'hip stabilizers'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'BW if single-leg squat is challenging; add 8kg DB if easy.',
      },
    ],
    stretches: [
      'Pigeon pose (glutes/hip external rotators) — 2×30s each side',
      'Standing quad stretch — 2×30s each side',
      'Butterfly stretch (adductors) — 1×45s',
      'Standing IT band stretch — 2×20s each side',
    ],
  },

  // ─── Day 12: Full-Body Power / Strength Retest ───────────────────────────────
  {
    dayIndex: 11,
    name: 'Full-Body Retest',
    subtitle: 'Strength',
    type: 'strength',
    isRest: false,
    warmup: [
      'Full dynamic flow: arm circles + leg swings + bodyweight squats 2×10 + glute bridges 2×15',
      'Bar-only deadlift — ×5',
      'Bar-only squat — ×5',
      'Bar-only bench — ×5',
      'Progressive ramp-up sets on each lift before working weight',
    ],
    exercises: [
      {
        name: 'Deadlift',
        sets: 3, reps: '5', restSec: 150, rpeTarget: 8,
        suggestedWeightKg: 100,
        muscleGroups: ['posterior chain', 'lats', 'traps', 'glutes', 'erectors'],
        isPrimary: true, cnsIntensity: 'high',
        videoUrl: null,
        notes: 'Moderate retest weight (100kg). Gauge form, speed, and feel vs Day 2.',
      },
      {
        name: 'Back Squat',
        sets: 3, reps: '5', restSec: 150, rpeTarget: 8,
        suggestedWeightKg: 55,
        muscleGroups: ['quads', 'glutes', 'erectors', 'core'],
        isPrimary: true, cnsIntensity: 'high',
        videoUrl: null,
        notes: 'Retest — between Day 3 strength (60kg) and Day 10 hypertrophy (50kg).',
      },
      {
        name: 'Bench Press',
        sets: 3, reps: '6', restSec: 120, rpeTarget: 8,
        suggestedWeightKg: 30,
        muscleGroups: ['chest', 'front delts', 'triceps'],
        isPrimary: true, cnsIntensity: 'high',
        videoUrl: null,
        notes: 'Same weight as Day 1 — compare speed and bar path.',
      },
      {
        name: 'Toe Raise',
        sets: 3, reps: '15', restSec: 45, rpeTarget: 7,
        suggestedWeightKg: 0,
        muscleGroups: ['tibialis anterior'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Often neglected — prevents shin splints and balances calf work.',
      },
      {
        name: 'Bulgarian Split Squat',
        sets: 3, reps: '10 each leg', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 10,
        muscleGroups: ['quads', 'glutes', 'hip stabilizers'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Rear foot elevated on bench. Control descent — do NOT collapse knee inward.',
      },
    ],
    stretches: [
      'Standing quad stretch — 2×20s each side',
      'Seated hamstring stretch — 2×20s each side',
      'Chest doorway stretch — 2×20s each side',
      'Child\'s pose — 1×45s',
    ],
  },

  // ─── Day 13: Core + Remaining Stabilizers Finisher ───────────────────────────
  {
    dayIndex: 12,
    name: 'Core + Stabilizers',
    subtitle: 'Finisher',
    type: 'hypertrophy',
    isRest: false,
    warmup: [
      'Cat-cow — 2×10',
      'Bird dog — 2×10 each side',
      'Bodyweight Russian twist — 2×15',
    ],
    exercises: [
      {
        name: 'Russian Twist',
        sets: 3, reps: '20', restSec: 45, rpeTarget: 8,
        suggestedWeightKg: 5,
        muscleGroups: ['obliques', 'core'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: '10 each side = 1 rep. Keep feet off floor for more challenge.',
      },
      {
        name: 'Hanging Leg Raise',
        sets: 3, reps: '12', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 0,
        muscleGroups: ['core', 'hip flexors', 'rectus abdominis'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
      },
      {
        name: 'Woodchop',
        sets: 3, reps: '12 each side', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 12,
        muscleGroups: ['obliques', 'core', 'shoulders'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Cable or dumbbell. High-to-low diagonal pull. Rotate through torso.',
      },
      {
        name: 'Prone Y-Raise',
        sets: 3, reps: '12', restSec: 45, rpeTarget: 7,
        suggestedWeightKg: 3,
        muscleGroups: ['lower traps', 'serratus anterior', 'posterior chain'],
        isPrimary: false, cnsIntensity: 'low',
        videoUrl: null,
        notes: 'Lie prone on incline bench. Raise arms to Y position — squeeze lower traps.',
      },
      {
        name: 'Kettlebell Swing',
        sets: 3, reps: '15', restSec: 60, rpeTarget: 8,
        suggestedWeightKg: 16,
        muscleGroups: ['glutes', 'hamstrings', 'core', 'erectors'],
        isPrimary: false, cnsIntensity: 'medium',
        videoUrl: null,
        notes: 'Hip-hinge power. Hike the bell back, drive hips forward explosively.',
      },
    ],
    stretches: [
      'Standing side bend (obliques) — 2×20s each side',
      'Cobra stretch (lower back) — 1×30s',
      'Knee-to-chest stretch — 2×20s each side',
      'Seated spinal twist — 2×20s each side',
    ],
  },

  // ─── Day 14: Rest ─────────────────────────────────────────────────────────────
  {
    dayIndex: 13,
    name: 'Rest',
    subtitle: 'Recovery',
    type: 'rest',
    isRest: true,
    tips: [
      'End-of-cycle rest — mandatory, not optional',
      'Log this week\'s lifts and compare to Day 1 baseline',
      'Take body measurements if not done this week',
      'Plan next cycle: note what was too heavy, too light, or ready for progression',
      'Optional: 5–10 min mobility only',
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the program day for a given cycle index (0–13) */
export function getDayByIndex(idx) {
  return PROGRAM_DAYS[idx % 14];
}

/** Returns the next non-rest training day after currentIdx */
export function getNextTrainingDay(currentIdx) {
  for (let i = 1; i <= 14; i++) {
    const day = PROGRAM_DAYS[(currentIdx + i) % 14];
    if (!day.isRest) return { day, offset: i };
  }
  return null;
}

/** CNS intensity weight for smart-merge decisions */
export const CNS_INTENSITY_ORDER = { 'very high': 4, 'high': 3, 'medium': 2, 'low': 1 };
