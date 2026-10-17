import { useState } from 'react'
import { useListen } from '../listen/useListen'
import { useT } from '../i18n'

export default function ListenPanel() {
  const { t } = useT()
  const { state, start, stop } = useListen()
  const [more, setMore] = useState(false)
  const on = state.status === 'listening' || state.status === 'starting'
  const problem = state.status === 'denied' || state.status === 'unsupported' || state.status === 'error'
  return (
    <section className={`card listen ${on ? 'on' : ''}`}>
      <div className="card-title">
        <h2><span className={`mic ${on ? 'on' : ''}`} />{t.listen.title} <span className="pill beta">{t.listen.beta}</span></h2>
        <button className={`info ${more ? 'on' : ''}`} onClick={() => setMore(!more)} aria-label="info" aria-expanded={more}>i</button>
      </div>

      {!on && !problem && <p className="sub compact">{t.listen.short}</p>}
      {more && !on && <p className="sub compact fade-in">{t.listen.betaNote} {t.listen.privacy}</p>}

      {on && <div className="level"><div className="level-bar" style={{ width: `${Math.round(state.level * 100)}%` }} /></div>}
      {state.status === 'starting' && <p className="sub compact">{t.listen.loading}</p>}
      {state.status === 'listening' && (
        <div className="listen-rows">
          <div className="lr"><span className={`dot ${state.speechOk ? 'ok' : 'off'}`} /><span className="lr-k">{t.listen.nameRec}</span>
            <span className="lr-v">{state.speechOk ? (state.transcript ? `“${state.transcript}”` : '…') : t.listen.nameOff}</span></div>
          <div className="lr"><span className={`dot ${state.modelOk ? 'ok' : 'off'}`} /><span className="lr-k">{t.listen.soundRec}</span>
            <span className="lr-v">{state.modelOk ? (state.lastClass || '…') : t.listen.soundOff}</span></div>
        </div>
      )}
      {state.status === 'denied' && <p className="sub compact">{t.listen.denied}</p>}
      {state.status === 'unsupported' && <p className="sub compact">{t.listen.unsupported}</p>}
      {state.status === 'error' && <p className="sub compact">{t.listen.error}</p>}

      <button className={`btn block ${on ? 'danger' : ''}`} onClick={on ? stop : start} disabled={state.status === 'starting'}>
        {on ? t.listen.stop : t.listen.start}
      </button>
    </section>
  )
}
