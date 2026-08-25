// bodyMetrics.js — body composition calculations

/**
 * Waist-to-height ratio — primary progress metric for this user
 * Formula: waist(cm) ÷ height(cm)
 * User baseline: ~106.7cm ÷ 182cm ≈ 0.587
 * Target range: 0.53–0.55
 */
export function calcWaistHeightRatio(waistCm, heightCm) {
  const ratio = waistCm / heightCm;
  return {
    ratio: Math.round(ratio * 1000) / 1000,
    percent: Math.round(ratio * 100),
    status: ratio <= 0.5 ? 'excellent' : ratio <= 0.55 ? 'good' : ratio <= 0.6 ? 'moderate' : 'high',
    formula: `${waistCm}cm ÷ ${heightCm}cm = ${(ratio).toFixed(3)}`,
  };
}

/**
 * Waist-to-hip ratio — secondary metric
 * < 0.90 for males = healthy
 */
export function calcWaistHipRatio(waistCm, hipsCm) {
  if (!hipsCm || hipsCm === 0) return null;
  const ratio = waistCm / hipsCm;
  return {
    ratio: Math.round(ratio * 100) / 100,
    status: ratio < 0.9 ? 'healthy' : 'elevated',
    formula: `${waistCm}cm ÷ ${hipsCm}cm = ${ratio.toFixed(2)}`,
  };
}

/**
 * BMI — shown as reference only, never used as primary target
 * Formula: weight(kg) ÷ height(m)²
 */
export function calcBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return {
    value: Math.round(bmi * 10) / 10,
    category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese',
    note: 'BMI does not distinguish muscle from fat — not used as the primary goal metric here',
    formula: `${weightKg}kg ÷ (${(heightM).toFixed(2)}m)² = ${(bmi).toFixed(1)}`,
  };
}

/**
 * 60-day realistic goal curve
 * Returns array of { day, minKg, maxKg } representing the expected fat loss range
 * Min loss: 4kg over 60 days (0.067kg/day)
 * Max loss: 7kg over 60 days (0.117kg/day)
 */
export function calcGoalCurve(startWeightKg, daysTotal = 60) {
  const minLossPerDay = 4 / daysTotal;
  const maxLossPerDay = 7 / daysTotal;
  const points = [];
  for (let day = 0; day <= daysTotal; day += 3) {
    points.push({
      day,
      minKg: Math.round((startWeightKg - maxLossPerDay * day) * 10) / 10,
      maxKg: Math.round((startWeightKg - minLossPerDay * day) * 10) / 10,
    });
  }
  return points;
}

/**
 * Detect water weight drop in the first 14 days
 * Returns a flag if drop > 2kg within first 2 weeks
 */
export function flagWaterWeightDrop(bodyLogs, programStartDate) {
  if (bodyLogs.length < 2) return null;
  const start = new Date(programStartDate);
  const earlyLogs = bodyLogs.filter(log => {
    const d = new Date(log.date);
    return (d - start) / (1000 * 60 * 60 * 24) <= 14;
  }).sort((a, b) => a.date.localeCompare(b.date));

  if (earlyLogs.length < 2) return null;
  const drop = earlyLogs[0].weightKg - earlyLogs[earlyLogs.length - 1].weightKg;
  if (drop > 2) {
    return {
      type: 'info',
      message: `Early drop of ${drop.toFixed(1)}kg — this is mostly water weight from diet changes. Real fat loss is typically 0.5–1kg/week. Don't use this as the baseline for the rest of the 60 days.`,
    };
  }
  return null;
}

/**
 * Check if weight trend is stalling despite a logged deficit
 */
export function detectWeightStall(bodyLogs, _nutritionLogs) {
  if (bodyLogs.length < 3) return null;
  const recent = [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const weightDelta = recent[recent.length - 1].weightKg - recent[0].weightKg;
  // Less than 0.2kg change over 3+ weeks
  if (Math.abs(weightDelta) < 0.2 && recent.length >= 3) {
    return {
      type: 'warning',
      message: 'Weight has been flat for 3+ weeks. Either the deficit is smaller than logged, or it\'s a temporary plateau. Check if your food log matches what you\'re actually eating.',
    };
  }
  return null;
}

/**
 * US Navy Body Fat % formula (males)
 * BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 * Requires waist, neck, and height in cm
 */
export function calcBodyFatNavy(waistCm, neckCm, heightCm) {
  if (!waistCm || !neckCm || !heightCm || waistCm <= neckCm) return null;
  const bf = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  const rounded = Math.round(bf * 10) / 10;
  return {
    percent: Math.max(0, rounded),
    category: rounded < 14 ? 'Athletic' : rounded < 18 ? 'Fitness' : rounded < 25 ? 'Average' : 'Above Average',
    formula: `86.01×log₁₀(${waistCm}−${neckCm}) − 70.04×log₁₀(${heightCm}) + 36.76 = ${rounded}%`,
  };
}
