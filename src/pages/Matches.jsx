import { useState, useEffect } from 'react'
import { getMatches, createMatch, updateMatch, deleteMatch, getActivePlayers } from '../lib/localStorage'
import { IconPlus, IconX, IconTrash } from '../components/Icons'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function resultColor(m) {
  if (m.our_score > m.their_score) return 'var(--color-accent-light)'
  if (m.our_score < m.their_score) return 'var(--color-danger)'
  return 'var(--color-warning)'
}

function SeasonBar({ matches }) {
  const done = matches.filter(m => m.our_score !== undefined && m.their_score !== undefined)
  const W = done.filter(m => m.our_score > m.their_score).length
  const D = done.filter(m => m.our_score === m.their_score).length
  const L = done.filter(m => m.our_score < m.their_score).length
  const GF = done.reduce((s, m) => s + (m.our_score || 0), 0)
  const GA = done.reduce((s, m) => s + (m.their_score || 0), 0)
  if (!done.length) return null
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px', margin: '0 16px 12px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{W}-{D}-{L}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>W-D-L</div>
      </div>
      <div style={{ width: 1, background: 'var(--color-border)' }} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent-light)' }}>{GF}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>FOR</div>
      </div>
      <div style={{ width: 1, background: 'var(--color-border)' }} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-danger)' }}>{GA}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>AGAINST</div>
      </div>
    </div>
  )
}

function Stepper({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{ padding: '10px 16px', background: 'none', color: 'var(--color-text)', fontSize: 20, borderRadius: 0 }}
      >−</button>
      <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: 18 }}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        style={{ padding: '10px 16px', background: 'none', color: 'var(--color-text)', fontSize: 20, borderRadius: 0 }}
      >+</button>
    </div>
  )
}

function AddMatchModal({ onClose, onSave, existingMatch }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState(existingMatch || {
    date: today, opponent: '', home_away: 'home', competition: 'league',
    our_score: 0, their_score: 0, match_notes: '',
  })
  const [appearances, setAppearances] = useState(existingMatch?.appearances || [])
  const [goals, setGoals] = useState(existingMatch?.goals || [])
  const [assists, setAssists] = useState(existingMatch?.assists || [])
  const players = getActivePlayers().sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99))

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function toggleApp(playerId, played) {
    setAppearances(prev => {
      const existing = prev.find(a => a.player_id === playerId)
      if (existing) {
        if (existing.played === played) return prev.filter(a => a.player_id !== playerId)
        return prev.map(a => a.player_id === playerId ? { ...a, played } : a)
      }
      return [...prev, { player_id: playerId, played }]
    })
  }

  function addGoal(playerId) {
    setGoals(prev => [...prev, { player_id: playerId, minute: 0 }])
  }

  function addAssist(playerId) {
    setAssists(prev => [...prev, { player_id: playerId, minute: 0 }])
  }

  function handleSave() {
    if (!form.opponent.trim()) return
    const data = { ...form, appearances, goals, assists }
    if (existingMatch) {
      updateMatch(existingMatch.id, data)
    } else {
      createMatch(data)
    }
    onSave()
    onClose()
  }

  const appTypes = ['full', 'half', 'sub', 'dnp']
  const appLabels = { full: 'Full', half: 'Half', sub: 'Sub', dnp: 'DNP' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-fullscreen" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{existingMatch ? 'Edit Match' : 'Log Match'}</span>
          <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-scroll" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Date</label>
              <input value={form.date} onChange={e => set('date', e.target.value)} type="date" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Opponent *</label>
            <input value={form.opponent} onChange={e => set('opponent', e.target.value)} placeholder="Team name" />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Location</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['home', 'away', 'neutral'].map(h => (
                <button key={h} onClick={() => set('home_away', h)} style={{
                  flex: 1, padding: '8px 4px',
                  background: form.home_away === h ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: form.home_away === h ? '#fff' : 'var(--color-text-muted)',
                  border: `1px solid ${form.home_away === h ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  fontSize: 13, fontWeight: form.home_away === h ? 700 : 400, textTransform: 'capitalize',
                }}>{h}</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Competition</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['league', 'cup', 'friendly', 'tournament'].map(c => (
                <button key={c} onClick={() => set('competition', c)} style={{
                  padding: '7px 12px',
                  background: form.competition === c ? 'var(--color-purple)' : 'var(--color-surface-2)',
                  color: form.competition === c ? '#fff' : 'var(--color-text-muted)',
                  border: `1px solid ${form.competition === c ? 'var(--color-purple)' : 'var(--color-border)'}`,
                  fontSize: 13, fontWeight: form.competition === c ? 700 : 400, textTransform: 'capitalize',
                }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 10 }}>Score</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>US</div>
                <Stepper value={form.our_score} onChange={v => set('our_score', v)} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-muted)' }}>–</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>THEM</div>
                <Stepper value={form.their_score} onChange={v => set('their_score', v)} />
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '16px 0' }} />
          <div className="section-label" style={{ marginBottom: 10 }}>Squad Appearances</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map(p => {
              const app = appearances.find(a => a.player_id === p.id)
              return (
                <div key={p.id} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {p.number || '?'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{p.first_name} {p.last_name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          const g = goals.filter(g => g.player_id === p.id).length
                          if (g < 5) addGoal(p.id)
                        }}
                        style={{ padding: '2px 6px', background: 'rgba(35,134,54,0.1)', color: 'var(--color-accent-light)', border: '1px solid rgba(35,134,54,0.3)', borderRadius: 5, fontSize: 11, fontWeight: 600 }}
                      >
                        ⚽ {goals.filter(g => g.player_id === p.id).length}
                      </button>
                      <button
                        onClick={() => addAssist(p.id)}
                        style={{ padding: '2px 6px', background: 'rgba(56,139,253,0.1)', color: 'var(--color-blue)', border: '1px solid rgba(56,139,253,0.3)', borderRadius: 5, fontSize: 11, fontWeight: 600 }}
                      >
                        🎯 {assists.filter(a => a.player_id === p.id).length}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {appTypes.map(t => (
                      <button key={t} onClick={() => toggleApp(p.id, t)} style={{
                        flex: 1, padding: '5px 2px',
                        background: app?.played === t ? 'var(--color-blue)' : 'var(--color-surface)',
                        color: app?.played === t ? '#fff' : 'var(--color-text-muted)',
                        border: `1px solid ${app?.played === t ? 'var(--color-blue)' : 'var(--color-border)'}`,
                        borderRadius: 6, fontSize: 11, fontWeight: app?.played === t ? 700 : 400,
                      }}>{appLabels[t]}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {goals.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Goal Scorers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {goals.map((g, i) => {
                  const p = players.find(pl => pl.id === g.player_id)
                  if (!p) return null
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', background: 'var(--color-surface-2)', borderRadius: 6 }}>
                      <span>⚽</span>
                      <span style={{ flex: 1 }}>{p.first_name} {p.last_name}</span>
                      <button onClick={() => setGoals(prev => prev.filter((_, idx) => idx !== i))} style={{ padding: 2, background: 'none', color: 'var(--color-danger)' }}><IconX size={14} /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {assists.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Assists</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {assists.map((a, i) => {
                  const p = players.find(pl => pl.id === a.player_id)
                  if (!p) return null
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', background: 'var(--color-surface-2)', borderRadius: 6 }}>
                      <span>🎯</span>
                      <span style={{ flex: 1 }}>{p.first_name} {p.last_name}</span>
                      <button onClick={() => setAssists(prev => prev.filter((_, idx) => idx !== i))} style={{ padding: 2, background: 'none', color: 'var(--color-danger)' }}><IconX size={14} /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Match Notes</label>
            <textarea value={form.match_notes} onChange={e => set('match_notes', e.target.value)} placeholder="Key moments, what worked, what to improve..." />
          </div>

          <button
            onClick={handleSave}
            style={{ marginTop: 16, width: '100%', padding: '13px', background: 'var(--color-purple)', color: '#fff', fontWeight: 700, fontSize: 16 }}
          >
            {existingMatch ? 'Save Changes' : 'Save Match'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MatchDetail({ match, players, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-fullscreen">
          <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}><IconX size={20} /></button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>vs {match.opponent}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(match.date)}</div>
            </div>
            <button onClick={() => setEditing(true)} style={{ padding: '5px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, fontWeight: 600 }}>
              Edit
            </button>
          </div>

          <div className="modal-scroll" style={{ padding: '14px 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: resultColor(match) }}>
                {match.our_score} – {match.their_score}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
                <span className="pill" style={{ background: 'rgba(137,87,229,0.2)', color: 'var(--color-purple)', textTransform: 'capitalize' }}>{match.competition}</span>
                <span className="pill" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{match.home_away}</span>
              </div>
            </div>

            {match.goals?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Goals</div>
                {match.goals.map((g, i) => {
                  const p = players.find(pl => pl.id === g.player_id)
                  return (
                    <div key={i} style={{ fontSize: 14, padding: '5px 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>⚽</span> {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                    </div>
                  )
                })}
              </div>
            )}

            {match.assists?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Assists</div>
                {match.assists.map((a, i) => {
                  const p = players.find(pl => pl.id === a.player_id)
                  return (
                    <div key={i} style={{ fontSize: 14, padding: '5px 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>🎯</span> {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                    </div>
                  )
                })}
              </div>
            )}

            {match.appearances?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Appearances</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['full', 'half', 'sub', 'dnp'].map(type => {
                    const apps = match.appearances.filter(a => a.played === type)
                    if (!apps.length) return null
                    const colors = { full: 'var(--color-accent-light)', half: 'var(--color-blue)', sub: 'var(--color-warning)', dnp: 'var(--color-text-muted)' }
                    const labels = { full: 'Full', half: 'Half', sub: 'Sub', dnp: 'DNP' }
                    return (
                      <div key={type} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 10px', minWidth: 100 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: colors[type], letterSpacing: '0.5px', marginBottom: 6 }}>{labels[type]}</div>
                        {apps.map(a => {
                          const p = players.find(pl => pl.id === a.player_id)
                          return p ? <div key={a.player_id} style={{ fontSize: 12, color: 'var(--color-text)', marginBottom: 2 }}>#{p.number} {p.first_name}</div> : null
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {match.match_notes && (
              <div style={{ marginBottom: 14 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Notes</div>
                <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>{match.match_notes}</p>
              </div>
            )}

            <button
              onClick={() => { deleteMatch(match.id); onUpdate(); onClose() }}
              style={{ width: '100%', padding: '10px', background: 'rgba(218,54,51,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(218,54,51,0.3)', fontWeight: 600, marginTop: 8 }}
            >
              Delete Match
            </button>
          </div>
        </div>
      </div>
      {editing && (
        <AddMatchModal
          onClose={() => setEditing(false)}
          onSave={() => { onUpdate(); onClose() }}
          existingMatch={match}
        />
      )}
    </>
  )
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)
  const players = getActivePlayers()

  function refresh() { setMatches(getMatches()) }
  useEffect(() => { refresh() }, [])

  const sorted = [...matches].sort((a, b) => b.date?.localeCompare(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <span style={{ fontWeight: 700, fontSize: 20 }}>Matches</span>
        <button onClick={() => setShowAdd(true)} style={{ background: 'none', color: 'var(--color-purple)', fontSize: 13, fontWeight: 600, padding: '5px 10px', border: '1px solid var(--color-purple)', borderRadius: 8 }}>
          + Log Match
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 12 }}>
        <SeasonBar matches={matches} />

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>No matches logged</div>
              <div style={{ fontSize: 14 }}>Tap "+ Log Match" after your next game.</div>
            </div>
          )}
          {sorted.map(m => {
            const rc = resultColor(m)
            const compColors = { league: 'var(--color-blue)', cup: 'var(--color-warning)', friendly: 'var(--color-text-muted)', tournament: 'var(--color-purple)' }
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 3 }}>{formatDate(m.date)}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>vs {m.opponent}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className="pill" style={{ background: `rgba(56,139,253,0.1)`, color: compColors[m.competition] || 'var(--color-text-muted)', textTransform: 'capitalize', fontSize: 10 }}>{m.competition}</span>
                      <span className="pill" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', textTransform: 'capitalize', fontSize: 10 }}>{m.home_away}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: rc, letterSpacing: '-1px' }}>
                      {m.our_score}–{m.their_score}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <IconPlus size={24} color="#fff" />
      </button>

      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onSave={refresh} />}
      {selected && <MatchDetail match={selected} players={players} onClose={() => setSelected(null)} onUpdate={refresh} />}
    </div>
  )
}
