import { useListen } from '../listen/useListen'
import { useT } from '../i18n'

export default function ListenPanel() {
  const { t } = useT()
  const { state, start, stop } = useListen()
  const on = state.status === 'listening' || state.status === 'starting'
  return (
    <section className={`card listen ${on ? 'on' : ''}`}>
      <div className="card-title">
        <h2><span className={`mic ${on ? 'on' : ''}`} />{t.listen.title}</h2>
        <span className="pill">{t.listen.status[state.status]}</span>
      </div>
      {on && (
        <div className="level"><div className="level-bar" style={{ width: `${Math.round(state.level * 100)}%` }} /></div>
      )}
      {state.status === 'listening' && (
        <p className="sub" style={{ minHeight: 20 }}>
          {state.transcript ? `“${state.transcript}”` : t.listen.waiting}
          {state.lastClass ? ` · ${state.lastClass}` : ''}
        </p>
      )}
      {state.status === 'denied' && <p>{t.listen.denied}</p>}
      {state.status === 'unsupported' && <p>{t.listen.unsupported}</p>}
      {state.status === 'error' && <p>{t.listen.error}</p>}
      <button className={`btn block ${on ? 'danger' : ''}`} onClick={on ? stop : start} disabled={state.status === 'starting'}>
        {on ? t.listen.stop : t.listen.start}
      </button>
      <p className="hint" style={{ marginTop: 8 }}>{t.listen.privacy}</p>
    </section>
  )
}
