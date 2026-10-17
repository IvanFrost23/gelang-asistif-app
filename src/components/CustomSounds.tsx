import { useState } from 'react'
import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { useT } from '../i18n'
import { useStore } from '../store'
import { embedSamples, loadYamnet, recordSamples } from '../listen/yamnet'
import Toast, { useToast } from './Toast'

type Phase = 'idle' | 'form' | 'recording' | 'processing'

/** Раздел «Suara lain (custom)»: запись своего звука и его распознавание по эмбеддингу YAMNet. */
export default function CustomSounds() {
  const { t } = useT()
  const sounds = useStore((s) => s.customSounds)
  const { addCustomSound, removeCustomSound } = useStore()
  const { msg, show } = useToast()
  const [phase, setPhase] = useState<Phase>('idle')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('home')
  const [level, setLevel] = useState(0)
  const [vectors, setVectors] = useState<number[][] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const record = async () => {
    setErr(null)
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) } catch { setErr(t.custom.micDenied); return }
    setPhase('recording')
    loadYamnet()
    const samples = await recordSamples(stream, 3, (rms) => setLevel(Math.min(1, rms * 8)))
    stream.getTracks().forEach((x) => x.stop())
    setPhase('processing')
    const embs = await embedSamples(samples)
    setVectors((prev) => [...(prev ?? []), ...embs.map((e) => Array.from(e))].slice(-12)); setPhase('form')
  }
  const save = () => {
    if (!vectors || !name.trim()) return
    addCustomSound({ name: name.trim(), category, vectors })
    setName(''); setVectors(null); setPhase('idle'); show(t.custom.saved)
  }

  return (
    <section className="card">
      <h2>{t.custom.title}</h2>
      <p style={{ marginBottom: 10 }}>{t.custom.hint}</p>
      {sounds.length === 0 && phase === 'idle' && <p className="hint" style={{ textAlign: 'left', marginBottom: 10 }}>{t.custom.empty}</p>}
      <div className="list" style={{ marginBottom: 10 }}>
        {sounds.map((s) => (
          <div key={s.id} className="row" style={{ padding: '10px 12px', boxShadow: 'none', background: 'var(--surface-2)' }}>
            <span className="dot" style={{ background: SIGNALS[s.category].color }} />
            <span className="grow"><div className="title" style={{ fontSize: 14 }}>{s.name}</div><div className="sub">{t.signals[s.category]}</div></span>
            <button className="link" onClick={() => removeCustomSound(s.id)} aria-label={t.custom.remove}>✕</button>
          </div>
        ))}
      </div>

      {phase === 'idle' && <button className="btn ghost block" onClick={() => setPhase('form')}>{t.custom.add}</button>}

      {phase !== 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label htmlFor="cs-name">{t.custom.name}</label>
            <input id="cs-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.custom.namePh} />
          </div>
          <div className="field">
            <label>{t.custom.category}</label>
            <div className="chips">
              {CATEGORIES.filter((c) => c !== 'name').map((c) => (
                <button key={c} className="chip" style={{ borderLeft: `6px solid ${SIGNALS[c].color}`, outline: category === c ? '2px solid var(--accent)' : 'none' }} onClick={() => setCategory(c)}>{t.signals[c]}</button>
              ))}
            </div>
          </div>
          {phase === 'recording' && <><div className="level"><div className="level-bar" style={{ width: `${Math.round(level * 100)}%` }} /></div><p className="hint">{t.custom.recording}</p></>}
          {phase === 'processing' && <p className="hint">{t.custom.processing}</p>}
          {phase === 'form' && (
            <button className={`btn block ${vectors ? 'ghost' : ''}`} onClick={record}>{vectors ? `✓ ${t.custom.again}` : `🎙 ${t.custom.record}`}</button>
          )}
          {err && <p className="hint" style={{ color: 'var(--red)' }}>{err}</p>}
          <div className="inline">
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setPhase('idle'); setVectors(null); setErr(null) }}>{t.custom.cancel}</button>
            <button className="btn" style={{ flex: 1 }} disabled={!vectors || !name.trim() || phase !== 'form'} onClick={save}>{t.custom.save}</button>
          </div>
        </div>
      )}
      <p className="hint" style={{ marginTop: 10 }}>{t.custom.note}</p>
      <Toast msg={msg} />
    </section>
  )
}
