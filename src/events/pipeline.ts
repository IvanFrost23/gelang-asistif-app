import { SIGNALS, type Category } from '../domain/signals'
import { useStore, type EventSource, type Sensitivity } from '../store'

export interface IncomingEvent {
  category: Category
  source: EventSource
  confidence?: number   // 0..1, отсутствует для ручных источников
  detail?: string       // например распознанное слово или класс YAMNet
}

/** Порог уверенности по настройке чувствительности. */
export const THRESHOLD: Record<Sensitivity, number> = { low: 0.6, medium: 0.4, high: 0.25 }

const DEBOUNCE_MS = 3000
const lastAt: Partial<Record<Category, number>> = {}

type Listener = (e: IncomingEvent) => void
const listeners = new Set<Listener>()
/** Подписка «браслета» (экранная анимация + вибрация) на принятые события. */
export function onAccepted(l: Listener) { listeners.add(l); return () => { listeners.delete(l) } }

/**
 * Единая точка входа для всех источников: симулятор, ручной вызов, речь, YAMNet.
 * Фильтр настроек → порог уверенности → антидребезг → история → слушатели.
 * Возвращает true, если событие принято.
 */
export function dispatch(e: IncomingEvent): boolean {
  const { settings, addEvent } = useStore.getState()
  const sig = SIGNALS[e.category]
  if (!sig.alwaysOn && !settings.enabled[e.category]) return false
  if (e.confidence !== undefined && e.confidence < THRESHOLD[settings.sensitivity]) return false
  const now = Date.now()
  if (e.source !== 'training' && now - (lastAt[e.category] ?? 0) < DEBOUNCE_MS) return false
  lastAt[e.category] = now
  addEvent({ category: e.category, source: e.source, confidence: e.confidence, detail: e.detail })
  listeners.forEach((l) => l(e))
  return true
}
