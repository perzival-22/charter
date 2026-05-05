import { useState, useRef } from 'react'
import { getSettings, saveSettings, clearAllData } from '../lib/localStorage'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]
const AGE_GROUPS = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18']
const SPORTS = ['Soccer','Basketball','Flag Football','Lacrosse','Other']
const CHARTER_KEYS = ['charter_players','charter_sessions','charter_matches','charter_custom_drills','charter_settings','charter_onboarded']

export default function Settings() {
  const [form, setForm] = useState(getSettings)
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const importRef = useRef(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  function handleSave() {
    saveSettings(form); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() { clearAllData(); window.location.reload() }

  function exportBackup() {
    const backup = { version: '2.0', exported_at: new Date().toISOString(), data: {} }
    CHARTER_KEYS.forEach(key => {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        try { backup.data[key] = JSON.parse(raw) } catch { backup.data[key] = raw }
      }
    })
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const team = (form.team_name || 'charter').replace(/\s+/g, '-').toLowerCase()
    a.download = 'charter-backup-' + team + '-' + new Date().toISOString().split('T')[0] + '.json'
    a.click(); URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const backup = JSON.parse(evt.target.result)
        if (!backup.data) throw new Error('Invalid backup')
        Object.entries(backup.data).forEach(([key, value]) => {
          if (CHARTER_KEYS.includes(key)) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
          }
        })
        setImportStatus('success')
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus(null), 3000)
      }
    }
    reader.readAsText(file); e.target.value = ''
  }

  function exportAttendance() {
    const sessions = JSON.parse(localStorage.getItem('charter_sessions') || '[]')
    const players = JSON.parse(localStorage.getItem('charter_players') || '[]')
    let txt = 'ATTENDANCE REPORT - ' + (form.team_name || 'My Team') + '\n'
    txt += 'Generated: ' + new Date().toLocaleDateString('en-US') + '\n\n'
    const done = sessions.filter(s => s.status === 'done')
    if (!done.length) {
      txt += 'No completed sessions yet.\n'
    } else {
      done.forEach(s => {
        txt += s.date + ' - ' + (s.theme || 'Session') + '\n'
        ;(s.attendance || []).forEach(a => {
          const p = players.find(pl => pl.id === a.player_id)
          if (p) txt += '  ' + p.first_name + ' ' + p.last_name + ': ' + a.status + '\n'
        })
        txt += '\n'
      })
    }
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'charter-attendance-' + new Date().toISOString().split('T')[0] + '.txt'
    a.click(); URL.revokeObjectURL(url)
  }

  const btnRow = { width: '100%', padding: '11px', border: '1px solid var(--border)', fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{title}</div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )

  const Field = ({ label, children, last }) => (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : '1px solid var(--border2)' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt3)', marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.3px' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-.5px' }}>Setup</div>
        </div>
        <button onClick={handleSave} style={{ padding: '8px 18px', background: saved ? 'var(--bg3)' : 'var(--lime)', color: saved ? 'var(--lime)' : '#0e0e10', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 12 }}>
        <div style={{ padding: '0 20px' }}>

          <Section title="Team Info">
            <Field label="Team Name">
              <input className="inp" value={form.team_name} onChange={e => set('team_name', e.target.value)} placeholder="e.g. Riverside FC" />
            </Field>
            <Field label="Age Group">
              <select className="inp" value={form.age_group} onChange={e => set('age_group', e.target.value)}>
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Sport">
              <select className="inp" value={form.sport || 'Soccer'} onChange={e => set('sport', e.target.value)}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select className="inp" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Home Field" last>
              <input className="inp" value={form.home_ground} onChange={e => set('home_ground', e.target.value)} placeholder="Riverside Fields" />
            </Field>
          </Section>

          <Section title="Season">
            <Field label="Season Start">
              <input className="inp" type="date" value={form.season_start} onChange={e => set('season_start', e.target.value)} />
            </Field>
            <Field label="Season End" last>
              <input className="inp" type="date" value={form.season_end} onChange={e => set('season_end', e.target.value)} />
            </Field>
          </Section>

          <Section title="Coach Info">
            <Field label="Coach Name">
              <input className="inp" value={form.coach_name} onChange={e => set('coach_name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="License Number (optional)" last>
              <input className="inp" value={form.license || ''} onChange={e => set('license', e.target.value)} placeholder="e.g. USSF-D" />
            </Field>
          </Section>

          <Section title="Data and Backup">
            <Field label="Export Backup">
              <button onClick={exportBackup} style={{ ...btnRow, background: 'var(--bg3)', color: 'var(--lime)' }}>
                Download Backup (.json)
              </button>
              <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 6 }}>Saves all players, sessions, matches, drills and settings. Restore on any device.</p>
            </Field>
            <Field label="Restore from Backup">
              <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
              <button onClick={() => importRef.current && importRef.current.click()} style={{ ...btnRow, background: 'var(--bg3)', color: 'var(--txt)' }}>
                Import Backup (.json)
              </button>
              {importStatus === 'success' && <p style={{ fontSize: 12, color: 'var(--lime)', marginTop: 6, fontWeight: 600 }}>Restored! Reloading...</p>}
              {importStatus === 'error' && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6, fontWeight: 600 }}>Invalid file. Choose a Charter backup (.json).</p>}
            </Field>
            <Field label="Attendance Report">
              <button onClick={exportAttendance} style={{ ...btnRow, background: 'var(--bg3)', color: 'var(--blue)' }}>
                Export Attendance (.txt)
              </button>
            </Field>
            <Field label="Danger Zone" last>
              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)} style={{ ...btnRow, background: 'var(--red-d)', color: 'var(--red)', borderColor: 'rgba(255,92,92,.2)' }}>
                  Clear All Data
                </button>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 10, fontWeight: 600 }}>
                    This will delete all players, sessions, matches and settings. Are you sure?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '9px', background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--border)', fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={handleClear} style={{ flex: 1, padding: '9px', background: 'var(--red)', color: '#fff', fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Yes, Clear All</button>
                  </div>
                </div>
              )}
            </Field>
          </Section>

          <Section title="About">
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Charter</div>
              <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 2 }}>Run the session. Log the session. Know your squad.</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 8, fontFamily: "'IBM Plex Mono',monospace" }}>Version 2.0 Beta &middot; Offline-first PWA &middot; Works without internet</div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}
