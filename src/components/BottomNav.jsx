import { NavLink } from 'react-router-dom'
import Ic from './Ic'

const tabs = [
  { to: '/squad',    icon: 'squad',    label: 'Squad' },
  { to: '/sessions', icon: 'sessions', label: 'Sessions' },
  { to: '/matches',  icon: 'matches',  label: 'Matches' },
  { to: '/settings', icon: 'settings', label: 'Setup' },
]

export default function BottomNav() {
  return (
    <div className="bnav">
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `ni${isActive ? ' active' : ''}`}>
          <Ic n={t.icon} s={22} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
