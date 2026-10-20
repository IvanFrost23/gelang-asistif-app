import { useEffect, useMemo, useRef, useState } from 'react'
import { APK_URL, REPO_URL } from '../app/links'
import { HeroView } from './three/views'
import { Stage } from './Stage'
import { Codes } from './Codes'
import { Inside } from './Inside'
import { Explorer } from './Explorer'
import { useT, type Lang } from './i18n'
import { Icon } from './icons'
import shotHome from '../../docs/screens/07-beranda.png'
import shotTraining from '../../docs/screens/11-mode-latihan.png'
import shotChild from '../../docs/screens/14-panduan-anak.png'
import shotSettings from '../../docs/screens/10-pengaturan.png'

const MEMBERS = ['Ichwan Maulal Hafif', 'Nadiyya Nur Savira', 'Hawa Istiqomah', 'Yoshelyn Shalom P.', 'Ismi Nafisah']
const LECTURER = 'Ima Kurrotun Ainin, S.Pd., M.Pd.'

function LangSwitch() {
  const { lang, setLang } = useT()
  return (
    <div className="lang" role="group" aria-label="Language">
      {(['id', 'en'] as Lang[]).map((l) => (
        <button key={l} className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

function Nav() {
  const { t } = useT()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="nav-in">
        <a className="brand" href="#top" aria-label="Gelang Asistif">
          <img src="/icon-192.png" alt="" width={28} height={28} />
          <span>Gelang Asistif</span>
        </a>
        <nav className="links">
          <a href="#kode">{t.nav.codes}</a>
          <a href="#dalam">{t.nav.inside}</a>
          <a href="#tiga-d">{t.nav.explore}</a>
          <a href="#cara-kerja">{t.nav.how}</a>
          <a href="#aplikasi">{t.nav.app}</a>
        </nav>
        <div className="nav-right">
          <LangSwitch />
          <a className="btn primary xs" href="/">{t.nav.open}</a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const { t } = useT()
  const view = useMemo(() => new HeroView(), [])
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      view.target.x = (e.clientX / window.innerWidth - 0.5) * 2
      view.target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [view])
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-in">
      <div className="hero-copy">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1><span>{t.hero.title[0]}</span><span className="grad">{t.hero.title[1]}</span></h1>
        <p className="hero-lead">{t.hero.lead}</p>
        <div className="hero-cta">
          <a className="btn primary" href="#tiga-d">{Icon.target(18)}{t.hero.explore}</a>
          <a className="btn ghost" href="/">{t.hero.tryApp}</a>
        </div>
      </div>
      <Stage className="hero-stage" view={view} />
      </div>
      <a className="scroll-cue" href="#cerita" aria-label={t.hero.scroll}>{Icon.arrowDown(18)}</a>
    </section>
  )
}

/** Абзац, слова которого «загораются» по мере прокрутки. */
function Statement() {
  const { t } = useT()
  const ref = useRef<HTMLParagraphElement>(null)
  const words = t.statement.split(' ')
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height + vh * 0.3)))
      const spans = el.children
      const lit = Math.round(p * spans.length)
      for (let i = 0; i < spans.length; i++) spans[i].classList.toggle('lit', i < lit)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [t.statement])
  return (
    <section className="statement" id="cerita">
      <p ref={ref} className="statement-text">
        {words.map((w, i) => <span key={i}>{w} </span>)}
      </p>
    </section>
  )
}

function How() {
  const { t } = useT()
  const icons = [Icon.mic(26), Icon.chip(26), Icon.bluetooth(26)]
  return (
    <section className="how" id="cara-kerja">
      <div className="wrap head reveal">
        <p className="kicker">{t.how.kicker}</p>
        <h2>{t.how.title}</h2>
      </div>
      <ol className="wrap steps">
        {t.how.steps.map((s, i) => (
          <li key={i} className="step reveal" style={{ transitionDelay: `${i * 90}ms` }}>
            <div className="step-icon">{icons[i]}</div>
            <p className="step-n">0{i + 1}</p>
            <h3>{s.h}</h3>
            <p>{s.p}</p>
          </li>
        ))}
      </ol>
      <p className="wrap privacy reveal">{Icon.lock(16)}{t.how.privacy}</p>
    </section>
  )
}

function AppShowcase() {
  const { t } = useT()
  const shots = [shotHome, shotTraining, shotChild, shotSettings]
  const icons = [Icon.user, Icon.sliders, Icon.target, Icon.phone, Icon.clock, Icon.book]
  return (
    <section className="app" id="aplikasi">
      <div className="wrap head reveal">
        <p className="kicker">{t.app.kicker}</p>
        <h2>{t.app.title}</h2>
        <p className="lead">{t.app.lead}</p>
      </div>
      <div className="phones reveal">
        {shots.map((src, i) => (
          <figure key={i} className={'phone p' + i}>
            <div className="phone-frame"><img src={src} alt={t.app.shots[i]} loading="lazy" width={390} height={800} /></div>
            <figcaption>{t.app.shots[i]}</figcaption>
          </figure>
        ))}
      </div>
      <ul className="wrap features">
        {t.app.features.map((f, i) => (
          <li key={i} className="feature reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
            <span className="feature-icon">{icons[i](22)}</span>
            <h3>{f.h}</h3>
            <p>{f.p}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Specs() {
  const { t } = useT()
  return (
    <section className="specs" id="spesifikasi">
      <div className="wrap head reveal">
        <p className="kicker">{t.specs.kicker}</p>
        <h2>{t.specs.title}</h2>
      </div>
      <div className="wrap bento">
        {t.specs.items.map((s, i) => (
          <div key={i} className={'cell reveal c' + i} style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
            <p className="cell-k">{s.k}</p>
            <p className="cell-v">{s.v}</p>
            <p className="cell-s">{s.s}</p>
          </div>
        ))}
        <div className="cell status reveal">
          <p className="cell-k"><span className="pulse" />{t.specs.status}</p>
          <p className="cell-s">{t.specs.statusText}</p>
        </div>
      </div>
    </section>
  )
}

function Cta() {
  const { t } = useT()
  return (
    <section className="cta" id="coba">
      <div className="wrap cta-box reveal">
        <h2>{t.cta.title}</h2>
        <p className="lead">{t.cta.lead}</p>
        <div className="cta-btns">
          <a className="btn primary lg" href="/">{Icon.globe(20)}{t.cta.web}</a>
          <a className="btn ghost lg" href={APK_URL}>{Icon.download(20)}<span>{t.cta.apk}<small>{t.cta.apkSub}</small></span></a>
          <a className="btn ghost lg" href={REPO_URL} target="_blank" rel="noreferrer">{Icon.code(20)}{t.cta.code}</a>
        </div>
      </div>
      <div className="wrap team reveal">
        <p className="kicker">{t.team.kicker}</p>
        <h3>{t.team.title}</h3>
        <ul className="members">{MEMBERS.map((m) => <li key={m}>{m}</li>)}</ul>
        <p className="team-course">{t.team.course}</p>
        <p className="team-course">{t.team.lecturer}: {LECTURER}</p>
      </div>
    </section>
  )
}

export default function App() {
  const { t, lang } = useT()
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lang])
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Codes />
        <Inside />
        <Explorer />
        <How />
        <AppShowcase />
        <Specs />
        <Cta />
      </main>
      <footer className="footer">
        <div className="wrap footer-in">
          <span>© 2026 Gelang Asistif · Universitas Negeri Surabaya</span>
          <span>{t.footer}</span>
        </div>
      </footer>
    </>
  )
}
