import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'
import { useT } from '../i18n'

export default function Help() {
  const { t } = useT()
  return (
    <Screen title={t.nav.help}>
      <div className="list">
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.help.guidebookSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.help.trainingSub} />
      </div>
      <section className="card">
        <h2>{t.help.about}</h2>
        <p>{t.help.aboutText}</p>
      </section>
    </Screen>
  )
}
