import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_EXERCISE_VIDEOS } from '../src/data/defaultVideos.js';
import { PROGRAM_DAYS, PROGRAM_CYCLE_LENGTH, SESSION_BUDGET_MIN } from '../src/data/program.js';
import { toLocalDateString } from '../src/utils/dateUtils.js';

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
  clear: () => values.clear(),
};

const storage = await import('../src/db/storage.js');
const { suggestNextWeight } = await import('../src/logic/progressiveOverload.js');
const { findMatchingExerciseVideo } = await import('../src/utils/videoUtils.js');

test.beforeEach(() => localStorage.clear());

test('advances from the workout that was actually completed', () => {
  storage.saveProgramState({ currentDayIndex: 0, mergeHistory: [], skippedDays: [] });
  const next = storage.advanceProgramDay(5);
  assert.equal(next.currentDayIndex, 6);
});

test('the seven-day plan wraps cleanly after its rest day', () => {
  assert.equal(PROGRAM_CYCLE_LENGTH, 7);
  storage.saveProgramState({ currentDayIndex: 6, mergeHistory: [], skippedDays: [] });
  assert.equal(storage.advanceProgramDay(6).currentDayIndex, 0);
});

test('the repeatable plan has six workouts, one rest day, and a 90-minute ceiling', () => {
  assert.equal(PROGRAM_DAYS.filter(day => !day.isRest).length, 6);
  assert.equal(PROGRAM_DAYS.filter(day => day.isRest).length, 1);
  for (const day of PROGRAM_DAYS.filter(day => !day.isRest)) {
    assert.equal(day.durationMin, SESSION_BUDGET_MIN);
    assert.ok(day.exercises.reduce((sum, exercise) => sum + exercise.sets, 0) <= 18);
    assert.ok(day.exercises.every(exercise => exercise.rpeTarget <= 8));
  }
});

test('every main exercise in the new plan has a bundled form video', () => {
  for (const day of PROGRAM_DAYS.filter(day => !day.isRest)) {
    for (const exercise of day.exercises) {
      assert.ok(storage.getVideoForExercise(exercise.name), `${exercise.name} is missing a video`);
    }
  }
});

test('does not increase weight when target reps were missed', () => {
  storage.saveWorkoutSession({
    id: 'previous', date: '2026-08-20', exercises: [{
      name: 'Barbell Bench Press', targetRepsMin: 8,
      sets: [{ weightKg: 30, reps: 6, done: true, skipped: false }],
    }],
  });
  assert.equal(suggestNextWeight('Barbell Bench Press', 20).weightKg, 30);
});

test('double progression holds weight until the top of the rep range is reached', () => {
  storage.saveWorkoutSession({
    id: 'volume', date: '2026-08-21', exercises: [{
      name: 'Incline Dumbbell Press', targetRepsMin: 8, targetRepsMax: 10,
      sets: [
        { weightKg: 14, reps: 8, done: true, skipped: false },
        { weightKg: 14, reps: 9, done: true, skipped: false },
        { weightKg: 14, reps: 8, done: true, skipped: false },
      ],
    }],
  });
  assert.equal(suggestNextWeight('Incline Dumbbell Press', 12).weightKg, 14);
});

test('clearing a bundled video persists as a tombstone', () => {
  const name = Object.keys(DEFAULT_EXERCISE_VIDEOS)[0];
  assert.ok(storage.getVideoForExercise(name));
  storage.clearVideoForExercise(name);
  assert.equal(storage.getVideoForExercise(name), null);
});

test('combined program exercise names resolve to bundled videos', () => {
  assert.ok(storage.getVideoForExercise('Pull-up / Lat Pulldown'));
  assert.ok(storage.getVideoForExercise('Wrist Curl / Reverse Wrist Curl'));
  assert.ok(storage.getVideoForExercise('Bench Press'));
});

test('natural-language routine instructions resolve to form videos', () => {
  const videos = storage.getExerciseVideos();
  assert.equal(findMatchingExerciseVideo('Bar-only bench press — ×10', videos)?.name, 'Barbell Bench Press');
  assert.equal(findMatchingExerciseVideo('Triceps overhead stretch — 30s', videos)?.name, 'Overhead Triceps Stretch');
  assert.equal(findMatchingExerciseVideo('Light squat ramp-up (bar only)', videos)?.name, 'Back Squat');
});

test('data export includes food and exercise-video data', () => {
  storage.saveFoodLibrary([{ id: 'custom' }]);
  const data = storage.exportAllData();
  assert.deepEqual(data.foodLibrary, [{ id: 'custom' }]);
  assert.ok(data.exerciseVideos);
  assert.equal(data.settings.geminiKey, '[REDACTED]');
});

test('local date helper preserves the local calendar date', () => {
  assert.equal(toLocalDateString(new Date(2026, 7, 25, 1, 0)), '2026-08-25');
});
