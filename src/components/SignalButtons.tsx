import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { useT } from '../i18n'

type Props = { active: Category | null; onPlay: (c: Category) => void }

export default function SignalButtons({ active, onPlay }: Props) {
  const { t } = useT()
  return (
    <div className="signal-grid">
      {CATEGORIES.map((c) => (
        <button key={c} className={`signal-btn ${active === c ? 'active' : ''}`} onClick={() => onPlay(c)}>
          <span className="dot" style={{ background: SIGNALS[c].color }} />
          <span className="title">{t.signals[c]}</span>
          <span className="sub">{t.signals[`${c}Sub`]}</span>
        </button>
      ))}
    </div>
  )
}
