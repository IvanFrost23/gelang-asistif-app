import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'
import { useT } from '../i18n'

export default function Home() {
  const { t } = useT()
  return (
    <Screen title={t.nav.home} subtitle={t.appName}>
      <section className="card">
        <h2>Aisyah <span className="pill">{t.home.connected}</span></h2>
        <p>{t.home.statusStub}</p>
      </section>
      <button className="btn block">{t.home.call}</button>
      <div className="list">
        <MenuRow to={routes.profile} title={t.home.profile} sub={t.home.profileSub} />
        <MenuRow to={routes.connect} title={t.home.connect} sub={t.home.connectSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.home.trainingSub} />
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.home.guidebookSub} />
      </div>
    </Screen>
  )
}
