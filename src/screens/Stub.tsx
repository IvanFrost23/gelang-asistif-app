import { Link } from 'react-router-dom'
import Screen from '../components/Screen'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import type { Dict } from '../i18n/dict'

export default function Stub({ screen, step }: { screen: keyof Dict['screens']; step: number }) {
  const { t } = useT()
  return (
    <Screen title={t.screens[screen]}>
      <p className="stub">{t.stub.madeOnStep} {step}.</p>
      <Link to={routes.home} className="btn ghost block">{t.stub.back}</Link>
    </Screen>
  )
}
