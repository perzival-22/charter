import { useState, useEffect } from 'react'
import { getPlayers, getActivePlayers, getSessions, getSettings, createPlayer, updatePlayer, deletePlayer } from '../lib/localStorage'
import { useNavigate } from 'react-router-dom'
import Ic from '../components/Ic'
import RegisterModal from '../components/RegisterModal'

const fullName = p => `${p.first_name} ${p.last_name}`
const initials = p => `${p.first_name[0]}${p.last_name[0]}`

function AddPlayerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', number: '', position: 'MID', dob: '', parent_name: '', parent_phone: '', parent_email: '', medical_notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.first_name.trim() || !form.last_name.trim()) return
    createPlayer(form)
    onSave()
    onClose()
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="handle" />
        <div className="mh">
          <div className="mh-title">Add Player</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}><Ic n="x" s={20} /></button>
        </div>
        <div className="mscroll" style={{ paddingTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><label className="lbl">First Name *</label><input className="inp" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Marcus" /></div>
            <div><label className="lbl">Last Name *</label><input className="inp" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Rivera" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, marginBottom: 12 }}>
            <div><label className="lbl"># Kit</label><input className="inp" value={form.number} onChange={e => set('number', e.target.value)} placeholder="9" /></div>
            <div>
              <label className="lbl">Position</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['GK', 'DEF', 'MID', 'FWD'].map(pos => (
                  <button key={pos} onClick={() => set('position', pos)} style={{ flex: 1, padding: '8px 4px', background: form.position === pos ? 'var(--lime)' : 'var(--bg3)', color: form.position === pos ? '#0e0e10' : 'var(--txt2)', border: `1px solid ${form.position === pos ? 'var(--lime)' : 'var(--border)'}`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Date of Birth</label><input className="inp" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Parent / Guardian</label><input className="inp" value={form.parent_name} onChange={e => set('parent_name', e.target.value)} placeholder="Full name" /></div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Parent Phone</label><input className="inp" value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} placeholder="555-0100" /></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Medical Notes</label><textarea className="inp" value={form.medical_notes} onChange={e => set('medical_notes', e.target.value)} placeholder="Allergies, conditions, etc." /></div>
          <button className="btn-primary" onClick={handleSave}>Add to Squad</button>
        </div>
      </div>
    </div>
  )
}

const POS_GROUPS = [
  { key: 'GK',  label: 'Goalkeepers' },
  { key: 'DEF', label: 'Defenders' },
  { key: 'MID', label: 'Midfielders' },
  { key: 'FWD', label: 'Forwards' },
]

export default function Squad() {
  const [tab, setTab] = useState('roster')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [players, setPlayers] = useState([])
  const navigate = useNavigate()

  const refresh = () => {
    const all = getPlayers().filter(p => p.status === 'active')
    setPlayers(all.sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99)))
  }

  useEffect(() => { refresh() }, [])

  const settings = getSettings()
  const filtered = players.filter(p =>
    `${p.first_name} ${p.last_name} ${p.position}`.toLowerCase().includes(search.toLowerCase())
  )

  const attDots = p => {
    const sessions = getSessions().filter(s => s.status === 'done' && s.attendance?.length > 0)
    return sessions.slice(-5).map(s => s.attendance.find(a => a.player_id === p.id)?.status || 'absent')
  }

  const attRate = p => {
    const sessions = getSessions().filter(s => s.status === 'done' && s.attendance?.some(a => a.player_id === p.id))
    if (!sessions.length) return null
    const present = sessions.filter(s => s.attendance.find(a => a.player_id === p.id)?.status === 'present').length
    return Math.round(present / sessions.length * 100)
  }

  return (
    <div className="screen-fixed">
      <div className="ph" style={{ paddingBottom: 8 }}>
        <div className="pt">Squad</div>
        <div className="ps">{settings.team_name || 'My Team'} &middot; {players.length} players</div>
      </div>

      {/* Action row */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        <button onClick={() => setShowRegister(true)} style={{ flex: 1, padding: '10px', background: 'var(--lime)', color: '#0e0e10', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          Take Register
        </button>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 16px', background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
          + Add
        </button>
      </div>

      <div className="tabs">
        <button className={`tb ${tab === 'roster' ? 'active' : ''}`} onClick={() => setTab('roster')}>Roster</button>
        <button className={`tb ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {tab === 'roster' && (
        <>
          <div className="sbar">
            <Ic n="search" s={15} c="var(--txt3)" />
            <input className="sinp" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="page-content" style={{ paddingBottom: 0 }}>
            {POS_GROUPS.map(({ key, label }) => {
              const group = filtered.filter(p => p.position === key)
              if (!group.length) return null
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div className="sh">
                    <span className="sl">{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: "'IBM Plex Mono',monospace" }}>{group.length}</span>
                  </div>
                  <div style={{ margin: '0 20px' }} className="card">
                    {group.map(p => {
                      const dots = attDots(p)
                      const rate = attRate(p)
                      return (
                        <div key={p.id} className="row" onClick={() => navigate(`/player/${p.id}`)}>
                          <div className="av">{initials(p)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>
                              {fullName(p)}
                              {p.medical_notes && <Ic n="warn" s={12} c="var(--red)" />}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>#{p.number || '-'}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            {dots.length > 0 && (
                              <div className="att-dots">
                                {dots.map((d, i) => <div key={i} className={`ad ${d === 'present' ? 'p' : d === 'late' ? 'l' : 'a'}`} />)}
                              </div>
                            )}
                            {rate !== null && <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: "'IBM Plex Mono',monospace" }}>{rate}%</span>}
                          </div>
                          <Ic n="chevron" s={16} c="var(--txt3)" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--txt2)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>No players found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Add your first player using the button above</div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'attendance' && (
        <div className="page-content" style={{ paddingBottom: 0 }}>
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ background: 'var(--lime-d2)', border: '1px solid rgba(200,241,53,.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--lime)', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Quick view</div>
              <div style={{ fontSize: 13, color: 'var(--txt2)' }}>Last 5 sessions. Green = present, amber = late, empty = absent.</div>
            </div>
            <div className="card">
              {players.map(p => {
                const dots = attDots(p)
                const rate = attRate(p)
                return (
                  <div key={p.id} className="row" onClick={() => navigate(`/player/${p.id}`)}>
                    <div className="av">{initials(p)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{fullName(p)}</div>
                      <span className={`badge badge-${(p.position || 'mid').toLowerCase()}`}>{p.position || 'MID'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {dots.length > 0 && (
                        <div className="att-dots">
                          {dots.map((d, i) => <div key={i} className={`ad ${d === 'present' ? 'p' : d === 'late' ? 'l' : 'a'}`} />)}
                        </div>
                      )}
                      {rate !== null && <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: "'IBM Plex Mono',monospace" }}>{rate}%</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowAdd(true)}><Ic n="plus" s={22} c="#0e0e10" /></button>
      {showAdd && <AddPlayerModal onClose={() => setShowAdd(false)} onSave={refresh} />}
      {showRegister && <RegisterModal onClose={() => { setShowRegister(false); refresh() }} />}
    </div>
  )
}
