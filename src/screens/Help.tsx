import { useState } from 'react'
import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'
import { useT } from '../i18n'

export default function Help() {
  const { t } = useT()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Screen title={t.nav.help}>
      <div className="list">
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.help.guidebookSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.help.trainingSub} />
      </div>
      <section className="card">
        <h2>{t.helpFull.faqTitle}</h2>
        <div className="list">
          {t.helpFull.faq.map((f, i) => (
            <div key={f.q} className="faq">
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>{f.q}<span>{open === i ? '−' : '+'}</span></button>
              {open === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>{t.help.about}</h2>
        <p>{t.help.aboutText}</p>
        <p style={{ marginTop: 8 }}>{t.helpFull.team}</p>
        <p style={{ marginTop: 8 }}>{t.helpFull.version} 0.6</p>
      </section>
    </Screen>
  )
}
