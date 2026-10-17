import { NavLink } from 'react-router-dom'
import { routes } from '../app/routes'
import { useT } from '../i18n'
import { HelpIcon, HistoryIcon, HomeIcon, SettingsIcon } from './Icons'

export default function BottomNav() {
  const { t } = useT()
  const items = [
    { to: routes.home, label: t.nav.home, Icon: HomeIcon },
    { to: routes.settings, label: t.nav.settings, Icon: SettingsIcon },
    { to: routes.history, label: t.nav.history, Icon: HistoryIcon },
    { to: routes.help, label: t.nav.help, Icon: HelpIcon },
  ]
  return (
    <nav className="nav" aria-label="Main navigation">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === routes.home} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
