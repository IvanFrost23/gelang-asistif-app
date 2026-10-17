import type { BraceletState } from '../hooks/useBraceletPlayer'

type Props = { state: BraceletState; size?: number }

/** Браслет в SVG: ремешок, корпус, LED-полоска и кнопка. При сигнале LED окрашивается, корпус дрожит в фазе вибрации. */
export default function Bracelet({ state, size = 260 }: Props) {
  const { signal, on } = state
  const led = signal ? signal.color : '#cfd3e6'
  const glow = signal ? signal.color : 'transparent'
  const cls = ['bracelet', on ? 'shaking' : '', signal?.blink ? 'blinking' : ''].join(' ')
  return (
    <svg className={cls} width={size} height={size * 0.6} viewBox="0 0 260 156" role="img" aria-label="Gelang">
      <defs>
        <linearGradient id="strap" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#a89cf0" />
          <stop offset="1" stopColor="#8676e3" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {/* ремешок */}
      <path d="M8 78 C8 40 60 32 130 32 C200 32 252 40 252 78 C252 116 200 124 130 124 C60 124 8 116 8 78 Z" fill="url(#strap)" />
      <path d="M26 78 C26 56 70 50 130 50 C190 50 234 56 234 78 C234 100 190 106 130 106 C70 106 26 100 26 78 Z" fill="#f3f1fb" />
      {/* тени под ремешок для глубины */}
      <ellipse cx="130" cy="124" rx="110" ry="6" fill="#000" opacity=".08" />
      {/* корпус */}
      <g className="body">
        <rect x="92" y="44" width="76" height="68" rx="16" fill="#1f1b3a" />
        <rect x="96" y="48" width="68" height="60" rx="13" fill="#2a2650" />
        {/* свечение LED */}
        <rect x="118" y="56" width="24" height="44" rx="12" fill={glow} opacity=".7" filter="url(#glow)" className="led-glow" />
        {/* LED-полоска */}
        <rect x="124" y="58" width="12" height="40" rx="6" fill={led} className="led" />
        {/* кнопка */}
        <circle cx="106" cy="98" r="5" fill="#0f0d22" stroke="#4a4580" strokeWidth="1.5" />
        {/* микрофон */}
        <circle cx="154" cy="58" r="2" fill="#6f6a8a" />
      </g>
    </svg>
  )
}
