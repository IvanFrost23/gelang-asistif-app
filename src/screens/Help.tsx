import { useState } from 'react'
import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'
import { APK_URL, SITE_URL } from '../app/links'
import { useT } from '../i18n'
import { ChevronIcon } from '../components/Icons'

const isNative = () => /; wv\)|Capacitor/i.test(navigator.userAgent) || !!(window as unknown as { Capacitor?: unknown }).Capacitor

export default function Help() {
  const { t } = useT()
  const [open, setOpen] = useState<number | null>(null)
  const h = t.helpFull
  return (
    <Screen title={t.nav.help}>
      <div className="list">
        <MenuRow to={routes.guidebook} title={t.home.guidebook} sub={t.help.guidebookSub} />
        <MenuRow to={routes.training} title={t.home.training} sub={t.help.trainingSub} />
        {isNative() ? (
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="row download">
            <span className="dl-icon">🌐</span>
            <span className="grow"><div className="title">{h.openWeb}</div><div className="sub">{SITE_URL.replace('https://', '')}</div></span>
            <span className="chev"><ChevronIcon size={20} /></span>
          </a>
        ) : (
          <a href={APK_URL} className="row download">
            <span className="dl-icon">⬇</span>
            <span className="grow"><div className="title">{h.download}</div><div className="sub">{h.downloadSub}</div></span>
            <span className="chev"><ChevronIcon size={20} /></span>
          </a>
        )}
      </div>

      <section className="card">
        <h2>{h.faqTitle}</h2>
        <div className="list">
          {h.faq.map((f, i) => (
            <div key={f.q} className="faq">
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>{f.q}<span>{open === i ? '−' : '+'}</span></button>
              {open === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="card about">
        <h2>{h.aboutTitle}</h2>
        <p>{h.aboutLead}</p>
        <dl className="meta">
          <dt>{h.course}</dt><dd>{h.courseName}</dd>
          <dt>{h.program}</dt><dd>{h.programName}</dd>
          <dt>{h.university}</dt><dd>{h.universityName}</dd>
          <dt>{h.lecturer}</dt><dd>{h.lecturerName}</dd>
          <dt>{h.status}</dt><dd>{h.statusText}</dd>
        </dl>
        <h3 className="team-title">{h.team}</h3>
        <ul className="team">
          {h.members.map((m) => (
            <li key={m.nim}><span className="avatar">{m.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}</span><span className="grow"><div className="title">{m.name}</div><div className="sub">NIM {m.nim}</div></span></li>
          ))}
        </ul>
        <p className="hint" style={{ marginTop: 12 }}>{h.version} 1.2 · {t.help.aboutText}</p>
      </section>
    </Screen>
  )
}
