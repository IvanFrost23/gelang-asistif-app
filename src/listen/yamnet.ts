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
export interface Classification { best: Detection | null; top: { className: string; score: number }; embedding: Float32Array }

/** Усредняет кадры модели и возвращает лучший класс из нашей карты. */
export async function classify(samples: Float32Array): Promise<Classification> {
  const { tf, model } = await loadYamnet()
  const [scores, emb] = tf.tidy(() => {
    const input = tf.tensor1d(samples)
    const out = model.execute(input) as import('@tensorflow/tfjs').Tensor[]
    // out[0] — баллы классов [кадры, 521], out[1] — эмбеддинги [кадры, 1024]
    return [out[0].mean(0), out[1].mean(0)]
  })
  const arr = await scores.data()
  const embedding = (await emb.data()) as Float32Array
  scores.dispose(); emb.dispose()
  let best: Detection | null = null
  let topI = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > arr[topI]) topI = i
    const cat = CLASS_TO_CATEGORY[YAMNET_CLASSES[i]]
    if (!cat) continue
    if (!best || arr[i] > best.score) best = { category: cat, className: YAMNET_CLASSES[i], score: arr[i] }
  }
  return { best, top: { className: YAMNET_CLASSES[topI], score: arr[topI] }, embedding }
}

export interface YamnetHandle { stop: () => void }

/** Захватывает микрофон, режет поток на окна и отдаёт детекции. */
export async function startYamnet(opts: {
  stream: MediaStream
  onDetect: (d: Detection) => void
  onTop?: (top: { className: string; score: number }) => void
  onEmbedding?: (embedding: Float32Array) => void
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
      classify(window).then((c) => { opts.onTop?.(c.top); opts.onEmbedding?.(c.embedding); if (c.best) opts.onDetect(c.best) }).finally(() => { busy = false })
    }
  }
  src.connect(proc)
  proc.connect(ctx.destination)
  return { stop: () => { proc.disconnect(); src.disconnect(); ctx.close() } }
}

/** Записывает `seconds` секунд с микрофона (16 кГц моно) и возвращает сэмплы. */
export function recordSamples(stream: MediaStream, seconds: number, onLevel?: (rms: number) => void): Promise<Float32Array> {
  return new Promise((resolve) => {
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    const src = ctx.createMediaStreamSource(stream)
    const proc = ctx.createScriptProcessor(4096, 1, 1)
    const ratio = ctx.sampleRate / SAMPLE_RATE
    const need = Math.round(seconds * SAMPLE_RATE)
    const out = new Float32Array(need); let n = 0
    proc.onaudioprocess = (e) => {
      const ch = e.inputBuffer.getChannelData(0)
      let sum = 0
      for (let i = 0; i < ch.length && n < need; i += 1) {
        if (ratio === 1 || i % Math.round(ratio) === 0) { out[n++] = ch[i]; sum += ch[i] * ch[i] }
      }
      onLevel?.(Math.sqrt(sum / ch.length))
      if (n >= need) { proc.disconnect(); src.disconnect(); ctx.close(); resolve(out) }
    }
    src.connect(proc); proc.connect(ctx.destination)
  })
}

/** Нормализует громкость к пику 0.9. */
export function normalize(samples: Float32Array): Float32Array {
  let peak = 0
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]))
  if (peak < 1e-4) return samples
  const out = new Float32Array(samples.length); const k = 0.9 / peak
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * k
  return out
}

const rms = (x: Float32Array) => { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / x.length) }

/**
 * Эмбеддинги записи: громкость нормализуется, окна с перекрытием 50%,
 * тихие окна (меньше 25% от самого громкого) отбрасываются. Возвращает до 6 самых громких окон.
 */
export async function embedSamples(samples: Float32Array): Promise<Float32Array[]> {
  const x = normalize(samples)
  const wins: { win: Float32Array; e: number }[] = []
  for (let start = 0; start + WINDOW <= x.length; start += Math.floor(WINDOW / 2)) {
    const win = x.slice(start, start + WINDOW); wins.push({ win, e: rms(win) })
  }
  if (!wins.length) { const padded = new Float32Array(WINDOW); padded.set(x); wins.push({ win: padded, e: rms(padded) }) }
  const maxE = Math.max(...wins.map((w) => w.e))
  const keep = wins.filter((w) => w.e >= maxE * 0.25).sort((a, b) => b.e - a.e).slice(0, 6)
  const out: Float32Array[] = []
  for (const w of keep) out.push((await classify(w.win)).embedding)
  return out
}
