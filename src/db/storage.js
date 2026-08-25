// storage.js — all localStorage I/O goes through here
// Never call localStorage directly elsewhere in the app
import { DEFAULT_EXERCISE_VIDEOS } from '../data/defaultVideos.js';
import { toLocalDateString } from '../utils/dateUtils.js';

const EXERCISE_VIDEO_ALIASES = {
  'Pull-up / Lat Pulldown': 'Pull-up',
  'Wrist Curl / Reverse Wrist Curl': 'Wrist Curl',
  'Bench Press': 'Barbell Bench Press',
};

const KEYS = {
  PROFILE: 'ig_profile',
  BODY_LOGS: 'ig_body_logs',
  NUTRITION_LOGS: 'ig_nutrition_logs',
  FOOD_LIBRARY: 'ig_food_library',
  WORKOUT_SESSIONS: 'ig_workout_sessions',
  PROGRAM_STATE: 'ig_program_state',
  SETTINGS: 'ig_settings',
  EXERCISE_VIDEOS: 'ig_exercise_videos',  // { [exerciseName]: youtubeUrl }
  ACTIVE_WORKOUT: 'ig_active_workout',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', key, e);
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'Shushant',
  age: 20,
  heightCm: 182,
  currentWeightKg: 97.5,
  goalWeightKg: 90.5,           // realistc 60-day midpoint of 4-7kg loss
  startDate: toLocalDateString(),
  programStartDate: toLocalDateString(),
  // Lift baselines
  deadlift1RMkg: 110,
  squat1RMkg: 60,
  bench1RMkg: 30,
  // Body baselines
  waistCm: 106.7,               // 42 in ≈ 106.7 cm
  chestCm: 106.7,               // 42 in ≈ 106.7 cm
  stomachCm: 111.8,             // 44 in ≈ 111.8 cm
};

export function getProfile() {
  return read(KEYS.PROFILE) ?? DEFAULT_PROFILE;
}

export function saveProfile(profile) {
  write(KEYS.PROFILE, profile);
}

// ─── Body Logs ───────────────────────────────────────────────────────────────
export function getBodyLogs() {
  return read(KEYS.BODY_LOGS) ?? [];
}

export function addBodyLog(log) {
  const logs = getBodyLogs();
  const idx = logs.findIndex(l => l.date === log.date);
  if (idx >= 0) logs[idx] = log; else logs.push(log);
  logs.sort((a, b) => a.date.localeCompare(b.date));
  write(KEYS.BODY_LOGS, logs);
}

// ─── Nutrition Logs ──────────────────────────────────────────────────────────
export function getNutritionLogs() {
  return read(KEYS.NUTRITION_LOGS) ?? [];
}

export function getNutritionLogForDate(date) {
  const logs = getNutritionLogs();
  return logs.find(l => l.date === date) ?? { date, meals: [], totals: { kcal: 0, proteinG: 0 } };
}

export function saveNutritionLog(log) {
  const logs = getNutritionLogs();
  const idx = logs.findIndex(l => l.date === log.date);
  if (idx >= 0) logs[idx] = log; else logs.push(log);
  logs.sort((a, b) => a.date.localeCompare(b.date));
  write(KEYS.NUTRITION_LOGS, logs);
}

// ─── Food Library ─────────────────────────────────────────────────────────────
export function getFoodLibrary() {
  return read(KEYS.FOOD_LIBRARY);  // null = use bundled data
}

export function saveFoodLibrary(foods) {
  write(KEYS.FOOD_LIBRARY, foods);
}

// ─── Workout Sessions ────────────────────────────────────────────────────────
export function getWorkoutSessions() {
  return read(KEYS.WORKOUT_SESSIONS) ?? [];
}

export function saveWorkoutSession(session) {
  const sessions = getWorkoutSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session; else sessions.push(session);
  sessions.sort((a, b) => a.date.localeCompare(b.date));
  write(KEYS.WORKOUT_SESSIONS, sessions);
}

export function getLastSessionForExercise(exerciseName) {
  const sessions = getWorkoutSessions();
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises?.find(
      e => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (ex) return ex;
  }
  return null;
}

// ─── Active Workout Draft ───────────────────────────────────────────────────
export function getActiveWorkoutDraft() {
  return read(KEYS.ACTIVE_WORKOUT);
}

export function saveActiveWorkoutDraft(draft) {
  write(KEYS.ACTIVE_WORKOUT, draft);
}

export function clearActiveWorkoutDraft() {
  localStorage.removeItem(KEYS.ACTIVE_WORKOUT);
}

// ─── Program State ───────────────────────────────────────────────────────────
const DEFAULT_PROGRAM_STATE = {
  cycleStart: toLocalDateString(),
  currentDayIndex: 0,   // 0-13 in the 14-day cycle
  mergeHistory: [],
  skippedDays: [],
};

export function getProgramState() {
  return read(KEYS.PROGRAM_STATE) ?? DEFAULT_PROGRAM_STATE;
}

export function saveProgramState(state) {
  write(KEYS.PROGRAM_STATE, state);
}

export function advanceProgramDay(completedDayIndex = null) {
  const state = getProgramState();
  const baseIndex = Number.isInteger(completedDayIndex)
    ? completedDayIndex
    : state.currentDayIndex;
  state.currentDayIndex = (baseIndex + 1) % 14;
  write(KEYS.PROGRAM_STATE, state);
  return state;
}

// ─── Settings ────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  geminiKey: '',
  audioEnabled: true,
  restTimerStrengthSec: 180,
  restTimerHypertrophySec: 90,
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(read(KEYS.SETTINGS) ?? {}) };
}

export function saveSettings(settings) {
  write(KEYS.SETTINGS, settings);
}

// ─── Exercise Videos ────────────────────────────────────────────────────────
// Stores a flat map: { "Barbell Bench Press": "https://youtube.com/..." }
export function getExerciseVideos() {
  const custom = read(KEYS.EXERCISE_VIDEOS);
  const videos = { ...DEFAULT_EXERCISE_VIDEOS };
  for (const [name, url] of Object.entries(custom ?? {})) {
    if (url) videos[name] = url;
    else delete videos[name];
  }
  return videos;
}

export function getVideoForExercise(name) {
  const map = getExerciseVideos();
  return map[name] ?? map[EXERCISE_VIDEO_ALIASES[name]] ?? null;
}

export function saveVideoForExercise(name, url) {
  const custom = read(KEYS.EXERCISE_VIDEOS) ?? {};
  custom[name] = url || null; // null is a persistent tombstone for bundled defaults
  write(KEYS.EXERCISE_VIDEOS, custom);
}

export function clearVideoForExercise(name) {
  saveVideoForExercise(name, null);
}

// ─── Export All ──────────────────────────────────────────────────────────────
export function exportAllData() {
  return {
    profile: getProfile(),
    bodyLogs: getBodyLogs(),
    nutritionLogs: getNutritionLogs(),
    foodLibrary: getFoodLibrary(),
    workoutSessions: getWorkoutSessions(),
    programState: getProgramState(),
    exerciseVideos: getExerciseVideos(),
    settings: { ...getSettings(), geminiKey: '[REDACTED]' },
    exportedAt: new Date().toISOString(),
  };
}

export function resetAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
