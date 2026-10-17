import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import Bracelet from '../components/Bracelet'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'

export default function Home() {
  const { t } = useT()
  const { state, play } = useBraceletPlayer()
  return (
    <Screen title={t.nav.home} subtitle={t.appName}>
      <section className="card">
        <h2>Aisyah <span className="pill">{t.home.connected}</span></h2>
        <Bracelet state={state} size={220} />
      </section>
      <button className="btn block" onClick={() => play('name')}>{t.home.call}</button>
      <div className="list">
        <MenuRow to={routes.profile} title={t.home.profile} sub={t.home.profileSub} />
        <MenuRow to={routes.connect} title={t.home.connect} sub={t.home.connectSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.home.trainingSub} />
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.home.guidebookSub} />
      </div>
    </Screen>
  )
}
