import { useCallback } from 'react'
import { fullPattern, type Signal } from '../domain/signals'

/** Реальная вибрация телефона (Android Chrome). На устройствах без поддержки тихо ничего не делает. */
export function useVibrate() {
  const vibrate = useCallback((s: Signal) => {
    try { navigator.vibrate?.(fullPattern(s)) } catch { /* unsupported */ }
  }, [])
  const stop = useCallback(() => {
    try { navigator.vibrate?.(0) } catch { /* unsupported */ }
  }, [])
  return { vibrate, stop, supported: typeof navigator !== 'undefined' && 'vibrate' in navigator }
}
