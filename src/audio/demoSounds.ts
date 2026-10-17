/**
 * Синтез демонстрационных звуков через Web Audio API, без аудиофайлов.
 * Звуки играют через динамик телефона, поэтому режим Dengar может их услышать и распознать.
 */
import type { Category } from '../domain/signals'

let ctx: AudioContext | null = null
const ac = () => {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function strike(c: BaseAudioContext, at: number, freq: number, dur: number, gain: number, partials: number[] = [1, 2.76, 5.4]) {
  const out = c.createGain()
  out.gain.setValueAtTime(0, at)
  out.gain.linearRampToValueAtTime(gain, at + 0.005)
  out.gain.exponentialRampToValueAtTime(0.001, at + dur)
  out.connect(c.destination)
  partials.forEach((m, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq * m
    const g = c.createGain()
    g.gain.value = 1 / (i + 1)
    o.connect(g).connect(out)
    o.start(at); o.stop(at + dur)
  })
}

/** Школьный звонок: частые удары молоточка по чашке, 2.5 с. */
export function playSchoolBell(c: BaseAudioContext = ac()) {
  const t = c.currentTime
  for (let i = 0; i < 20; i++) strike(c, t + i * 0.12, 2100, 0.25, 0.35, [1, 2.4, 4.1])
  return 2600
}

/** Сирена: качающийся тон, 3 с. */
export function playSiren(c: BaseAudioContext = ac()) {
  const t = c.currentTime
  const o = c.createOscillator(); o.type = 'sawtooth'
  const g = c.createGain(); g.gain.value = 0.18
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2500
  o.connect(f).connect(g).connect(c.destination)
  o.frequency.setValueAtTime(600, t)
  for (let i = 0; i < 3; i++) {
    o.frequency.linearRampToValueAtTime(1300, t + i + 0.5)
    o.frequency.linearRampToValueAtTime(600, t + i + 1)
  }
  g.gain.setValueAtTime(0.18, t + 2.8); g.gain.linearRampToValueAtTime(0, t + 3)
  o.start(t); o.stop(t + 3)
  return 3100
}

/** Дверной звонок: «динь-дон». */
export function playDoorbell(c: BaseAudioContext = ac()) {
  const t = c.currentTime
  strike(c, t, 659, 1.2, 0.4, [1, 2, 3])
  strike(c, t + 0.55, 523, 1.6, 0.4, [1, 2, 3])
  return 2200
}

/** Имя ребёнка голосом (синтез речи, индонезийский). */
export function sayName(name: string) {
  if (!('speechSynthesis' in window)) return 0
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(`${name}!`)
  u.lang = 'id-ID'; u.rate = 0.95; u.pitch = 1.1; u.volume = 1
  const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('id'))
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
  return 1500
}

/** Проигрывает звук категории; возвращает его длительность в мс. */
export function playDemoSound(category: Category, name = 'Nadiyya'): number {
  switch (category) {
    case 'name': return sayName(name)
    case 'bell': return playSchoolBell()
    case 'danger': return playSiren()
    case 'home': return playDoorbell()
  }
}
