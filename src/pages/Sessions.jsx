import { useState, useEffect } from 'react'
import { getSessions, createSession, updateSession, deleteSession, getActivePlayers } from '../lib/localStorage'
import { DRILL_LIBRARY } from '../lib/drillLibrary'
import { getCustomDrills } from '../lib/localStorage'
import DrillPicker from '../components/DrillPicker'
import Ic from '../components/Ic'

function getDrillData(drillRef) {
  if (drillRef.source === 'custom' && drillRef.custom_data) return drillRef.custom_data
  if (drillRef.source === 'custom') {
    const customs = getCustomDrills()
    return customs.find(d => d.id === drillRef.drill_id)
  }
  return DRILL_LIBRARY.find(d => d.id === drillRef.drill_id)
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/* ── Add Session Modal ── */
function AddSessionModal({ onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ date: today, theme: '', location: '', duration_minutes: 60 })
  const [drills, setDrills] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addDrill(drill, source) {
    if (drills.some(d => d.drill_id === drill.id)) return
    setDrills(prev => [...prev, { drill_id: drill.id, source, custom_data: source === 'custom' ? drill : undefined }])
  }
  function removeDrill(idx) { setDrills(d => d.filter((_, i) => i !== idx)) }
  function moveDrill(idx, dir) {
    setDrills(d => {
      const a = [...d]; const t = idx + dir
      if (t < 0 || t >= a.length) return a
      ;[a[idx], a[t]] = [a[t], a[idx]]; return a
    })
  }
  function handleSave() {
    if (!form.date) return
    createSession({ ...form, drills })
    onSave(); onClose()
  }

  const totalMin = drills.reduce((sum, d) => sum + (getDrillData(d)?.duration_minutes || 0), 0)

  return (
    <>
      <div className="modal" onClick={showPicker ? undefined : onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="handle" />
          <div className="mh">
            <div className="mh-title">New Session</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}><Ic n="x" s={20} /></button>
          </div>
          <div className="mscroll" style={{ paddingTop: 12 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}><label className="lbl">Date</label><input className="inp" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
              <div style={{ width: 90 }}><label className="lbl">Duration (min)</label><input className="inp" type="number" min="15" max="180" value={form.duration_minutes} onChange={e => set('duration_minutes', parseInt(e.target.value) || 60)} /></div>
            </div>
            <div style={{ marginBottom: 12 }}><label className="lbl">Theme</label><input className="inp" value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="e.g. Pressing, Finishing..." /></div>
            <div style={{ marginBottom: 16 }}><label className="lbl">Location</label><input className="inp" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Field name" /></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="lbl" style={{ margin: 0 }}>Drills {drills.length > 0 && `(${totalMin} min)`}</label>
              <button onClick={() => setShowPicker(true)} style={{ padding: '4px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                + Add Drills
              </button>
            </div>
            {drills.length === 0 && (
              <div style={{ textAlign: 'center', padding: 16, color: 'var(--txt3)', fontSize: 13, background: 'var(--bg3)', borderRadius: 8, border: '1px dashed var(--border)', marginBottom: 16 }}>
                No drills added yet
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {drills.map((d, idx) => {
                const drill = getDrillData(d)
                if (!drill) return null
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', width: 18, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace" }}>{idx + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{drill.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{drill.duration_minutes} min</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button onClick={() => moveDrill(idx, -1)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer' }}><Ic n="up" s={14} /></button>
                      <button onClick={() => moveDrill(idx, 1)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer' }}><Ic n="down" s={14} /></button>
                      <button onClick={() => removeDrill(idx)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><Ic n="trash" s={14} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="btn-primary" onClick={handleSave}>Save Session</button>
          </div>
        </div>
      </div>
      {showPicker && <DrillPicker selectedDrillIds={drills.map(d => d.drill_id)} onAdd={addDrill} onClose={() => setShowPicker(false)} />}
    </>
  )
}

/* ── Attendance Editor ── */
function AttendanceEditor({ sessionId, players, onDone }) {
  const session = getSessions().find(s => s.id === sessionId)
  const sorted = [...players].sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99))
  const [status, setStatus] = useState(() => {
    const s = {}
    sorted.forEach(p => {
      const existing = session?.attendance?.find(a => a.player_id === p.id)
      s[p.id] = existing?.status || 'present'
    })
    return s
  })

  function toggle(id, st) { setStatus(prev => ({ ...prev, [id]: st })) }
  function handleSave() {
    const attendance = Object.entries(status).map(([player_id, st]) => ({ player_id, status: st }))
    updateSession(sessionId, { attendance })
    onDone()
  }

  const colors = { present: 'var(--lime)', late: 'var(--amber)', absent: 'var(--red)' }
  const labels = { present: 'Present', late: 'Late', absent: 'Absent' }

  return (
    <>
      <div className="mscroll" style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(p => {
          const st = status[p.id]
          return (
            <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0e0e10', flexShrink: 0 }}>{p.number || '?'}</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.first_name} {p.last_name}</span>
                {p.medical_notes && <Ic n="warn" s={13} c="var(--red)" />}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['present', 'late', 'absent'].map(s => (
                  <button key={s} onClick={() => toggle(p.id, s)} style={{ flex: 1, padding: '8px 4px', background: st === s ? colors[s] : 'var(--bg3)', color: st === s ? (s === 'present' ? '#0e0e10' : '#fff') : 'var(--txt2)', border: `1px solid ${st === s ? colors[s] : 'var(--border)'}`, borderRadius: 7, fontSize: 12, fontWeight: st === s ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {labels[s]}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border2)', flexShrink: 0 }}>
        <button onClick={handleSave} className="btn-primary">Save Attendance</button>
      </div>
    </>
  )
}

/* ── Session Detail ── */
function SessionDetail({ session, onClose, onUpdate }) {
  const [s, setS] = useState(session)
  const [showAttendance, setShowAttendance] = useState(false)
  const [showDrillRun, setShowDrillRun] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [drills, setDrills] = useState(session.drills || [])
  const [notes, setNotes] = useState(session.post_session_notes || '')
  const [checkedDrills, setCheckedDrills] = useState([])
  const players = getActivePlayers()

  function refresh() {
    const updated = getSessions().find(x => x.id === session.id)
    if (updated) setS(updated)
  }

  function saveNotes() { updateSession(s.id, { post_session_notes: notes }); refresh() }

  function markDone() {
    updateSession(s.id, { status: 'done', post_session_notes: notes })
    refresh(); onUpdate(); onClose()
  }

  function addDrill(drill, source) {
    if (drills.some(d => d.drill_id === drill.id)) return
    const nd = [...drills, { drill_id: drill.id, source, custom_data: source === 'custom' ? drill : undefined }]
    setDrills(nd); updateSession(s.id, { drills: nd })
  }

  function removeDrill(idx) {
    const nd = drills.filter((_, i) => i !== idx)
    setDrills(nd); updateSession(s.id, { drills: nd })
  }

  function moveDrill(idx, dir) {
    const nd = [...drills]; const t = idx + dir
    if (t < 0 || t >= nd.length) return
    ;[nd[idx], nd[t]] = [nd[t], nd[idx]]
    setDrills(nd); updateSession(s.id, { drills: nd })
  }

  const isPlanned = s.status === 'planned'
  const attSummary = s.attendance?.length
    ? `${s.attendance.filter(a => a.status === 'present').length}/${s.attendance.length} present`
    : 'No register taken'

  if (showAttendance) {
    return (
      <div className="modal">
        <div className="fullscreen">
          <div className="mh">
            <div className="mh-title">Attendance</div>
            <button onClick={() => setShowAttendance(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}><Ic n="x" s={20} /></button>
          </div>
          <AttendanceEditor sessionId={s.id} players={players} onDone={() => { setShowAttendance(false); refresh(); onUpdate() }} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="modal">
        <div className="fullscreen">
          <div className="mh">
            <button onClick={onClose} className="back-btn"><Ic n="back" s={18} /></button>
            <div style={{ flex: 1 }}>
              <div className="mh-title">{s.theme || 'Session'}</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{fmtDate(s.date)}</div>
            </div>
            <span className="badge" style={{ background: isPlanned ? 'var(--blue-d)' : 'var(--lime-d)', color: isPlanned ? 'var(--blue)' : 'var(--lime)' }}>
              {isPlanned ? 'Planned' : 'Done'}
            </span>
          </div>

          <div className="mscroll" style={{ paddingTop: 14 }}>
            {/* Meta row */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '0 0 16px', borderBottom: '1px solid var(--border2)' }}>
              {s.location && <span className="badge badge-cooldown">{s.location}</span>}
              {s.duration_minutes && <span className="badge badge-cooldown">{s.duration_minutes} min</span>}
              <span className="badge badge-cooldown">{attSummary}</span>
            </div>

            {/* Drills */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="lbl" style={{ margin: 0 }}>Drills ({drills.length})</label>
              {isPlanned && (
                <button onClick={() => setShowPicker(true)} style={{ padding: '4px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Add
                </button>
              )}
            </div>
            {drills.length === 0 && <div style={{ textAlign: 'center', padding: 16, color: 'var(--txt3)', fontSize: 13, marginBottom: 16 }}>No drills planned</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {drills.map((d, idx) => {
                const drill = getDrillData(d)
                if (!drill) return null
                const checked = checkedDrills.includes(idx)
                return (
                  <div key={idx} style={{ background: checked ? 'rgba(200,241,53,.06)' : 'var(--bg2)', border: `1px solid ${checked ? 'rgba(200,241,53,.2)' : 'var(--border2)'}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt3)', width: 18, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0 }}>{idx + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.5 : 1 }}>{drill.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{drill.duration_minutes} min {drill.equipment ? '· ' + drill.equipment : ''}</div>
                    </div>
                    {showDrillRun ? (
                      <button onClick={() => setCheckedDrills(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])} style={{ width: 28, height: 28, borderRadius: '50%', background: checked ? 'var(--lime)' : 'var(--bg3)', border: `2px solid ${checked ? 'var(--lime)' : 'var(--border)'}`, color: checked ? '#0e0e10' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
                        {checked ? <Ic n="check" s={14} c="#0e0e10" /> : null}
                      </button>
                    ) : isPlanned ? (
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={() => moveDrill(idx, -1)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer' }}><Ic n="up" s={13} /></button>
                        <button onClick={() => moveDrill(idx, 1)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer' }}><Ic n="down" s={13} /></button>
                        <button onClick={() => removeDrill(idx)} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><Ic n="trash" s={13} /></button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {/* Attendance summary */}
            {s.attendance?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="lbl">Attendance</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.attendance.map(a => {
                    const p = players.find(pl => pl.id === a.player_id)
                    if (!p) return null
                    const cl = { present: 'badge-defending', absent: 'badge-shooting', late: 'badge-warmup' }[a.status] || 'badge-cooldown'
                    return <span key={a.player_id} className={`badge ${cl}`}>#{p.number} {p.first_name}</span>
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label className="lbl">Post-Session Notes</label>
              <textarea className="inp" value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} placeholder="How did it go? What to improve?" />
            </div>

            {/* Actions */}
            {isPlanned && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setShowAttendance(true)} style={{ width: '100%', padding: '12px', background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--border)', fontWeight: 600, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Take Attendance
                </button>
                <button onClick={() => setShowDrillRun(r => !r)} style={{ width: '100%', padding: '12px', background: showDrillRun ? 'var(--blue-d)' : 'var(--bg2)', color: 'var(--blue)', border: '1px solid var(--blue)', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {showDrillRun ? 'Stop Drill Run' : 'Run Session'}
                </button>
                <button onClick={markDone} className="btn-primary">Mark as Done</button>
              </div>
            )}

            <button onClick={() => { deleteSession(s.id); onUpdate(); onClose() }} style={{ width: '100%', padding: '10px', background: 'var(--red-d)', color: 'var(--red)', border: '1px solid rgba(255,92,92,.2)', fontWeight: 600, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              Delete Session
            </button>
          </div>
        </div>
      </div>
      {showPicker && <DrillPicker selectedDrillIds={drills.map(d => d.drill_id)} onAdd={addDrill} onClose={() => setShowPicker(false)} />}
    </>
  )
}

/* ── Sessions Page ── */
export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [tab, setTab] = useState('planned')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)

  function refresh() { setSessions(getSessions()) }
  useEffect(() => { refresh() }, [])

  const filtered = sessions
    .filter(s => s.status === tab)
    .sort((a, b) => tab === 'planned' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))

  return (
    <div className="screen-fixed">
      <div className="ph" style={{ paddingBottom: 8 }}>
        <div className="pt">Sessions</div>
        <div className="ps">{sessions.filter(s => s.status === 'planned').length} upcoming &middot; {sessions.filter(s => s.status === 'done').length} done</div>
      </div>

      <div className="tabs">
        <button className={`tb ${tab === 'planned' ? 'active' : ''}`} onClick={() => setTab('planned')}>
          Planned ({sessions.filter(s => s.status === 'planned').length})
        </button>
        <button className={`tb ${tab === 'done' ? 'active' : ''}`} onClick={() => setTab('done')}>
          Done ({sessions.filter(s => s.status === 'done').length})
        </button>
      </div>

      <div className="page-content" style={{ paddingBottom: 0 }}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--txt2)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>No {tab} sessions</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{tab === 'planned' ? 'Plan your next practice.' : 'Completed sessions will appear here.'}</div>
            </div>
          )}
          {filtered.map(s => {
            const att = s.attendance?.length
              ? `${s.attendance.filter(a => a.status === 'present').length}/${s.attendance.length}`
              : null
            return (
              <button key={s.id} onClick={() => setSelected(s)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>{s.theme || 'Session'}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>{fmtDate(s.date)}</div>
                  </div>
                  <span className="badge" style={{ background: s.status === 'done' ? 'var(--lime-d)' : 'var(--blue-d)', color: s.status === 'done' ? 'var(--lime)' : 'var(--blue)' }}>
                    {s.status === 'done' ? 'Done' : 'Planned'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.location && <span className="badge badge-cooldown">{s.location}</span>}
                  {s.drills?.length > 0 && <span className="badge badge-cooldown">{s.drills.length} drills</span>}
                  {att && <span className="badge badge-cooldown">{att} present</span>}
                  {s.duration_minutes && <span className="badge badge-cooldown">{s.duration_minutes} min</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}><Ic n="plus" s={22} c="#0e0e10" /></button>

      {showAdd && <AddSessionModal onClose={() => setShowAdd(false)} onSave={() => { refresh(); setShowAdd(false) }} />}
      {selected && <SessionDetail session={selected} onClose={() => setSelected(null)} onUpdate={refresh} />}
    </div>
  )
}
