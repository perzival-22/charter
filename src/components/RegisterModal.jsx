import { useState } from 'react'
import { getActivePlayers, getSessions, updateSession } from '../lib/localStorage'
import Ic from './Ic'

const fullName = p => `${p.first_name} ${p.last_name}`

export default function RegisterModal({ onClose }) {
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
    const today = new Date().toISOString().split('T')[0]
    const planned = sessions.find(s => s.status === 'planned' && s.date >= today)
    if (planned) {
      const attendance = Object.entries(status).map(([player_id, st]) => ({ player_id, status: st }))
      updateSession(planned.id, { attendance })
    }
    setSaved(true)
    setTimeout(onClose, 600)
  }

  const colors = { present: 'var(--lime)', late: 'var(--amber)', absent: 'var(--red)' }
  const labels = { present: 'Present', late: 'Late', absent: 'Absent' }
  const count = Object.values(status).filter(s => s === 'present').length

  return (
    <div className="modal">
      <div className="fullscreen">
        <div className="mh">
          <div>
            <div className="mh-title">Take Register</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>{count}/{players.length} present</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}>
            <Ic n="x" s={20} />
          </button>
        </div>

        <div className="mscroll" style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map(p => {
              const st = status[p.id]
              return (
                <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0e0e10', flexShrink: 0 }}>
                      {p.number || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {fullName(p)}
                        {p.medical_notes && <Ic n="warn" s={13} c="var(--red)" />}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['present', 'late', 'absent'].map(s => (
                      <button key={s} onClick={() => toggle(p.id, s)} style={{
                        flex: 1, padding: '8px 4px',
                        background: st === s ? colors[s] : 'var(--bg3)',
                        color: st === s ? (s === 'present' ? '#0e0e10' : '#fff') : 'var(--txt2)',
                        border: `1px solid ${st === s ? colors[s] : 'var(--border)'}`,
                        borderRadius: 7, fontSize: 12,
                        fontWeight: st === s ? 700 : 400,
                        cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                      }}>
                        {labels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border2)', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={saved ? { background: 'var(--bg3)', color: 'var(--lime)' } : undefined}
          >
            {saved ? 'Saved ✓' : 'Save Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
