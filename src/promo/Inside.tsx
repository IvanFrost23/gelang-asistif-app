import { useEffect, useMemo, useRef } from 'react'
import { InsideView } from './three/views'
import { INNER_IDS, type InnerId } from './three/bracelet'
import { projectAnchor } from './three/engine'
import { Stage } from './Stage'
import { useT } from './i18n'

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/** Разборка по скроллу: секция высокая, сцена «прилипает», браслет раскладывается на слои. */
export function Inside() {
  const { t } = useT()
  const view = useMemo(() => new InsideView(), [])
  const section = useRef<HTMLElement>(null)
  const tags = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = section.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = r.height - window.innerHeight
      view.progress = Math.min(1, Math.max(0, -r.top / Math.max(1, span)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [view])

  useEffect(() => {
    view.onAfter = (m, cam, explode) => {
      const c = view.canvas
      const w = c.clientWidth, h = c.clientHeight
      INNER_IDS.forEach((id, i) => {
        const el = tags.current[id]
        if (!el) return
        const p = projectAnchor(m, m.inner[id], cam, w, h)
        const show = smooth(0.72 + i * 0.03, 0.9 + i * 0.012, explode)
        const left = p.x < w / 2
        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
        el.style.opacity = String(show)
        el.classList.toggle('l', left)
      })
    }
    return () => { view.onAfter = undefined }
  }, [view])

  return (
    <section id="dalam" className="inside" ref={section}>
      <div className="inside-sticky">
        <div className="inside-copy">
          <p className="kicker">{t.inside.kicker}</p>
          <h2>{t.inside.title}</h2>
          <p className="lead">{t.inside.lead}</p>
        </div>
        <Stage className="inside-stage" view={view}>
          <div className="tags" aria-hidden="true">
            {INNER_IDS.map((id: InnerId) => (
              <div key={id} className="tag" ref={(el) => { tags.current[id] = el }}>
                <i /><span>{t.inside.labels[id]}</span>
              </div>
            ))}
          </div>
        </Stage>
        <ul className="sr-only">{INNER_IDS.map((id) => <li key={id}>{t.inside.labels[id]}</li>)}</ul>
      </div>
    </section>
  )
}
