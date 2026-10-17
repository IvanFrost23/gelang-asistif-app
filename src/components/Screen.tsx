import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import LangSwitch from './LangSwitch'

type Props = { title: string; subtitle?: string; children: ReactNode; nav?: boolean }

export default function Screen({ title, subtitle, children, nav = true }: Props) {
  return (
    <div className="phone">
      <header className="header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <LangSwitch />
      </header>
      <main className="content" style={nav ? undefined : { paddingBottom: 16 }}>{children}</main>
      {nav && <BottomNav />}
    </div>
  )
}
