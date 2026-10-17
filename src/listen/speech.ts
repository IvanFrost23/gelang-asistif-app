/** Обёртка над Web Speech API: непрерывное распознавание с автоперезапуском. */

// Типы из @types/dom-speech-recognition; в Chrome конструктор лежит в webkitSpeechRecognition.
type SRCtor = new () => SpeechRecognition
const getCtor = (): SRCtor | undefined => {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }
  return w.SpeechRecognition || w.webkitSpeechRecognition
}

export const speechSupported = () => !!getCtor()

export interface SpeechHandle { stop: () => void }

export function startSpeech(opts: {
  lang: string
  onText: (text: string, final: boolean) => void
  onError?: (code: string) => void
}): SpeechHandle | null {
  const Ctor = getCtor()
  if (!Ctor) return null
  let active = true
  let rec: SpeechRecognition | null = null

  const spawn = () => {
    if (!active) return
    const r = new Ctor()
    rec = r
    r.lang = opts.lang
    r.continuous = true
    r.interimResults = true
    r.maxAlternatives = 1
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        opts.onText(r[0].transcript, r.isFinal)
      }
    }
    r.onerror = (e) => {
      opts.onError?.(e.error)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') active = false
    }
    // Chrome сам завершает сессию через ~минуту тишины: перезапускаем, пока режим активен.
    r.onend = () => { if (active) setTimeout(spawn, 250) }
    try { r.start() } catch { /* уже запущен */ }
  }
  spawn()
  return { stop: () => { active = false; try { rec?.stop() } catch { /* ignore */ } } }
}
