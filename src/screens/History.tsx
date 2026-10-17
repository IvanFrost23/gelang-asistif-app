import { useMemo } from 'react'
import Screen from '../components/Screen'
import { SIGNALS } from '../domain/signals'
import { useT } from '../i18n'
import { useStore } from '../store'

export default function History() {
  const { t, lang } = useT()
  const history = useStore((s) => s.history)
  const activeId = useStore((s) => s.activeProfileId)
  const clear = useStore((s) => s.clearHistory)
  const loc = lang === 'id' ? 'id-ID' : 'en-GB'

  const groups = useMemo(() => {
    const mine = history.filter((e) => !activeId || e.profileId === activeId || !e.profileId)
    const map = new Map<string, typeof mine>()
    for (const e of mine) {
      const d = new Date(e.at)
      const key = d.toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return [...map.entries()]
  }, [history, activeId])

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const dayLabel = (key: string) =>
    key === today ? t.historyFull.today : key === yesterday ? t.historyFull.yesterday : new Date(key).toLocaleDateString(loc, { day: 'numeric', month: 'long' })

  return (
    <Screen title={t.nav.history} subtitle={t.history.subtitle}>
      {groups.length === 0 ? (
        <section className="card"><h2>{t.history.empty}</h2><p>{t.history.emptySub}</p></section>
      ) : (
        <>
          {groups.map(([key, events]) => (
            <section key={key}>
              <h2 style={{ fontSize: 14, color: 'var(--muted)', margin: '4px 0 8px' }}>{dayLabel(key)} · {events.length}</h2>
              <div className="list">
                {events.map((e) => (
                  <div key={e.id} className="row" style={{ padding: '10px 14px' }}>
                    <span className="dot" style={{ background: SIGNALS[e.category].color }} />
                    <span className="grow">
                      <div className="title">{t.signals[e.category]}</div>
                      <div className="sub">
                        {t.historyFull.source[e.source]}
                        {e.detail ? ` · «${e.detail}»` : ''}
                        {e.confidence !== undefined ? ` · ${Math.round(e.confidence * 100)}%` : ''}
                      </div>
                    </span>
                    <span className="sub">{new Date(e.at).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <button className="btn ghost block" onClick={clear}>{t.historyFull.clear}</button>
        </>
      )}
    </Screen>
  )
}
