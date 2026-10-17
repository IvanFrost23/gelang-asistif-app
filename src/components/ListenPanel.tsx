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
      {on && <div className="level"><div className="level-bar" style={{ width: `${Math.round(state.level * 100)}%` }} /></div>}
      {state.status === 'listening' && (
        <div className="list" style={{ marginBottom: 10 }}>
          <div className="row" style={{ padding: '8px 12px' }}>
            <span className={`dot ${state.speechOk ? 'ok' : 'off'}`} />
            <span className="grow"><div className="title" style={{ fontSize: 14 }}>{t.listen.nameRec}</div>
              <div className="sub">{state.speechOk ? (state.transcript ? `“${state.transcript}”` : t.listen.waiting) : t.listen.nameOff}</div></span>
          </div>
          <div className="row" style={{ padding: '8px 12px' }}>
            <span className={`dot ${state.modelOk ? 'ok' : 'off'}`} />
            <span className="grow"><div className="title" style={{ fontSize: 14 }}>{t.listen.soundRec}</div>
              <div className="sub">{state.modelOk ? (state.lastClass ? `${t.listen.hears}: ${state.lastClass}` : t.listen.waiting) : t.listen.soundOff}</div></span>
          </div>
        </div>
      )}
      {state.status === 'starting' && <p className="sub">{t.listen.loading}</p>}
      {state.status === 'denied' && <p>{t.listen.denied}</p>}
      {state.status === 'unsupported' && <p>{t.listen.unsupported}</p>}
      {state.status === 'error' && <p>{t.listen.error}</p>}
      <button className={`btn block ${on ? 'danger' : ''}`} onClick={on ? stop : start} disabled={state.status === 'starting'}>
        {on ? t.listen.stop : t.listen.start}
      </button>
      <p className="hint" style={{ marginTop: 8 }}>{state.status === 'listening' ? t.listen.whatItHears : t.listen.privacy}</p>
    </section>
  )
}
