// Body.jsx — Premium body tracking page
import { useState, useMemo } from 'react';
import { Plus, Save, Info, TrendingDown, Ruler, Scale } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import { getProfile, getBodyLogs, addBodyLog } from '../db/storage';
import {
  calcWaistHeightRatio, calcBMI, calcGoalCurve, flagWaterWeightDrop, detectWeightStall, calcBodyFatNavy
} from '../logic/bodyMetrics';
import ProgressRing from '../components/shared/ProgressRing';
import { toLocalDateString } from '../utils/dateUtils';

const TODAY = toLocalDateString();

export default function Body() {
  const profile = getProfile();
  const [logs, setLogs] = useState(() => getBodyLogs().sort((a, b) => a.date.localeCompare(b.date)));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: TODAY, weightKg: '', waistCm: '', neckCm: '', chestCm: '', hipsCm: '', bicepsCm: '', thighCm: '',
  });
  const [saved, setSaved] = useState(false);

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const waistRatio = latestLog?.waistCm
    ? calcWaistHeightRatio(latestLog.waistCm, profile.heightCm)
    : calcWaistHeightRatio(profile.waistCm, profile.heightCm);
  const bmi = latestLog?.weightKg
    ? calcBMI(latestLog.weightKg, profile.heightCm)
    : calcBMI(profile.currentWeightKg, profile.heightCm);

  const waterFlag = useMemo(() => flagWaterWeightDrop(logs, profile.programStartDate), [logs, profile]);
  const stallFlag = useMemo(() => detectWeightStall(logs, []), [logs]);

  const goalCurve = useMemo(() => {
    const curve = calcGoalCurve(profile.currentWeightKg, 60);
    const logMap = Object.fromEntries(logs.map(b => {
      const start = new Date(profile.programStartDate);
      const d = new Date(b.date);
      return [Math.round((d - start) / (1000 * 60 * 60 * 24)), b.weightKg];
    }));
    return curve.map(pt => ({ ...pt, actual: logMap[pt.day] }));
  }, [logs, profile]);

  const ratioTrend = useMemo(() =>
    logs.filter(l => l.waistCm).map(l => ({
      date: l.date.slice(5),
      ratio: parseFloat(calcWaistHeightRatio(l.waistCm, profile.heightCm).ratio.toFixed(3)),
    }))
  , [logs, profile]);

  // Body fat estimate
  const bodyFat = useMemo(() => {
    const waist = latestLog?.waistCm || profile.waistCm;
    const neck = latestLog?.neckCm || profile.neckCm;
    return calcBodyFatNavy(waist, neck, profile.heightCm);
  }, [latestLog, profile]);

  const bodyFatTrend = useMemo(() =>
    logs.filter(l => l.waistCm && l.neckCm).map(l => ({
      date: l.date.slice(5),
      bf: calcBodyFatNavy(l.waistCm, l.neckCm, profile.heightCm)?.percent ?? null,
    })).filter(l => l.bf !== null)
  , [logs, profile]);

  const ratioProgress = Math.max(0, Math.min(100, ((0.62 - waistRatio.ratio) / (0.62 - 0.53)) * 100));

  function handleSave() {
    if (!form.weightKg && !form.waistCm) return;
    const entry = {
      date: form.date,
      weightKg: parseFloat(form.weightKg) || undefined,
      waistCm: parseFloat(form.waistCm) || undefined,
      neckCm: parseFloat(form.neckCm) || undefined,
      chestCm: parseFloat(form.chestCm) || undefined,
      hipsCm: parseFloat(form.hipsCm) || undefined,
      bicepsCm: parseFloat(form.bicepsCm) || undefined,
      thighCm: parseFloat(form.thighCm) || undefined,
    };
    addBodyLog(entry);
    setLogs(getBodyLogs().sort((a, b) => a.date.localeCompare(b.date)));
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1200);
  }

  return (
    <div>
      <div className="page-header">
        <div className="container flex items-center justify-between">
          <h1 className="page-title">Body</h1>
          <button id="body-add-log" className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            <Plus size={14} /> Log
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="display-sm mb-md">Log Measurements</h3>
            <div className="flex flex-col gap-sm">
              <div>
                <label className="label" htmlFor="body-date">Date</label>
                <input id="body-date" type="date" className="input" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              {[
                { key: 'weightKg', label: 'Weight', placeholder: 'kg', icon: Scale },
                { key: 'waistCm', label: 'Waist', placeholder: 'cm', icon: Ruler },
                { key: 'neckCm', label: 'Neck', placeholder: 'cm' },
                { key: 'chestCm', label: 'Chest', placeholder: 'cm' },
                { key: 'hipsCm', label: 'Hips', placeholder: 'cm' },
                { key: 'bicepsCm', label: 'Bicep', placeholder: 'cm' },
                { key: 'thighCm', label: 'Thigh', placeholder: 'cm' },
              ].map(field => (
                <div key={field.key}>
                  <label className="label" htmlFor={`body-${field.key}`}>{field.label}</label>
                  <input id={`body-${field.key}`} type="number" className="input" placeholder={field.placeholder}
                    value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} step="0.1" />
                </div>
              ))}
              <button id="body-save" className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-full btn-lg mt-sm`}
                onClick={handleSave}>
                <Save size={16} /> {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: 20 }}>

        {waterFlag && <div className="banner banner-info mb-md"><Info size={14} /><span>{waterFlag.message}</span></div>}
        {stallFlag && <div className="banner banner-warning mb-md"><Info size={14} /><span>{stallFlag.message}</span></div>}

        {/* Hero metric — big ratio ring */}
        <div className="card mb-md fade-in-up" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
          <div className="metric-ring-container" style={{ margin: '0 auto 16px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={ratioProgress > 60 ? '#22C55E' : '#FF6B35'} />
                  <stop offset="100%" stopColor={ratioProgress > 60 ? '#4ADE80' : '#FF3F00'} />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="70" cy="70" r="58" fill="none" stroke="url(#bodyGrad)" strokeWidth="8"
                strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - ratioProgress / 100)}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${ratioProgress > 60 ? 'rgba(74,222,128,0.3)' : 'rgba(255,87,34,0.3)'})` }}
              />
            </svg>
            <div className="metric-ring-center">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700,
                color: ratioProgress > 60 ? 'var(--success)' : 'var(--accent-iron)' }}>
                {waistRatio.ratio.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted" style={{ letterSpacing: '1.5px', textTransform: 'uppercase' }}>Waist : Height Ratio</p>
          <p className="text-xs text-dim mt-xs">Baseline 0.587 → Target 0.53–0.55</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Weight', value: latestLog?.weightKg ? `${latestLog.weightKg}` : `${profile.currentWeightKg}`, unit: 'kg', color: 'var(--text-primary)' },
            { label: 'Waist', value: latestLog?.waistCm ? `${latestLog.waistCm}` : `${profile.waistCm.toFixed(1)}`, unit: 'cm', color: 'var(--accent-iron)' },
            { label: 'BMI', value: `${bmi.value}`, unit: bmi.category, color: 'var(--text-muted)' },
            { label: 'Chest', value: latestLog?.chestCm ? `${latestLog.chestCm}` : `${profile.chestCm.toFixed(1)}`, unit: 'cm', color: 'var(--text-secondary)' },
          ].map((item, i) => (
            <div key={i} className="stat-pill fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
              <div className="stat-label">{item.label} <span style={{ opacity: 0.6, textTransform: 'none' }}>{item.unit}</span></div>
            </div>
          ))}
        </div>

        {/* Body Fat Estimate Card */}
        {bodyFat && (
          <div className="card mb-md fade-in-up">
            <div className="flex items-center gap-lg">
              <ProgressRing
                value={bodyFat.percent}
                max={40}
                size={90}
                strokeWidth={7}
                label="BF%"
                color={bodyFat.percent < 18 ? '#22C55E' : '#FF6B35'}
                colorEnd={bodyFat.percent < 18 ? '#4ADE80' : '#FF3F00'}
              />
              <div style={{ flex: 1 }}>
                <p className="text-xs text-muted" style={{ letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Body Fat Estimate</p>
                <p className="display-sm" style={{ marginBottom: 4 }}>{bodyFat.percent}%</p>
                <span className="badge badge-muted" style={{ fontSize: 9 }}>{bodyFat.category}</span>
                <p className="text-xs text-dim mt-xs">US Navy Method</p>
              </div>
            </div>
            {bodyFatTrend.length >= 2 && (
              <div style={{ marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={bodyFatTrend} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="bf" stroke="#FF5722" strokeWidth={2} dot={{ r: 2, fill: '#FF5722' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* 60-day weight curve */}
        <div className="card mb-md fade-in-up">
          <div className="flex items-center gap-sm mb-md">
            <TrendingDown size={16} color="var(--success)" />
            <p className="display-xs">Weight Curve</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={goalCurve} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="bodyGoalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5722" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#F5F5F7' }}
                formatter={(v, name) => [v ? `${v}kg` : '—', name === 'actual' ? 'Actual' : name === 'maxKg' ? 'Best' : 'Realistic']} />
              <Area type="monotone" dataKey="maxKg" stroke="none" fill="url(#bodyGoalGrad)" />
              <Line type="monotone" dataKey="maxKg" stroke="rgba(255,87,34,0.2)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="minKg" stroke="rgba(255,87,34,0.2)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="actual" stroke="#4ADE80" strokeWidth={2.5} dot={{ r: 3, fill: '#4ADE80', stroke: '#0A0A0F', strokeWidth: 2 }} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-dim mt-sm">Dashed = 4–7kg band · Green = actual</p>
        </div>

        {/* Waist trend chart */}
        {ratioTrend.length >= 2 && (
          <div className="card mb-md fade-in-up">
            <div className="flex items-center gap-sm mb-md">
              <Ruler size={16} color="var(--accent-iron)" />
              <p className="display-xs">Ratio Trend</p>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={ratioTrend} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0.5, 0.65]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#F5F5F7' }}
                  formatter={v => [v.toFixed(3), 'W:H']} />
                <ReferenceLine y={0.55} stroke="rgba(74,222,128,0.35)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="ratio" stroke="#FF5722" strokeWidth={2.5} dot={{ r: 3, fill: '#FF5722', stroke: '#0A0A0F', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History table */}
        {logs.length > 0 && (
          <div className="card mb-lg fade-in-up">
            <p className="label mb-md">History</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Date', 'kg', 'Waist', 'W:H'].map(h => (
                      <th key={h} style={{ textAlign: 'left', color: 'var(--text-dim)', padding: '6px 8px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().slice(0, 10).map((l, i) => {
                    const ratio = l.waistCm ? calcWaistHeightRatio(l.waistCm, profile.heightCm).ratio.toFixed(3) : '—';
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{l.date}</td>
                        <td style={{ padding: '8px', fontWeight: 700 }}>{l.weightKg ?? '—'}</td>
                        <td style={{ padding: '8px' }}>{l.waistCm ?? '—'}</td>
                        <td style={{ padding: '8px', color: 'var(--accent-iron)', fontWeight: 700 }}>{ratio}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-dim mt-sm" style={{ fontStyle: 'italic' }}>{bmi.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
