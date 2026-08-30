// ProgramOverview.jsx — Complete repeatable workout-cycle overview
import { useState, useMemo } from 'react';
import {
  Calendar, ChevronDown, ChevronUp, Play, CheckCircle2,
  Zap, Activity, Info
} from 'lucide-react';
import { PROGRAM_DAYS, PROGRAM_CYCLE_LENGTH } from '../data/program';
import { getProgramState, saveProgramState } from '../db/storage';

export default function ProgramOverview({ onStartWorkout }) {
  const [programState, setProgramState] = useState(getProgramState);
  const [expandedDay, setExpandedDay] = useState(programState.currentDayIndex);
  const [filter, setFilter] = useState('all'); // 'all' | 'workout' | 'rest'

  const currentIdx = programState.currentDayIndex;

  // Filtered days list
  const visibleDays = useMemo(() => {
    if (filter === 'workout') return PROGRAM_DAYS.filter(d => !d.isRest);
    if (filter === 'rest') return PROGRAM_DAYS.filter(d => d.isRest);
    return PROGRAM_DAYS;
  }, [filter]);

  function handleSetCurrentDay(dayIndex) {
    const updated = { ...programState, currentDayIndex: dayIndex };
    saveProgramState(updated);
    setProgramState(updated);
  }

  function handleStartDay(day) {
    if (onStartWorkout) {
      handleSetCurrentDay(day.dayIndex);
      onStartWorkout(day);
    }
  }

  function handleCompleteRestDay(day) {
    const updated = { ...programState, currentDayIndex: (day.dayIndex + 1) % PROGRAM_CYCLE_LENGTH };
    saveProgramState(updated);
    setProgramState(updated);
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <div className="flex items-center justify-between mb-xs">
            <div>
              <div className="flex items-center gap-xs mb-xs">
                <Calendar size={14} color="var(--accent-iron)" />
                <span className="text-xs text-iron" style={{ fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  {PROGRAM_CYCLE_LENGTH}-Day Repeatable Cycle
                </span>
              </div>
              <h1 className="page-title">Workout Plan</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-iron" style={{ fontSize: 11 }}>
                Day {currentIdx + 1} Active
              </span>
              <p className="text-xs text-muted mt-xs">{PROGRAM_DAYS[currentIdx].name}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-xs mt-sm">
            {[
              { id: 'all', label: `All ${PROGRAM_CYCLE_LENGTH} Days` },
              { id: 'workout', label: 'Workouts Only' },
              { id: 'rest', label: 'Rest Days' },
            ].map(f => (
              <button
                key={f.id}
                id={`filter-${f.id}`}
                className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f.id)}
                style={{ fontSize: 11 }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Banner */}
        <div className="banner banner-info mb-md fade-in-up">
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Tap any day to view its complete warmups, exercises, sets, reps, starting weights, and stretches.
          </span>
        </div>

        {/* Cycle day list */}
        <div className="flex flex-col gap-md">
          {visibleDays.map((day) => {
            const isCurrent = day.dayIndex === currentIdx;
            const isExpanded = expandedDay === day.dayIndex;

            return (
              <div
                key={day.dayIndex}
                className={`card fade-in-up ${isCurrent ? 'border-active' : ''}`}
                style={{
                  border: isCurrent ? '1px solid var(--accent-iron)' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'linear-gradient(135deg, var(--panel) 0%, rgba(255,87,34,0.06) 100%)' : undefined,
                  boxShadow: isCurrent ? 'var(--shadow-glow-iron)' : undefined,
                }}
              >
                {/* Day Header */}
                <div
                  className="flex items-center justify-between"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setExpandedDay(isExpanded ? null : day.dayIndex)}
                >
                  <div className="flex items-center gap-md">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--r-md)',
                        background: isCurrent
                          ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                          : 'var(--panel-alt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrent ? 'white' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      D{day.dayIndex + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-sm">
                        <h3 className="display-xs" style={{ fontSize: 18 }}>{day.name}</h3>
                        {isCurrent && (
                          <span className="badge badge-iron" style={{ fontSize: 8 }}>
                            Active Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-xs mt-xs">
                        <span className={`badge ${day.isRest ? 'badge-success' : day.type === 'strength' ? 'badge-iron' : 'badge-brass'}`}>
                          {day.subtitle}
                        </span>
                        {!day.isRest && (
                          <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                            {(day.exercises ?? []).length} exercises · {day.durationMin} min max
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-ghost btn-icon" style={{ padding: 6 }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-md" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                    {!day.isRest ? (
                      <>
                        {day.timePlan && (
                          <div className="banner banner-info mb-md">
                            <Info size={14} />
                            <span>{day.timePlan}</span>
                          </div>
                        )}
                        {/* Action buttons */}
                        <div className="flex gap-sm mb-md">
                          <button
                            id={`start-day-${day.dayIndex}`}
                            className="btn btn-primary flex-1 btn-sm"
                            onClick={() => handleStartDay(day)}
                          >
                            <Play size={14} fill="currentColor" /> Start This Workout
                          </button>
                          {!isCurrent && (
                            <button
                              id={`set-current-${day.dayIndex}`}
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleSetCurrentDay(day.dayIndex)}
                            >
                              Set Active Day
                            </button>
                          )}
                        </div>

                        {/* Warmup List */}
                        <div className="mb-md">
                          <p className="label">Warmup Routine</p>
                          <div className="flex flex-col gap-xs">
                            {(day.warmup ?? []).map((w, i) => (
                              <div key={i} className="text-xs text-muted flex items-center gap-xs" style={{ padding: '4px 0' }}>
                                <CheckCircle2 size={12} color="var(--accent-iron)" />
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exercises List */}
                        <div className="mb-md">
                          <p className="label">Main Exercises</p>
                          <div className="flex flex-col gap-xs">
                            {(day.exercises ?? []).map((ex, i) => (
                              <div
                                key={i}
                                className="card-alt"
                                style={{ padding: '10px 14px' }}
                              >
                                <div className="flex items-center justify-between mb-xs">
                                  <div className="flex items-center gap-xs">
                                    <span className="text-xs text-iron mono" style={{ fontWeight: 700 }}>
                                      #{i + 1}
                                    </span>
                                    <span className="text-sm" style={{ fontWeight: 600 }}>{ex.name}</span>
                                    {ex.isPrimary && <Zap size={12} color="var(--accent-brass)" />}
                                  </div>
                                  <span className="text-xs text-iron mono" style={{ fontWeight: 700 }}>
                                    {ex.suggestedWeightKg} kg
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted">
                                  <span>{ex.sets} sets × {ex.reps} reps · RPE {ex.rpeTarget}</span>
                                  <span style={{ fontSize: 10, opacity: 0.8 }}>
                                    {(ex.muscleGroups ?? []).join(', ')}
                                  </span>
                                </div>

                                {ex.notes && (
                                  <p className="text-xs text-dim mt-xs" style={{ fontStyle: 'italic' }}>
                                    Note: {ex.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cooldown and optional conditioning list */}
                        <div>
                          <p className="label">Cooldown & Optional Cardio</p>
                          <div className="flex flex-col gap-xs">
                            {(day.stretches ?? []).map((s, i) => (
                              <p key={i} className="text-xs text-muted">• {s}</p>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Rest Day Content */
                      <div>
                        <div className="flex items-center gap-sm mb-sm text-success">
                          <Activity size={16} />
                          <span className="text-sm font-semibold">Rest & Active Recovery</span>
                        </div>
                        <p className="text-xs text-muted mb-md">
                          Recovery days are essential for muscle repair, CNS recovery, and fat loss adaptation.
                        </p>
                        <div className="card-alt mb-md">
                          <p className="label">Recovery Checklist</p>
                          {(day.tips ?? []).map((tip, i) => (
                            <p key={i} className="text-xs text-secondary mt-xs">• {tip}</p>
                          ))}
                        </div>
                        {!isCurrent && (
                          <button
                            id={`set-current-rest-${day.dayIndex}`}
                            className="btn btn-secondary btn-sm btn-full"
                            onClick={() => handleSetCurrentDay(day.dayIndex)}
                          >
                            Set Active Day to Rest Day {day.dayIndex + 1}
                          </button>
                        )}
                        {isCurrent && (
                          <button className="btn btn-primary btn-sm btn-full" onClick={() => handleCompleteRestDay(day)}>
                            Complete Rest Day
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
