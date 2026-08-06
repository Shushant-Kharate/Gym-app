// MacroBar.jsx — Glowing gradient progress bars
export default function MacroBar({ label, current, target, unit = 'g', colorVar = '--accent-iron' }) {
  const pct = Math.min((current / Math.max(target, 1)) * 100, 100);
  const isOver = current > target;
  const gap = target - current;

  const isSuccess = colorVar === '--success';
  const gradientBg = isOver
    ? 'linear-gradient(90deg, #FFB300, #FFD54F)'
    : isSuccess
      ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
      : 'linear-gradient(90deg, var(--accent-start), var(--accent-end))';

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
        <span className="text-xs text-muted" style={{ fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
        <span className="text-sm" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <span style={{ color: isOver ? 'var(--accent-brass)' : isSuccess ? 'var(--success)' : 'var(--accent-iron)' }}>
            {Math.round(current)}
          </span>
          <span className="text-dim"> / {Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className="progress-track" style={{ height: 8 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: gradientBg }} />
      </div>
      {gap > 0 && (
        <p className="text-xs text-muted mt-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          +{Math.round(gap)}{unit} needed
        </p>
      )}
      {isOver && (
        <p className="text-xs mt-xs" style={{ color: 'var(--accent-brass)', fontFamily: 'var(--font-mono)' }}>
          {Math.round(current - target)}{unit} over
        </p>
      )}
    </div>
  );
}
