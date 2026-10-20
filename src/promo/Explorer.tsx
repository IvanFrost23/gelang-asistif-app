import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, SIGNALS } from '../domain/signals'
import { ExplorerView } from './three/views'
import { INTERNAL, PART_IDS, type PartId } from './three/bracelet'
import { projectAnchor, type Engine } from './three/engine'
import { Stage } from './Stage'
import { useT } from './i18n'
import { Icon } from './icons'

const coarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/** Интерактивная 3D-модель: вращение, зум, точки деталей, разборка, проигрывание кодов. */
export function Explorer() {
  const { t } = useT()
  const view = useMemo(() => new ExplorerView(), [])
  const [selected, setSelected] = useState<PartId | null>(null)
  const [exploded, setExploded] = useState(false)
  const [touch] = useState(coarse)
  const [engaged, setEngaged] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const dots = useRef<Record<string, HTMLButtonElement | null>>({})

  const select = useCallback((id: PartId | null) => {
    setSelected(id)
    if (id) view.focus(id)
    else view.reset()
  }, [view])

  // Подключение OrbitControls и выбора детали кликом
  const onReady = useCallback((engine: Engine, canvas: HTMLCanvasElement) => {
    view.attach(canvas, engine.model)
    view.onExplode = (on) => setExploded(on)
    const c = view.controls!
    c.enableZoom = false
    if (coarse()) { c.enabled = false; canvas.style.touchAction = 'pan-y' }
    let down: { x: number; y: number; t: number } | null = null
    let pinchedAt = 0
    // Колесо мыши зумит модель только после клика по ней, до ухода курсора; иначе колесо листает страницу
    let armed = false
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; if (!coarse()) { armed = true; c.enableZoom = true } }
    const onUp = (e: PointerEvent) => {
      if (!down || performance.now() - pinchedAt < 400) { down = null; return }
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y)
      const quick = performance.now() - down.t < 450
      down = null
      if (moved > 6 || !quick) return
      const part = engine.pick(view, e.clientX, e.clientY)
      if (part) { setSelected(part); view.focus(part) }
    }
    const onLeave = () => { if (!coarse()) { armed = false; c.enableZoom = false } }
    // Щипок тачпада (ctrl+колесо) над моделью приближает её сразу, без клика: зум включается только на это событие
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey || coarse()) return
      c.enableZoom = true
      setTimeout(() => { c.enableZoom = armed }, 0)
    }
    // На телефоне щипок двумя пальцами приближает модель и до нажатия «Ketuk untuk menjelajah»;
    // после него щипком управляет OrbitControls. Слушаем весь контейнер, чтобы щипок работал и с пальцем на точке детали
    const area = canvas.parentElement ?? canvas
    let pinch = 0
    const span = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onTouchStart = (e: TouchEvent) => {
      if (c.enabled || e.touches.length !== 2) return
      e.preventDefault()
      pinch = span(e.touches)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (c.enabled || e.touches.length !== 2) return
      e.preventDefault()
      const d = span(e.touches)
      if (pinch > 0 && d > 0) view.dolly(pinch / d)
      pinch = d
      pinchedAt = performance.now()
    }
    const onTouchEnd = (e: TouchEvent) => { if (e.touches.length < 2) pinch = 0 }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('wheel', onWheel, { capture: true })
    area.addEventListener('touchstart', onTouchStart, { passive: false })
    area.addEventListener('touchmove', onTouchMove, { passive: false })
    area.addEventListener('touchend', onTouchEnd)
    area.addEventListener('touchcancel', onTouchEnd)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('wheel', onWheel, { capture: true })
      area.removeEventListener('touchstart', onTouchStart)
      area.removeEventListener('touchmove', onTouchMove)
      area.removeEventListener('touchend', onTouchEnd)
      area.removeEventListener('touchcancel', onTouchEnd)
      view.detach()
    }
  }, [view])

  // На телефоне вращение включается по нажатию, чтобы холст не перехватывал прокрутку страницы
  useEffect(() => {
    const c = view.controls
    if (!touch || !c) return
    c.enabled = engaged
    c.enableZoom = engaged
    view.canvas.style.touchAction = engaged ? 'none' : 'pan-y'
  }, [engaged, touch, view])

  useEffect(() => {
    if (!box.current) return
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setEngaged(false) }, { threshold: 0.15 })
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  // Точки деталей следуют за моделью
  useEffect(() => {
    view.onAfter = (m, cam) => {
      const c = view.canvas
      const w = c.clientWidth, h = c.clientHeight
      const ex = view.explodeLevel
      for (const id of PART_IDS) {
        const el = dots.current[id]
        if (!el) continue
        const p = projectAnchor(m, m.anchors[id], cam, w, h)
        const inside = p.x > 14 && p.x < w - 14 && p.y > 14 && p.y < h - 14 && !p.behind
        const ok = inside && p.facing > 0.08 && (!INTERNAL.has(id) || ex > 0.6)
        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
        el.style.opacity = ok ? '1' : '0'
        el.style.pointerEvents = ok ? 'auto' : 'none'
        el.tabIndex = ok ? 0 : -1
      }
    }
    return () => { view.onAfter = undefined }
  }, [view])

  const toggleExplode = () => {
    const on = !exploded
    if (!on && selected && INTERNAL.has(selected)) {
      setSelected(null)
      view.setExplode(false, false)
      view.reset()
      return
    }
    view.setExplode(on)
  }
  const step = (d: number) => {
    const i = selected ? PART_IDS.indexOf(selected) : -1
    select(PART_IDS[(i + d + PART_IDS.length) % PART_IDS.length])
  }
  const part = selected ? t.parts[selected] : null

  return (
    <section id="tiga-d" className="explore">
      <div className="wrap head reveal">
        <p className="kicker">{t.explore.kicker}</p>
        <h2>{t.explore.title}</h2>
        <p className="lead">{touch ? t.explore.hintTouch : t.explore.hintMouse}</p>
      </div>
      <div className="explore-box reveal" ref={box}>
        <Stage className={'explore-stage' + (engaged ? ' engaged' : '')} view={view} onReady={onReady}>
          <div className="hotspots">
            {PART_IDS.map((id) => (
              <button key={id} ref={(el) => { dots.current[id] = el }} className={'hotspot' + (selected === id ? ' on' : '')}
                aria-label={t.parts[id].name} onClick={() => select(id)}>
                <i /><span>{t.parts[id].name}</span>
              </button>
            ))}
          </div>
          {touch && !engaged && (
            <button className="engage" onClick={() => setEngaged(true)}>{Icon.hand(20)}{t.explore.tapToStart}</button>
          )}
          {touch && engaged && (
            <button className="engage done" onClick={() => setEngaged(false)}>{t.explore.done}</button>
          )}
        </Stage>
        {part && selected && (
          <div className="info" role="region" aria-live="polite" aria-label={part.name}>
            <div className="info-top">
              <p className="info-kicker">{t.explore.parts} · {PART_IDS.indexOf(selected) + 1}/{PART_IDS.length}</p>
              <button className="icon-btn" aria-label={t.explore.close} onClick={() => select(null)}>{Icon.close(18)}</button>
            </div>
            <h3>{part.name}{part.planned && <em>{t.explore.planned}</em>}</h3>
            <p>{part.text}</p>
            <div className="info-nav">
              <button className="icon-btn" aria-label={t.explore.prev} onClick={() => step(-1)}>{Icon.left(18)}</button>
              <button className="icon-btn" aria-label={t.explore.next} onClick={() => step(1)}>{Icon.right(18)}</button>
            </div>
          </div>
        )}
        <div className="toolbar" role="toolbar">
          <button className={'tool wide' + (exploded ? ' on' : '')} onClick={toggleExplode}>
            {Icon.layers(18)}<span>{exploded ? t.explore.assemble : t.explore.inside}</span>
          </button>
          <div className="tool-group" aria-label={t.explore.play}>
            {CATEGORIES.map((c) => (
              <button key={c} className="tool code-dot" style={{ ['--c' as string]: SIGNALS[c].color }}
                aria-label={`${t.explore.play}: ${t.codes.items[c].sound}`} title={t.codes.items[c].sound}
                onClick={() => view.playCode(c)}><i /></button>
            ))}
          </div>
          <div className="tool-group">
            <button className="tool" aria-label={t.explore.zoomOut} onClick={() => view.zoom(1.3)}>{Icon.minus(18)}</button>
            <button className="tool" aria-label={t.explore.zoomIn} onClick={() => view.zoom(0.75)}>{Icon.plus(18)}</button>
            <button className="tool" aria-label={t.explore.reset} title={t.explore.reset}
              onClick={() => { setSelected(null); view.setExplode(false, false); view.reset() }}>{Icon.reset(18)}</button>
          </div>
        </div>
      </div>
      <div className="wrap chips reveal">
        {PART_IDS.map((id) => (
          <button key={id} className={'chip' + (selected === id ? ' on' : '')} onClick={() => select(selected === id ? null : id)}>
            {t.parts[id].name}
          </button>
        ))}
      </div>
    </section>
  )
}
