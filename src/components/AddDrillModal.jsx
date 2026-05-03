import { useState } from 'react'
import { createCustomDrill } from '../lib/localStorage'
import { DRILL_CATEGORIES } from '../lib/drillLibrary'
import { IconX } from './Icons'

const empty = {
  name: '', category: 'Warm-Up', description: '', coaching_points: '',
  duration_minutes: 8, players_needed: 'Any', equipment: '',
}

export default function AddDrillModal({ onClose, onSave }) {
  const [form, setForm] = useState(empty)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.name.trim()) return
    const d = createCustomDrill(form)
    onSave(d)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Create Custom Drill</span>
          <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>
        <div className="modal-scroll" style={{ padding: '0 16px 16px' }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Drill Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Box-to-Box Sprint" autoFocus />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {DRILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What does the drill look like? How does it work?"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Coaching Points</label>
            <textarea
              value={form.coaching_points}
              onChange={e => set('coaching_points', e.target.value)}
              placeholder="What do you say to players?"
              style={{ minHeight: 64 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Duration (min)</label>
              <input
                value={form.duration_minutes}
                onChange={e => set('duration_minutes', parseInt(e.target.value) || 0)}
                type="number" min="1" max="60"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Players Needed</label>
              <input value={form.players_needed} onChange={e => set('players_needed', e.target.value)} placeholder="Any, 6-8, 10+" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Equipment</label>
            <input value={form.equipment} onChange={e => set('equipment', e.target.value)} placeholder="Cones, balls, bibs" />
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '13px',
              background: 'var(--color-warning)',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Save Drill
          </button>
        </div>
      </div>
    </div>
  )
}
