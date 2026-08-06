// nutrition.js — all nutrition calculations
// Formulas are shown explicitly so the user can verify every number

/**
 * Mifflin-St Jeor BMR then × activity multiplier
 * For male: BMR = 10×weight + 6.25×height - 5×age + 5
 * Activity multiplier for ~4x/week training = 1.55
 */
export function calcMaintenance(weightKg, heightCm, age) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const maintenance = Math.round(bmr * 1.55);
  return {
    bmr: Math.round(bmr),
    maintenance,
    formula: `BMR = 10×${weightKg} + 6.25×${heightCm} - 5×${age} + 5 = ${Math.round(bmr)} kcal → ×1.55 (4×/week) = ${maintenance} kcal`,
  };
}

/**
 * Protein target: 1.6–2.2g per kg bodyweight
 * At 97.5kg → 156–215g/day
 */
export function calcProteinTarget(weightKg) {
  return {
    minG: Math.round(weightKg * 1.6),
    maxG: Math.round(weightKg * 2.2),
    formula: `1.6–2.2g × ${weightKg}kg = ${Math.round(weightKg * 1.6)}–${Math.round(weightKg * 2.2)}g/day`,
  };
}

/**
 * Deficit target: 500–700 kcal below maintenance
 * Produces 0.5–1kg/week fat loss (3500 kcal ≈ 1 lb fat)
 */
export function calcDeficitTarget(maintenanceKcal) {
  return {
    minKcal: maintenanceKcal - 700,
    maxKcal: maintenanceKcal - 500,
    formula: `${maintenanceKcal} - 500 to 700 = ${maintenanceKcal - 700}–${maintenanceKcal - 500} kcal/day target`,
  };
}

/**
 * Sum a single day's meal entries
 */
export function getDayTotals(meals) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      proteinG: acc.proteinG + (m.proteinG || 0),
    }),
    { kcal: 0, proteinG: 0 }
  );
}

/**
 * 7-day rolling average for calories and protein
 */
export function getWeeklyAverages(nutritionLogs, referenceDate) {
  const ref = new Date(referenceDate);
  const weekLogs = nutritionLogs.filter(log => {
    const d = new Date(log.date);
    const diff = (ref - d) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  if (weekLogs.length === 0) return { kcal: 0, proteinG: 0, days: 0 };
  const totals = weekLogs.reduce(
    (acc, log) => ({
      kcal: acc.kcal + (log.totals?.kcal || 0),
      proteinG: acc.proteinG + (log.totals?.proteinG || 0),
    }),
    { kcal: 0, proteinG: 0 }
  );
  return {
    kcal: Math.round(totals.kcal / weekLogs.length),
    proteinG: Math.round(totals.proteinG / weekLogs.length),
    days: weekLogs.length,
  };
}

/**
 * Flag potentially incomplete log days
 * Returns null if OK, or an object with message if suspicious
 */
export function flagIncompleteDayLog(totals) {
  if (totals.kcal === 0) return null; // nothing logged at all — don't flag
  if (totals.kcal < 1500) {
    return {
      type: 'warning',
      message: `Only ${totals.kcal} kcal logged — looks incomplete. A full day is typically 2000+ kcal. Is this all you ate?`,
    };
  }
  if (totals.kcal > 4000) {
    return {
      type: 'info',
      message: `${totals.kcal} kcal logged — that's above maintenance. Fine occasionally, but track the weekly average.`,
    };
  }
  return null;
}

/**
 * Calculate how much protein is still needed today
 */
export function getProteinGap(loggedG, targetMinG) {
  const gap = targetMinG - loggedG;
  if (gap <= 0) return null;
  return { gap: Math.round(gap), message: `+${Math.round(gap)}g protein still needed today` };
}

/**
 * Estimate expected fat loss in kg for a given deficit and days
 * 7700 kcal ≈ 1kg fat
 */
export function estimateFatLoss(dailyDeficitKcal, days) {
  return (dailyDeficitKcal * days) / 7700;
}
