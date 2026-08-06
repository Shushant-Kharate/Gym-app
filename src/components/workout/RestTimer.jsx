// RestTimer.jsx — Adjustable rest timer overlay
// Features:
//   • +15 / -15 buttons to change duration while running
//   • Every 30s: gentle double-ping reminder
//   • Last 10s: loud escalating square-wave tick each second
//   • Corner mini-clock shows elapsed session time (passed as prop)
import { useCallback } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';

export default function RestTimer({ durationSec, exerciseName, onDismiss, sessionElapsed }) {
  const { playRestComplete, playReminder30s, playCountdownTick, playGoSignal } = useAudio();

  // onTick fires every second with (secondsLeft, totalSeconds)
  const handleTick = useCallback((secondsLeft, totalSeconds) => {
    // ── Last 10 seconds: loud escalating countdown beep ──────────────────
    if (secondsLeft <= 10 && secondsLeft > 0) {
      playCountdownTick(secondsLeft);
    }

    // ── Every 30s reminder (only while there's still plenty of time left) ─
    // Fire when secondsLeft is a multiple of 30, but NOT in the final 10s
    // and NOT at the very start (totalSeconds)
    if (secondsLeft > 10 && secondsLeft < totalSeconds && secondsLeft % 30 === 0) {
      playReminder30s();
    }
  }, [playCountdownTick, playReminder30s]);

  const timer = useTimer(durationSec, () => {
    playRestComplete();
    setTimeout(() => playGoSignal(), 400);
  }, true, handleTick);

  const {
    display, progress, secondsLeft, totalSeconds,
    addTime, subtractTime,
  } = timer;

  const isLow        = secondsLeft <= 10;
  const isMid        = secondsLeft <= 30 && secondsLeft > 10;
  const circumference = 2 * Math.PI * 74;

  // Stroke colour: orange → yellow at 30s → red at 10s
  const strokeStart = isLow ? '#F87171' : isMid ? '#FFD54F' : '#FF6B35';
  const strokeEnd   = isLow ? '#DC2626' : isMid ? '#FFB300' : '#FF3F00';
  const glowColor   = isLow
    ? 'rgba(248,113,113,0.4)'
    : isMid
      ? 'rgba(255,213,79,0.3)'
      : 'rgba(255,87,34,0.25)';

  return (
    <div className="rest-timer-overlay" onClick={onDismiss} aria-modal="true" role="dialog" aria-label="Rest timer">
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 340 }} onClick={e => e.stopPropagation()}>

        {/* ── Corner session clock ────────────────────────────────────────── */}
        {sessionElapsed && (
          <div style={{
            position: 'absolute', top: 20, right: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '5px 12px',
            backdropFilter: 'blur(8px)',
          }}>
            <p className="text-xs text-dim" style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Session</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>
              {sessionElapsed}
            </p>
          </div>
        )}

        {/* ── Exercise label ───────────────────────────────────────────────── */}
        <p className="text-xs text-muted" style={{ letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
          Rest — {exerciseName}
        </p>

        {/* ── Duration adjustment buttons ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-lg mb-sm">
          <button
            id="rest-minus-15"
            className="btn btn-secondary"
            style={{ width: 48, height: 48, borderRadius: 14, fontSize: 13, fontWeight: 700, padding: 0 }}
            onClick={() => subtractTime(15)}
            aria-label="Subtract 15 seconds"
          >
            <Minus size={18} />
          </button>

          {/* ── SVG ring timer ──────────────────────────────────────────────── */}
          <svg
            width="180" height="180" viewBox="0 0 180 180"
            style={{
              filter: `drop-shadow(0 0 24px ${glowColor})`,
              transition: 'filter 0.5s ease',
            }}
          >
            <defs>
              <linearGradient id="restGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={strokeStart} />
                <stop offset="100%" stopColor={strokeEnd} />
              </linearGradient>
            </defs>

            {/* Background track */}
            <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />

            {/* Progress ring */}
            <circle
              cx="90" cy="90" r="74" fill="none"
              stroke="url(#restGrad)" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />

            {/* Countdown digits */}
            <text
              x="90" y={isLow ? '78' : '82'}
              textAnchor="middle"
              fill={isLow ? '#F87171' : isMid ? '#FFD54F' : '#F5F5F7'}
              fontFamily="Oswald, sans-serif"
              fontSize={isLow ? '54' : '48'}
              fontWeight="700"
              style={{ transition: 'fill 0.3s ease, font-size 0.2s ease' }}
            >
              {display}
            </text>

            {/* Status label */}
            <text x="90" y="108" textAnchor="middle"
              fill={isLow ? '#F87171' : isMid ? '#FFD54F' : '#7A7787'}
              fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" letterSpacing="2"
            >
              {isLow ? '● FINAL COUNTDOWN' : isMid ? '◐ ALMOST DONE' : 'REST'}
            </text>

            {/* 3...2...1...GO! overlay text */}
            {secondsLeft <= 3 && secondsLeft > 0 && (
              <text x="90" y="90" textAnchor="middle"
                fill="#F87171"
                fontFamily="Oswald, sans-serif" fontSize="72" fontWeight="700"
                opacity={0.15}
              >
                {secondsLeft}
              </text>
            )}
            {secondsLeft === 0 && (
              <text x="90" y="88" textAnchor="middle"
                fill="#4ADE80"
                fontFamily="Oswald, sans-serif" fontSize="42" fontWeight="700"
              >
                GO!
              </text>
            )}

            {/* Total duration label at bottom */}
            <text x="90" y="150" textAnchor="middle"
              fill="rgba(255,255,255,0.18)"
              fontFamily="var(--font-mono, monospace)" fontSize="11" fontWeight="500"
            >
              {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')} total
            </text>
          </svg>

          <button
            id="rest-plus-15"
            className="btn btn-secondary"
            style={{ width: 48, height: 48, borderRadius: 14, fontSize: 13, fontWeight: 700, padding: 0 }}
            onClick={() => addTime(15)}
            aria-label="Add 15 seconds"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* ── Adjustment hint ─────────────────────────────────────────────── */}
        <p className="text-xs text-dim mb-md" style={{ letterSpacing: '0.5px' }}>
          − / + to adjust · beeps every 30s · final 10s countdown
        </p>

        {/* ── Quick-add presets ────────────────────────────────────────────── */}
        <div className="flex gap-sm justify-center mb-md">
          {[-30, +30, +60].map(delta => (
            <button
              key={delta}
              id={`rest-adjust-${delta}`}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '5px 12px', minWidth: 52 }}
              onClick={() => delta > 0 ? addTime(Math.abs(delta)) : subtractTime(Math.abs(delta))}
              aria-label={`${delta > 0 ? 'Add' : 'Remove'} ${Math.abs(delta)} seconds`}
            >
              {delta > 0 ? '+' : '−'}{Math.abs(delta)}s
            </button>
          ))}
        </div>

        {/* ── Skip button ──────────────────────────────────────────────────── */}
        <div className="flex gap-md justify-center">
          <button id="rest-skip" className="btn btn-ghost btn-sm" onClick={onDismiss}>
            <X size={14} /> Skip Rest
          </button>
        </div>
        <p className="text-xs text-dim mt-sm">Tap background to dismiss</p>
      </div>
    </div>
  );
}
