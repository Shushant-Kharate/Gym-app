// ProgressRing.jsx — reusable animated SVG progress ring
import { useState, useEffect } from 'react';

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 100,
  strokeWidth = 8,
  label = '',
  sublabel = '',
  color = 'var(--accent-iron)',
  colorEnd,
  bgColor = 'rgba(255,255,255,0.05)',
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min(value / max, 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedProgress);
  const gradientId = `ring-${label.replace(/\s/g, '')}-${size}`;

  const isOver = value > max;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorEnd || color} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={bgColor} strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={isOver ? 'var(--danger, #F87171)' : `url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.3s ease' }}
        />
      </svg>
      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.22,
          fontWeight: 700,
          color: isOver ? 'var(--danger, #F87171)' : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {Math.round(value)}
        </span>
        {label && (
          <span style={{
            fontSize: Math.max(8, size * 0.08),
            color: 'var(--text-muted)',
            marginTop: 2,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span style={{
            fontSize: Math.max(7, size * 0.07),
            color: 'var(--text-dim)',
            marginTop: 1,
          }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
