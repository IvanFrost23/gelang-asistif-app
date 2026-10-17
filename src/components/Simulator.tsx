import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { dispatch } from '../events/pipeline'
import { useT } from '../i18n'

const DEMO_SEQUENCE: { category: Category; detail: string; after: number }[] = [
  { category: 'name', detail: 'Nadiyya!', after: 2000 },
  { category: 'bell', detail: 'bel masuk', after: 6000 },
  { category: 'home', detail: 'tok tok', after: 5000 },
  { category: 'danger', detail: 'sirine', after: 7000 },
  { category: 'name', detail: 'Nad, sini', after: 6000 },
]

/** Панель демонстрации: порождает события как будто они распознаны с микрофона. */
export default function Simulator() {
  const { t } = useT()
  const [running, setRunning] = useState(false)
  const [open, setOpen] = useState(false)
  const idx = useRef(0)

  useEffect(() => {
    if (!running) return
    let timer = 0
    const next = () => {
      const step = DEMO_SEQUENCE[idx.current % DEMO_SEQUENCE.length]
      timer = window.setTimeout(() => {
        dispatch({ category: step.category, source: 'simulator', confidence: 0.72 + Math.random() * 0.25, detail: step.detail })
        idx.current += 1
        next()
      }, step.after)
    }
    next()
    return () => clearTimeout(timer)
  }, [running])

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
              <button key={c} className="chip" style={{ borderLeft: `6px solid ${SIGNALS[c].color}` }}
                onClick={() => dispatch({ category: c, source: 'simulator', confidence: 0.9 })}>
                {t.signals[c]}
              </button>
            ))}
          </div>
          <button className={`btn block ${running ? 'danger' : ''}`} onClick={() => setRunning(!running)}>
            {running ? t.sim.stop : t.sim.start}
          </button>
        </>
      )}
    </section>
  )
}
