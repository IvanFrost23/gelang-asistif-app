import Screen from '../components/Screen'
import { useT } from '../i18n'

export default function Settings() {
  const { t } = useT()
  const s = t.signals
  const kinds = [
    { name: s.name, color: 'var(--blue)', sub: s.nameSub },
    { name: s.danger, color: 'var(--red)', sub: `${s.dangerSub} · ${t.settings.alwaysOn}` },
    { name: s.bell, color: 'var(--yellow)', sub: s.bellSub },
    { name: s.home, color: 'var(--green)', sub: s.homeSub },
  ]
  return (
    <Screen title={t.nav.settings} subtitle={t.settings.subtitle}>
      <div className="list">
        {kinds.map((k) => (
          <div key={k.name} className="row">
            <span className="dot" style={{ background: k.color }} />
            <span className="grow">
              <div className="title">{k.name}</div>
              <div className="sub">{k.sub}</div>
            </span>
          </div>
        ))}
      </div>
      <p className="stub">{t.settings.stub}</p>
    </Screen>
  )
}
