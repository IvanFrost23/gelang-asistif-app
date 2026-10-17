import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import Toast, { useToast } from '../components/Toast'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { useActiveProfile, useStore } from '../store'

export default function Profile() {
  const { t } = useT()
  const nav = useNavigate()
  const active = useActiveProfile()
  const profiles = useStore((s) => s.profiles)
  const { addProfile, updateProfile, removeProfile, setActiveProfile } = useStore()
  const { msg, show } = useToast()

  const [editing, setEditing] = useState<string | null | 'new'>(active ? active.id : 'new')
  const current = editing === 'new' ? null : profiles.find((p) => p.id === editing) ?? null
  const [name, setName] = useState(current?.name ?? '')
  const [callNames, setCallNames] = useState<string[]>(current?.callNames ?? [])
  const [draft, setDraft] = useState('')

  const startEdit = (id: string | 'new') => {
    const p = id === 'new' ? null : profiles.find((x) => x.id === id)
    setEditing(id); setName(p?.name ?? ''); setCallNames(p?.callNames ?? []); setDraft('')
  }
  const addName = () => {
    const v = draft.trim()
    if (v && !callNames.includes(v)) setCallNames([...callNames, v])
    setDraft('')
  }
  const save = (e: FormEvent) => {
    e.preventDefault()
    const names = callNames.length ? callNames : [name.trim()]
    if (!name.trim()) return
    if (current) updateProfile(current.id, { name: name.trim(), callNames: names })
    else { const id = addProfile({ name: name.trim(), callNames: names, braceletId: null }); setActiveProfile(id); setEditing(id) }
    show(t.profile.saved)
    setTimeout(() => nav(routes.home), 600)
  }

  return (
    <Screen title={t.screens.profile} subtitle={t.profile.subtitle}>
      {profiles.length > 0 && (
        <section className="card">
          <div className="card-title"><h2>{t.profile.list}</h2><button className="link" onClick={() => startEdit('new')}>+ {t.profile.newProfile}</button></div>
          <div className="list">
            {profiles.map((p) => (
              <div key={p.id} className="row" style={{ padding: '10px 12px' }}>
                <span className="grow" onClick={() => startEdit(p.id)} style={{ cursor: 'pointer' }}>
                  <div className="title">{p.name} {p.id === active?.id && <span className="pill">{t.profile.active}</span>}</div>
                  <div className="sub">{p.callNames.join(', ')}</div>
                </span>
                {p.id !== active?.id && <button className="btn ghost sm" onClick={() => setActiveProfile(p.id)}>{t.profile.choose}</button>}
                <button className="link" onClick={() => { removeProfile(p.id); if (editing === p.id) startEdit('new') }} aria-label={t.profile.remove}>✕</button>
              </div>
            ))}
          </div>
        </section>
      )}
      <form className="card" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0 }}>{current ? current.name : t.profile.newProfile}</h2>
        <div className="field">
          <label htmlFor="name">{t.profile.name}</label>
          <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.profile.namePh} />
        </div>
        <div className="field">
          <label htmlFor="call">{t.profile.callNames}</label>
          <div className="inline">
            <input id="call" className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.profile.namePhCall}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addName() } }} />
            <button type="button" className="btn ghost" onClick={addName}>{t.profile.addName}</button>
          </div>
          <div className="chips">
            {callNames.map((n) => (
              <span key={n} className="chip">{n}<button type="button" onClick={() => setCallNames(callNames.filter((x) => x !== n))} aria-label="remove">×</button></span>
            ))}
          </div>
          <p className="hint" style={{ textAlign: 'left' }}>{t.profile.callNamesHint}</p>
        </div>
        <button className="btn block" type="submit">{t.profile.save}</button>
      </form>
      <Toast msg={msg} />
    </Screen>
  )
}
