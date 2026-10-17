/**
 * Классификация звуков моделью YAMNet (TensorFlow.js) прямо на устройстве.
 * Модель лежит в public/yamnet и грузится один раз. Вход: моно 16 кГц, окно 0.975 с.
 */
import type { Category } from '../domain/signals'
import { CLASS_TO_CATEGORY } from './yamnetMap'
import { YAMNET_CLASSES } from './yamnetClasses'

type TF = typeof import('@tensorflow/tfjs')
type GraphModel = import('@tensorflow/tfjs').GraphModel

const SAMPLE_RATE = 16000
const WINDOW = 15600 // 0.975 с

let tfPromise: Promise<{ tf: TF; model: GraphModel }> | null = null

export function loadYamnet() {
  if (!tfPromise) {
    tfPromise = (async () => {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const model = await tf.loadGraphModel(`${import.meta.env.BASE_URL}yamnet/model.json`)
      return { tf, model }
    })()
  }
  return tfPromise
}

export interface Detection { category: Category; className: string; score: number }
export interface Classification { best: Detection | null; top: { className: string; score: number } }

/** Усредняет кадры модели и возвращает лучший класс из нашей карты. */
export async function classify(samples: Float32Array): Promise<Classification> {
  const { tf, model } = await loadYamnet()
  const scores = tf.tidy(() => {
    const input = tf.tensor1d(samples)
    const out = model.execute(input) as import('@tensorflow/tfjs').Tensor[] | import('@tensorflow/tfjs').Tensor
    const s = Array.isArray(out) ? out[0] : out
    return s.mean(0) // [521]
  })
  const arr = await scores.data()
  scores.dispose()
  let best: Detection | null = null
  let topI = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > arr[topI]) topI = i
    const cat = CLASS_TO_CATEGORY[YAMNET_CLASSES[i]]
    if (!cat) continue
    if (!best || arr[i] > best.score) best = { category: cat, className: YAMNET_CLASSES[i], score: arr[i] }
  }
  return { best, top: { className: YAMNET_CLASSES[topI], score: arr[topI] } }
}

export interface YamnetHandle { stop: () => void }

/** Захватывает микрофон, режет поток на окна и отдаёт детекции. */
export async function startYamnet(opts: {
  stream: MediaStream
  onDetect: (d: Detection) => void
  onTop?: (top: { className: string; score: number }) => void
  onLevel?: (rms: number) => void
}): Promise<YamnetHandle> {
  await loadYamnet()
  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
  const src = ctx.createMediaStreamSource(opts.stream)
  const proc = ctx.createScriptProcessor(4096, 1, 1)
  const ratio = ctx.sampleRate / SAMPLE_RATE // если браузер не дал 16 кГц, децимируем
  let buf = new Float32Array(0)
  let busy = false

  proc.onaudioprocess = (e) => {
    const ch = e.inputBuffer.getChannelData(0)
    let chunk: Float32Array
    if (ratio === 1) chunk = ch.slice()
    else {
      const n = Math.floor(ch.length / ratio)
      chunk = new Float32Array(n)
      for (let i = 0; i < n; i++) chunk[i] = ch[Math.floor(i * ratio)]
    }
    let sum = 0
    for (let i = 0; i < chunk.length; i++) sum += chunk[i] * chunk[i]
    opts.onLevel?.(Math.sqrt(sum / chunk.length))

    const merged = new Float32Array(buf.length + chunk.length)
    merged.set(buf); merged.set(chunk, buf.length)
    buf = merged
    if (buf.length >= WINDOW && !busy) {
      const window = buf.slice(0, WINDOW)
      buf = buf.slice(Math.floor(WINDOW / 2)) // окна с перекрытием 50%
      busy = true
      classify(window).then((c) => { opts.onTop?.(c.top); if (c.best) opts.onDetect(c.best) }).finally(() => { busy = false })
    }
  }
  src.connect(proc)
  proc.connect(ctx.destination)
  return { stop: () => { proc.disconnect(); src.disconnect(); ctx.close() } }
}
