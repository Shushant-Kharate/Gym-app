// Dashboard.jsx — Premium gym app dashboard
import { useState, useMemo } from 'react';
import {
  Play, TrendingDown, Zap, ChevronRight, RefreshCw, AlertTriangle,
  SkipForward, Flame,
  Calendar, Activity
} from 'lucide-react';
import {
  Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { getProfile, getProgramState, getBodyLogs, getNutritionLogForDate, getNutritionLogs, getWorkoutSessions, saveProgramState } from '../db/storage';
import { getDayByIndex, getNextTrainingDay, PROGRAM_CYCLE_LENGTH } from '../data/program';
import { calcMaintenance, calcProteinTarget, calcDeficitTarget, getDayTotals, getWeeklyAverages } from '../logic/nutrition';
import { calcWaistHeightRatio, calcGoalCurve, flagWaterWeightDrop } from '../logic/bodyMetrics';
import { getSkipOptions, buildMergedSession } from '../logic/skipMerge';
import { getWeeklySummary } from '../logic/geminiCoach';
import { getSettings } from '../db/storage';
import { toLocalDateString } from '../utils/dateUtils';
import MacroBar from '../components/nutrition/MacroBar';
import ProgressRing from '../components/shared/ProgressRing';
import { useNavigate } from 'react-router-dom';

const TODAY = toLocalDateString();

export default function Dashboard({ onStartWorkout }) {
  const navigate = useNavigate();
  const [profile] = useState(getProfile);
  const [programState, setProgramState] = useState(getProgramState);
  const [bodyLogs] = useState(getBodyLogs);
  const [todayNutrition] = useState(() => getNutritionLogForDate(TODAY));
  const [nutritionLogs] = useState(getNutritionLogs);
  const [workoutSessions] = useState(getWorkoutSessions);

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const currentDay = getDayByIndex(programState.currentDayIndex);
  const nextTraining = getNextTrainingDay(programState.currentDayIndex);
  const settings = getSettings();

  const latestWeight = [...bodyLogs].reverse().find(log => log.weightKg)?.weightKg ?? profile.currentWeightKg;
  const maintenance = useMemo(() => calcMaintenance(latestWeight, profile.heightCm, profile.age), [latestWeight, profile]);
  const proteinTarget = useMemo(() => calcProteinTarget(latestWeight), [latestWeight]);
  const deficitTarget = useMemo(() => calcDeficitTarget(maintenance.maintenance), [maintenance]);

  const todayMeals = useMemo(() => todayNutrition.meals ?? [], [todayNutrition.meals]);
  const todayTotals = useMemo(() => getDayTotals(todayMeals), [todayMeals]);
  const weeklyAvg = useMemo(() => getWeeklyAverages(nutritionLogs, TODAY), [nutritionLogs]);

  const latestBody = bodyLogs.length > 0 ? [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const waistRatio = latestBody?.waistCm
    ? calcWaistHeightRatio(latestBody.waistCm, profile.heightCm)
    : calcWaistHeightRatio(profile.waistCm, profile.heightCm);

  const waterWeightFlag = useMemo(() => flagWaterWeightDrop(bodyLogs, profile.programStartDate), [bodyLogs, profile]);

  const goalCurve = useMemo(() => {
    const curve = calcGoalCurve(profile.currentWeightKg, 60);
    const logMap = Object.fromEntries(bodyLogs.map(b => {
      const start = new Date(profile.programStartDate);
      const d = new Date(b.date);
      return [Math.round((d - start) / (1000 * 60 * 60 * 24)), b.weightKg];
    }));
    return curve.map(pt => ({ ...pt, actual: logMap[pt.day] }));
  }, [bodyLogs, profile]);

  const skipOptions = currentDay && !currentDay.isRest && nextTraining
    ? getSkipOptions(currentDay, nextTraining.day) : [];

  function handleSkipOption(optionId) {
    const state = { ...programState };
    if (optionId === 'shift') {
      // Keep the same workout active so it becomes tomorrow's session.
      state.cycleStart = toLocalDateString(new Date(new Date(state.cycleStart).getTime() + 86400000));
    } else if (optionId === 'skip_log') {
      state.skippedDays = [...(state.skippedDays ?? []), { date: TODAY, day: currentDay.name }];
      state.currentDayIndex = (state.currentDayIndex + 1) % PROGRAM_CYCLE_LENGTH;
    } else if (optionId === 'smart_merge') {
      const merged = buildMergedSession(currentDay, nextTraining?.day);
      state.mergeHistory = [...(state.mergeHistory ?? []), { date: TODAY, merged: merged.tag }];
      saveProgramState(state);
      setProgramState(state);
      setShowSkipModal(false);
      onStartWorkout(merged);
      return;
    }
    saveProgramState(state);
    setProgramState(state);
    setShowSkipModal(false);
  }

  function handleCompleteRestDay() {
    const state = {
      ...programState,
      currentDayIndex: (programState.currentDayIndex + 1) % PROGRAM_CYCLE_LENGTH,
    };
    saveProgramState(state);
    setProgramState(state);
  }

  async function fetchAiSummary() {
    if (!settings.geminiKey) { setAiError('Add your Gemini API key in Settings.'); return; }
    setAiLoading(true); setAiError('');
    try {
      const result = await getWeeklySummary({
        workoutSessions: workoutSessions.slice(-7),
        nutritionLogs: nutritionLogs.slice(-7),
        bodyLogs: bodyLogs.slice(-4),
        nutritionTargets: { minKcal: deficitTarget.minKcal, maxKcal: deficitTarget.maxKcal, proteinMinG: proteinTarget.minG, proteinMaxG: proteinTarget.maxG },
      });
      setAiSummary(result);
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  }

  const dayNumber = useMemo(() => {
    const start = new Date(profile.programStartDate);
    return Math.floor((new Date(TODAY) - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [profile]);

  const dayProgress = Math.min(100, (dayNumber / 60) * 100);

  // Waist ring progress: 0.62 (worst) → 0.53 (target) maps to 0→100%
  const ratioProgress = Math.max(0, Math.min(100, ((0.62 - waistRatio.ratio) / (0.62 - 0.53)) * 100));

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <Flame size={14} color="var(--accent-iron)" />
                <span className="text-xs" style={{ color: 'var(--accent-iron)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Day {dayNumber} of 60
                </span>
              </div>
              <h1 className="page-title">Iron Coach</h1>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-iron)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'white' }}>
                {profile.name?.[0] ?? 'S'}
              </span>
            </div>
          </div>

          {/* 60-day progress bar under header */}
          <div className="mt-sm">
            <div className="progress-track" style={{ height: 4 }}>
              <div className="progress-fill" style={{ width: `${dayProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Water weight flag */}
        {waterWeightFlag && (
          <div className="banner banner-info mb-md fade-in-up">
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{waterWeightFlag.message}</span>
          </div>
        )}

        {/* ─── Today's Workout Hero Card ─────────────────────────────────── */}
        <div className="card-hero mb-md fade-in-up">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <p className="text-xs text-muted" style={{ letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>Today's Session</p>
              <h2 className="display-lg" style={{ marginBottom: 4 }}>{currentDay.name}</h2>
              <div className="flex gap-sm items-center">
                <span className="badge badge-iron">{currentDay.subtitle}</span>
                <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  Day {programState.currentDayIndex + 1}/{PROGRAM_CYCLE_LENGTH}
                </span>
              </div>
            </div>

            {/* Circular day indicator */}
            <div className="metric-ring-container">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--panel-alt)" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke="url(#dayGrad)" strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - (programState.currentDayIndex + 1) / PROGRAM_CYCLE_LENGTH)}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                />
                <defs>
                  <linearGradient id="dayGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent-start)" />
                    <stop offset="100%" stopColor="var(--accent-end)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="metric-ring-center">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {programState.currentDayIndex + 1}
                </span>
              </div>
            </div>
          </div>

          {!currentDay.isRest ? (
            <>
              {/* Exercise preview */}
              <div className="flex flex-col gap-xs mb-md" style={{ marginTop: 12 }}>
                {(currentDay.exercises ?? []).slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-sm fade-in-up" style={{
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-iron)', fontWeight: 700, minWidth: 20 }}>
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ flex: 1, fontWeight: 500 }}>{ex.name}</span>
                    <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      {ex.sets}×{ex.reps}
                    </span>
                    {ex.isPrimary && <Zap size={12} color="var(--accent-brass)" />}
                  </div>
                ))}
                {(currentDay.exercises ?? []).length > 3 && (
                  <p className="text-xs text-muted" style={{ paddingLeft: 12 }}>
                    +{currentDay.exercises.length - 3} more exercises
                  </p>
                )}
              </div>

              <div className="flex gap-sm">
                <button
                  id="dashboard-start-workout"
                  className="btn btn-primary flex-1 btn-lg pulse-iron"
                  onClick={() => onStartWorkout(currentDay)}
                >
                  <Play size={20} fill="currentColor" /> Start Workout
                </button>
                <button
                  id="dashboard-skip"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setShowSkipModal(true)}
                  aria-label="Skip"
                  style={{ width: 56 }}
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <button
                id="dashboard-view-plan"
                className="btn btn-ghost btn-full mt-sm"
                onClick={() => navigate('/program')}
                style={{ fontSize: 12 }}
              >
                <Calendar size={14} /> View All 14 Days Plan
              </button>
            </>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div className="flex items-center gap-sm mb-sm" style={{ color: 'var(--success)' }}>
                <Activity size={16} />
                <span className="text-sm" style={{ fontWeight: 600 }}>Recovery Day</span>
              </div>
              {(currentDay.tips ?? []).map((tip, i) => (
                <p key={i} className="text-xs text-muted" style={{ padding: '3px 0', paddingLeft: 24 }}>• {tip}</p>
              ))}
              <button className="btn btn-primary btn-full mt-md" onClick={handleCompleteRestDay}>
                Complete Rest Day <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ─── Quick Stats Row ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }} className="fade-in-up" >
          <div className="stat-pill">
            <div className="stat-value gradient-text-iron">{Math.round(todayTotals.kcal)}</div>
            <div className="stat-label">kcal</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value gradient-text-success">{Math.round(todayTotals.proteinG)}g</div>
            <div className="stat-label">protein</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: waistRatio.ratio <= 0.55 ? 'var(--success)' : 'var(--accent-iron)' }}>
              {waistRatio.ratio.toFixed(2)}
            </div>
            <div className="stat-label">W:H Ratio</div>
          </div>
        </div>

        {/* ─── Waist-to-Height Ring + Progress ───────────────────────────── */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-lg">
            {/* Big ring */}
            <div className="metric-ring-container" style={{ flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--panel-alt)" strokeWidth="7" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#whGrad)" strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - ratioProgress / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="whGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ratioProgress > 60 ? '#22C55E' : 'var(--accent-start)'} />
                    <stop offset="100%" stopColor={ratioProgress > 60 ? '#4ADE80' : 'var(--accent-end)'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="metric-ring-center">
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22, fontWeight: 700,
                  color: ratioProgress > 60 ? 'var(--success)' : 'var(--accent-iron)',
                }}>
                  {waistRatio.ratio.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <p className="text-xs text-muted" style={{ letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Primary Metric</p>
              <p className="display-sm" style={{ marginBottom: 8 }}>Waist : Height</p>
              <div className="flex justify-between text-xs mb-xs">
                <span className="text-muted">0.59 baseline</span>
                <span style={{ color: 'var(--success)' }}>0.53 target</span>
              </div>
              <div className="progress-track-thick">
                <div className="progress-fill" style={{
                  width: `${ratioProgress}%`,
                  background: ratioProgress > 60
                    ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                    : 'linear-gradient(90deg, var(--accent-start), var(--accent-end))',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Nutrition Progress Rings ─────────────────────────────────────── */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <Flame size={16} color="var(--accent-iron)" />
            <p className="display-xs">Today's Fuel</p>
            <div style={{ flex: 1 }} />
            <span className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              {todayTotals.kcal} / {deficitTarget.maxKcal} kcal
            </span>
          </div>

          <div className="flex items-center justify-around mb-md">
            <ProgressRing
              value={todayTotals.kcal}
              max={deficitTarget.maxKcal}
              size={100}
              strokeWidth={8}
              label="CALORIES"
              sublabel={`Target ${deficitTarget.maxKcal}`}
              color="var(--accent-iron)"
              colorEnd="#FF6B35"
            />
            <ProgressRing
              value={todayTotals.proteinG}
              max={proteinTarget.minG}
              size={100}
              strokeWidth={8}
              label="PROTEIN"
              sublabel={`Min ${proteinTarget.minG}g`}
              color="#22C55E"
              colorEnd="#4ADE80"
            />
          </div>

          <div className="flex flex-col gap-md">
            <MacroBar label="Calories" current={todayTotals.kcal} target={deficitTarget.maxKcal} unit=" kcal" colorVar="--accent-iron" />
            <MacroBar label="Protein" current={todayTotals.proteinG} target={proteinTarget.minG} unit="g" colorVar="--success" />
          </div>

          <div className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div className="text-center">
              <p className="text-xs text-muted">Wk avg kcal</p>
              <p className="display-xs" style={{ fontFamily: 'var(--font-mono)' }}>{weeklyAvg.kcal}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted">Wk avg pro</p>
              <p className="display-xs gradient-text-success" style={{ fontFamily: 'var(--font-mono)' }}>{weeklyAvg.proteinG}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted">Target</p>
              <p className="display-xs text-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{deficitTarget.minKcal}–{deficitTarget.maxKcal}</p>
            </div>
          </div>
        </div>

        {/* ─── 60-Day Weight Curve ────────────────────────────────────────── */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <TrendingDown size={16} color="var(--success)" />
            <p className="display-xs">60-Day Progress</p>
            <div style={{ flex: 1 }} />
            <span className="badge badge-muted" style={{ fontSize: 9 }}>4–7kg range</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={goalCurve} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="rangeGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5722" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#F5F5F7' }}
                formatter={(v, name) => [v ? `${v}kg` : '—', name === 'actual' ? 'Actual' : name === 'maxKg' ? 'Best case' : 'Min']}
              />
              <Area type="monotone" dataKey="maxKg" stroke="none" fill="url(#rangeGrad2)" />
              <Line type="monotone" dataKey="maxKg" stroke="rgba(255,87,34,0.25)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="minKg" stroke="rgba(255,87,34,0.25)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="actual" stroke="#4ADE80" strokeWidth={2.5} dot={{ r: 3, fill: '#4ADE80', stroke: '#0A0A0F', strokeWidth: 2 }} connectNulls={false} />
              <ReferenceLine x={dayNumber} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-dim mt-sm">Dashed = goal band · Green = actual weight</p>
        </div>

        {/* ─── AI Coach ──────────────────────────────────────────────────── */}
        <div className="card mb-lg fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <Zap size={16} color="var(--accent-brass)" />
            <p className="display-xs">AI Coach</p>
            <div style={{ flex: 1 }} />
            <button id="dashboard-ai-refresh" className="btn btn-ghost btn-icon" onClick={fetchAiSummary} disabled={aiLoading}
              aria-label="Generate weekly AI summary"
              style={{ padding: 8 }}>
              <RefreshCw size={16} className={aiLoading ? 'spin' : ''} />
            </button>
          </div>

          {aiError && <div className="banner banner-warning"><AlertTriangle size={13} /><span>{aiError}</span></div>}
          {aiSummary ? (
            <p className="text-sm" style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>{aiSummary}</p>
          ) : !aiError && (
            <p className="text-sm text-muted">
              {settings.geminiKey ? 'Tap refresh to generate your weekly AI summary.' : 'Add your Gemini API key in Settings.'}
            </p>
          )}
        </div>
      </div>

      {/* ─── Skip Modal ──────────────────────────────────────────────────── */}
      {showSkipModal && (
        <div className="modal-backdrop" onClick={() => setShowSkipModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="display-sm mb-xs">Can't make {currentDay.name}?</h3>
            <p className="text-sm text-muted mb-lg">Choose how to handle today's session:</p>
            <div className="flex flex-col gap-sm">
              {skipOptions.map(opt => (
                <button
                  key={opt.id}
                  id={`skip-option-${opt.id}`}
                  className="card-alt flex gap-md items-start"
                  style={{
                    border: opt.recommended ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                    textAlign: 'left', cursor: 'pointer',
                    background: opt.recommended ? 'rgba(255,87,34,0.05)' : undefined,
                  }}
                  onClick={() => handleSkipOption(opt.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-sm">
                      <p className="text-sm" style={{ fontWeight: 600 }}>{opt.label}</p>
                      {opt.recommended && <span className="badge badge-iron" style={{ fontSize: 8 }}>Best</span>}
                    </div>
                    <p className="text-xs text-muted mt-xs">{opt.description}</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-dim)" style={{ marginTop: 2 }} />
                </button>
              ))}
            </div>
            <button id="skip-cancel" className="btn btn-ghost btn-full mt-lg" onClick={() => setShowSkipModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
