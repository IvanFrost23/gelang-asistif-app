import { useCallback, useEffect, useRef, useState } from 'react'
import { dispatch } from '../events/pipeline'
import { useStore } from '../store'
import { matchName } from './nameMatch'
import { speechSupported, startSpeech, type SpeechHandle } from './speech'
import { startYamnet, type YamnetHandle } from './yamnet'

export type ListenStatus = 'idle' | 'starting' | 'listening' | 'denied' | 'unsupported' | 'error'

export interface ListenState {
  status: ListenStatus
  transcript: string      // последняя распознанная фраза
  lastClass: string       // последний класс YAMNet (для отладки/индикации)
  level: number           // громкость 0..1
  speechOk: boolean
  modelOk: boolean
}

/** Режим «Dengar»: один поток микрофона, Web Speech API для имени и YAMNet для классов звуков. */
export function useListen() {
  const [state, setState] = useState<ListenState>({ status: 'idle', transcript: '', lastClass: '', level: 0, speechOk: false, modelOk: false })
  const speech = useRef<SpeechHandle | null>(null)
  const yam = useRef<YamnetHandle | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const patch = (p: Partial<ListenState>) => setState((s) => ({ ...s, ...p }))

  const stop = useCallback(() => {
    speech.current?.stop(); speech.current = null
    yam.current?.stop(); yam.current = null
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null
    patch({ status: 'idle', level: 0 })
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { patch({ status: 'unsupported' }); return }
    patch({ status: 'starting', transcript: '', lastClass: '' })
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch {
      patch({ status: 'denied' }); return
    }

    // Имя ребёнка через Web Speech API
    if (speechSupported()) {
      speech.current = startSpeech({
        lang: 'id-ID',
        onText: (text, final) => {
          patch({ transcript: text })
          const s = useStore.getState()
          const prof = s.profiles.find((p) => p.id === s.activeProfileId)
          const names = prof?.callNames.length ? prof.callNames : prof ? [prof.name] : []
          const hit = matchName(text, names)
          if (hit) dispatch({ category: 'name', source: 'speech', confidence: final ? 0.95 : 0.7, detail: hit })
        },
        onError: (code) => { if (code === 'not-allowed') patch({ status: 'denied' }) },
      })
      patch({ speechOk: !!speech.current })
    }

    // Классы звуков через YAMNet
    try {
      yam.current = await startYamnet({
        stream: stream.current,
        onLevel: (rms) => patch({ level: Math.min(1, rms * 8) }),
        onTop: (top) => patch({ lastClass: `${top.className} ${Math.round(top.score * 100)}%` }),
        onDetect: (d) => dispatch({ category: d.category, source: 'yamnet', confidence: d.score, detail: d.className }),
      })
      patch({ modelOk: true })
    } catch (e) {
      console.warn('YAMNet failed', e)
      patch({ modelOk: false })
      if (!speech.current) { patch({ status: 'error' }); return }
    }
    patch({ status: 'listening' })
  }, [])

  useEffect(() => stop, [stop])
  return { state, start, stop }
}
