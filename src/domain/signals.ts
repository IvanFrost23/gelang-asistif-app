export type Category = 'name' | 'danger' | 'bell' | 'home'

export interface Signal {
  category: Category
  color: string       // CSS-цвет LED
  blink: boolean      // быстрое мигание LED (danger)
  pattern: number[]   // мс: [вибрация, пауза, вибрация, ...] как для navigator.vibrate
  repeat: number      // сколько раз проиграть паттерн
  alwaysOn: boolean   // нельзя отключить в настройках
}

export const SIGNALS: Record<Category, Signal> = {
  name:   { category: 'name',   color: '#2f6cf6', blink: false, pattern: [150, 120, 150],                repeat: 1, alwaysOn: false },
  danger: { category: 'danger', color: '#e5383b', blink: true,  pattern: [700, 250, 700, 250, 700],      repeat: 2, alwaysOn: true },
  bell:   { category: 'bell',   color: '#f5b400', blink: false, pattern: [450],                          repeat: 1, alwaysOn: false },
  home:   { category: 'home',   color: '#22c55e', blink: false, pattern: [120, 90, 120, 90, 120],        repeat: 1, alwaysOn: false },
}

export const CATEGORIES: Category[] = ['name', 'danger', 'bell', 'home']

/** Полный паттерн с учётом повторов, с паузой 400 мс между повторами. */
export function fullPattern(s: Signal): number[] {
  const out: number[] = []
  for (let i = 0; i < s.repeat; i++) {
    if (i > 0) out.push(400)
    out.push(...s.pattern)
  }
  return out
}

export function patternDuration(s: Signal): number {
  return fullPattern(s).reduce((a, b) => a + b, 0)
}
