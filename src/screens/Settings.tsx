import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTheme, setTheme, type Theme } from '../theme'
import Screen from '../components/Screen'
import { CATEGORIES, SIGNALS } from '../domain/signals'
import { useT } from '../i18n'
import { useStore, type Sensitivity } from '../store'
import { routes } from '../app/routes'
import { auth } from '../firebase'
import { signOut as fbSignOut } from 'firebase/auth'
import CustomSounds from '../components/CustomSounds'

export default function Settings() {
  const { t } = useT()
  const nav = useNavigate()
  const { settings, setEnabled, setSensitivity, user, signOut } = useStore()
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const pickTheme = (t: Theme) => { setTheme(t); setThemeState(t) }
  const themes: { v: Theme; label: string }[] = [{ v: 'auto', label: t.settingsFull.themeAuto }, { v: 'light', label: t.settingsFull.themeLight }, { v: 'dark', label: t.settingsFull.themeDark }]
  const sens: { v: Sensitivity; label: string }[] = [
    { v: 'low', label: t.settingsFull.sensLow }, { v: 'medium', label: t.settingsFull.sensMedium }, { v: 'high', label: t.settingsFull.sensHigh },
  ]
  return (
    <Screen title={t.nav.settings} subtitle={t.settings.subtitle}>
      <div className="list">
        {CATEGORIES.map((c) => {
          const on = settings.enabled[c]
          return (
            <div key={c} className="row">
              <span className="dot" style={{ background: SIGNALS[c].color }} />
              <span className="grow">
                <div className="title">{t.signals[c]}</div>
                <div className="sub">{t.signals[`${c}Sub`]}{SIGNALS[c].alwaysOn ? ` · ${t.settings.alwaysOn}` : ''}</div>
              </span>
              <button className={`switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} disabled={SIGNALS[c].alwaysOn} onClick={() => setEnabled(c, !on)} aria-label={t.signals[c]} />
            </div>
          )
        })}
      </div>
      <p className="hint">{t.settingsFull.dangerLocked}</p>
      <CustomSounds />

      <section className="card">
        <h2>{t.settingsFull.sensitivity}</h2>
        <div className="seg">
          {sens.map((s) => <button key={s.v} className={settings.sensitivity === s.v ? 'on' : ''} onClick={() => setSensitivity(s.v)}>{s.label}</button>)}
        </div>
        <p style={{ marginTop: 10 }}>{t.settingsFull.sensHint}</p>
      </section>
      <section className="card">
        <h2>{t.settingsFull.theme}</h2>
        <div className="seg">
          {themes.map((x) => <button key={x.v} className={theme === x.v ? 'on' : ''} onClick={() => pickTheme(x.v)}>{x.label}</button>)}
        </div>
      </section>
      <p className="hint">{t.settingsFull.saved}</p>

      <section className="card">
        <h2>{t.settingsFull.account}</h2>
        {user ? (
          <div className="row" style={{ padding: '10px 12px' }}>
            <span className="grow"><div className="sub">{t.login.signedAs} · {user.mode === 'cloud' ? t.login.modeCloud : t.login.modeLocal}</div><div className="title">{user.email}</div></span>
            <button className="btn ghost sm" onClick={() => { signOut(); if (auth) fbSignOut(auth).catch(() => {}); nav(routes.login) }}>{t.login.signOut}</button>
          </div>
        ) : <button className="btn block" onClick={() => nav(routes.login)}>{t.login.submit}</button>}
      </section>
    </Screen>
  )
}
