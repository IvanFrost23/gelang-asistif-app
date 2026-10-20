/** Линейные иконки 24×24 для промо-страницы. */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const I = ({ d, size = 22 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...P}><path d={d} /></svg>
)

export const Icon = {
  mic: (s?: number) => <I size={s} d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  chip: (s?: number) => <I size={s} d="M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />,
  wave: (s?: number) => <I size={s} d="M3 12h2l2-5 3 10 3-14 3 12 2-6 1 3h2" />,
  user: (s?: number) => <I size={s} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  sliders: (s?: number) => <I size={s} d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
  target: (s?: number) => <I size={s} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01" />,
  phone: (s?: number) => <I size={s} d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2" />,
  clock: (s?: number) => <I size={s} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2" />,
  book: (s?: number) => <I size={s} d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7" />,
  lock: (s?: number) => <I size={s} d="M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3" />,
  download: (s?: number) => <I size={s} d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  globe: (s?: number) => <I size={s} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />,
  code: (s?: number) => <I size={s} d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />,
  play: (s?: number) => <I size={s} d="M7 4l13 8-13 8z" />,
  replay: (s?: number) => <I size={s} d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" />,
  vibrate: (s?: number) => <I size={s} d="M8 4h8v16H8zM4 8v8M20 8v8M1 10v4M23 10v4" />,
  layers: (s?: number) => <I size={s} d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  plus: (s?: number) => <I size={s} d="M12 5v14M5 12h14" />,
  minus: (s?: number) => <I size={s} d="M5 12h14" />,
  reset: (s?: number) => <I size={s} d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  close: (s?: number) => <I size={s} d="M6 6l12 12M18 6L6 18" />,
  left: (s?: number) => <I size={s} d="M15 5l-7 7 7 7" />,
  right: (s?: number) => <I size={s} d="M9 5l7 7-7 7" />,
  hand: (s?: number) => <I size={s} d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V4a1.5 1.5 0 0 1 3 0v6M15 10V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4.3a1.5 1.5 0 0 1 2.6-1.5L6 14V8a1.5 1.5 0 0 1 3 0v3" />,
  arrowDown: (s?: number) => <I size={s} d="M12 5v14M6 13l6 6 6-6" />,
  bluetooth: (s?: number) => <I size={s} d="M7 7l10 10-5 5V2l5 5L7 17" />,
}
