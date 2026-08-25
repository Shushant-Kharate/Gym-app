// Settings.jsx — Premium settings with glassmorphism
import { useState } from 'react';
import { Save, Download, Trash2, Eye, EyeOff, AlertTriangle, Dumbbell, Info, Key, Volume2, Timer, Shield, PlayCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, exportAllData, resetAllData, getProfile, saveProfile, getWorkoutSessions, getExerciseVideos, getBodyLogs } from '../db/storage';
import { calcMaintenance, calcProteinTarget, calcDeficitTarget } from '../logic/nutrition';
import { checkLiftImbalance } from '../logic/geminiCoach';

export default function Settings() {
  const [profile, setProfile] = useState(getProfile);
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const linkedVideoCount = Object.keys(getExerciseVideos()).length;

  const latestWeight = [...getBodyLogs()].reverse().find(entry => entry.weightKg)?.weightKg ?? profile.currentWeightKg;
  const maintenance = calcMaintenance(latestWeight, profile.heightCm, profile.age);
  const proteinTarget = calcProteinTarget(latestWeight);
  const deficitTarget = calcDeficitTarget(maintenance.maintenance);

  function handleSave() {
    saveSettings(settings);
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }
  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `iron-coach-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }
  function handleReset() { resetAllData(); setShowResetConfirm(false); window.location.reload(); }

  async function handleLiftCheck() {
    if (!settings.geminiKey) { setAiError('Add your Gemini key first.'); return; }
    setAiLoading(true); setAiResult(''); setAiError('');
    try {
      const result = await checkLiftImbalance(
        { workoutSessions: getWorkoutSessions() },
        settings.geminiKey
      );
      setAiResult(result);
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Exercise Library card */}
        <div
          className="card mb-md fade-in-up"
          style={{ cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
          onClick={() => navigate('/library')}
          id="settings-open-library"
          role="button"
          tabIndex={0}
          aria-label="Open Exercise Library Manager"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-iron)',
              }}>
                <PlayCircle size={20} color="white" />
              </div>
              <div>
                <p className="display-xs">Exercise Library</p>
                <p className="text-xs text-muted mt-xs">Attach YouTube form videos to each exercise</p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              {linkedVideoCount > 0 && (
                <span className="badge badge-iron" style={{ fontSize: 10 }}>{linkedVideoCount} linked</span>
              )}
              <ChevronRight size={18} color="var(--text-dim)" />
            </div>
          </div>
        </div>

        {/* Targets */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <Info size={16} color="var(--accent-iron)" />
            <p className="display-xs">Your Targets</p>
          </div>
          <div className="flex flex-col gap-sm">
            {[
              { label: 'Maintenance', value: `${maintenance.maintenance} kcal/day`, note: maintenance.formula, color: 'var(--text-primary)' },
              { label: 'Target intake', value: `${deficitTarget.minKcal}–${deficitTarget.maxKcal} kcal`, note: '500–700 kcal deficit', color: 'var(--accent-iron)' },
              { label: 'Protein', value: `${proteinTarget.minG}–${proteinTarget.maxG}g/day`, note: proteinTarget.formula, color: 'var(--success)' },
            ].map((item, i) => (
              <div key={i} className="card-alt">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted" style={{ fontWeight: 600 }}>{item.label}</p>
                  <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.color }}>{item.value}</p>
                </div>
                <p className="text-xs text-dim mt-xs" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{item.note}</p>
              </div>
            ))}
          </div>
          <div className="banner banner-info mt-md">
            <Shield size={13} />
            <span>Every number is calculated from your profile with formula shown — nothing invented.</span>
          </div>
        </div>

        {/* Profile grid */}
        <div className="card mb-md fade-in-up">
          <p className="label mb-md">Profile</p>
          <div className="profile-grid">
            {[
              ['Name', profile.name], ['Age', `${profile.age}y`],
              ['Height', `${profile.heightCm}cm`], ['Weight', `${profile.currentWeightKg}kg`],
              ['DL', `${profile.deadlift1RMkg}kg`], ['SQ', `${profile.squat1RMkg}kg`],
              ['BP', `${profile.bench1RMkg}kg`], ['Waist', `${profile.waistCm.toFixed(0)}cm`],
            ].map(([k, v]) => (
              <div key={k} className="stat-pill" style={{ padding: 10 }}>
                <div className="stat-value" style={{ fontSize: 16 }}>{v}</div>
                <div className="stat-label" style={{ fontSize: 8 }}>{k}</div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="settings-profile-form">
            {[
              ['name', 'Name', 'text', 1],
              ['age', 'Age', 'number', 1],
              ['heightCm', 'Height (cm)', 'number', 0.1],
              ['currentWeightKg', 'Baseline Weight (kg)', 'number', 0.1],
              ['goalWeightKg', 'Goal Weight (kg)', 'number', 0.1],
              ['deadlift1RMkg', 'Deadlift 1RM (kg)', 'number', 2.5],
              ['squat1RMkg', 'Squat 1RM (kg)', 'number', 2.5],
              ['bench1RMkg', 'Bench 1RM (kg)', 'number', 2.5],
              ['waistCm', 'Baseline Waist (cm)', 'number', 0.1],
            ].map(([key, label, type, step]) => (
              <div key={key}>
                <label className="label" htmlFor={`profile-${key}`}>{label}</label>
                <input
                  id={`profile-${key}`}
                  className="input input-sm"
                  type={type}
                  step={step}
                  value={profile[key] ?? ''}
                  onChange={event => setProfile(current => ({
                    ...current,
                    [key]: type === 'number' ? Number(event.target.value) : event.target.value,
                  }))}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-dim mt-sm">Targets use your latest logged body weight when available.</p>
        </div>

        {/* Gemini Key */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-sm">
            <Key size={16} color="var(--accent-brass)" />
            <p className="display-xs">Gemini API Key</p>
          </div>
          <p className="text-xs text-muted mb-md">Stored locally — never sent anywhere except Google's API.</p>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input id="settings-gemini-key" type={showKey ? 'text' : 'password'} className="input"
              placeholder="AIza..." value={settings.geminiKey}
              onChange={e => setSettings(s => ({ ...s, geminiKey: e.target.value }))}
              style={{ paddingRight: 48 }}
            />
            <button id="settings-toggle-key" className="btn btn-ghost btn-icon"
              onClick={() => setShowKey(v => !v)}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 10 }}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-dim">
            Get a free key at <span style={{ color: 'var(--accent-iron)' }}>aistudio.google.com</span>
          </p>
        </div>

        {/* Rest Timer */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <Timer size={16} color="var(--accent-iron)" />
            <p className="display-xs">Rest Timers</p>
          </div>
          <div className="flex flex-col gap-sm">
            <div>
              <label className="label" htmlFor="settings-strength-rest">Strength (sec)</label>
              <input id="settings-strength-rest" type="number" className="input" value={settings.restTimerStrengthSec}
                onChange={e => setSettings(s => ({ ...s, restTimerStrengthSec: parseInt(e.target.value) || 180 }))}
                step="30" min="60" max="600" />
              <p className="text-xs text-dim mt-xs">Default: 180s (3 min)</p>
            </div>
            <div>
              <label className="label" htmlFor="settings-hyper-rest">Hypertrophy (sec)</label>
              <input id="settings-hyper-rest" type="number" className="input" value={settings.restTimerHypertrophySec}
                onChange={e => setSettings(s => ({ ...s, restTimerHypertrophySec: parseInt(e.target.value) || 90 }))}
                step="15" min="30" max="300" />
              <p className="text-xs text-dim mt-xs">Default: 90s</p>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <Volume2 size={16} color="var(--accent-iron)" />
              <div>
                <p className="display-xs">Audio Cues</p>
                <p className="text-xs text-muted mt-xs">Set check-off and rest complete beeps</p>
              </div>
            </div>
            <button id="settings-audio-toggle" onClick={() => setSettings(s => ({ ...s, audioEnabled: !s.audioEnabled }))}
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: settings.audioEnabled ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' : 'var(--panel-alt)',
                position: 'relative', transition: 'all 0.3s', border: '1px solid var(--border)',
                boxShadow: settings.audioEnabled ? 'var(--shadow-glow-iron)' : 'none',
              }}
              role="switch" aria-checked={settings.audioEnabled}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2,
                left: settings.audioEnabled ? 27 : 3,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </button>
          </div>
        </div>

        {/* AI Lift Check */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <Dumbbell size={16} color="var(--accent-brass)" />
            <p className="display-xs">Lift Imbalance Check</p>
          </div>
          <button id="settings-lift-check" className="btn btn-secondary btn-full" onClick={handleLiftCheck} disabled={aiLoading}>
            <Dumbbell size={14} className={aiLoading ? 'spin' : ''} />
            {aiLoading ? 'Analysing...' : 'Run Check'}
          </button>
          {aiError && <p className="text-xs text-danger mt-sm">{aiError}</p>}
          {aiResult && <div className="card-alt mt-md"><p className="text-sm" style={{ lineHeight: 1.7 }}>{aiResult}</p></div>}
        </div>

        {/* Save */}
        <button id="settings-save" className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-full btn-lg mb-md`} onClick={handleSave}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>

        {/* Export */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-sm">
            <Download size={16} color="var(--text-muted)" />
            <p className="display-xs">Export Data</p>
          </div>
          <p className="text-xs text-muted mb-md">Download everything as JSON. API key is redacted.</p>
          <button id="settings-export" className="btn btn-secondary btn-full" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
        </div>

        {/* Reset */}
        <div className="card mb-lg fade-in-up" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
          <p className="label mb-sm" style={{ color: 'var(--danger)' }}>Danger Zone</p>
          <p className="text-xs text-muted mb-md">Erase everything and start over. Cannot be undone.</p>
          {!showResetConfirm ? (
            <button id="settings-reset" className="btn btn-secondary btn-full" style={{ color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.2)' }}
              onClick={() => setShowResetConfirm(true)}>
              <Trash2 size={14} /> Reset All Data
            </button>
          ) : (
            <div>
              <div className="banner banner-danger mb-md">
                <AlertTriangle size={13} />
                <span>This deletes all workouts, nutrition, and body logs permanently.</span>
              </div>
              <div className="flex gap-sm">
                <button id="settings-reset-cancel" className="btn btn-secondary flex-1" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                <button id="settings-reset-confirm" className="btn btn-danger flex-1" onClick={handleReset}>Delete Everything</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
