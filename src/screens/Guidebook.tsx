import { useState } from 'react'
import Screen from '../components/Screen'
import Bracelet from '../components/Bracelet'
import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'
import { useT } from '../i18n'

const PATTERN_GLYPH: Record<Category, string> = { name: '● ●', danger: '▬ ▬ ▬', bell: '▬', home: '● ● ●' }

export default function Guidebook() {
  const { t } = useT()
  const [tab, setTab] = useState<'adult' | 'child'>('adult')
  const { state, play } = useBraceletPlayer()
  return (
    <Screen title={t.screens.guidebook} subtitle={t.guide.subtitle}>
      <div className="seg two">
        <button className={tab === 'adult' ? 'on' : ''} onClick={() => setTab('adult')}>{t.guide.tabAdult}</button>
        <button className={tab === 'child' ? 'on' : ''} onClick={() => setTab('child')}>{t.guide.tabChild}</button>
      </div>

      {tab === 'adult' && (
        <div className="list">
          {t.guide.adult.map((sec) => (
            <section key={sec.h} className="card"><h2>{sec.h}</h2><p>{sec.p}</p></section>
          ))}
        </div>
      )}

      {tab === 'child' && (
        <>
          <section className="card hero center">
            <Bracelet state={state} size={160} />
            <p className="big">{t.guide.childIntro}</p>
          </section>
          <div className="list">
            {CATEGORIES.map((c) => (
              <section key={c} className="card kid" style={{ borderColor: SIGNALS[c].color }}>
                <div className="kid-head">
                  <span className="dot big-dot" style={{ background: SIGNALS[c].color }} />
                  <span className="glyph" style={{ color: SIGNALS[c].color }}>{PATTERN_GLYPH[c]}</span>
                </div>
                <h2 className="kid-what">{t.guide.child[c].what}</h2>
                <p className="kid-do">{t.guide.child[c].doIt}</p>
                <button className="btn ghost sm" onClick={() => play(c)}>{t.guide.feel}</button>
              </section>
            ))}
          </div>
          <p className="hint">{t.guide.videoSoon}</p>
        </>
      )}
    </Screen>
  )
}
