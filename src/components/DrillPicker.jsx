import { useState } from 'react'
import { DRILL_LIBRARY, DRILL_CATEGORIES } from '../lib/drillLibrary'
import { getCustomDrills, deleteCustomDrill } from '../lib/localStorage'
import { IconX, IconCheck, IconSearch, IconClock, IconUsers, IconTrash } from './Icons'
import AddDrillModal from './AddDrillModal'

function catClass(category) {
  const map = {
    'Warm-Up': 'cat-warmup',
    'Passing & Receiving': 'cat-passing',
    'Dribbling & Ball Control': 'cat-dribbling',
    'Shooting & Finishing': 'cat-shooting',
    'Defending': 'cat-defending',
    'Small-Sided Games': 'cat-ssg',
    'Cool-Down': 'cat-cooldown',
  }
  return map[category] || 'cat-warmup'
}

function DrillRow({ drill, added, onAdd, isCustom, onDelete, refreshCustom }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px 14px',
          textAlign: 'left',
          color: 'var(--color-text)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{drill.name}</span>
              {isCustom && <span className="pill cat-custom" style={{ fontSize: 10 }}>Custom</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              <span className={`pill ${catClass(drill.category)}`} style={{ fontSize: 10 }}>{drill.category}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconClock size={11} /> {drill.duration_minutes} min
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconUsers size={11} /> {drill.players_needed}
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {added ? (
              <div style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(35,134,54,0.15)',
                border: '1px solid var(--color-accent)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: 'var(--color-accent-light)',
                fontSize: 14,
                fontWeight: 600,
              }}>
                <IconCheck size={16} color="var(--color-accent-light)" /> Added
              </div>
            ) : (
              <button
                onClick={() => onAdd(drill, isCustom ? 'custom' : 'library')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Add to Session
              </button>
            )}
            {isCustom && (
              <button
                onClick={() => { deleteCustomDrill(drill.id); refreshCustom() }}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(218,54,51,0.1)',
                  border: '1px solid rgba(218,54,51,0.3)',
                  color: 'var(--color-danger)',
                  borderRadius: 8,
                }}
              >
                <IconTrash size={16} />
              </button>
            )}
          </div>
          {drill.description && (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>{drill.description}</p>
          )}
          {drill.coaching_points && (
            <div style={{ marginTop: 8 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>Coaching Points</div>
              <p style={{ fontSize: 13, color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>{drill.coaching_points}</p>
            </div>
          )}
          {drill.equipment && (
            <div style={{ marginTop: 8 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>Equipment</div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>{drill.equipment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DrillPicker({ selectedDrillIds = [], onAdd, onClose }) {
  const [tab, setTab] = useState('library')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [customDrills, setCustomDrills] = useState(() => getCustomDrills())
  const [showAddDrill, setShowAddDrill] = useState(false)

  const refreshCustom = () => setCustomDrills(getCustomDrills())

  const filteredLibrary = DRILL_LIBRARY.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || d.category === catFilter
    return matchSearch && matchCat
  })

  const filteredCustom = customDrills.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleAddDrill(drill) {
    refreshCustom()
    onAdd(drill, 'custom')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-fullscreen">
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Add Drills</span>
          <button onClick={onClose} style={{ background: 'none', padding: 4, color: 'var(--color-text-muted)', borderRadius: 6 }}>
            <IconX size={20} />
          </button>
        </div>

        <div style={{ padding: '10px 16px', flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 10, background: 'var(--color-surface-2)', borderRadius: 8, padding: 3 }}>
            {['library', 'custom'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: tab === t ? 'var(--color-surface)' : 'transparent',
                  color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: 14,
                  borderRadius: 6,
                  border: tab === t ? '1px solid var(--color-border)' : '1px solid transparent',
                }}
              >
                {t === 'library' ? 'Library' : 'My Drills'}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <IconSearch size={16} color="var(--color-text-muted)" />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drills..."
              style={{ paddingLeft: 34 }}
            />
          </div>

          {tab === 'library' && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginTop: 8, scrollbarWidth: 'none' }}>
              {['All', ...DRILL_CATEGORIES].map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  style={{
                    padding: '5px 12px',
                    background: catFilter === c ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: catFilter === c ? '#fff' : 'var(--color-text-muted)',
                    border: `1px solid ${catFilter === c ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: catFilter === c ? 600 : 400,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >{c}</button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-scroll" style={{ padding: '10px 16px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tab === 'library' ? (
            filteredLibrary.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>No drills found</div>
              : filteredLibrary.map(d => (
                <DrillRow
                  key={d.id}
                  drill={d}
                  added={selectedDrillIds.includes(d.id)}
                  onAdd={onAdd}
                  isCustom={false}
                />
              ))
          ) : (
            <>
              {filteredCustom.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 24 }}>
                  No custom drills yet. Create your first one below.
                </div>
              )}
              {filteredCustom.map(d => (
                <DrillRow
                  key={d.id}
                  drill={d}
                  added={selectedDrillIds.includes(d.id)}
                  onAdd={onAdd}
                  isCustom={true}
                  onDelete={() => {}}
                  refreshCustom={refreshCustom}
                />
              ))}
            </>
          )}
        </div>

        <button
          onClick={() => setShowAddDrill(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            padding: '11px 18px',
            background: 'var(--color-warning)',
            color: '#000',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 9999,
            boxShadow: '0 4px 16px rgba(210,153,34,0.4)',
          }}
        >
          + Create Drill
        </button>
      </div>

      {showAddDrill && (
        <AddDrillModal
          onClose={() => setShowAddDrill(false)}
          onSave={handleAddDrill}
        />
      )}
    </div>
  )
}
