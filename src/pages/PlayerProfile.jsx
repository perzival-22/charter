import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlayers, updatePlayer, deletePlayer, getSessions, getMatches } from '../lib/localStorage'
import { IconX, IconWarning } from '../components/Icons'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD', 'Any']

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PlayerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('info')
  const [player, setPlayer] = useState(null)
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const p = getPlayers().find(p => p.id === id)
    if (!p) { navigate('/squad'); return }
    setPlayer(p)
    setForm({ ...p })
  }, [id])

  if (!player || !form) return null

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  function handleSave() {
    updatePlayer(player.id, form)
    setPlayer({ ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete() {
    if (window.confirm(`Remove ${player.first_name} from the squad?`)) {
      deletePlayer(player.id)
      navigate('/squad')
    }
  }

  const sessions = getSessions()
  const matches = getMatches()

  const playerSessions = sessions
    .filter(s => s.attendance?.some(a => a.player_id === id))
    .sort((a, b) => b.date.localeCompare(a.date))

  const playerMatches = matches
    .filter(m => m.appearances?.some(a => a.player_id === id))
    .sort((a, b) => b.date.localeCompare(a.date))

  const doneSessions = playerSessions.filter(s => s.status === 'done')
  const present = doneSessions.filter(s => s.attendance.find(a => a.player_id === id)?.status === 'present').length
  const attPct = doneSessions.length ? Math.round((present / doneSessions.length) * 100) : null

  const totalGoals = matches.reduce((sum, m) => sum + (m.goals?.filter(g => g.player_id === id).length || 0), 0)
  const totalAssists = matches.reduce((sum, m) => sum + (m.assists?.filter(a => a.player_id === id).length || 0), 0)
  const totalApps = matches.reduce((sum, m) => {
    const a = m.appearances?.find(a => a.player_id === id)
    return sum + (a && a.played !== 'dnp' ? 1 : 0)
  }, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ justifyContent: 'flex-start', paddingBottom: 0, gap: 10 }}>
        <button onClick={() => navigate('/squad')} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
          <IconX size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{player.first_name} {player.last_name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>#{player.number} · {player.position}</div>
        </div>
        <button onClick={handleSave} style={{ padding: '6px 14px', background: saved ? 'var(--color-surface-2)' : 'var(--color-accent)', color: saved ? 'var(--color-accent-light)' : '#fff', fontWeight: 600, fontSize: 13 }}>
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'flex', flexShrink: 0, background: 'var(--color-surface)', padding: '0 16px', borderBottom: '1px solid var(--color-border)' }}>
        {['info', 'attendance', 'matches'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 14px', background: 'none', borderRadius: 0,
            color: tab === t ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
            fontWeight: tab === t ? 600 : 400, fontSize: 13,
            borderBottom: tab === t ? '2px solid var(--color-accent)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      <div className="page-content" style={{ paddingTop: 16, paddingBottom: 100 }}>
        <div style={{ padding: '0 16px' }}>

          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>First Name</label>
                  <input value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 80 }}>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6 }}># Jersey</label>
                  <input value={form.number} onChange={e => set('number', e.target.value)} type="number" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Position</label>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {POSITIONS.map(p => (
                      <button key={p} onClick={() => set('position', p)} style={{
                        padding: '5px 10px',
                        background: form.position === p ? 'var(--color-accent)' : 'var(--color-surface-2)',
                        color: form.position === p ? '#fff' : 'var(--color-text-muted)',
                        border: `1px solid ${form.position === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        fontSize: 12,
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Date of Birth</label>
                <input value={form.dob || ''} onChange={e => set('dob', e.target.value)} type="date" />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['active', 'inactive'].map(s => (
                    <button key={s} onClick={() => set('status', s)} style={{
                      flex: 1, padding: '8px',
                      background: form.status === s ? (s === 'active' ? 'var(--color-accent)' : 'var(--color-surface-2)') : 'var(--color-surface-2)',
                      color: form.status === s ? (s === 'active' ? '#fff' : 'var(--color-danger)') : 'var(--color-text-muted)',
                      border: `1px solid ${form.status === s ? (s === 'active' ? 'var(--color-accent)' : 'var(--color-danger)') : 'var(--color-border)'}`,
                      fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="divider" />
              <div className="section-label">Parent / Guardian</div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Name</label>
                <input value={form.parent_name || ''} onChange={e => set('parent_name', e.target.value)} />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Phone</label>
                <input value={form.parent_phone || ''} onChange={e => set('parent_phone', e.target.value)} type="tel" />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input value={form.parent_email || ''} onChange={e => set('parent_email', e.target.value)} type="email" />
              </div>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Medical Notes</label>
                <textarea value={form.medical_notes || ''} onChange={e => set('medical_notes', e.target.value)} placeholder="Allergies, conditions, medications..." />
              </div>

              <button onClick={handleDelete} style={{ marginTop: 8, width: '100%', padding: '10px', background: 'rgba(218,54,51,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(218,54,51,0.3)', fontWeight: 600 }}>
                Remove Player
              </button>
            </div>
          )}

          {tab === 'attendance' && (
            <div>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px', marginBottom: 16, display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: attPct >= 80 ? 'var(--color-accent-light)' : attPct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                    {attPct !== null ? `${attPct}%` : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>ATTENDANCE</div>
                </div>
                <div style={{ width: 1, background: 'var(--color-border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{present}/{doneSessions.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>SESSIONS</div>
                </div>
              </div>

              {playerSessions.length === 0 && <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 32 }}>No sessions recorded yet.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {playerSessions.map(s => {
                  const att = s.attendance.find(a => a.player_id === id)
                  const statusColors = { present: 'var(--color-accent-light)', absent: 'var(--color-danger)', late: 'var(--color-warning)' }
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.theme || 'Session'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(s.date)}</div>
                      </div>
                      {att && <span className="pill" style={{ background: `rgba(0,0,0,0.2)`, color: statusColors[att.status], textTransform: 'capitalize' }}>{att.status}</span>}
                      {!att && s.status === 'planned' && <span className="pill" style={{ background: 'rgba(56,139,253,0.2)', color: 'var(--color-blue)' }}>Planned</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'matches' && (
            <div>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px', marginBottom: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{totalApps}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>APPS</div>
                </div>
                <div style={{ width: 1, background: 'var(--color-border)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent-light)' }}>{totalGoals}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>GOALS</div>
                </div>
                <div style={{ width: 1, background: 'var(--color-border)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-blue)' }}>{totalAssists}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>ASSISTS</div>
                </div>
              </div>

              {playerMatches.length === 0 && <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 32 }}>No matches recorded yet.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {playerMatches.map(m => {
                  const app = m.appearances?.find(a => a.player_id === id)
                  const goals = m.goals?.filter(g => g.player_id === id).length || 0
                  const assists = m.assists?.filter(a => a.player_id === id).length || 0
                  const rc = m.our_score > m.their_score ? 'var(--color-accent-light)' : m.our_score < m.their_score ? 'var(--color-danger)' : 'var(--color-warning)'
                  return (
                    <div key={m.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>vs {m.opponent}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(m.date)}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          {goals > 0 && <span style={{ fontSize: 12 }}>⚽ {goals}</span>}
                          {assists > 0 && <span style={{ fontSize: 12 }}>🎯 {assists}</span>}
                          {app && <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{app.played}</span>}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: rc }}>{m.our_score}–{m.their_score}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
                                                                                         