// QuickAdd.jsx — food search + quick-add with pre-seeded library
import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { FOOD_LIBRARY, calcFoodNutrition } from '../../data/foodLibrary';

export default function QuickAdd({ onAdd, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return FOOD_LIBRARY.slice(0, 20);
    const q = query.toLowerCase();
    return FOOD_LIBRARY.filter(f =>
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query]);

  function handleSelect(food) {
    setSelectedFood(food);
    setGrams(food.gramsPerUnit ? String(food.gramsPerUnit) : '100');
  }

  function handleAdd() {
    if (!selectedFood || !grams) return;
    const g = parseFloat(grams);
    const nutrition = calcFoodNutrition(selectedFood, g);
    onAdd({
      foodId: selectedFood.id,
      name: selectedFood.name,
      grams: g,
      unit: selectedFood.unit,
      kcal: nutrition.kcal,
      proteinG: nutrition.proteinG,
      addedAt: new Date().toISOString(),
    });
    setSelectedFood(null);
    setGrams('');
    setQuery('');
  }

  // Group by category
  const grouped = useMemo(() => {
    const map = {};
    results.forEach(f => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [results]);

  if (selectedFood) {
    const g = parseFloat(grams) || 0;
    const nutrition = calcFoodNutrition(selectedFood, g);
    return (
      <div>
        <div className="flex items-center gap-sm mb-md">
          <button id="quickadd-back" className="btn btn-ghost btn-icon" onClick={() => setSelectedFood(null)}>
            <X size={18} />
          </button>
          <h3 className="display-xs">{selectedFood.name}</h3>
        </div>

        <div className="card-alt mb-md">
          <div className="flex justify-between mb-sm">
            <span className="text-muted text-sm">Quantity ({selectedFood.unit})</span>
          </div>
          <div className="flex gap-sm items-center">
            <input
              id="quickadd-grams"
              type="number"
              className="input"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              step={selectedFood.gramsPerUnit ?? 10}
              min="0"
              autoFocus
            />
            <span className="text-muted text-sm" style={{ whiteSpace: 'nowrap' }}>
              {selectedFood.unit === 'g' ? 'grams' : selectedFood.unit === 'ml' ? 'ml' : selectedFood.unit}
            </span>
          </div>
        </div>

        <div className="card-alt mb-md">
          <div className="flex justify-between">
            <div className="text-center flex-1">
              <p className="display-sm text-iron">{nutrition.kcal}</p>
              <p className="text-xs text-muted">kcal</p>
            </div>
            <div className="text-center flex-1">
              <p className="display-sm" style={{ color: 'var(--success)' }}>{nutrition.proteinG}g</p>
              <p className="text-xs text-muted">protein</p>
            </div>
            <div className="text-center flex-1">
              <p className="display-sm text-muted">{g}g</p>
              <p className="text-xs text-muted">serving</p>
            </div>
          </div>
        </div>

        <button id="quickadd-confirm" className="btn btn-primary btn-full btn-lg" onClick={handleAdd}>
          <Plus size={18} /> Add to Log
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-sm mb-md">
        <button id="quickadd-close" className="btn btn-ghost btn-icon" onClick={onClose}>
          <X size={18} />
        </button>
        <h3 className="display-xs">Add Food</h3>
      </div>

      <div style={{ position: 'relative', marginBottom: 'var(--sp-md)' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          id="quickadd-search"
          type="text"
          className="input"
          placeholder="Search foods..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: 36 }}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-xs" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        {Object.entries(grouped).map(([cat, foods]) => (
          <div key={cat} style={{ marginBottom: 12 }}>
            <p className="label" style={{ paddingLeft: 4 }}>{cat}</p>
            {foods.map(food => (
              <button
                key={food.id}
                id={`food-${food.id}`}
                className="check-row"
                style={{ marginBottom: 4, width: '100%', textAlign: 'left' }}
                onClick={() => handleSelect(food)}
              >
                <div style={{ flex: 1 }}>
                  <p className="text-sm" style={{ fontWeight: 500 }}>{food.name}</p>
                  <p className="text-xs text-muted">
                    {food.kcalPer100g} kcal · {food.proteinPer100g}g protein per 100{food.unit === 'ml' ? 'ml' : 'g'}
                  </p>
                </div>
                <Plus size={16} color="var(--accent-iron)" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
