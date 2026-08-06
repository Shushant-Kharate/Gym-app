// Analytics.jsx — Exercise volume analytics, PR board, and session trends
import { useState, useMemo } from 'react';
import { BarChart3, Trophy, TrendingUp, Dumbbell, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
  getExerciseVolumeHistory, getSessionVolumeTrend,
  getPRBoard, getLiftRadar, getExerciseNames,
} from '../logic/analyticsCalc';
import { calc1RM } from '../logic/progressiveOverload';

const chartTooltipStyle = {
  background: '#16161E', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 12, color: '#F5F5F7', fontSize: 12,
};

export default function Analytics() {
  const sessionTrend = useMemo(() => getSessionVolumeTrend(), []);
  const prBoard = useMemo(() => getPRBoard(), []);
  const liftRadar = useMemo(() => getLiftRadar(), []);
  const exerciseNames = useMemo(() => getExerciseNames(), []);
  const [selectedExercise, setSelectedExercise] = useState('');

  const exerciseHistory = useMemo(() => {
    if (!selectedExercise) return [];
    return getExerciseVolumeHistory(selectedExercise);
  }, [selectedExercise]);

  const hasData = sessionTrend.length > 0;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div className="flex items-center gap-xs mb-xs">
            <BarChart3 size={14} color="var(--accent-iron)" />
            <span className="text-xs text-iron" style={{ fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Analytics
            </span>
          </div>
          <h1 className="page-title">Progress Tracker</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {!hasData && (
          <div className="card mb-md" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Dumbbell size={32} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">Complete your first workout to see analytics here.</p>
          </div>
        )}

        {/* ─── Session Volume Trend ─────────────────────────────────────────── */}
        {hasData && (
          <div className="card mb-md fade-in-up">
            <div className="flex items-center gap-sm mb-md">
              <TrendingUp size={16} color="var(--accent-iron)" />
              <p className="display-xs">Session Volume</p>
              <div style={{ flex: 1 }} />
              <span className="badge badge-muted" style={{ fontSize: 9 }}>
                {sessionTrend.length} sessions
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sessionTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle}
                  formatter={(v) => [`${v} kg`, 'Volume']}
                />
                <Bar dataKey="totalVolume" fill="url(#volGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-dim mt-sm">Total weight × reps per session</p>
          </div>
        )}

        {/* ─── PR Board ────────────────────────────────────────────────────── */}
        {prBoard.length > 0 && (
          <div className="card mb-md fade-in-up">
            <div className="flex items-center gap-sm mb-md">
              <Trophy size={16} color="var(--accent-brass)" />
              <p className="display-xs">Personal Records</p>
            </div>
            <div className="flex flex-col gap-xs">
              {prBoard.slice(0, 10).map((pr, i) => {
                const est1RM = calc1RM(pr.weightKg, pr.reps);
                return (
                  <div
                    key={pr.name}
                    className="flex items-center gap-sm"
                    style={{
                      padding: '10px 12px',
                      background: i < 3 ? 'rgba(214,87,42,0.06)' : 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--r-md)',
                      border: i < 3 ? '1px solid rgba(214,87,42,0.15)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <span className="text-xs" style={{
                      fontFamily: 'var(--font-mono)', color: i < 3 ? 'var(--accent-brass)' : 'var(--text-dim)',
                      fontWeight: 700, minWidth: 20,
                    }}>
                      {i < 3 ? '🏆' : `${i + 1}`}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p className="text-sm" style={{ fontWeight: 600 }}>{pr.name}</p>
                      <p className="text-xs text-muted">{pr.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="display-xs" style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>
                        {pr.weightKg}kg × {pr.reps}
                      </p>
                      {est1RM && (
                        <p className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                          Est 1RM: {est1RM.value}kg
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Lift Radar ──────────────────────────────────────────────────── */}
        {liftRadar.some(l => l.weight > 0) && (
          <div className="card mb-md fade-in-up">
            <div className="flex items-center gap-sm mb-md">
              <Dumbbell size={16} color="var(--accent-iron)" />
              <p className="display-xs">Lift Balance</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={liftRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="lift"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <Radar
                  dataKey="normalized"
                  stroke="#FF6B35"
                  fill="#FF6B35"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-sm justify-center">
              {liftRadar.filter(l => l.weight > 0).map(l => (
                <span key={l.lift} className="badge badge-muted" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                  {l.lift}: {l.weight}kg
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Per-Exercise Volume Drill-Down ──────────────────────────────── */}
        {exerciseNames.length > 0 && (
          <div className="card mb-lg fade-in-up">
            <div className="flex items-center gap-sm mb-md">
              <TrendingUp size={16} color="var(--success)" />
              <p className="display-xs">Exercise Deep Dive</p>
            </div>

            {/* Exercise selector */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <select
                id="analytics-exercise-select"
                className="input"
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                style={{ appearance: 'none', paddingRight: 36, cursor: 'pointer' }}
              >
                <option value="">Select an exercise...</option>
                {exerciseNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}
              />
            </div>

            {selectedExercise && exerciseHistory.length > 0 && (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={exerciseHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle}
                      formatter={(v, name) => [name === 'volume' ? `${v} kg·reps` : `${v} kg`, name === 'volume' ? 'Volume' : 'Max Weight']}
                    />
                    <Line type="monotone" dataKey="volume" stroke="#4ADE80" strokeWidth={2.5} dot={{ r: 3, fill: '#4ADE80' }} />
                    <Line type="monotone" dataKey="maxWeight" stroke="#FF6B35" strokeWidth={1.5} dot={{ r: 2, fill: '#FF6B35' }} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-dim mt-sm">Green = volume · Orange = max weight</p>

                {/* Session breakdown */}
                <div className="flex flex-col gap-xs mt-md">
                  {exerciseHistory.slice(-5).reverse().map((entry, i) => (
                    <div key={entry.date} className="flex items-center justify-between" style={{
                      padding: '8px 10px', borderRadius: 'var(--r-sm)',
                      background: i === 0 ? 'rgba(74,222,128,0.05)' : 'transparent',
                      border: i === 0 ? '1px solid rgba(74,222,128,0.15)' : '1px solid var(--border-subtle)',
                    }}>
                      <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{entry.date}</span>
                      <span className="text-xs" style={{ fontWeight: 600 }}>{entry.maxWeight}kg × {entry.bestSet.reps}</span>
                      <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{entry.volume} vol</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedExercise && exerciseHistory.length === 0 && (
              <p className="text-sm text-muted" style={{ textAlign: 'center', padding: 24 }}>
                No data logged yet for {selectedExercise}.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
