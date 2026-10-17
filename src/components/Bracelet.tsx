import type { BraceletState } from '../hooks/useBraceletPlayer'

type Props = { state: BraceletState; size?: number }

/**
 * Браслет в SVG, вид в три четверти: силиконовый ремешок с объёмом и пряжкой,
 * глянцевый корпус со стеклом, вертикальная LED-полоска, кнопка и микрофон.
 * При сигнале LED окрашивается и светится, корпус дрожит в фазе вибрации.
 */
export default function Bracelet({ state, size = 280 }: Props) {
  const { signal, on } = state
  const led = signal ? signal.color : '#b9bed6'
  const active = !!signal
  const cls = ['bracelet', on ? 'shaking' : '', signal?.blink ? 'blinking' : '', active ? 'active' : ''].join(' ')
  return (
    <svg className={cls} width={size} height={size * 0.62} viewBox="0 0 300 186" role="img" aria-label="Gelang">
      <defs>
        <linearGradient id="strapTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3b8f5" />
          <stop offset=".5" stopColor="#9f91ea" />
          <stop offset="1" stopColor="#7b6bd6" />
        </linearGradient>
        <linearGradient id="strapInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e50b8" />
          <stop offset=".6" stopColor="#8678dc" />
          <stop offset="1" stopColor="#b3a7f0" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3566" />
          <stop offset="1" stopColor="#15122b" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ledGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".25" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".15" />
        </linearGradient>
        <radialGradient id="btnGrad" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#4d477f" />
          <stop offset="1" stopColor="#0e0c1d" />
        </radialGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5fa" />
          <stop offset=".5" stopColor="#b8bccc" />
          <stop offset="1" stopColor="#e6e8f0" />
        </linearGradient>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1f1b3a" floodOpacity=".28" />
        </filter>
        <filter id="strapShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1f1b3a" floodOpacity=".18" />
        </filter>
      </defs>

      {/* тень под браслетом */}
      <ellipse cx="150" cy="170" rx="118" ry="8" fill="#1f1b3a" opacity=".08" />

      {/* внутренняя (задняя) стенка ремешка */}
      <g filter="url(#strapShadow)">
        <path d="M22 96 C22 52 86 36 150 36 C214 36 278 52 278 96 C278 140 214 158 150 158 C86 158 22 140 22 96 Z" fill="url(#strapInner)" />
        {/* отверстие */}
        <path d="M46 96 C46 70 98 60 150 60 C202 60 254 70 254 96 C254 120 202 132 150 132 C98 132 46 120 46 96 Z" fill="#f3f1fb" />
        {/* верхняя плоскость ремешка */}
        <path d="M22 92 C22 50 86 34 150 34 C214 34 278 50 278 92 C278 112 250 122 220 126 L220 118 C244 114 262 106 262 92 C262 60 206 50 150 50 C94 50 38 60 38 92 C38 106 56 114 80 118 L80 126 C50 122 22 112 22 92 Z" fill="url(#strapTop)" />
        {/* блик по верхнему краю */}
        <path d="M60 60 C90 46 120 42 150 42 C180 42 210 46 240 60" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
        {/* отверстия для пряжки на правой стороне */}
        {[214, 226, 238].map((x, i) => (
          <ellipse key={i} cx={x} cy={62 + i * 2} rx="2.2" ry="1.6" fill="#5a4db3" opacity=".8" />
        ))}
        {/* пряжка */}
        <g transform="translate(246 70) rotate(18)">
          <rect x="-7" y="-9" width="14" height="18" rx="3" fill="url(#metal)" stroke="#8d93a8" strokeWidth="1" />
          <rect x="-4" y="-6" width="8" height="12" rx="2" fill="#7b6bd6" />
          <rect x="-1" y="-9" width="2" height="10" rx="1" fill="#9aa0b5" />
        </g>
      </g>

      {/* корпус */}
      <g className="body" filter="url(#softShadow)">
        {/* подложка корпуса, слегка выступает из ремешка */}
        <rect x="104" y="26" width="92" height="86" rx="24" fill="#0f0d22" />
        <rect x="107" y="29" width="86" height="80" rx="22" fill="url(#bodyGrad)" />
        {/* стекло */}
        <rect x="113" y="35" width="74" height="68" rx="18" fill="#141129" />
        {/* свечение LED */}
        <rect x="126" y="38" width="48" height="62" rx="24" fill={led} opacity={active ? 1 : 0} filter="url(#glow)" className="led-glow" />
        {/* LED-полоска */}
        <rect x="143" y="46" width="14" height="46" rx="7" fill={led} className="led" />
        <rect x="143" y="46" width="14" height="46" rx="7" fill="url(#ledGrad)" />
        {/* кнопка */}
        <circle cx="128" cy="88" r="7.5" fill="url(#btnGrad)" stroke="#5a5490" strokeWidth="1.2" />
        <circle cx="126.5" cy="86" r="2.2" fill="#fff" opacity=".18" />
        {/* микрофон */}
        <circle cx="174" cy="46" r="2.2" fill="#6f6a8a" />
        {/* блик стекла */}
        <rect x="113" y="35" width="74" height="68" rx="18" fill="url(#glass)" />
        {/* контур стекла */}
        <rect x="113" y="35" width="74" height="68" rx="18" fill="none" stroke="#fff" strokeOpacity=".12" />
      </g>
    </svg>
  )
}
