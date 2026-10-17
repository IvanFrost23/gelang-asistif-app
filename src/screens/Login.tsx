import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { useStore } from '../store'
import { auth, firebaseEnabled } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default function Login() {
  const { t } = useT()
  const nav = useNavigate()
  const signIn = useStore((s) => s.signIn)
  const hasProfiles = useStore((s) => s.profiles.length > 0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const done = () => nav(hasProfiles ? routes.home : routes.profile, { replace: true })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const em = email.trim()
    if (!em.includes('@')) return
    if (!firebaseEnabled || !auth) { signIn(em); done(); return }
    setBusy(true); setNote(null)
    try {
      try {
        await signInWithEmailAndPassword(auth, em, password)
      } catch (err) {
        const code = (err as { code?: string }).code ?? ''
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
          await createUserWithEmailAndPassword(auth, em, password)   // прототип: первый вход создаёт аккаунт
          setNote(t.login.created)
        } else throw err
      }
      done() // onAuthStateChanged в sync.ts запишет пользователя в store
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/wrong-password') { setNote(t.login.wrongPassword); setBusy(false); return }
      // Провайдер не включён, нет сети и т.п. — работаем локально, как и без Firebase.
      console.warn('firebase auth unavailable, local mode:', code)
      signIn(em); setNote(t.login.localMode); setTimeout(done, 900)
    } finally { setBusy(false) }
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
        <button className="btn block" type="submit" disabled={busy}>{busy ? '…' : t.login.submit}</button>
        {note && <p className="hint">{note}</p>}
        <button type="button" className="link center">{t.login.forgot}</button>
      </form>
      <p className="hint">{firebaseEnabled ? t.login.hintCloud : t.login.hint}</p>
    </Screen>
  )
}
