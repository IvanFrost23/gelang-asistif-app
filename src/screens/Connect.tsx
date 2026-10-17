import { useEffect, useState } from 'react'
import Screen from '../components/Screen'
import Bracelet from '../components/Bracelet'
import { useT } from '../i18n'
import { useActiveProfile, useStore } from '../store'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'

const FAKE_ID = 'GA-2041'

export default function Connect() {
  const { t } = useT()
  const status = useStore((s) => s.bracelet)
  const setBracelet = useStore((s) => s.setBracelet)
  const updateProfile = useStore((s) => s.updateProfile)
  const active = useActiveProfile()
  const { state, play } = useBraceletPlayer()
  const [found, setFound] = useState(false)

  useEffect(() => {
    if (status !== 'searching') return
    const t = setTimeout(() => setFound(true), 1800)
    return () => clearTimeout(t)
  }, [status])

  const connect = () => {
    setBracelet('connected'); setFound(false)
    if (active) updateProfile(active.id, { braceletId: FAKE_ID })
    play('name')
  }

  return (
    <Screen title={t.screens.connect} subtitle={t.connect.subtitle}>
      <section className="card hero center">
        <Bracelet state={state} size={220} />
        <div className={`status ${status}`}><span className="dot" />{t.connect.status[status]}</div>
        {status === 'connected' && <p style={{ marginTop: 6 }}>{FAKE_ID} · {t.connect.battery} 86%</p>}
      </section>

      {status === 'disconnected' && (
        <>
          <ol className="steps"><li>{t.connect.step1}</li><li>{t.connect.step2}</li><li>{t.connect.step3}</li></ol>
          <button className="btn block" onClick={() => setBracelet('searching')}>{t.connect.search}</button>
        </>
      )}
      {status === 'searching' && (
        found ? (
          <div className="row">
            <span className="grow"><div className="title">{t.connect.found}</div><div className="sub">{FAKE_ID}</div></span>
            <button className="btn sm" onClick={connect}>{t.connect.connectTo}</button>
          </div>
        ) : <p className="hint">{t.connect.status.searching}</p>
      )}
      {status === 'connected' && <button className="btn ghost block" onClick={() => setBracelet('disconnected')}>{t.connect.disconnect}</button>}
      <p className="hint">{t.connect.simNote}</p>
    </Screen>
  )
}
