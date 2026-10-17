import { useCallback, useEffect, useRef, useState } from 'react'
import { fullPattern, ledHoldMs, SIGNALS, type Category, type Signal } from '../domain/signals'
import { useVibrate } from './useVibrate'

export interface BraceletState {
  signal: Signal | null  // какой сигнал сейчас играет
  on: boolean            // мотор включён в данный момент (фаза вибрации)
}

/** Проигрывает паттерн: синхронно переключает фазы для анимации и запускает реальную вибрацию. */
export function useBraceletPlayer() {
  const [state, setState] = useState<BraceletState>({ signal: null, on: false })
  const timers = useRef<number[]>([])
  const { vibrate, stop: stopVibrate } = useVibrate()

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const stop = useCallback(() => {
    clear()
    stopVibrate()
    setState({ signal: null, on: false })
  }, [clear, stopVibrate])

  const play = useCallback((category: Category) => {
    const s = SIGNALS[category]
    clear()
    vibrate(s)
    const steps = fullPattern(s)
    let t = 0
    steps.forEach((ms, i) => {
      const on = i % 2 === 0
      timers.current.push(window.setTimeout(() => setState({ signal: s, on }), t))
      t += ms
    })
    // Мотор выключен, но LED продолжает гореть (как у настоящего браслета), затем гаснет.
    timers.current.push(window.setTimeout(() => setState({ signal: s, on: false }), t))
    timers.current.push(window.setTimeout(() => setState({ signal: null, on: false }), t + ledHoldMs(s)))
  }, [clear, vibrate])

  useEffect(() => clear, [clear])
  return { state, play, stop }
}
