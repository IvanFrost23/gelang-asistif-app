import { useT } from '../i18n'
import type { Lang } from '../i18n/dict'

const langs: { code: Lang; label: string }[] = [{ code: 'id', label: 'ID' }, { code: 'en', label: 'EN' }]

export default function LangSwitch() {
  const { lang, setLang } = useT()
  return (
    <div className="lang" role="group" aria-label="Language">
      {langs.map((l) => (
        <button key={l.code} className={lang === l.code ? 'on' : ''} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
