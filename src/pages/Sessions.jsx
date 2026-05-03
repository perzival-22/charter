import { useState, useEffect } from 'react'
import { getSessions, createSession, updateSession, deleteSession, getActivePlayers } from '../lib/localStorage'
import { DRILL_LIBRARY } from '../lib/drillLibrary'
import { getCustomDrills } from '../lib/localStorage'
import DrillPicker from '../components/DrillPicker'
import { IconPlus, IconX, IconArrowUp, IconArrowDown, IconTrash, IconWarning } from '../components/Icons'

function getDrillData(drillRef) {
  if (drillRef.source === 'custom' && drillRef.custom_data) return drillRef.custom_data
  if (drillRef.source === 'custom') {
    const customs = getCustomDrills()
    return customs.find(d => d.id === drillRef.drill_id)
  }
  return DRILL_LIBRARY.find(d => d.id === drillRef.drill_id)
}

function sessionAttStr(session) {
  if (!session.attendance?.length) return null
  const present = session.attendance.filter(a => a.status === 'present').length
  return `${present}/${session.attendance.length}`
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function AddSessionModal({ onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ date: today, theme: '', location: '', duration_minutes: 60 })
  const [drills, setDrills] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function addDrill(drill, source) {
    const alreadyIn = drills.some(d => d.drill_id === drill.id)
    if (alreadyIn) return
    setDrills(prev => [...prev, {
      drill_id: drill.id,
      source,
      custom_data: source === 'custom' ? drill : undefined,
    }])
  }

  function removeDrill(idx) { setDrills(d => d.filter((_, i) => i !== idx)) }
  function moveUp(idx) {
    if (idx === 0) return
    setDrills(d => { const a = [...d]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a })
  }
  function moveDown(idx) {
    setDrills(d => { if (idx >= d.length - 1) return d; const a = [...d]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a })
  }

  function handleSave() {
    if (!form.date) return
    const s = createSession({ ...form, drills })
    onSave(s)
    onClose()
  }

  const selectedIds = drills.map(d => d.drill_id)
  const totalMin = drills.reduce((sum, d) => {
    const drill = getDrillData(d)
    return sum + (drill?.duration_minutes || 0)
  }, 0)

  return (
    <>
      <div className="modal-overlay" onClick={showPicker ? undefined : onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="modal-handle" />
          <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>New Session</span>
            <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
              <IconX size={20} />
            </button>
          </div>
          <div className="modal-scroll" style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Date</label>
                <input value={form.date} onChange={e => set('date', e.target.value)} type="date" />
              </div>
              <div style={{ width: 90 }}>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Duration (min)</label>
                <input value={form.duration_minutes} onChange={e => set('duration_minutes', parseInt(e.target.value) || 60)} type="number" min="15" max="180" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Theme</label>
              <input value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="e.g. Pressing, Finishing, 1v1 Defending" />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Field name" />
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="section-label">Drills {drills.length > 0 && `(${totalMin} min)`}</span>
                <button
                  onClick={() => setShowPicker(true)}
                  style={{ padding: '5px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-blue)', fontSize: 13, fontWeight: 600 }}
                >
                  + Add Drills
                </button>
              </div>
              {drills.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)', fontSize: 13, background: 'var(--color-surface-2)', borderRadius: 8, border: '1px dashed var(--color-border)' }}>
                  No drills added yet
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {drills.map((d, idx) => {
                  const drill = getDrillData(d)
                  if (!drill) return null
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', width: 20, textAlign: 'center' }}>{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{drill.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{drill.duration_minutes} min</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => moveUp(idx)} style={{ padding: 4, background: 'none', color: 'var(--color-text-muted)' }}><IconArrowUp size={14} /></button>
                        <button onClick={() => moveDown(idx)} style={{ padding: 4, background: 'none', color: 'var(--color-text-muted)' }}><IconArrowDown size={14} /></button>
                        <button onClick={() => removeDrill(idx)} style={{ padding: 4, background: 'none', color: 'var(--color-danger)' }}><IconTrash size={14} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{ marginTop: 16, width: '100%', padding: '13px', background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: 16 }}
            >
              Save Session
            </button>
          </div>
        </div>
      </div>
      {showPicker && (
        <DrillPicker
          selectedDrillIds={selectedIds}
          onAdd={addDrill}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

function SessionDetail({ session, onClose, onUpdate }) {
  const [s, setS] = useState(session)
  const [showRegister, setShowRegister] = useState(false)
  const [showDrillRun, setShowDrillRun] = useState(false)
  const [notes, setNotes] = useState(session.post_session_notes || '')
  const [checkedDrills, setCheckedDrills] = useState([])
  const players = getActivePlayers()
  const [showPicker, setShowPicker] = useState(false)
  const [drills, setDrills] = useState(session.drills || [])

  function refresh() { const updated = getSessions().find(x => x.id === session.id); if (updated) setS(updated) }

  function saveNotes() {
    updateSession(s.id, { post_session_notes: notes })
    refresh()
  }

  function markDone() {
    updateSession(s.id, { status: 'done', post_session_notes: notes })
    refresh()
    onUpdate()
    onClose()
  }

  function addDrill(drill, source) {
    const alreadyIn = drills.some(d => d.drill_id === drill.id)
    if (alreadyIn) return
    const newDrills = [...drills, { drill_id: drill.id, source, custom_data: source === 'custom' ? drill : undefined }]
    setDrills(newDrills)
    updateSession(s.id, { drills: newDrills })
  }

  function removeDrillFromSession(idx) {
    const newDrills = drills.filter((_, i) => i !== idx)
    setDrills(newDrills)
    updateSession(s.id, { drills: newDrills })
  }

  function moveDrill(idx, dir) {
    const newDrills = [...drills]
    const target = idx + dir
    if (target < 0 || target >= newDrills.length) return
    ;[newDrills[idx], newDrills[target]] = [newDrills[target], newDrills[idx]]
    setDrills(newDrills)
    updateSession(s.id, { drills: newDrills })
  }

  const isPlanned = s.status === 'planned'
  const attSummary = s.attendance?.length
    ? `${s.attendance.filter(a => a.status === 'present').length}/${s.attendance.length} present`
    : 'No register taken'

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-fullscreen">
          <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
              <IconX size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.theme || 'Session'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(s.date)}</div>
            </div>
            <span className="pill" style={{
              background: s.status === 'done' ? 'rgba(35,134,54,0.2)' : 'rgba(56,139,253,0.2)',
              color: s.status === 'done' ? 'var(--color-accent-light)' : 'var(--color-blue)',
            }}>
              {s.status === 'done' ? 'Done' : 'Planned'}
            </span>
          </div>

          <div className="modal-scroll" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              {s.location && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>📍 {s.location}</div>}
              {s.duration_minutes && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>⏱ {s.duration_minutes} min</div>}
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>👥 {attSummary}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="section-label">Drills ({drills.length})</span>
                {isPlanned && (
                  <button
                    onClick={() => setShowPicker(true)}
                    style={{ padding: '4px 10px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-blue)', fontSize: 12, fontWeight: 600 }}
                  >
                    + Add
                  </button>
                )}
              </div>
              {drills.length === 0 && (
                <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>No drills planned</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {drills.map((d, idx) => {
                  const drill = getDrillData(d)
                  if (!drill) return null
                  const checked = checkedDrills.includes(idx)
                  return (
                    <div key={idx} style={{
                      background: checked ? 'rgba(35,134,54,0.08)' : 'var(--color-surface-2)',
                      border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', width: 20, textAlign: 'center', flexShrink: 0 }}>{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.5 : 1 }}>{drill.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{drill.duration_minutes} min · {drill.equipment}</div>
                      </div>
                      {showDrillRun ? (
                        <button
                          onClick={() => setCheckedDrills(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: checked ? 'var(--color-accent)' : 'var(--color-surface)',
                            border: `2px solid ${checked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {checked ? '✓' : ''}
                        </button>
                      ) : isPlanned ? (
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button onClick={() => moveDrill(idx, -1)} style={{ padding: 4, background: 'none', color: 'var(--color-text-muted)' }}><IconArrowUp size={13} /></button>
                          <button onClick={() => moveDrill(idx, 1)} style={{ padding: 4, background: 'none', color: 'var(--color-text-muted)' }}><IconArrowDown size={13} /></button>
                          <button onClick={() => removeDrillFromSession(idx)} style={{ padding: 4, background: 'none', color: 'var(--color-danger)' }}><IconTrash size={13} /></button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {s.attendance?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Attendance</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.attendance.map(a => {
                    const p = players.find(pl => pl.id === a.player_id)
                    if (!p) return null
                    const colors = { present: 'var(--color-accent-light)', absent: 'var(--color-danger)', late: 'var(--color-warning)' }
                    return (
                      <span key={a.player_id} style={{ fontSize: 12, padding: '3px 8px', background: 'var(--color-surface-2)', border: `1px solid ${colors[a.status]}`, borderRadius: 6, color: colors[a.status] }}>
                        #{p.number} {p.first_name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Post-Session Notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="How did it go? What to improve?"
                style={{ minHeight: 90 }}
              />
            </div>

            {isPlanned && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!showDrillRun && (
                  <button
                    onClick={() => setShowRegister(true)}
                    style={{ width: '100%', padding: '12px', background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600 }}
                  >
                    Take Attendance
                  </button>
                )}
                <button
                  onClick={() => setShowDrillRun(r => !r)}
                  style={{ width: '100%', padding: '12px', background: 'var(--color-surface-2)', color: 'var(--color-blue)', border: '1px solid var(--color-blue)', fontWeight: 600 }}
                >
                  {showDrillRun ? 'Stop Drill Run' : 'Start Session (Run Drills)'}
                </button>
                <button
                  onClick={markDone}
                  style={{ width: '100%', padding: '12px', background: 'var(--color-accent)', color: '#fff', fontWeight: 700 }}
                >
                  Mark as Done
                </button>
              </div>
            )}

            <button
              onClick={() => { deleteSession(s.id); onUpdate(); onClose() }}
              style={{ marginTop: 12, width: '100%', padding: '10px', background: 'rgba(218,54,51,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(218,54,51,0.3)', fontWeight: 600 }}
            >
              Delete Session
            </button>
          </div>
        </div>
      </div>

      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-fullscreen">
            <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
              <button onClick={() => setShowRegister(false)} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}><IconX size={20} /></button>
              <span style={{ fontWeight: 700, fontSize: 17 }}>Attendance</span>
            </div>
            <AttendanceEditor sessionId={s.id} players={players} onDone={() => { setShowRegister(false); refresh(); onUpdate() }} />
          </div>
        </div>
      )}

      {showPicker && (
        <DrillPicker
          selectedDrillIds={drills.map(d => d.drill_id)}
          onAdd={addDrill}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

function AttendanceEditor({ sessionId, players, onDone }) {
  const session = getSessions().find(s => s.id === sessionId)
  const activePlayers = players.sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99))
  const [status, setStatus] = useState(() => {
    const s = {}
    activePlayers.forEach(p => {
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

  return (
    <>
      <div className="modal-scroll" style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activePlayers.map(p => {
          const st = status[p.id]
          return (
            <div key={p.id} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {p.number || '?'}
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.first_name} {p.last_name}</span>
                {p.medical_notes && <IconWarning size={13} color="var(--color-danger)" />}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['present', 'late', 'absent'].map(s => {
                  const colors = { present: 'var(--color-accent)', late: 'var(--color-warning)', absent: 'var(--color-danger)' }
                  const labels = { present: 'Present', late: 'Late', absent: 'Absent' }
                  const isActive = st === s
                  return (
                    <button key={s} onClick={() => toggle(p.id, s)} style={{
                      flex: 1, padding: '7px 4px',
                      background: isActive ? colors[s] : 'var(--color-surface)',
                      color: isActive ? '#fff' : 'var(--color-text-muted)',
                      border: `1px solid ${isActive ? colors[s] : 'var(--color-border)'}`,
                      borderRadius: 7, fontSize: 13, fontWeight: isActive ? 700 : 400,
                    }}>{labels[s]}</button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <button onClick={handleSave} style={{ width: '100%', padding: '13px', background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 16 }}>
          Save Attendance
        </button>
      </div>
    </>
  )
}

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [tab, setTab] = useState('planned')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)

  function refresh() {
    const all = getSessions()
    setSessions(all)
  }

  useEffect(() => { refresh() }, [])

  const filtered = sessions
    .filter(s => s.status === tab)
    .sort((a, b) => tab === 'planned' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <span style={{ fontWeight: 700, fontSize: 20 }}>Sessions</span>
        <button onClick={() => setShowAdd(true)} style={{ background: 'none', color: 'var(--color-accent-light)', fontSize: 13, fontWeight: 600, padding: '5px 10px', border: '1px solid var(--color-accent)', borderRadius: 8 }}>
          + New
        </button>
      </div>

      <div style={{ padding: '10px 16px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 0, background: 'var(--color-surface-2)', borderRadius: 8, padding: 3 }}>
          {['planned', 'done'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px',
              background: tab === t ? 'var(--color-surface)' : 'transparent',
              color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14,
              border: tab === t ? '1px solid var(--color-border)' : '1px solid transparent',
              borderRadius: 6,
            }}>
              {t === 'planned' ? `Planned (${sessions.filter(s => s.status === 'planned').length})` : `Done (${sessions.filter(s => s.status === 'done').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 0 }}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>No {tab} sessions</div>
              <div style={{ fontSize: 14 }}>{tab === 'planned' ? 'Plan your next practice.' : 'Completed sessions will appear here.'}</div>
            </div>
          )}
          {filtered.map(s => {
            const att = s.attendance?.length
              ? `${s.attendance.filter(a => a.status === 'present').length}/${s.attendance.length}`
              : null
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.theme || 'Session'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatDate(s.date)}</div>
                  </div>
                  <span className="pill" style={{
                    background: s.status === 'done' ? 'rgba(35,134,54,0.2)' : 'rgba(56,139,253,0.2)',
                    color: s.status === 'done' ? 'var(--color-accent-light)' : 'var(--color-blue)',
                  }}>
                    {s.status === 'done' ? 'Done' : 'Planned'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {s.location && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>📍 {s.location}</span>}
                  {s.drills?.length > 0 && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>📚 {s.drills.length} drills</span>}
                  {att && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>👥 {att} present</span>}
                  {s.duration_minutes && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>⏱ {s.duration_minutes} min</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <IconPlus size={24} color="#fff" />
      </button>

      {showAdd && <AddSessionModal onClose={() => setShowAdd(false)} onSave={() => { refresh(); setShowAdd(false) }} />}
      {selected && <SessionDetail session={selected} onClose={() => setSelected(null)} onUpdate={refresh} />}
    </div>
  )
}
