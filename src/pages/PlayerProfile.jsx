import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlayers, updatePlayer, deletePlayer, getSessions, getMatches } from '../lib/localStorage'
import BottomNav from '../components/BottomNav'
import Ic from '../components/Ic'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD', 'Any']

function fmtDate(iso) {
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
    setPlayer(p); setForm({ ...p })
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
  const playerSessions = sessions.filter(s => s.attendance?.some(a => a.player_id === id)).sort((a, b) => b.date.localeCompare(a.date))
  const playerMatches = matches.filter(m => m.appearances?.some(a => a.player_id === id)).sort((a, b) => b.date.localeCompare(a.date))
  const doneSessions = playerSessions.filter(s => s.status === 'done')
  const present = doneSessions.filter(s => s.attendance.find(a => a.player_id === id)?.status === 'present').length
  const attPct = doneSessions.length ? Math.round((present / doneSessions.length) * 100) : null
  const totalGoals = matches.reduce((sum, m) => sum + (m.goals?.filter(g => g.player_id === id).length || 0), 0)
  const totalAssists = matches.reduce((sum, m) => sum + (m.assists?.filter(a => a.player_id === id).length || 0), 0)
  const totalApps = matches.reduce((sum, m) => {
    const a = m.appearances?.find(a => a.player_id === id)
    return sum + (a && a.played !== 'dnp' ? 1 : 0)
  }, 0)

  const attColor = attPct >= 80 ? 'var(--lime)' : attPct >= 60 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/squad')} className="back-btn"><Ic n="back" s={18} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>{player.first_name} {player.last_name}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>#{player.number || '-'} &middot; {player.position}</div>
          </div>
          <button onClick={handleSave} style={{ padding: '7px 16px', background: saved ? 'var(--bg3)' : 'var(--lime)', color: saved ? 'var(--lime)' : '#0e0e10', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border2)' }}>
          {['info', 'attendance', 'matches'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--lime)' : 'transparent'}`, color: tab === t ? 'var(--txt)' : 'var(--txt3)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: -1 }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-content" style={{ paddingTop: 16, paddingBottom: 90 }}>
        <div style={{ padding: '0 20px' }}>

          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}><label className="lbl">First Name</label><input className="inp" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></div>
                <div style={{ flex: 1 }}><label className="lbl">Last Name</label><input className="inp" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 80 }}><label className="lbl"># Kit</label><input className="inp" value={form.number} onChange={e => set('number', e.target.value)} type="number" /></div>
                <div style={{ flex: 1 }}>
                  <label className="lbl">Position</label>
                  <div className="seg">
                    {POSITIONS.map(p => (
                      <button key={p} onClick={() => set('position', p)} className={`seg-btn${form.position === p ? ' active' : ''}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div><label className="lbl">Date of Birth</label><input className="inp" type="date" value={form.dob || ''} onChange={e => set('dob', e.target.value)} /></div>
              <div>
                <label className="lbl">Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['active', 'inactive'].map(s => (
                    <button key={s} onClick={() => set('status', s)} style={{ flex: 1, padding: '9px', background: form.status === s ? (s === 'active' ? 'var(--lime)' : 'var(--red-d)') : 'var(--bg3)', color: form.status === s ? (s === 'active' ? '#0e0e10' : 'var(--red)') : 'var(--txt2)', border: `1px solid ${form.status === s ? (s === 'active' ? 'var(--lime)' : 'rgba(255,92,92,.3)') : 'var(--border)'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border2)', margin: '4px 0' }} />
              <label className="lbl">Parent / Guardian</label>
              <div><label className="lbl">Name</label><input className="inp" value={form.parent_name || ''} onChange={e => set('parent_name', e.target.value)} placeholder="Full name" /></div>
              <div><label className="lbl">Phone</label><input className="inp" type="tel" value={form.parent_phone || ''} onChange={e => set('parent_phone', e.target.value)} placeholder="555-0100" /></div>
              <div><label className="lbl">Email</label><input className="inp" type="email" value={form.parent_email || ''} onChange={e => set('parent_email', e.target.value)} placeholder="parent@email.com" /></div>
              <div><label className="lbl">Medical Notes</label><textarea className="inp" value={form.medical_notes || ''} onChange={e => set('medical_notes', e.target.value)} placeholder="Allergies, conditions, medications..." /></div>

              <button onClick={handleDelete} style={{ marginTop: 4, width: '100%', padding: '10px', background: 'var(--red-d)', color: 'var(--red)', border: '1px solid rgba(255,92,92,.2)', fontWeight: 600, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove Player
              </button>
            </div>
          )}

          {tab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div className="sc-stat">
                  <div className="sc-val" style={{ color: attPct !== null ? attColor : 'var(--txt3)' }}>{attPct !== null ? `${attPct}%` : '-'}</div>
                  <div className="sc-lbl">Attendance</div>
                </div>
                <div className="sc-stat">
                  <div className="sc-val">{present}</div>
                  <div className="sc-lbl">Present</div>
                </div>
                <div className="sc-stat">
                  <div className="sc-val">{doneSessions.length}</div>
                  <div className="sc-lbl">Sessions</div>
                </div>
              </div>

              {playerSessions.length === 0 && <div style={{ color: 'var(--txt2)', textAlign: 'center', padding: 32, fontSize: 13 }}>No sessions recorded yet.</div>}
              <div className="card">
                {playerSessions.map(s => {
                  const att = s.attendance.find(a => a.player_id === id)
                  const attCl = { present: 'badge-defending', absent: 'badge-shooting', late: 'badge-warmup' }[att?.status] || 'badge-cooldown'
                  return (
                    <div key={s.id} className="row" style={{ cursor: 'default' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{s.theme || 'Session'}</div>
                        <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>{fmtDate(s.date)}</div>
                      </div>
                      {att && <span className={`badge ${attCl}`} style={{ textTransform: 'capitalize' }}>{att.status}</span>}
                      {!att && s.status === 'planned' && <span className="badge badge-passing">Planned</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'matches' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div className="sc-stat"><div className="sc-val">{totalApps}</div><div className="sc-lbl">Apps</div></div>
                <div className="sc-stat"><div className="sc-val" style={{ color: 'var(--lime)' }}>{totalGoals}</div><div className="sc-lbl">Goals</div></div>
                <div className="sc-stat"><div className="sc-val" style={{ color: 'var(--blue)' }}>{totalAssists}</div><div className="sc-lbl">Assists</div></div>
              </div>

              {playerMatches.length === 0 && <div style={{ color: 'var(--txt2)', textAlign: 'center', padding: 32, fontSize: 13 }}>No matches recorded yet.</div>}
              <div className="card">
                {playerMatches.map(m => {
                  const app = m.appearances?.find(a => a.player_id === id)
                  const g = m.goals?.filter(x => x.player_id === id).length || 0
                  const a = m.assists?.filter(x => x.player_id === id).length || 0
                  const rc = m.our_score > m.their_score ? 'var(--lime)' : m.our_score < m.their_score ? 'var(--red)' : 'var(--amber)'
                  return (
                    <div key={m.id} className="row" style={{ cursor: 'default' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>vs {m.opponent}</div>
                        <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span>{fmtDate(m.date)}</span>
                          {g > 0 && <span className="badge badge-defending">{g}G</span>}
                          {a > 0 && <span className="badge badge-passing">{a}A</span>}
                          {app && <span className="badge badge-cooldown" style={{ textTransform: 'capitalize' }}>{app.played}</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: rc }}>{m.our_score}-{m.their_score}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
