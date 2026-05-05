function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export const getPlayers = () => load('charter_players')
export const savePlayers = p => save('charter_players', p)
export const getActivePlayers = () => getPlayers().filter(p => p.status === 'active')
export function createPlayer(data) {
  const p = { id: uuid(), status: 'active', created_at: new Date().toISOString(), ...data }
  savePlayers([...getPlayers(), p])
  return p
}
export function updatePlayer(id, updates) {
  const all = getPlayers().map(p => p.id === id ? { ...p, ...updates } : p)
  savePlayers(all)
  return all.find(p => p.id === id)
}
export function deletePlayer(id) { savePlayers(getPlayers().filter(p => p.id !== id)) }

export const getSessions = () => load('charter_sessions')
export const saveSessions = s => save('charter_sessions', s)
export function createSession(data) {
  const s = { id: uuid(), attendance: [], drills: [], status: 'planned', post_session_notes: '', created_at: new Date().toISOString(), ...data }
  saveSessions([s, ...getSessions()])
  return s
}
export function updateSession(id, updates) {
  const all = getSessions().map(s => s.id === id ? { ...s, ...updates } : s)
  saveSessions(all)
  return all.find(s => s.id === id)
}
export function deleteSession(id) { saveSessions(getSessions().filter(s => s.id !== id)) }

export const getMatches = () => load('charter_matches')
export const saveMatches = m => save('charter_matches', m)
export function createMatch(data) {
  const m = { id: uuid(), goals: [], assists: [], appearances: [], match_notes: '', created_at: new Date().toISOString(), ...data }
  saveMatches([m, ...getMatches()])
  return m
}
export function updateMatch(id, updates) {
  const all = getMatches().map(m => m.id === id ? { ...m, ...updates } : m)
  saveMatches(all)
  return all.find(m => m.id === id)
}
export function deleteMatch(id) { saveMatches(getMatches().filter(m => m.id !== id)) }

export const getCustomDrills = () => load('charter_custom_drills')
export function createCustomDrill(data) {
  const d = { id: uuid(), created_at: new Date().toISOString(), source: 'custom', ...data }
  save('charter_custom_drills', [d, ...getCustomDrills()])
  return d
}
export function deleteCustomDrill(id) {
  save('charter_custom_drills', getCustomDrills().filter(d => d.id !== id))
}

export const getSettings = () => load('charter_settings', {
  team_name: '', age_group: 'U10', state: '', home_ground: '',
  season_start: '', season_end: '', coach_name: '', sport: 'Soccer',
})
export const saveSettings = s => save('charter_settings', s)

export const isOnboarded = () => localStorage.getItem('charter_onboarded') === 'true'
export const setOnboarded = () => localStorage.setItem('charter_onboarded', 'true')
export const clearAllData = () => {
  ['charter_players','charter_sessions','charter_matches','charter_custom_drills','charter_settings','charter_onboarded'].forEach(k => localStorage.removeItem(k))
}
