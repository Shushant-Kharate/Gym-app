import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_EXERCISE_VIDEOS } from '../src/data/defaultVideos.js';
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
  const next = storage.advanceProgramDay(7);
  assert.equal(next.currentDayIndex, 8);
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
