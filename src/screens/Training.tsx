import Screen from '../components/Screen'
import Bracelet from '../components/Bracelet'
import SignalButtons from '../components/SignalButtons'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'
import { useActiveProfile, useStore } from '../store'
import { playDemoSound } from '../audio/demoSounds'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../app/routes'
import { useVibrate } from '../hooks/useVibrate'
import { useT } from '../i18n'

export default function Training() {
  const { t } = useT()
  const { state, play, stop } = useBraceletPlayer()
  const addEvent = useStore((s) => s.addEvent)
  const profile = useActiveProfile()
  const [sound, setSound] = useState(true)
  const playAndLog = (c: Parameters<typeof play>[0]) => {
    if (sound) playDemoSound(c, profile?.callNames[0] ?? profile?.name ?? 'Nadiyya')
    play(c)
    addEvent({ category: c, source: 'training' })
  }
  const { supported } = useVibrate()
  return (
    <Screen title={t.screens.training} subtitle={t.training.subtitle}>
      <section className="card hero">
        <Bracelet state={state} size={250} />
        <p style={{ textAlign: 'center', marginTop: 8 }}>{state.signal ? t.bracelet.playing : t.bracelet.idle}</p>
      </section>
      <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{t.training.tryIt}</h2>
      <SignalButtons active={state.signal?.category ?? null} onPlay={playAndLog} />
      <div className="row" style={{ padding: '8px 12px' }}>
        <span className="grow"><div className="title" style={{ fontSize: 14 }}>{t.sim.sound}</div><div className="sub">{t.training.soundHint}</div></span>
        <button className={`switch ${sound ? 'on' : ''}`} role="switch" aria-checked={sound} onClick={() => setSound(!sound)} aria-label={t.sim.sound} />
      </div>
      <button className="btn ghost block" onClick={stop}>{t.bracelet.stop}</button>
      <Link to={routes.quiz} className="row download">
        <span className="dl-icon">⭐</span>
        <span className="grow"><div className="title">{t.quiz.title}</div><div className="sub">{t.quiz.teaser}</div></span>
      </Link>
      {!supported && <p className="hint">{t.bracelet.noVibrate}</p>}
    </Screen>
  )
}
