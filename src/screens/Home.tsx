import { Link, useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import Bracelet from '../components/Bracelet'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { useBraceletLink } from '../hooks/useBraceletLink'
import { dispatch } from '../events/pipeline'
import { sayName } from '../audio/demoSounds'
import { useActiveProfile, useStore } from '../store'
import { SIGNALS } from '../domain/signals'
import Simulator from '../components/Simulator'
import ListenPanel from '../components/ListenPanel'

export default function Home() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const { state } = useBraceletLink()
  const active = useActiveProfile()
  const { user, bracelet } = useStore()
  const last = useStore((s) => s.history[0])

  const call = () => {
    if (active) sayName(active.callNames[0] ?? active.name)
    dispatch({ category: 'name', source: 'manual' })
  }

  if (!user) {
    return (
      <Screen title={t.nav.home} subtitle={t.appName}>
        <section className="card center"><Bracelet state={state} size={220} /><p>{t.homeFull.signInFirst}</p></section>
        <button className="btn block" onClick={() => nav(routes.login)}>{t.login.submit}</button>
      </Screen>
    )
  }

  return (
    <Screen title={t.nav.home} subtitle={t.appName}>
      <section className="card">
        <div className="card-title">
          <h2>{active ? active.name : t.homeFull.noProfile}</h2>
          <Link to={routes.connect} className={`status ${bracelet}`}><span className="dot" />{t.connect.status[bracelet]}</Link>
        </div>
        <Bracelet state={state} size={220} />
        <p className="center">
          {last ? (
            <><span className="dot" style={{ background: SIGNALS[last.category].color, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
              {t.homeFull.lastEvent}: {t.signals[last.category]} · {new Date(last.at).toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</>
          ) : t.homeFull.noEvents}
        </p>
      </section>
      {active ? (
        <button className="btn block" onClick={call}>{t.home.call}</button>
      ) : (
        <button className="btn block" onClick={() => nav(routes.profile)}>{t.homeFull.createProfile}</button>
      )}
      <Simulator />
      <ListenPanel />
      <div className="list">
        <MenuRow to={routes.profile} title={t.home.profile} sub={active ? active.callNames.join(', ') : t.home.profileSub} />
        <MenuRow to={routes.connect} title={t.home.connect} sub={t.home.connectSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.home.trainingSub} />
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.home.guidebookSub} />
      </div>
    </Screen>
  )
}
