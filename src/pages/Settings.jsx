import { useState } from 'react'
import { getSettings, saveSettings, clearAllData } from '../lib/localStorage'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const AGE_GROUPS = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18']

const SPORTS = ['Soccer', 'Basketball', 'Flag Football', 'Lacrosse', 'Other']

export default function Settings() {
  const [form, setForm] = useState(getSettings)
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setSaved(false)
  }

  function handleSave() {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    clearAllData()
    window.location.reload()
  }

  function exportAttendance() {
    const { getSessions, getPlayers } = require ? (() => {
      const ls = require('../lib/localStorage')
      return ls
    })() : {}
    const sessions = JSON.parse(localStorage.getItem('charter_sessions') || '[]')
    const players = JSON.parse(localStorage.getItem('charter_players') || '[]')
    const settings = form
    let txt = `ATTENDANCE REPORT — ${settings.team_name || 'My Team'}\n`
    txt += `Generated: ${new Date().toLocaleDateString('en-US')}\n\n`
    const done = sessions.filter(s => s.status === 'done')
    done.forEach(s => {
      txt += `${s.date} — ${s.theme || 'Session'}\n`
      s.attendance?.forEach(a => {
        const p = players.find(pl => pl.id === a.player_id)
        if (p) txt += `  ${p.first_name} ${p.last_name}: ${a.status}\n`
      })
      txt += '\n'
    })
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `charter-attendance-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div className="section-label" style={{ marginBottom: 12 }}>{title}</div>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )

  const Field = ({ label, children, last }) => (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.3px' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <span style={{ fontWeight: 700, fontSize: 20 }}>Settings</span>
        <button
          onClick={handleSave}
          style={{ padding: '7px 16px', background: saved ? 'var(--color-surface-2)' : 'var(--color-accent)', color: saved ? 'var(--color-accent-light)' : '#fff', fontWeight: 600, fontSize: 14 }}
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        <div style={{ padding: '0 16px' }}>

          <Section title="Team Info">
            <Field label="Team Name">
              <input value={form.team_name} onChange={e => set('team_name', e.target.value)} placeholder="e.g. Riverside FC" />
            </Field>
            <Field label="Age Group">
              <select value={form.age_group} onChange={e => set('age_group', e.target.value)}>
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Sport">
              <select value={form.sport || 'Soccer'} onChange={e => set('sport', e.target.value)}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Home Field" last>
              <input value={form.home_ground} onChange={e => set('home_ground', e.target.value)} placeholder="Riverside Fields" />
            </Field>
          </Section>

          <Section title="Season">
            <Field label="Season Start">
              <input value={form.season_start} onChange={e => set('season_start', e.target.value)} type="date" />
            </Field>
            <Field label="Season End" last>
              <input value={form.season_end} onChange={e => set('season_end', e.target.value)} type="date" />
            </Field>
          </Section>

          <Section title="Coach Info">
            <Field label="Coach Name">
              <input value={form.coach_name} onChange={e => set('coach_name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="License Number (optional)" last>
              <input value={form.license || ''} onChange={e => set('license', e.target.value)} placeholder="e.g. USSF-D" />
            </Field>
          </Section>

          <Section title="Data">
            <Field label="Export">
              <button
                onClick={exportAttendance}
                style={{ width: '100%', padding: '10px', background: 'var(--color-surface-2)', color: 'var(--color-blue)', border: '1px solid var(--color-border)', fontWeight: 600 }}
              >
                Export Attendance Report
              </button>
            </Field>
            <Field label="Danger Zone" last>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(218,54,51,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(218,54,51,0.3)', fontWeight: 600 }}
                >
                  Clear All Data
                </button>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--color-danger)', marginBottom: 10, fontWeight: 600 }}>
                    This will delete all players, sessions, matches and settings. Are you sure?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '9px', background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button onClick={handleClear} style={{ flex: 1, padding: '9px', background: 'var(--color-danger)', color: '#fff', fontWeight: 700 }}>
                      Yes, Clear All
                    </button>
                  </div>
                </div>
              )}
            </Field>
          </Section>

          <Section title="About">
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Charter</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>Run the session. Log the session. Know your squad.</div>
              <div style={{ fontSize: 12, color: 'var(--color-border)', marginTop: 8 }}>Version 1.0 · Offline-first PWA</div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
