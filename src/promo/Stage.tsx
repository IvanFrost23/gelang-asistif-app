import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getEngine, type Engine, type View } from './three/engine'
import { useT } from './i18n'

/** Холст секции: регистрирует вид в общем движке, включает его, только пока секция видна. */
export function Stage({ view, className, children, onReady }: {
  view: View
  className?: string
  children?: ReactNode
  onReady?: (engine: Engine, canvas: HTMLCanvasElement) => (() => void) | void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const { t } = useT()
  useEffect(() => {
    const engine = getEngine()
    const canvas = ref.current
    if (!engine || !canvas) { setFailed(true); return }
    view.canvas = canvas
    const cleanup = onReady?.(engine, canvas)
    const io = new IntersectionObserver(([e]) => { view.active = e.isIntersecting }, { rootMargin: '120px 0px' })
    io.observe(canvas)
    engine.add(view)
    return () => { io.disconnect(); engine.remove(view); view.active = false; cleanup?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])
  return (
    <div className={'stage ' + (className ?? '')}>
      {failed
        ? <div className="stage-fallback"><img src="/gelang/bracelet.png" alt="" /><p>{t.fallback}</p></div>
        : <canvas ref={ref} />}
      {!failed && children}
    </div>
  )
}
