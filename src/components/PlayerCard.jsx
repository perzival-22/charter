import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '../lib/localStorage'
import { IconChevronDown, IconChevronUp, IconPhone, IconWarning } from './Icons'

function posPillClass(pos) {
  const map = { GK: 'pos-gk', DEF: 'pos-def', MID: 'pos-mid', FWD: 'pos-fwd', Any: 'pos-any' }
  return map[pos] || 'pos-any'
}

function calcAttendance(playerId) {
  const sessions = getSessions().filter(s => s.status === 'done' && s.attendance?.length > 0)
  if (!sessions.length) return null
  const present = sessions.filter(s => s.attendance.some(a => a.player_id === playerId && a.status === 'present')).length
  const pct = Math.round((present / sessions.length) * 100)
  return { pct, present, total: sessions.length }
}

function attColor(pct) {
  if (pct >= 80) return 'var(--color-accent-light)'
  if (pct >= 60) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export default function PlayerCard({ player }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const att = calcAttendance(player.id)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          color: 'var(--color-text)',
          borderRadius: 0,
        }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {player.number || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {player.first_name} {player.last_name}
            </span>
            {player.medical_notes && (
              <IconWarning size={14} color="var(--color-danger)" />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <span className={`pill ${posPillClass(player.position)}`}>{player.position || 'Any'}</span>
            {att && (
              <span style={{ fontSize: 12, color: attColor(att.pct) }}>
                {att.pct}% attendance
              </span>
            )}
          </div>
        </div>
        {expanded ? <IconChevronUp size={16} color="var(--color-text-muted)" /> : <IconChevronDown size={16} color="var(--color-text-muted)" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--color-border)' }}>
          {player.medical_notes && (
            <div style={{
              background: 'rgba(218,54,51,0.1)',
              border: '1px solid rgba(218,54,51,0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              marginTop: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <IconWarning size={15} color="var(--color-danger)" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical</div>
                <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 2 }}>{player.medical_notes}</div>
              </div>
            </div>
          )}
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{player.parent_name}</span>
            </div>
            {player.parent_phone && (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconPhone size={13} color="var(--color-text-muted)" />
                <a href={`tel:${player.parent_phone}`} style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>
                  {player.parent_phone}
                </a>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(`/player/${player.id}`)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '8px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-blue)',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid var(--color-border)',
            }}
          >
            View Full Profile →
          </button>
        </div>
      )}
    </div>
  )
}
