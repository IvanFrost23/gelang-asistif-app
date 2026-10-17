/** Свои звуки: сравнение эмбеддингов YAMNet по косинусной близости. */
import type { CustomSound } from '../store'

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

/** Близость к звуку = максимум по его сохранённым окнам. */
export function similarity(embedding: ArrayLike<number>, sound: CustomSound): number {
  let best = 0
  for (const v of sound.vectors) best = Math.max(best, cosine(embedding, v))
  return best
}

export function matchCustom(embedding: ArrayLike<number>, sounds: CustomSound[]): { sound: CustomSound; sim: number } | null {
  let best: { sound: CustomSound; sim: number } | null = null
  for (const s of sounds) {
    const sim = similarity(embedding, s)
    if (!best || sim > best.sim) best = { sound: s, sim }
  }
  return best
}
