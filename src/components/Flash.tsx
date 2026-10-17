import { useEffect, useState } from 'react'
import { onAccepted } from '../events/pipeline'
import { flashMs, SIGNALS, type Category } from '../domain/signals'
import { useT } from '../i18n'

export const CATEGORY_ICON: Record<Category, string> = { name: '🙋', danger: '⚠️', bell: '🔔', home: '🚪' }

/** Полноэкранная вспышка цветом кода при каждом принятом событии: телефон на парте работает как второй «браслет». */
export default function Flash() {
  const { t } = useT()
  const [cat, setCat] = useState<Category | null>(null)
  useEffect(() => onAccepted((e) => { setCat(null); requestAnimationFrame(() => setCat(e.category)) }), [])
  useEffect(() => {
    if (!cat) return
    const id = setTimeout(() => setCat(null), flashMs(cat))
    return () => clearTimeout(id)
  }, [cat])
  if (!cat) return null
  const s = SIGNALS[cat]
  return (
    <div className={`flash ${s.blink ? 'flash-blink' : ''}`} style={{ background: s.color }} onClick={() => setCat(null)} role="status" aria-live="assertive">
      <div className="flash-icon">{CATEGORY_ICON[cat]}</div>
      <div className="flash-text">{t.guide.child[cat].what}</div>
      <div className="flash-sub">{t.guide.child[cat].doIt}</div>
    </div>
  )
}
