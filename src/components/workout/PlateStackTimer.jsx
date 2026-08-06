// PlateStackTimer.jsx — Premium SVG plate stack with glow effects

export default function PlateStackTimer({ progress, display, isRunning }) {
  const rings = [
    { r: 92, stroke: 11, colorStart: '#FF6B35', colorEnd: '#FF3F00', opacity: 1.0 },
    { r: 76, stroke: 10, colorStart: '#FFD54F', colorEnd: '#FFB300', opacity: 0.85 },
    { r: 61, stroke: 9,  colorStart: '#FF6B35', colorEnd: '#FF3F00', opacity: 0.7 },
    { r: 47, stroke: 8,  colorStart: '#7A7787', colorEnd: '#4A475A', opacity: 0.55 },
    { r: 34, stroke: 7,  colorStart: '#FF6B35', colorEnd: '#FF3F00', opacity: 0.45 },
    { r: 22, stroke: 5,  colorStart: '#FFD54F', colorEnd: '#FFB300', opacity: 0.35 },
  ];

  const totalRings = rings.length;
  const elapsed = 1 - progress;

  return (
    <div className="plate-stack-container">
      <svg width="230" height="230" viewBox="0 0 230 230" role="img" aria-label={`Session timer: ${display}`}>
        {/* Background glow */}
        <defs>
          <radialGradient id="timerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 87, 34, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="ringGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          {rings.map((ring, i) => (
            <linearGradient key={`g${i}`} id={`rg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ring.colorStart} />
              <stop offset="100%" stopColor={ring.colorEnd} />
            </linearGradient>
          ))}
        </defs>

        <circle cx="115" cy="115" r="100" fill="url(#timerGlow)" />

        {rings.map((ring, i) => {
          const cx = 115, cy = 115;
          const circumference = 2 * Math.PI * ring.r;
          const ringStart = i / totalRings;
          const ringEnd = (i + 1) / totalRings;
          let ringFill;
          if (elapsed <= ringStart) ringFill = 1;
          else if (elapsed >= ringEnd) ringFill = 0;
          else ringFill = 1 - (elapsed - ringStart) / (1 / totalRings);

          const dashOffset = circumference * (1 - ringFill);

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={ring.r} fill="none"
                stroke={ring.colorStart} strokeWidth={ring.stroke} opacity={0.06} />
              {/* Glow layer */}
              {ringFill > 0.1 && (
                <circle cx={cx} cy={cy} r={ring.r} fill="none"
                  stroke={`url(#rg${i})`} strokeWidth={ring.stroke + 4}
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" opacity={ring.opacity * 0.2}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  filter="url(#ringGlow)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              )}
              {/* Main ring */}
              <circle cx={cx} cy={cy} r={ring.r} fill="none"
                stroke={`url(#rg${i})`} strokeWidth={ring.stroke}
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" opacity={ring.opacity}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </g>
          );
        })}

        {/* Center display */}
        <text x="115" y="106" textAnchor="middle" fill="#F5F5F7"
          fontFamily="Oswald, sans-serif" fontSize="38" fontWeight="700" letterSpacing="-1">
          {display}
        </text>
        <text x="115" y="128" textAnchor="middle" fill={isRunning ? '#FF5722' : '#7A7787'}
          fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" letterSpacing="2">
          {isRunning ? '● LIVE' : '❚❚ PAUSED'}
        </text>
      </svg>
    </div>
  );
}
