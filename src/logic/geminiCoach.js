// geminiCoach.js — all Gemini API calls
// Key is read from localStorage — never hardcoded
// AI is ONLY for pattern-level interpretation, never arithmetic

import { getSettings } from '../db/storage';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
// Stable model with a documented Gemini API free tier.
const FLASH_MODEL = 'gemini-2.5-flash';
const PRO_MODEL = 'gemini-2.5-flash';

function getKey(keyOverride = '') {
  const key = keyOverride.trim() || getSettings().geminiKey.trim();
  if (!key) throw new Error('No Gemini API key set. Add your key in Settings and save it.');
  return key;
}

function friendlyApiError(status, error) {
  const providerMessage = error?.error?.message ?? '';
  if (status === 400) return `Gemini rejected the request. ${providerMessage || 'Check the selected model and request data.'}`;
  if (status === 401 || status === 403) return `Gemini API key was rejected or blocked. ${providerMessage || 'Check the key in Google AI Studio.'}`;
  if (status === 404) return `The configured Gemini model is unavailable. ${providerMessage}`.trim();
  if (status === 429) return `Gemini free-tier quota is temporarily exhausted. Wait for the quota window to reset, then try again. ${providerMessage}`.trim();
  if (status >= 500) return 'Gemini is temporarily unavailable. Please try again in a minute.';
  return providerMessage || `Gemini API error ${status}`;
}

async function requestGemini(model, body, keyOverride = '') {
  const key = getKey(keyOverride);
  const url = `${GEMINI_BASE}/${model}:generateContent`;
  const retryDelays = [0, 1000, 2500];

  for (let attempt = 0; attempt < retryDelays.length; attempt++) {
    if (retryDelays[attempt]) {
      await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim();
        if (!text) throw new Error('Gemini returned an empty response. Try rephrasing or adding more logged data.');
        return text;
      }

      const error = await res.json().catch(() => ({}));
      const transient = res.status === 408 || res.status === 429 || res.status >= 500;
      if (transient && attempt < retryDelays.length - 1) continue;
      throw new Error(friendlyApiError(res.status, error));
    } catch (error) {
      if (error.name === 'AbortError') {
        if (attempt < retryDelays.length - 1) continue;
        throw new Error('Gemini request timed out. Check your connection and try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error('Gemini request failed after multiple attempts.');
}

async function callGemini(model, prompt, systemInstruction = '', keyOverride = '') {

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

  return requestGemini(model, body, keyOverride);
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
export async function checkLiftImbalance({ workoutSessions }, keyOverride = '') {
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

  return callGemini(FLASH_MODEL, prompt, SYSTEM_COACH, keyOverride);
}

/**
 * Free-form chat with full context
 */
export async function freeChat(messages, { workoutSessions, nutritionLogs, bodyLogs }) {
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
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const body = {
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_COACH }] },
    generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
  };

  return requestGemini(FLASH_MODEL, body);
}
