// geminiCoach.js — all Gemini API calls
// Key is read from localStorage — never hardcoded
// AI is ONLY for pattern-level interpretation, never arithmetic

import { getSettings } from '../db/storage';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const FLASH_MODEL = 'gemini-2.0-flash';
const PRO_MODEL = 'gemini-2.0-flash'; // use same model for consistency

function getKey() {
  const settings = getSettings();
  if (!settings.geminiKey) throw new Error('No Gemini API key set. Go to Settings to add your key.');
  return settings.geminiKey;
}

async function callGemini(model, prompt, systemInstruction = '') {
  const key = getKey();
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(systemInstruction && {
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

const SYSTEM_COACH = `You are Iron Coach, a no-nonsense personal training assistant.
The user is male, 20 years old, 182cm, ~97.5kg, vegetarian (Indian diet).
They are on a 60-day cut targeting 4–7kg fat loss.
Key lifts: Deadlift 110kg, Squat 60kg, Bench 30kg (deadlift strong, squat/bench lagging).
IMPORTANT RULES:
- Never invent numbers. All calorie/protein math is done in the app — you interpret patterns only.
- Be direct and practical. No wellness-spa tone.
- Keep responses under 200 words unless the user asks for more.
- If something looks off in the data, say so plainly.`;

/**
 * Weekly summary — connects workout, nutrition, and body data
 */
export async function getWeeklySummary({ workoutSessions, nutritionLogs, bodyLogs, nutritionTargets }) {
  const prompt = `
Here is my data from the past week:

WORKOUTS:
${workoutSessions.map(s => `- ${s.date}: ${s.name} (${s.durationMin ?? '?'} min) — ${s.exercises?.map(e => `${e.name}: ${e.sets.filter(x => x.done).length}/${e.sets.length} sets`).join(', ')}`).join('\n')}

NUTRITION (daily totals):
${nutritionLogs.map(n => `- ${n.date}: ${n.totals?.kcal ?? '?'} kcal, ${n.totals?.proteinG ?? '?'}g protein`).join('\n')}
Target: ${nutritionTargets?.minKcal ?? '?'}–${nutritionTargets?.maxKcal ?? '?'} kcal, ${nutritionTargets?.proteinMinG ?? '?'}–${nutritionTargets?.proteinMaxG ?? '?'}g protein

BODY:
${bodyLogs.map(b => `- ${b.date}: ${b.weightKg ?? '?'}kg, waist ${b.waistCm ?? '?'}cm`).join('\n')}

Give me a plain-language weekly summary connecting these: what's going well, what's off, and one concrete action to fix the biggest issue.`;

  return callGemini(PRO_MODEL, prompt, SYSTEM_COACH);
}

/**
 * Plateau / deficit check
 */
export async function checkPlateauOrDeficit({ bodyLogs, nutritionLogs }) {
  const prompt = `
BODY LOG (weight over time):
${bodyLogs.map(b => `- ${b.date}: ${b.weightKg}kg, waist ${b.waistCm ?? '?'}cm`).join('\n')}

NUTRITION (average daily intake):
${nutritionLogs.slice(-14).map(n => `- ${n.date}: ${n.totals?.kcal ?? '?'} kcal, ${n.totals?.proteinG ?? '?'}g protein`).join('\n')}

Is the weight trend matching the logged deficit? If not, what's the most likely explanation? Be specific.`;

  return callGemini(FLASH_MODEL, prompt, SYSTEM_COACH);
}

/**
 * Lift imbalance check
 */
export async function checkLiftImbalance({ workoutSessions }) {
  const getProgression = (name) =>
    workoutSessions
      .map(s => ({ date: s.date, ex: s.exercises?.find(e => e.name.toLowerCase().includes(name)) }))
      .filter(x => x.ex)
      .map(x => `${x.date}: ${x.ex.sets?.[0]?.weightKg ?? '?'}kg`);

  const prompt = `
DEADLIFT PROGRESSION:
${getProgression('deadlift').join('\n')}

SQUAT PROGRESSION:
${getProgression('squat').join('\n')}

BENCH PROGRESSION:
${getProgression('bench').join('\n')}

The user's deadlift is strong (110kg baseline) but squat and bench are lagging.
Is the squat/bench gap narrowing or widening vs deadlift? What's the likely cause and fix?`;

  return callGemini(FLASH_MODEL, prompt, SYSTEM_COACH);
}

/**
 * Free-form chat with full context
 */
export async function freeChat(messages, { workoutSessions, nutritionLogs, bodyLogs }) {
  const key = getKey();
  const url = `${GEMINI_BASE}/${FLASH_MODEL}:generateContent?key=${key}`;

  const contextBlock = `
CONTEXT (last 6 weeks):
Recent workouts: ${workoutSessions.slice(-8).map(s => `${s.date} ${s.name}`).join(', ')}
Recent nutrition avg: ~${
    Math.round(nutritionLogs.slice(-7).reduce((a, n) => a + (n.totals?.kcal ?? 0), 0) / Math.max(nutritionLogs.slice(-7).length, 1))
  } kcal/day, ~${
    Math.round(nutritionLogs.slice(-7).reduce((a, n) => a + (n.totals?.proteinG ?? 0), 0) / Math.max(nutritionLogs.slice(-7).length, 1))
  }g protein/day
Recent weight: ${bodyLogs.slice(-3).map(b => `${b.date} ${b.weightKg}kg`).join(', ')}
`;

  // Build conversation history
  const contents = [
    // Inject context as first user message
    { role: 'user', parts: [{ text: contextBlock }] },
    { role: 'model', parts: [{ text: 'Got it. I have your recent data. What\'s your question?' }] },
    // Then the actual conversation
    ...messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ];

  const body = {
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_COACH }] },
    generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
