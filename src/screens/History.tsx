import Screen from '../components/Screen'
import { useT } from '../i18n'

export default function History() {
  const { t } = useT()
  return (
    <Screen title={t.nav.history} subtitle={t.history.subtitle}>
      <section className="card">
        <h2>{t.history.empty}</h2>
        <p>{t.history.emptySub}</p>
      </section>
    </Screen>
  )
}
