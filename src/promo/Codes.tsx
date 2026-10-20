import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, SIGNALS, fullPattern, type Category } from '../domain/signals'
import { CodesView } from './three/views'
import { Stage } from './Stage'
import { useT } from './i18n'
import { Icon } from './icons'

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

/** Полоса паттерна: отрезки вибрации пропорциональны длительности. */
function PatternBar({ cat }: { cat: Category }) {
  const pat = fullPattern(SIGNALS[cat])
  const total = pat.reduce((a, b) => a + b, 0)
  return (
    <div className="pattern" aria-hidden="true">
      {pat.map((d, i) => <span key={i} className={i % 2 ? 'gap' : 'on'} style={{ flexGrow: d / total }} />)}
    </div>
  )
}

export function Codes() {
  const { t } = useT()
  const view = useMemo(() => new CodesView(), [])
  const [active, setActive] = useState<Category>('name')
  const [pulse, setPulse] = useState(0)
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.cat as Category)
    }, { rootMargin: '-45% 0px -45% 0px' })
    for (const c of CATEGORIES) { const el = refs.current[c]; if (el) io.observe(el) }
    return () => io.disconnect()
  }, [])

  useEffect(() => { view.setCategory(active); setPulse((p) => p + 1) }, [active, view])

  const replay = (c: Category) => {
    if (c !== active) { refs.current[c]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    view.replay(); setPulse((p) => p + 1)
  }
  const feel = (c: Category) => { try { navigator.vibrate(fullPattern(SIGNALS[c])) } catch { /* ignore */ } replay(c) }

  return (
    <section id="kode" className="codes" style={{ ['--code' as string]: SIGNALS[active].color }}>
      <div className="wrap head reveal">
        <p className="kicker">{t.codes.kicker}</p>
        <h2>{t.codes.title}</h2>
        <p className="lead">{t.codes.lead}</p>
      </div>
      <div className="codes-grid">
        <div className="codes-stage-wrap">
          <Stage className="codes-stage" view={view}>
            <div className="ripples" key={pulse} aria-hidden="true"><i /><i /><i /></div>
            <div className="codes-dots" role="tablist">
              {CATEGORIES.map((c) => (
                <button key={c} role="tab" aria-selected={c === active} aria-label={t.codes.items[c].sound}
                  className={c === active ? 'on' : ''} style={{ ['--c' as string]: SIGNALS[c].color }} onClick={() => replay(c)} />
              ))}
            </div>
          </Stage>
        </div>
        <div className="codes-list">
          {CATEGORIES.map((c, i) => {
            const it = t.codes.items[c]
            return (
              <article key={c} data-cat={c} ref={(el) => { refs.current[c] = el }} className={'code' + (c === active ? ' on' : '')}
                style={{ ['--c' as string]: SIGNALS[c].color }}>
                <div className="code-card">
                  <p className="code-num"><span className="dot" />{t.codes.of} {i + 1} / 4</p>
                  <h3>{it.sound}</h3>
                  {it.sub && <p className="code-sub">{it.sub}</p>}
                  <dl className="code-meta">
                    <div><dt>{t.codes.colorLabel}</dt><dd>{it.color}</dd></div>
                    <div><dt>{t.codes.patternLabel}</dt><dd>{it.pattern}</dd></div>
                  </dl>
                  <PatternBar cat={c} />
                  <blockquote><span>{t.codes.childDoes}</span>{it.child}</blockquote>
                  {c === 'danger' && <p className="always">{Icon.lock(16)}{t.codes.alwaysOn}</p>}
                  <div className="code-actions">
                    <button className="btn ghost sm" onClick={() => replay(c)}>{Icon.replay(18)}{t.codes.replay}</button>
                    {canVibrate && <button className="btn ghost sm" onClick={() => feel(c)}>{Icon.vibrate(18)}{t.codes.feel}</button>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
