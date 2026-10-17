import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dict, type Dict, type Lang } from './dict'

const KEY = 'gelang-asistif:lang'
const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: 'id', t: dict.id, setLang: () => {} })

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'id' || saved === 'en') return saved
  } catch { /* storage unavailable */ }
  return 'id'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial)
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  }, [lang])
  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>
}

export const useT = () => useContext(Ctx)
