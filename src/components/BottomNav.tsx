import { NavLink } from 'react-router-dom'
import { routes } from '../app/routes'
import { HelpIcon, HistoryIcon, HomeIcon, SettingsIcon } from './Icons'

const items = [
  { to: routes.home, label: 'Beranda', Icon: HomeIcon },
  { to: routes.settings, label: 'Pengaturan', Icon: SettingsIcon },
  { to: routes.history, label: 'Riwayat', Icon: HistoryIcon },
  { to: routes.help, label: 'Bantuan', Icon: HelpIcon },
]

export default function BottomNav() {
  return (
    <nav className="nav" aria-label="Navigasi utama">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === routes.home} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
