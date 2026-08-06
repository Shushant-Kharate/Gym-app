// Nutrition.jsx — Premium nutrition tracking with glassmorphism
import { useState, useMemo } from 'react';
import { Plus, Zap, AlertTriangle, Flame, TrendingUp } from 'lucide-react';
import { getNutritionLogForDate, saveNutritionLog, getProfile, getNutritionLogs } from '../db/storage';
import { calcMaintenance, calcProteinTarget, calcDeficitTarget, getDayTotals, getWeeklyAverages, flagIncompleteDayLog, getProteinGap } from '../logic/nutrition';
import { calcFoodNutrition, getPinnedFoods } from '../data/foodLibrary';
import MacroBar from '../components/nutrition/MacroBar';
import QuickAdd from '../components/nutrition/QuickAdd';
import FoodLog from '../components/nutrition/FoodLog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TODAY = new Date().toISOString().slice(0, 10);

export default function Nutrition() {
  const profile = getProfile();
  const [log, setLog] = useState(() => getNutritionLogForDate(TODAY));
  const [weeklyLogs] = useState(() => getNutritionLogs());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [viewMode, setViewMode] = useState('today');

  const maintenance = calcMaintenance(profile.currentWeightKg, profile.heightCm, profile.age);
  const proteinTarget = calcProteinTarget(profile.currentWeightKg);
  const deficitTarget = calcDeficitTarget(maintenance.maintenance);

  const meals = log.meals ?? [];
  const totals = useMemo(() => getDayTotals(meals), [meals]);
  const incompleteFlagResult = useMemo(() => flagIncompleteDayLog(totals), [totals]);
  const proteinGap = useMemo(() => getProteinGap(totals.proteinG, proteinTarget.minG), [totals, proteinTarget]);
  const weeklyAvg = useMemo(() => getWeeklyAverages(weeklyLogs, TODAY), [weeklyLogs]);

  const weekChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLog = weeklyLogs.find(l => l.date === dateStr);
      days.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), kcal: dayLog?.totals?.kcal ?? 0, protein: dayLog?.totals?.proteinG ?? 0 });
    }
    return days;
  }, [weeklyLogs]);

  function updateLog(newMeals) {
    const newTotals = getDayTotals(newMeals);
    const newLog = { ...log, meals: newMeals, totals: newTotals };
    setLog(newLog);
    saveNutritionLog(newLog);
  }

  function handleAddFood(entry) { updateLog([...meals, entry]); setShowQuickAdd(false); }
  function handleDeleteFood(idx) { updateLog(meals.filter((_, i) => i !== idx)); }

  function handleAddPinned(pinnedFood) {
    const nutrition = calcFoodNutrition(pinnedFood, pinnedFood.defaultGrams);
    handleAddFood({
      foodId: pinnedFood.id, name: pinnedFood.pinnedLabel ?? pinnedFood.name,
      grams: pinnedFood.defaultGrams, unit: pinnedFood.unit,
      kcal: nutrition.kcal, proteinG: nutrition.proteinG, addedAt: new Date().toISOString(),
    });
  }

  const pinnedFoods = getPinnedFoods();
  const pinnedAdded = useMemo(() => Object.fromEntries(pinnedFoods.map(p => [p.id, meals.some(m => m.foodId === p.id)])), [meals, pinnedFoods]);

  // Calorie/protein ring %
  const calPct = Math.min(100, (totals.kcal / deficitTarget.maxKcal) * 100);
  const proPct = Math.min(100, (totals.proteinG / proteinTarget.minG) * 100);

  return (
    <div>
      <div className="page-header">
        <div className="container flex items-center justify-between">
          <h1 className="page-title">Fuel</h1>
          <div className="flex gap-xs">
            <button id="nutrition-view-today" className={`btn btn-sm ${viewMode === 'today' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('today')}>Today</button>
            <button id="nutrition-view-week" className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('week')}>Week</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {showQuickAdd && (
          <div className="modal-backdrop" onClick={() => setShowQuickAdd(false)}>
            <div className="modal-sheet" style={{ maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <QuickAdd onAdd={handleAddFood} onClose={() => setShowQuickAdd(false)} />
            </div>
          </div>
        )}

        {viewMode === 'today' ? (
          <>
            {/* Dual ring hero */}
            <div className="card mb-md fade-in-up" style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 24 }}>
              <div className="flex justify-center gap-xl items-center" style={{ marginBottom: 16 }}>
                {/* Calorie ring */}
                <div className="metric-ring-container">
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#FF3F00" />
                      </linearGradient>
                    </defs>
                    <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                    <circle cx="55" cy="55" r="46" fill="none" stroke="url(#calGrad)" strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - calPct / 100)}
                      strokeLinecap="round" transform="rotate(-90 55 55)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 6px rgba(255,87,34,0.25))' }}
                    />
                  </svg>
                  <div className="metric-ring-center">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent-iron)' }}>
                      {Math.round(totals.kcal)}
                    </span>
                  </div>
                </div>

                {/* Protein ring */}
                <div className="metric-ring-container">
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <linearGradient id="proGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#4ADE80" />
                      </linearGradient>
                    </defs>
                    <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                    <circle cx="55" cy="55" r="46" fill="none" stroke="url(#proGrad)" strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - proPct / 100)}
                      strokeLinecap="round" transform="rotate(-90 55 55)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.25))' }}
                    />
                  </svg>
                  <div className="metric-ring-center">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
                      {Math.round(totals.proteinG)}g
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-xl text-xs text-muted">
                <span>Calories</span>
                <span>Protein</span>
              </div>
            </div>

            {/* Macro bars */}
            <div className="card mb-md fade-in-up">
              <div className="flex flex-col gap-md">
                <MacroBar label={`Calories (${deficitTarget.minKcal}–${deficitTarget.maxKcal})`} current={totals.kcal} target={deficitTarget.maxKcal} unit=" kcal" />
                <MacroBar label={`Protein (${proteinTarget.minG}–${proteinTarget.maxG}g)`} current={totals.proteinG} target={proteinTarget.minG} unit="g" colorVar="--success" />
              </div>
              <p className="text-xs text-dim mt-md" style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                {maintenance.formula}
              </p>
            </div>

            {incompleteFlagResult && (
              <div className={`banner banner-${incompleteFlagResult.type === 'warning' ? 'warning' : 'info'} mb-md`}>
                <AlertTriangle size={13} /><span>{incompleteFlagResult.message}</span>
              </div>
            )}
            {proteinGap && (
              <div className="banner banner-info mb-md">
                <Zap size={13} /><span>{proteinGap.message}</span>
              </div>
            )}

            {/* Pinned */}
            <div className="mb-md">
              <p className="label">Daily Staples</p>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                {pinnedFoods.map(food => (
                  <button key={food.id} id={`pinned-${food.id}`}
                    className={`btn btn-sm ${pinnedAdded[food.id] ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => !pinnedAdded[food.id] && handleAddPinned(food)}
                    disabled={pinnedAdded[food.id]}
                    style={{ opacity: pinnedAdded[food.id] ? 0.4 : 1 }}>
                    {pinnedAdded[food.id] ? '✓ ' : <Plus size={11} />}
                    {food.pinnedLabel ?? food.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Food log */}
            <div className="mb-lg">
              <div className="flex items-center justify-between mb-sm">
                <p className="label">Today's Log</p>
                <button id="nutrition-add-food" className="btn btn-primary btn-sm" onClick={() => setShowQuickAdd(true)}>
                  <Plus size={13} /> Add Food
                </button>
              </div>
              <FoodLog meals={meals} onDelete={handleDeleteFood} />
            </div>
          </>
        ) : (
          <>
            {/* Weekly stats */}
            <div className="card mb-md fade-in-up">
              <div className="flex justify-between mb-md">
                <div>
                  <p className="text-xs text-muted">7-day avg kcal</p>
                  <p className="display-md gradient-text-iron">{weeklyAvg.kcal}</p>
                  <p className="text-xs text-dim">target: {deficitTarget.minKcal}–{deficitTarget.maxKcal}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-xs text-muted">7-day avg protein</p>
                  <p className="display-md gradient-text-success">{weeklyAvg.proteinG}g</p>
                  <p className="text-xs text-dim">target: {proteinTarget.minG}–{proteinTarget.maxG}g</p>
                </div>
              </div>
              <p className="text-xs text-dim">One bad day isn't failure — the weekly average matters.</p>
            </div>

            <div className="card mb-md fade-in-up">
              <p className="label mb-md">Calories · 7 Days</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weekChartData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#F5F5F7' }}
                    formatter={v => [`${v} kcal`]} />
                  <ReferenceLine y={deficitTarget.minKcal} stroke="rgba(255,87,34,0.25)" strokeDasharray="4 4" />
                  <ReferenceLine y={deficitTarget.maxKcal} stroke="rgba(255,87,34,0.25)" strokeDasharray="4 4" />
                  <Bar dataKey="kcal" fill="url(#kcalBarGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="kcalBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B35" />
                      <stop offset="100%" stopColor="#FF3F00" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card mb-lg fade-in-up">
              <p className="label mb-md">Protein · 7 Days</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weekChartData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ background: '#16161E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#F5F5F7' }}
                    formatter={v => [`${v}g protein`]} />
                  <ReferenceLine y={proteinTarget.minG} stroke="rgba(74,222,128,0.35)" strokeDasharray="4 4" />
                  <Bar dataKey="protein" fill="url(#proBarGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="proBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ADE80" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
