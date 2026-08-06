// FoodLog.jsx — today's logged meals list with delete
import { Trash2 } from 'lucide-react';

export default function FoodLog({ meals, onDelete }) {
  if (meals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p className="text-muted text-sm">Nothing logged yet today.</p>
        <p className="text-dim text-xs mt-xs">Tap + to add your first meal.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xs">
      {meals.map((meal, i) => (
        <div key={i} className="card-alt flex items-center gap-sm" style={{ padding: '10px 12px' }}>
          <div style={{ flex: 1 }}>
            <p className="text-sm" style={{ fontWeight: 500 }}>{meal.name}</p>
            <p className="text-xs text-muted mono">{meal.grams}{meal.unit === 'ml' ? 'ml' : 'g'}</p>
          </div>
          <div className="flex gap-sm items-center">
            <div style={{ textAlign: 'right' }}>
              <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-iron)' }}>
                {meal.kcal} kcal
              </p>
              <p className="text-xs text-muted">{meal.proteinG}g pro</p>
            </div>
            <button
              id={`meal-delete-${i}`}
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--text-dim)', padding: 6 }}
              onClick={() => onDelete(i)}
              aria-label={`Delete ${meal.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
