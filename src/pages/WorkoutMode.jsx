// WorkoutMode.jsx — full-screen workout flow
import { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, Trophy, Clock, Info, ChevronDown, Clipboard, Check, Flame, Dumbbell } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { getSettings, getVideoForExercise } from '../db/storage';
import PlateStackTimer from '../components/workout/PlateStackTimer';
import ChecklistBlock from '../components/workout/ChecklistBlock';
import SetRow from '../components/workout/SetRow';
import RestTimer from '../components/workout/RestTimer';
import ExerciseVideoPlayer from '../components/workout/ExerciseVideoPlayer';
import { calc1RM, calcLoadTargets, getExercisePR } from '../logic/progressiveOverload';

export default function WorkoutMode({ programDay, onEnd }) {
  const settings = getSettings();
  const { playSessionComplete } = useAudio();

  const session = useWorkoutSession(programDay);
  const {
    phase,
    warmupChecks, toggleWarmup, completeWarmup,
    stretchChecks, toggleStretch, completeStretch,
    exercises, currentExIdx,
    checkSet, skipSet, updateSetWeight, updateSetReps,
    isCurrentExerciseComplete, nextExercise,
    restTimer, dismissRestTimer,
    sessionStartTime, saveSession,
  } = session;

  // 2-hour session timer
  const sessionTimer = useTimer(
    7200,
    () => {}, // no auto-end — just visual
    true       // autoStart
  );

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [savedSession, setSavedSession] = useState(null);
  const [showLoadCalc, setShowLoadCalc] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentExercise = exercises[currentExIdx];

  // Per-exercise rest from program data; fall back to global setting if missing
  const getRestForExercise = (ex) =>
    ex?.restSec ?? (programDay?.type === 'strength'
      ? settings.restTimerStrengthSec
      : settings.restTimerHypertrophySec);

  const currentRestDuration = currentExercise ? getRestForExercise(currentExercise) : settings.restTimerStrengthSec;

  // ── Floating session stopwatch (elapsed, counts UP) ────────────────
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedS   = elapsedSec % 60;
  const sessionElapsedDisplay = `${String(elapsedMin).padStart(2,'0')}:${String(elapsedS).padStart(2,'0')}`;

  function handleEndEarly() {
    const s = saveSession(true);
    setSavedSession(s);
    session.setPhase('complete');
  }

  function handleCompleteStretch() {
    const s = saveSession(false);
    setSavedSession(s);
    playSessionComplete();
    completeStretch();
  }

  // ─── Phase: Complete ────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const durationMin = savedSession?.durationMin ?? Math.round((Date.now() - sessionStartTime) / 60000);
    const setsCompleted = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
    const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
    const prs = exercises.filter(ex => {
      const last = ex.sets.filter(s => s.done);
      return last.length > 0 && ex.suggestedResult?.isFirst;
    });

    // Total volume (kg × reps)
    const totalVolume = exercises.reduce((sum, ex) => {
      return sum + ex.sets.filter(s => s.done).reduce((s, set) => s + (set.weightKg || 0) * (set.reps || 0), 0);
    }, 0);

    // Rough calorie estimate: ~5 kcal per minute of strength training
    const estCalories = Math.round(durationMin * 5.5);

    // Per-exercise breakdown
    const exerciseBreakdown = exercises.map(ex => {
      const doneSets = ex.sets.filter(s => s.done);
      const vol = doneSets.reduce((s, set) => s + (set.weightKg || 0) * (set.reps || 0), 0);
      const maxW = doneSets.length > 0 ? Math.max(...doneSets.map(s => s.weightKg || 0)) : 0;
      const pr = getExercisePR(ex.name);
      const isNewPR = maxW > 0 && pr && maxW >= pr.weightKg;
      return { name: ex.name, sets: doneSets.length, total: ex.sets.length, volume: Math.round(vol), maxWeight: maxW, isNewPR };
    });

    function copySummary() {
      const lines = [
        `🏋️ ${programDay?.name} — ${programDay?.subtitle}`,
        `⏱️ ${durationMin} min · ${setsCompleted}/${totalSets} sets`,
        `📊 ${Math.round(totalVolume).toLocaleString()} kg total volume`,
        `🔥 ~${estCalories} kcal burned`,
        '',
        ...exerciseBreakdown.map(ex => `${ex.isNewPR ? '🏆 ' : ''}${ex.name}: ${ex.maxWeight}kg × ${ex.sets} sets (${ex.volume} vol)`),
      ];
      navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className="workout-mode" style={{ alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-lg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <Trophy size={48} color="var(--accent-brass)" style={{ margin: '0 auto 16px' }} />
          <h1 className="display-md mb-sm">Session Complete</h1>
          <p className="text-muted text-sm mb-lg">{programDay?.name} · {programDay?.subtitle}</p>

          {/* Stats grid */}
          <div className="card mb-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
            <div className="text-center">
              <p className="display-sm text-iron" style={{ fontFamily: 'var(--font-display)' }}>{durationMin}'</p>
              <p className="text-xs text-muted">Duration</p>
            </div>
            <div className="text-center">
              <p className="display-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--success)' }}>{setsCompleted}/{totalSets}</p>
              <p className="text-xs text-muted">Sets Done</p>
            </div>
            <div className="text-center">
              <Dumbbell size={14} color="var(--accent-iron)" style={{ margin: '0 auto 4px' }} />
              <p className="display-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: 17 }}>{Math.round(totalVolume).toLocaleString()}</p>
              <p className="text-xs text-muted">Total Volume (kg)</p>
            </div>
            <div className="text-center">
              <Flame size={14} color="var(--accent-brass)" style={{ margin: '0 auto 4px' }} />
              <p className="display-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: 17 }}>~{estCalories}</p>
              <p className="text-xs text-muted">Est. kcal</p>
            </div>
          </div>

          {/* Exercise breakdown */}
          <div className="card mb-md" style={{ textAlign: 'left' }}>
            <p className="text-xs text-muted mb-sm" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Exercise Breakdown</p>
            <div className="flex flex-col gap-xs">
              {exerciseBreakdown.map((ex, i) => (
                <div key={i} className="flex items-center gap-sm" style={{
                  padding: '8px 10px', borderRadius: 'var(--r-sm)',
                  background: ex.isNewPR ? 'rgba(214,87,42,0.06)' : 'transparent',
                  border: ex.isNewPR ? '1px solid rgba(214,87,42,0.15)' : '1px solid var(--border-subtle)',
                }}>
                  <span className="text-xs" style={{ flex: 1, fontWeight: 500 }}>
                    {ex.isNewPR && <span style={{ marginRight: 4 }}>🏆</span>}
                    {ex.name}
                  </span>
                  <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    {ex.maxWeight}kg
                  </span>
                  <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    {ex.volume} vol
                  </span>
                </div>
              ))}
            </div>
          </div>

          {durationMin > 120 && (
            <div className="banner banner-warning mb-md">
              <Clock size={14} />
              <span>Session ran over 2 hours. Consider trimming an accessory next time.</span>
            </div>
          )}

          {prs.length > 0 && (
            <div className="banner banner-info mb-md">
              <Trophy size={14} />
              <span>First session logged for: {prs.map(e => e.name).join(', ')}</span>
            </div>
          )}

          <div className="flex gap-sm">
            <button
              id="workout-copy-summary"
              className="btn btn-secondary flex-1"
              onClick={copySummary}
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Clipboard size={14} /> Copy Summary</>}
            </button>
            <button id="workout-done" className="btn btn-primary flex-1 btn-lg" onClick={onEnd}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-mode">
      {/* Rest Timer Overlay */}
      {restTimer?.active && (
        <RestTimer
          durationSec={restTimer.durationSec ?? currentRestDuration}
          exerciseName={restTimer.exerciseName}
          onDismiss={dismissRestTimer}
          sessionElapsed={sessionElapsedDisplay}
        />
      )}

      {/* End Early Confirm */}
      {showEndConfirm && (
        <div className="modal-backdrop" onClick={() => setShowEndConfirm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="display-xs mb-sm">End session early?</h3>
            <p className="text-sm text-muted mb-md">Your progress will be saved.</p>
            <div className="flex gap-sm">
              <button id="workout-end-cancel" className="btn btn-secondary flex-1" onClick={() => setShowEndConfirm(false)}>Continue</button>
              <button id="workout-end-confirm" className="btn btn-danger flex-1" onClick={handleEndEarly}>End & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px var(--sp-md) 0',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div>
          <p className="text-xs text-muted" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>{programDay?.name}</p>
          <p className="display-xs text-iron">{programDay?.subtitle}</p>
        </div>
        <button
          id="workout-end-early"
          className="btn btn-ghost btn-icon"
          onClick={() => setShowEndConfirm(true)}
          aria-label="End session"
        >
          <X size={22} />
        </button>
      </div>

      {/* ── Floating corner session stopwatch ─────────────────────── */}
      {phase !== 'complete' && (
        <div
          id="session-stopwatch"
          style={{
            position: 'fixed',
            bottom: 90,         // above the (hidden) bottom nav
            right: 16,
            zIndex: 50,
            background: 'rgba(14,14,20,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '6px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            minWidth: 72,
          }}
          aria-label={`Session elapsed: ${sessionElapsedDisplay}`}
        >
          <Clock size={10} color="var(--text-dim)" style={{ marginBottom: 2 }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color: elapsedSec >= 5400 ? 'var(--accent-brass)' : 'var(--text-secondary)',
            letterSpacing: '0.5px',
            lineHeight: 1,
          }}>
            {sessionElapsedDisplay}
          </span>
          <span style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '1px', textTransform: 'uppercase' }}>
            elapsed
          </span>
        </div>
      )}

      {/* Plate Stack Timer */}
      <PlateStackTimer
        progress={sessionTimer.progress}
        display={sessionTimer.display}
        isRunning={sessionTimer.isRunning}
      />

      <div className="container" style={{ paddingBottom: 100 }}>

        {/* ─── Phase: Warmup ──────────────────────────────────────────────── */}
        {phase === 'warmup' && (
          <div>
            <ChecklistBlock
              title="Warmup"
              items={programDay?.warmup ?? []}
              checks={warmupChecks}
              onToggle={toggleWarmup}
            />
            <button
              id="workout-start-lifts"
              className="btn btn-primary btn-full btn-lg mt-lg"
              onClick={completeWarmup}
            >
              Start Main Lifts <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── Phase: Workout ─────────────────────────────────────────────── */}
        {phase === 'workout' && currentExercise && (
          <div>
            {/* Exercise header */}
            <div className="card mb-md" style={{ border: '1px solid var(--border-active)', background: 'rgba(214,87,42,0.05)' }}>
              <div className="flex items-center justify-between mb-xs">
                <span className="badge badge-iron">{currentExIdx + 1} / {exercises.length}</span>
                <div className="flex gap-xs">
                  <span className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                    {Math.floor(currentRestDuration / 60)}:{String(currentRestDuration % 60).padStart(2,'0')} rest
                  </span>
                  <span className="badge badge-muted">{programDay?.type === 'strength' ? 'Strength' : 'Hypertrophy'}</span>
                </div>
              </div>
              <h2 className="display-md mb-xs">{currentExercise.name}</h2>
              <p className="text-sm text-muted">{currentExercise.sets.length} sets × {currentExercise.reps} reps</p>

              {currentExercise.suggestedResult && (
                <div className="flex items-center gap-xs mt-sm" style={{ color: 'var(--accent-brass)', fontSize: 12 }}>
                  <Info size={12} />
                  <span>{currentExercise.suggestedResult.rationale}</span>
                </div>
              )}

              {currentExercise.notes && (
                <p className="text-xs text-muted mt-xs" style={{ fontStyle: 'italic' }}>{currentExercise.notes}</p>
              )}

              {/* Load Calculator toggle */}
              <button
                id="load-calc-toggle"
                className="btn btn-ghost btn-sm mt-sm"
                onClick={() => setShowLoadCalc(v => !v)}
                style={{ fontSize: 11, gap: 4 }}
              >
                <Dumbbell size={12} /> Load Targets
                <ChevronDown size={12} style={{ transform: showLoadCalc ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>

            {/* Collapsible Load Calculator */}
            {showLoadCalc && (() => {
              const doneSets = currentExercise.sets.filter(s => s.done);
              const pr = getExercisePR(currentExercise.name);
              const lastDone = doneSets.length > 0 ? doneSets[doneSets.length - 1] : null;
              const est = lastDone ? calc1RM(lastDone.weightKg, lastDone.reps) : (pr ? calc1RM(pr.weightKg, 1) : null);
              const targets = est ? calcLoadTargets(est.value) : null;
              return (
                <div className="card-alt mb-md fade-in-up" style={{ border: '1px solid rgba(214,87,42,0.15)' }}>
                  <p className="text-xs text-muted mb-sm" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Load Calculator</p>
                  {est ? (
                    <>
                      <p className="text-sm mb-sm">
                        Est. 1RM: <span className="gradient-text-iron" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{est.value}kg</span>
                        <span className="text-xs text-dim" style={{ marginLeft: 8 }}>{est.formula}</span>
                      </p>
                      {targets && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                          {targets.map(t => (
                            <div key={t.pct} style={{
                              padding: '6px 8px', borderRadius: 'var(--r-sm)',
                              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                              textAlign: 'center',
                            }}>
                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.kg}kg</p>
                              <p className="text-xs text-dim">{t.pct}%</p>
                              <p style={{ fontSize: 8, color: 'var(--text-dim)' }}>{t.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted">Complete a set or log a previous session to calculate load targets.</p>
                  )}
                </div>
              );
            })()}

            {/* ── Form Video Player (collapsible, above set rows) ─────────── */}
            <ExerciseVideoPlayer
              exerciseName={currentExercise.name}
              videoUrl={getVideoForExercise(currentExercise.name)}
            />

            {/* Set header row */}
            <div className="flex gap-sm" style={{
              padding: '6px 12px',
              display: 'grid',
              gridTemplateColumns: '28px 1fr 1fr auto',
              gap: 10,
              marginBottom: 6,
            }}>
              <span className="text-xs text-dim text-center">#</span>
              <span className="text-xs text-dim text-center">kg</span>
              <span className="text-xs text-dim text-center">reps</span>
              <span className="text-xs text-dim text-center" style={{ width: 32 }}>✓</span>
            </div>

            {/* Set rows */}
            <div className="flex flex-col gap-xs mb-md">
              {currentExercise.sets.map((set, si) => (
                <SetRow
                  key={si}
                  setIndex={si}
                  set={set}
                  restDurationSec={currentRestDuration}
                  onCheck={(idx, dur) => checkSet(currentExIdx, idx, dur)}
                  onSkip={(idx) => skipSet(currentExIdx, idx)}
                  onWeightChange={(idx, w) => updateSetWeight(currentExIdx, idx, w)}
                  onRepsChange={(idx, r) => updateSetReps(currentExIdx, idx, r)}
                />
              ))}
            </div>

            {/* Upcoming exercises */}
            {currentExIdx < exercises.length - 1 && (
              <div className="card-alt mb-md">
                <p className="text-xs text-muted mb-sm">Up next</p>
                {exercises.slice(currentExIdx + 1, currentExIdx + 3).map((ex, i) => (
                  <p key={i} className="text-sm text-muted" style={{ padding: '4px 0' }}>
                    {i + 1 + currentExIdx + 1 <= exercises.length ? `${currentExIdx + i + 2}. ` : ''}{ex.name} — {ex.sets.length}×{ex.reps}
                  </p>
                ))}
              </div>
            )}

            <button
              id="workout-next-exercise"
              className="btn btn-primary btn-full btn-lg"
              disabled={!isCurrentExerciseComplete()}
              onClick={nextExercise}
              style={{ opacity: isCurrentExerciseComplete() ? 1 : 0.4 }}
            >
              {currentExIdx < exercises.length - 1 ? 'Next Exercise' : 'Finish Lifts'} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── Phase: Stretch ─────────────────────────────────────────────── */}
        {phase === 'stretch' && (
          <div>
            <ChecklistBlock
              title="Stretch"
              items={programDay?.stretches ?? []}
              checks={stretchChecks}
              onToggle={toggleStretch}
            />
            <button
              id="workout-complete"
              className="btn btn-brass btn-full btn-lg mt-lg"
              onClick={handleCompleteStretch}
            >
              <Trophy size={18} /> Complete Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
