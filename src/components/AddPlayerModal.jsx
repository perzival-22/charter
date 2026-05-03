import { useState } from 'react'
import { createPlayer } from '../lib/localStorage'
import { IconX } from './Icons'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD', 'Any']

const empty = {
  first_name: '', last_name: '', number: '', position: 'MID',
  dob: '', parent_name: '', parent_phone: '', parent_email: '', medical_notes: '',
}

export default function AddPlayerModal({ onClose, onSave }) {
  const [form, setForm] = useState(empty)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.first_name.trim()) return
    const p = createPlayer(form)
    onSave(p)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Add Player</span>
          <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>
        <div className="modal-scroll" style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>First Name *</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First" autoFocus />
            </div>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Last Name</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ width: 80 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}># Jersey</label>
              <input value={form.number} onChange={e => set('number', e.target.value)} placeholder="1" type="number" min="1" max="99" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Position</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {POSITIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => set('position', p)}
                    style={{
                      padding: '6px 12px',
                      background: form.position === p ? 'var(--color-accent)' : 'var(--color-surface-2)',
                      color: form.position === p ? '#fff' : 'var(--color-text-muted)',
                      border: `1px solid ${form.position === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      fontSize: 13,
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Date of Birth</label>
            <input value={form.dob} onChange={e => set('dob', e.target.value)} type="date" />
          </div>

          <div className="divider" style={{ margin: '16px 0' }} />
          <div className="section-label" style={{ marginBottom: 10 }}>Parent / Guardian</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Name</label>
              <input value={form.parent_name} onChange={e => set('parent_name', e.target.value)} placeholder="Parent name" />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Phone</label>
              <input value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} placeholder="555-0100" type="tel" />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
              <input value={form.parent_email} onChange={e => set('parent_email', e.target.value)} placeholder="email@example.com" type="email" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Medical Notes</label>
            <textarea
              value={form.medical_notes}
              onChange={e => set('medical_notes', e.target.value)}
              placeholder="Allergies, conditions, medications..."
              style={{ minHeight: 60 }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '13px',
              background: 'var(--color-accent)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  )
}
