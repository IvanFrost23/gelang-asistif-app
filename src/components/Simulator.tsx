import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { dispatch } from '../events/pipeline'
import { useT } from '../i18n'
import { useActiveProfile } from '../store'
import { playDemoSound } from '../audio/demoSounds'

const DEMO_SEQUENCE: { category: Category; after: number }[] = [
  { category: 'name', after: 1500 },
  { category: 'bell', after: 6000 },
  { category: 'home', after: 6000 },
  { category: 'danger', after: 7000 },
  { category: 'name', after: 7000 },
]

/** Панель демонстрации: проигрывает звук через динамик и порождает событие, как будто оно распознано. */
export default function Simulator() {
  const { t } = useT()
  const profile = useActiveProfile()
  const [running, setRunning] = useState(false)
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(true)
  const idx = useRef(0)

  const fire = (c: Category) => {
    const name = profile?.callNames[0] ?? profile?.name ?? 'Nadiyya'
    let delay = 0
    if (sound) delay = Math.min(playDemoSound(c, name), 1200)
    // Событие приходит чуть позже звука, как при реальном распознавании.
    window.setTimeout(() => dispatch({ category: c, source: 'simulator', confidence: 0.72 + Math.random() * 0.25, detail: t.sim.detail[c] }), delay)
  }

  useEffect(() => {
    if (!running) return
    let timer = 0
    const next = () => {
      const step = DEMO_SEQUENCE[idx.current % DEMO_SEQUENCE.length]
      timer = window.setTimeout(() => { fire(step.category); idx.current += 1; next() }, step.after)
    }
    next()
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sound])

  return (
    <section className="card sim">
      <div className="card-title">
        <h2>{t.sim.title}</h2>
        <button className="link" onClick={() => setOpen(!open)}>{open ? t.sim.hide : t.sim.show}</button>
      </div>
      {open && (
        <>
          <p style={{ marginBottom: 10 }}>{t.sim.hint}</p>
          <div className="chips" style={{ marginBottom: 10 }}>
            {CATEGORIES.map((c) => (
              <button key={c} className="chip" style={{ borderLeft: `6px solid ${SIGNALS[c].color}` }} onClick={() => fire(c)}>
                {t.signals[c]}
              </button>
            ))}
          </div>
          <div className="row" style={{ padding: '8px 12px', marginBottom: 10 }}>
            <span className="grow"><div className="title" style={{ fontSize: 14 }}>{t.sim.sound}</div><div className="sub">{t.sim.soundHint}</div></span>
            <button className={`switch ${sound ? 'on' : ''}`} role="switch" aria-checked={sound} onClick={() => setSound(!sound)} aria-label={t.sim.sound} />
          </div>
          <button className={`btn block ${running ? 'danger' : ''}`} onClick={() => setRunning(!running)}>
            {running ? t.sim.stop : t.sim.start}
          </button>
        </>
      )}
    </section>
  )
}
