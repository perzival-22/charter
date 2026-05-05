import { useState, useEffect } from 'react'
import { getMatches, createMatch, updateMatch, deleteMatch, getActivePlayers } from '../lib/localStorage'
import Ic from '../components/Ic'

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function resultColor(m) {
  if (m.our_score > m.their_score) return 'var(--lime)'
  if (m.our_score < m.their_score) return 'var(--red)'
  return 'var(--amber)'
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
    <div style={{ display: 'flex', margin: '0 20px 16px', gap: 8 }}>
      <div className="sc-stat">
        <div className="sc-val">{W}-{D}-{L}</div>
        <div className="sc-lbl">W-D-L</div>
      </div>
      <div className="sc-stat">
        <div className="sc-val" style={{ color: 'var(--lime)' }}>{GF}</div>
        <div className="sc-lbl">For</div>
      </div>
      <div className="sc-stat">
        <div className="sc-val" style={{ color: 'var(--red)' }}>{GA}</div>
        <div className="sc-lbl">Against</div>
      </div>
    </div>
  )
}

function Stepper({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ padding: '10px 18px', background: 'none', border: 'none', color: 'var(--txt)', fontSize: 20, cursor: 'pointer', fontFamily: 'inherit' }}>-</button>
      <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk',sans-serif" }}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={{ padding: '10px 18px', background: 'none', border: 'none', color: 'var(--txt)', fontSize: 20, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
    </div>
  )
}

function AddMatchModal({ onClose, onSave, existingMatch }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState(existingMatch || { date: today, opponent: '', home_away: 'home', competition: 'league', our_score: 0, their_score: 0, match_notes: '' })
  const [appearances, setAppearances] = useState(existingMatch?.appearances || [])
  const [goals, setGoals] = useState(existingMatch?.goals || [])
  const [assists, setAssists] = useState(existingMatch?.assists || [])
  const players = getActivePlayers().sort((a, b) => parseInt(a.number || 99) - parseInt(b.number || 99))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function toggleApp(playerId, played) {
    setAppearances(prev => {
      const ex = prev.find(a => a.player_id === playerId)
      if (ex) {
        if (ex.played === played) return prev.filter(a => a.player_id !== playerId)
        return prev.map(a => a.player_id === playerId ? { ...a, played } : a)
      }
      return [...prev, { player_id: playerId, played }]
    })
  }

  function toggleStat(arr, setArr, playerId) {
    setArr(prev => {
      const idx = prev.findIndex(x => x.player_id === playerId)
      if (idx >= 0) return prev.filter((_, i) => i !== idx)
      return [...prev, { player_id: playerId }]
    })
  }

  function handleSave() {
    if (!form.opponent.trim()) return
    const data = { ...form, appearances, goals, assists }
    if (existingMatch) {
      updateMatch(existingMatch.id, data)
    } else {
      createMatch(data)
    }
    onSave(); onClose()
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '95%' }}>
        <div className="handle" />
        <div className="mh">
          <div className="mh-title">{existingMatch ? 'Edit Match' : 'New Match'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}><Ic n="x" s={20} /></button>
        </div>
        <div className="mscroll" style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label className="lbl">Date</label><input className="inp" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div style={{ flex: 1 }}>
              <label className="lbl">Venue</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['home', 'away'].map(v => (
                  <button key={v} onClick={() => set('home_away', v)} style={{ flex: 1, padding: '10px 4px', background: form.home_away === v ? 'var(--lime)' : 'var(--bg3)', color: form.home_away === v ? '#0e0e10' : 'var(--txt2)', border: `1px solid ${form.home_away === v ? 'var(--lime)' : 'var(--border)'}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Opponent</label><input className="inp" value={form.opponent} onChange={e => set('opponent', e.target.value)} placeholder="Team name" /></div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Competition</label>
            <div className="seg">
              {['League', 'Cup', 'Friendly', 'Tournament'].map(c => (
                <button key={c} onClick={() => set('competition', c.toLowerCase())} className={`seg-btn${form.competition === c.toLowerCase() ? ' active' : ''}`}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Score</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <Stepper value={form.our_score} onChange={v => set('our_score', v)} />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: 'var(--txt3)', fontSize: 16 }}>vs</span>
              <Stepper value={form.their_score} onChange={v => set('their_score', v)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Match Notes</label>
            <textarea className="inp" value={form.match_notes} onChange={e => set('match_notes', e.target.value)} placeholder="Tactics, performance notes..." />
          </div>

          {players.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label className="lbl">Appearances / Goals / Assists</label>
              <div className="card">
                {players.map(p => {
                  const appeared = appearances.find(a => a.player_id === p.id)
                  const scored = goals.some(g => g.player_id === p.id)
                  const assisted = assists.some(a => a.player_id === p.id)
                  return (
                    <div key={p.id} className="row" style={{ cursor: 'default' }}>
                      <div className="av" style={{ fontSize: 11 }}>{p.number || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{p.first_name} {p.last_name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => toggleApp(p.id, 'started')} style={{ padding: '4px 8px', background: appeared?.played === 'started' ? 'var(--lime)' : 'var(--bg3)', color: appeared?.played === 'started' ? '#0e0e10' : 'var(--txt2)', border: `1px solid ${appeared?.played === 'started' ? 'var(--lime)' : 'var(--border)'}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace" }}>ST</button>
                        <button onClick={() => toggleApp(p.id, 'sub')} style={{ padding: '4px 8px', background: appeared?.played === 'sub' ? 'var(--amber)' : 'var(--bg3)', color: appeared?.played === 'sub' ? '#0e0e10' : 'var(--txt2)', border: `1px solid ${appeared?.played === 'sub' ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace" }}>SU</button>
                        <button onClick={() => toggleStat(goals, setGoals, p.id)} style={{ padding: '4px 8px', background: scored ? 'var(--blue-d)' : 'var(--bg3)', color: scored ? 'var(--blue)' : 'var(--txt2)', border: `1px solid ${scored ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace" }}>G</button>
                        <button onClick={() => toggleStat(assists, setAssists, p.id)} style={{ padding: '4px 8px', background: assisted ? 'var(--purple-d)' : 'var(--bg3)', color: assisted ? 'var(--purple)' : 'var(--txt2)', border: `1px solid ${assisted ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace" }}>A</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={handleSave}>{existingMatch ? 'Save Changes' : 'Add Match'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editMatch, setEditMatch] = useState(null)

  function refresh() { setMatches(getMatches().sort((a, b) => b.date.localeCompare(a.date))) }
  useEffect(() => { refresh() }, [])

  const hasScore = m => m.our_score !== undefined && m.their_score !== undefined
  const resultLabel = m => {
    if (!hasScore(m)) return null
    if (m.our_score > m.their_score) return { label: 'W', color: 'var(--lime)', bg: 'var(--lime-d)' }
    if (m.our_score < m.their_score) return { label: 'L', color: 'var(--red)', bg: 'var(--red-d)' }
    return { label: 'D', color: 'var(--amber)', bg: 'var(--amber-d)' }
  }

  return (
    <div className="screen-fixed">
      <div className="ph" style={{ paddingBottom: 8 }}>
        <div className="pt">Matches</div>
        <div className="ps">{matches.length} matches</div>
      </div>

      <SeasonBar matches={matches} />

      <div className="page-content" style={{ paddingBottom: 0 }}>
        {matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--txt2)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>No matches yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add your first match using the button below</div>
          </div>
        )}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.map(m => {
            const res = resultLabel(m)
            const starters = m.appearances?.filter(a => a.played === 'started').length || 0
            return (
              <button key={m.id} onClick={() => setEditMatch(m)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {res && (
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: res.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 14, color: res.color }}>{res.label}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, display: 'flex', justifyContent: 'space-between' }}>
                      <span>vs {m.opponent}</span>
                      {hasScore(m) && <span style={{ color: resultColor(m) }}>{m.our_score}–{m.their_score}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-cooldown">{fmtDate(m.date)}</span>
                      <span className="badge badge-cooldown" style={{ textTransform: 'capitalize' }}>{m.home_away}</span>
                      <span className="badge badge-cooldown" style={{ textTransform: 'capitalize' }}>{m.competition}</span>
                      {starters > 0 && <span className="badge badge-cooldown">{starters} players</span>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}><Ic n="plus" s={22} c="#0e0e10" /></button>

      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onSave={refresh} />}
      {editMatch && <AddMatchModal existingMatch={editMatch} onClose={() => setEditMatch(null)} onSave={() => { refresh(); setEditMatch(null) }} />}
    </div>
  )
}
