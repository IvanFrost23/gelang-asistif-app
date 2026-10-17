import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { useStore } from '../store'

export default function Login() {
  const { t } = useT()
  const nav = useNavigate()
  const signIn = useStore((s) => s.signIn)
  const hasProfiles = useStore((s) => s.profiles.length > 0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    signIn(email.trim())
    nav(hasProfiles ? routes.home : routes.profile, { replace: true })
  }

  return (
    <Screen title={t.login.title} subtitle={t.login.subtitle} nav={false}>
      <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label htmlFor="email">{t.login.email}</label>
          <input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
        </div>
        <div className="field">
          <label htmlFor="password">{t.login.password}</label>
          <input id="password" className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn block" type="submit">{t.login.submit}</button>
        <button type="button" className="link center">{t.login.forgot}</button>
      </form>
      <p className="hint">{t.login.hint}</p>
    </Screen>
  )
}
