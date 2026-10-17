import type { BraceletState } from '../hooks/useBraceletPlayer'

type Props = { state: BraceletState; size?: number }

/**
 * Браслет «как на продуктовом рендере»: вертикальный силиконовый ремешок,
 * капсульный корпус с чёрным стеклом, вертикальная LED-полоска, кнопка сбоку, микрофон.
 * При сигнале LED окрашивается и светится, корпус дрожит в фазе вибрации.
 */
export default function Bracelet({ state, size = 240 }: Props) {
  const { signal, on } = state
  const active = !!signal
  const led = active ? signal!.color : '#a99cf2'
  const cls = ['bracelet', on ? 'shaking' : '', signal?.blink ? 'blinking' : '', active ? 'active' : 'idle'].join(' ')
  const h = size * 0.8
  return (
    <svg className={cls} width={size} height={h} viewBox="0 0 250 200" role="img" aria-label="Gelang">
      <defs>
        <linearGradient id="strapV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d7fe6" />
          <stop offset=".18" stopColor="#b2a6f3" />
          <stop offset=".5" stopColor="#c9c0f8" />
          <stop offset=".82" stopColor="#b2a6f3" />
          <stop offset="1" stopColor="#8d7fe6" />
        </linearGradient>
        <linearGradient id="strapFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".18" />
          <stop offset=".12" stopColor="#000" stopOpacity="0" />
          <stop offset=".88" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <linearGradient id="bodyV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a4480" />
          <stop offset=".5" stopColor="#1b1836" />
          <stop offset="1" stopColor="#2f2a56" />
        </linearGradient>
        <linearGradient id="glassV" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".03" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ledV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="btnV" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#6c64a8" />
          <stop offset="1" stopColor="#15122b" />
        </radialGradient>
        <filter id="glowV" x="-150%" y="-60%" width="400%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="bodyShadow" x="-40%" y="-20%" width="180%" height="150%">
          <feDropShadow dx="-10" dy="0" stdDeviation="8" floodColor="#120f2a" floodOpacity=".45" />
        </filter>
        <filter id="strapShadowV" x="-40%" y="-10%" width="180%" height="130%">
          <feDropShadow dx="-6" dy="0" stdDeviation="6" floodColor="#2a2060" floodOpacity=".25" />
        </filter>
      </defs>

      <g transform="translate(0 200) rotate(-90)">
      {/* ремешок */}
      <g filter="url(#strapShadowV)">
        <rect x="66" y="0" width="68" height="250" rx="34" fill="url(#strapV)" />
        <rect x="66" y="0" width="68" height="250" rx="34" fill="url(#strapFade)" />
        {/* продольный блик */}
        <rect x="92" y="8" width="7" height="234" rx="3.5" fill="#fff" opacity=".35" />
        {/* отверстия внизу */}
        {[196, 212, 228].map((y) => <ellipse key={y} cx="100" cy={y} rx="4" ry="2.6" fill="#6f61c8" opacity=".75" />)}
        {/* поперечные риски сверху */}
        {[18, 30, 42].map((y) => <rect key={y} x="76" y={y} width="48" height="2" rx="1" fill="#fff" opacity=".18" />)}
      </g>

      {/* корпус */}
      <g className="body" filter="url(#bodyShadow)">
        <rect x="52" y="62" width="96" height="126" rx="48" fill="#0f0d22" />
        <rect x="55" y="65" width="90" height="120" rx="45" fill="url(#bodyV)" />
        {/* стекло */}
        <rect x="62" y="72" width="76" height="106" rx="38" fill="#0c0a1c" />
        {/* свечение */}
        <rect x="86" y="92" width="28" height="66" rx="14" fill={led} opacity={active ? 1 : 0.35} filter="url(#glowV)" className="led-glow" />
        {/* LED */}
        <rect x="94" y="96" width="12" height="58" rx="6" fill={led} className="led" />
        <rect x="94" y="96" width="12" height="58" rx="6" fill="url(#ledV)" />
        {/* кнопка */}
        <circle cx="82" cy="160" r="7" fill="url(#btnV)" stroke="#5a5490" strokeWidth="1.2" />
        <circle cx="80" cy="158" r="2" fill="#fff" opacity=".2" />
        {/* микрофон */}
        <circle cx="120" cy="84" r="2.2" fill="#7a74a8" />
        {/* блик стекла */}
        <rect x="62" y="72" width="76" height="106" rx="38" fill="url(#glassV)" />
        <rect x="62" y="72" width="76" height="106" rx="38" fill="none" stroke="#fff" strokeOpacity=".10" />
        {/* боковая кнопка на корпусе */}
        <rect x="146" y="112" width="5" height="22" rx="2.5" fill="#3a3466" />
      </g>
      </g>
    </svg>
  )
}
