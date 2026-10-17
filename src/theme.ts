/** Тема: auto (по системе), light, dark. Хранится в localStorage, применяется атрибутом data-theme на <html>. */
export type Theme = 'auto' | 'light' | 'dark'
const KEY = 'gelang-asistif:theme'
const mq = () => window.matchMedia('(prefers-color-scheme: dark)')

export function getTheme(): Theme {
  try { const v = localStorage.getItem(KEY); if (v === 'light' || v === 'dark') return v } catch { /* ignore */ }
  return 'auto'
}

export function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.toggle('sys-dark', mq().matches)
  if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t)
  const dark = t === 'dark' || (t === 'auto' && mq().matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1b1836' : '#7c6fe0')
}

export function setTheme(t: Theme) {
  try { if (t === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, t) } catch { /* ignore */ }
  applyTheme(t)
}

export function initTheme() {
  applyTheme(getTheme())
  mq().addEventListener('change', () => applyTheme(getTheme()))
}
