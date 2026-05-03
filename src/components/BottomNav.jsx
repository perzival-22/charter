import { NavLink } from 'react-router-dom'
import { IconSquad, IconSessions, IconMatches, IconSettings } from './Icons'

const tabs = [
  { to: '/squad', label: 'Squad', Icon: IconSquad },
  { to: '/sessions', label: 'Sessions', Icon: IconSessions },
  { to: '/matches', label: 'Matches', Icon: IconMatches },
  { to: '/settings', label: 'Settings', Icon: IconSettings },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 20,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            textDecoration: 'none',
            color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
            fontSize: 10,
            fontWeight: isActive ? 600 : 400,
            WebkitTapHighlightColor: 'transparent',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={22} color={isActive ? 'var(--color-accent-light)' : 'var(--color-text-muted)'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
