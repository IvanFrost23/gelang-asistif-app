/** Поиск имени ребёнка в распознанном тексте с допуском на одну ошибку для имён от 4 букв. */

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let left = i
    let best = left
    for (let j = 1; j <= b.length; j++) {
      const cur = Math.min(prev[j] + 1, left + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev[j - 1] = left
      left = cur
      if (cur < best) best = cur
    }
    prev[b.length] = left
    if (best > max) return max + 1
  }
  return prev[b.length]
}

/** Возвращает совпавшее слово из текста или null. */
export function matchName(text: string, names: string[]): string | null {
  const words = normalize(text).split(' ').filter(Boolean)
  const targets = names.map(normalize).filter(Boolean)
  for (const w of words) {
    for (const n of targets) {
      if (w === n) return w
      const tol = n.length >= 4 ? 1 : 0
      if (tol && levenshtein(w, n, tol) <= tol) return w
      // имя из нескольких слов: проверяем как подстроку нормализованного текста
    }
  }
  const joined = words.join(' ')
  for (const n of targets) if (n.includes(' ') && joined.includes(n)) return n
  return null
}
