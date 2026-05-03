import { useState, useEffect } from 'react'
import { getPlayers, getActivePlayers, updatePlayer, getSessions, updateSession } from '../lib/localStorage'
import { getSettings } from '../lib/localStorage'
import PlayerCard from '../components/PlayerCard'
import AddPlayerModal from '../components/AddPlayerModal'
import { IconPlus, IconX, IconWarning } from '../components/Icons'

function RegisterModal({ onClose }) {
  const players = getActivePlayers().sort((a, b) => parseInt(a.number || 0) - parseInt(b.number || 0))
  const [status, setStatus] = useState(() => {
    const s = {}
    players.forEach(p => { s[p.id] = 'present' })
    return s
  })
  const [saved, setSaved] = useState(false)

  function toggle(id, st) {
    setStatus(prev => ({ ...prev, [id]: st }))
  }

  function handleSave() {
    const sessions = getSessions()
    const planned = sessions.find(s => s.status === 'planned' && s.date >= new Date().toISOString().split('T')[0])
    if (planned) {
      const attendance = Object.entries(status).map(([player_id, st]) => ({ player_id, status: st }))
      updateSession(planned.id, { attendance })
    }
    setSaved(true)
    setTimeout(onClose, 600)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-fullscreen">
        <div className="page-header">
          <span style={{ fontWeight: 700, fontSize: 17 }}>Take Register</span>
          <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>
        <div className="modal-scroll" style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map(p => {
            const st = status[p.id]
            return (
              <div key={p.id} style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--color-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>{p.number || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.first_name} {p.last_name}
                      {p.medical_notes && <IconWarning size={13} color="var(--color-danger)" />}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['present', 'late', 'absent'].map(s => {
                    const colors = { present: 'var(--color-accent)', late: 'var(--color-warning)', absent: 'var(--color-danger)' }
                    const labels = { present: 'Present', late: 'Late', absent: 'Absent' }
                    const isActive = st === s
                    return (
                      <button
                        key={s}
                        onClick={() => toggle(p.id, s)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          background: isActive ? colors[s] : 'var(--color-surface)',
                          color: isActive ? '#fff' : 'var(--color-text-muted)',
                          border: `1px solid ${isActive ? colors[s] : 'var(--color-border)'}`,
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >{labels[s]}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '13px',
              background: saved ? 'var(--color-surface-2)' : 'var(--color-accent)',
              color: saved ? 'var(--color-accent-light)' : '#fff',
              fontWeight: 700, fontSize: 16,
            }}
          >
            {saved ? 'Saved!' : 'Save Register'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Squad() {
  const [players, setPlayers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [filter, setFilter] = useState('active')
  const settings = getSettings()

  function refresh() {
    const all = getPlayers()
    const shown = filter === 'active' ? all.filter(p => p.status === 'active') : all
    setPlayers(shown.sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99)))
  }

  useEffect(() => { refresh() }, [filter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>Charter</span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{settings.team_name}</span>
      </div>

      <div style={{ padding: '12px 16px 8px', flexShrink: 0, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowRegister(true)}
          style={{
            flex: 1, padding: '10px',
            background: 'var(--color-accent)',
            color: '#fff', fontWeight: 600, fontSize: 14,
          }}
        >
          Take Register
        </button>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: 14,
          }}
        >
          + Add Player
        </button>
      </div>

      <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--color-surface-2)', borderRadius: 8, padding: 3 }}>
          {['active', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1, padding: '6px',
                background: filter === f ? 'var(--color-surface)' : 'transparent',
                color: filter === f ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: filter === f ? 600 : 400,
                fontSize: 13,
                border: filter === f ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRadius: 6,
              }}
            >
              {f === 'active' ? `Active (${getPlayers().filter(p => p.status === 'active').length})` : `All (${getPlayers().length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 0 }}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>No players yet</div>
              <div style={{ fontSize: 14 }}>Tap "+ Add Player" to register your squad.</div>
            </div>
          )}
          {players.map(p => (
            <PlayerCard key={p.id} player={p} onUpdate={refresh} />
          ))}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <IconPlus size={24} color="#fff" />
      </button>

      {showAdd && <AddPlayerModal onClose={() => { setShowAdd(false); refresh() }} onSave={refresh} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  )
}
                                                                                                                                                                                                                                       