// Pre-seeded Indian food library
// kcalPer100g and proteinPer100g are per 100g (or per 100ml for liquids)
// pinned = appears as one-tap daily fixed entry

export const FOOD_LIBRARY = [
  // ─── Grains & Staples ───────────────────────────────────────────────────────
  { id: 'oats_dry',       name: 'Oats (dry)',           kcalPer100g: 389, proteinPer100g: 17,  category: 'Grains',  unit: 'g' },
  { id: 'roti',           name: 'Roti / Chapati',       kcalPer100g: 297, proteinPer100g: 8.6, category: 'Grains',  unit: 'piece', gramsPerUnit: 35 },
  { id: 'rice_cooked',    name: 'Rice (cooked)',         kcalPer100g: 130, proteinPer100g: 2.7, category: 'Grains',  unit: 'g' },
  { id: 'bread_wheat',    name: 'Whole Wheat Bread',    kcalPer100g: 247, proteinPer100g: 13,  category: 'Grains',  unit: 'slice', gramsPerUnit: 30 },
  { id: 'poha',           name: 'Poha (cooked)',         kcalPer100g: 130, proteinPer100g: 2.0, category: 'Grains',  unit: 'g' },
  { id: 'upma',           name: 'Upma (cooked)',         kcalPer100g: 102, proteinPer100g: 2.8, category: 'Grains',  unit: 'g' },

  // ─── Dals & Legumes ─────────────────────────────────────────────────────────
  { id: 'toor_dal',       name: 'Toor Dal (cooked)',    kcalPer100g: 116, proteinPer100g: 7.0, category: 'Dal',     unit: 'g' },
  { id: 'chana_dal',      name: 'Chana Dal (cooked)',   kcalPer100g: 164, proteinPer100g: 9.0, category: 'Dal',     unit: 'g' },
  { id: 'moong_dal',      name: 'Moong Dal (cooked)',   kcalPer100g: 105, proteinPer100g: 7.0, category: 'Dal',     unit: 'g' },
  { id: 'rajma',          name: 'Rajma (cooked)',       kcalPer100g: 127, proteinPer100g: 8.7, category: 'Dal',     unit: 'g' },
  { id: 'chole',          name: 'Chole / Chickpeas',    kcalPer100g: 164, proteinPer100g: 8.9, category: 'Dal',     unit: 'g' },

  // ─── Vegetables ─────────────────────────────────────────────────────────────
  { id: 'bhindi',         name: 'Bhindi Sabji',         kcalPer100g: 33,  proteinPer100g: 1.9, category: 'Veggie',  unit: 'g' },
  { id: 'cabbage',        name: 'Cabbage Sabji',        kcalPer100g: 25,  proteinPer100g: 1.3, category: 'Veggie',  unit: 'g' },
  { id: 'palak',          name: 'Palak / Spinach',      kcalPer100g: 23,  proteinPer100g: 2.9, category: 'Veggie',  unit: 'g' },
  { id: 'broccoli',       name: 'Broccoli',             kcalPer100g: 34,  proteinPer100g: 2.8, category: 'Veggie',  unit: 'g' },
  { id: 'potato',         name: 'Potato (boiled)',      kcalPer100g: 86,  proteinPer100g: 1.7, category: 'Veggie',  unit: 'g' },
  { id: 'tomato',         name: 'Tomato',               kcalPer100g: 18,  proteinPer100g: 0.9, category: 'Veggie',  unit: 'g' },
  { id: 'onion',          name: 'Onion',                kcalPer100g: 40,  proteinPer100g: 1.1, category: 'Veggie',  unit: 'g' },
  { id: 'mixed_sabji',    name: 'Mixed Sabji (est.)',   kcalPer100g: 80,  proteinPer100g: 3.0, category: 'Veggie',  unit: 'g' },

  // ─── Dairy & Protein ────────────────────────────────────────────────────────
  { id: 'milk_full',      name: 'Milk (full fat)',      kcalPer100g: 61,  proteinPer100g: 3.2, category: 'Dairy',   unit: 'ml' },
  { id: 'milk_toned',     name: 'Milk (toned)',         kcalPer100g: 43,  proteinPer100g: 3.0, category: 'Dairy',   unit: 'ml' },
  { id: 'curd',           name: 'Curd / Yogurt',        kcalPer100g: 60,  proteinPer100g: 3.5, category: 'Dairy',   unit: 'g' },
  { id: 'paneer',         name: 'Paneer',               kcalPer100g: 265, proteinPer100g: 18,  category: 'Dairy',   unit: 'g' },
  { id: 'cheese_slice',   name: 'Cheese Slice',         kcalPer100g: 300, proteinPer100g: 19,  category: 'Dairy',   unit: 'slice', gramsPerUnit: 20 },

  // ─── High-Protein Veg Sources ────────────────────────────────────────────────
  { id: 'tofu',           name: 'Tofu (firm)',          kcalPer100g: 76,  proteinPer100g: 8.0, category: 'Protein', unit: 'g' },
  { id: 'soya_chunks',    name: 'Soya Chunks (dry)',    kcalPer100g: 345, proteinPer100g: 52,  category: 'Protein', unit: 'g' },
  { id: 'soya_cooked',    name: 'Soya Chunks (cooked)', kcalPer100g: 149, proteinPer100g: 15,  category: 'Protein', unit: 'g' },
  { id: 'egg',            name: 'Egg (whole)',          kcalPer100g: 155, proteinPer100g: 13,  category: 'Protein', unit: 'piece', gramsPerUnit: 50 },
  { id: 'egg_white',      name: 'Egg White',            kcalPer100g: 52,  proteinPer100g: 11,  category: 'Protein', unit: 'piece', gramsPerUnit: 33 },

  // ─── Fruits ──────────────────────────────────────────────────────────────────
  { id: 'apple',          name: 'Apple',                kcalPer100g: 52,  proteinPer100g: 0.3, category: 'Fruit',   unit: 'piece', gramsPerUnit: 150 },
  { id: 'banana',         name: 'Banana',               kcalPer100g: 89,  proteinPer100g: 1.1, category: 'Fruit',   unit: 'piece', gramsPerUnit: 120 },
  { id: 'orange',         name: 'Orange',               kcalPer100g: 47,  proteinPer100g: 0.9, category: 'Fruit',   unit: 'piece', gramsPerUnit: 130 },

  // ─── Nuts & Seeds ────────────────────────────────────────────────────────────
  { id: 'almonds',        name: 'Almonds',              kcalPer100g: 579, proteinPer100g: 21,  category: 'Nuts',    unit: 'g' },
  { id: 'peanut_butter',  name: 'Peanut Butter',        kcalPer100g: 588, proteinPer100g: 25,  category: 'Nuts',    unit: 'g' },
  { id: 'peanuts',        name: 'Peanuts (roasted)',    kcalPer100g: 567, proteinPer100g: 26,  category: 'Nuts',    unit: 'g' },
  { id: 'chia_seeds',     name: 'Chia Seeds',           kcalPer100g: 486, proteinPer100g: 17,  category: 'Nuts',    unit: 'g' },

  // ─── Oils & Condiments ───────────────────────────────────────────────────────
  { id: 'ghee',           name: 'Ghee',                 kcalPer100g: 900, proteinPer100g: 0,   category: 'Fat',     unit: 'g' },
  { id: 'cooking_oil',    name: 'Cooking Oil',          kcalPer100g: 884, proteinPer100g: 0,   category: 'Fat',     unit: 'ml' },

  // ─── Supplements ─────────────────────────────────────────────────────────────
  {
    id: 'whey_scoop',
    name: 'Whey Protein Scoop',
    kcalPer100g: 417,         // ~150 kcal per 36g scoop
    proteinPer100g: 69,       // ~25g protein per 36g scoop
    category: 'Supplement',
    unit: 'scoop',
    gramsPerUnit: 36,
    pinned: true,
    pinnedLabel: 'Whey Protein',
    defaultGrams: 36,
  },
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    kcalPer100g: 0,
    proteinPer100g: 0,
    category: 'Supplement',
    unit: 'g',
    pinned: true,
    pinnedLabel: 'Creatine 3g',
    defaultGrams: 3,
  },

  // ─── Snacks & Ready-Made ──────────────────────────────────────────────────────
  { id: 'chivda',         name: 'Chivda / Namkeen',    kcalPer100g: 480, proteinPer100g: 9,   category: 'Snack',   unit: 'g' },
  { id: 'biscuits',       name: 'Marie Biscuits',       kcalPer100g: 430, proteinPer100g: 7,   category: 'Snack',   unit: 'piece', gramsPerUnit: 7 },
  { id: 'samosa',         name: 'Samosa (medium)',      kcalPer100g: 262, proteinPer100g: 4,   category: 'Snack',   unit: 'piece', gramsPerUnit: 100 },
];

export function getPinnedFoods() {
  return FOOD_LIBRARY.filter(f => f.pinned);
}

export function calcFoodNutrition(food, grams) {
  return {
    kcal: Math.round((food.kcalPer100g * grams) / 100),
    proteinG: Math.round(((food.proteinPer100g * grams) / 100) * 10) / 10,
  };
}

export function searchFoods(query) {
  const q = query.toLowerCase();
  return FOOD_LIBRARY.filter(f =>
    f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}
