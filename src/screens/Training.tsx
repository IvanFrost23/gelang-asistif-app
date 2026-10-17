import Screen from '../components/Screen'
import Bracelet from '../components/Bracelet'
import SignalButtons from '../components/SignalButtons'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'
import { useVibrate } from '../hooks/useVibrate'
import { useT } from '../i18n'

export default function Training() {
  const { t } = useT()
  const { state, play, stop } = useBraceletPlayer()
  const { supported } = useVibrate()
  return (
    <Screen title={t.screens.training} subtitle={t.training.subtitle}>
      <section className="card">
        <Bracelet state={state} />
        <p style={{ textAlign: 'center', marginTop: 8 }}>{state.signal ? t.bracelet.playing : t.bracelet.idle}</p>
      </section>
      <h2 style={{ margin: '4px 0 0', fontSize: 16 }}>{t.training.tryIt}</h2>
      <SignalButtons active={state.signal?.category ?? null} onPlay={play} />
      <button className="btn ghost block" onClick={stop}>{t.bracelet.stop}</button>
      {!supported && <p className="hint">{t.bracelet.noVibrate}</p>}
    </Screen>
  )
}
