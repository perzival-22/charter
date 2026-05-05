# Charter — Replit Agent Build Prompt

> Paste everything below the horizontal rule directly into Replit Agent.

---

Build a mobile-first PWA called **Charter** — a practice and squad management app for volunteer youth soccer coaches in the United States.

**Tagline:** "Run the session. Log the session. Know your squad."

The app works fully offline using localStorage only. No backend, no Supabase, no API calls.

---

## Tech Stack

- React 18 + Vite + React Router v6
- Tailwind CSS (dark theme, CSS variables)
- localStorage only — no external dependencies except react-router-dom
- PWA: manifest.json + Apple meta tags

---

## Colour Palette (index.css)

```css
:root {
  --color-primary: #0d1117;
  --color-surface: #161b22;
  --color-surface-2: #21262d;
  --color-border: #30363d;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  --color-accent: #238636;      /* green — action, sport energy */
  --color-accent-light: #2ea043;
  --color-warning: #d29922;     /* amber — alerts */
  --color-danger: #da3633;      /* red — danger */
  --color-blue: #388bfd;        /* blue — info, selected states */
  --color-purple: #8957e5;      /* purple — matches */
}
```

---

## App Structure

```
src/
  lib/
    localStorage.js
    drillLibrary.js       — 70 built-in drills as JS constant
    sampleData.js         — pre-loaded demo squad + sessions
  pages/
    Squad.jsx             — roster + quick register
    Sessions.jsx          — session planner + drill picker
    Matches.jsx           — game log + results
    Settings.jsx          — team info, state, season
  components/
    BottomNav.jsx
    PlayerCard.jsx
    DrillPicker.jsx       — modal for adding drills to a session
    AddPlayerModal.jsx
    AddDrillModal.jsx     — custom drill creation form
    Icons.jsx
  App.jsx
  main.jsx
  index.css
public/
  manifest.json
index.html
```

---

## Data Models

### Player
```js
{
  id: string,
  first_name: string,
  last_name: string,
  number: string,           // jersey number
  position: string,         // 'GK'|'DEF'|'MID'|'FWD'|'Any'
  dob: string,              // ISO date
  parent_name: string,
  parent_phone: string,
  parent_email: string,
  medical_notes: string,
  status: 'active'|'inactive',
  created_at: string,
}
```

### Session
```js
{
  id: string,
  date: string,             // ISO date
  theme: string,            // "Pressing", "Finishing", "1v1 Defending"
  location: string,
  duration_minutes: number,
  drills: [                 // ordered list of drills used
    { drill_id: string, source: 'library'|'custom', custom_data?: object }
  ],
  attendance: [
    { player_id: string, status: 'present'|'absent'|'late' }
  ],
  post_session_notes: string,
  status: 'planned'|'done',
  created_at: string,
}
```

### Match
```js
{
  id: string,
  date: string,
  opponent: string,
  home_away: 'home'|'away'|'neutral',
  competition: 'league'|'cup'|'friendly'|'tournament',
  our_score: number,
  their_score: number,
  appearances: [
    { player_id: string, played: 'full'|'half'|'sub'|'dnp' }
  ],
  goals: [{ player_id: string, minute: number }],
  assists: [{ player_id: string, minute: number }],
  match_notes: string,
  created_at: string,
}
```

### Custom Drill
```js
{
  id: string,
  name: string,
  category: string,
  description: string,
  coaching_points: string,
  duration_minutes: number,
  players_needed: string,   // "8-12" or "Any"
  equipment: string,        // "Cones, balls"
  created_at: string,
}
```

### Settings
```js
{
  team_name: string,
  age_group: string,        // "U10", "U12", "U14", etc.
  state: string,            // US state abbreviation e.g. "CA", "TX"
  home_ground: string,
  season_start: string,
  season_end: string,
  coach_name: string,
}
```

### localStorage keys
- `charter_players`
- `charter_sessions`
- `charter_matches`
- `charter_custom_drills`
- `charter_settings`
- `charter_onboarded`

---

## localStorage.js — Full Implementation

```js
function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

// Players
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

// Sessions
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

// Matches
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

// Custom Drills
export const getCustomDrills = () => load('charter_custom_drills')
export function createCustomDrill(data) {
  const d = { id: uuid(), created_at: new Date().toISOString(), source: 'custom', ...data }
  save('charter_custom_drills', [d, ...getCustomDrills()])
  return d
}
export function deleteCustomDrill(id) {
  save('charter_custom_drills', getCustomDrills().filter(d => d.id !== id))
}

// Settings
export const getSettings = () => load('charter_settings', {
  team_name: '', age_group: 'U10', state: '', home_ground: '',
  season_start: '', season_end: '', coach_name: '',
})
export const saveSettings = s => save('charter_settings', s)

// Onboarding
export const isOnboarded = () => localStorage.getItem('charter_onboarded') === 'true'
export const setOnboarded = () => localStorage.setItem('charter_onboarded', 'true')
```

---

## drillLibrary.js — 70 Built-in Drills

```js
export const DRILL_CATEGORIES = [
  'Warm-Up',
  'Passing & Receiving',
  'Dribbling & Ball Control',
  'Shooting & Finishing',
  'Defending',
  'Small-Sided Games',
  'Cool-Down',
]

export const DRILL_LIBRARY = [
  // ── WARM-UP (10) ──────────────────────────────────────────────
  { id: 'wu01', category: 'Warm-Up', name: 'Dynamic Stretching Circle', description: 'Players form a circle and move through leg swings, hip rotations, high knees, and arm circles led by the coach.', coaching_points: 'Full range of motion, controlled movements, no static holds.', duration_minutes: 5, players_needed: '6+', equipment: 'None' },
  { id: 'wu02', category: 'Warm-Up', name: 'Jogging Shapes', description: 'Players jog in a defined area changing direction on coach\'s call: straight, diagonal, zigzag, circles.', coaching_points: 'Head up, stay light on feet, listen for cues.', duration_minutes: 4, players_needed: '4+', equipment: 'Cones' },
  { id: 'wu03', category: 'Warm-Up', name: 'Ball Mastery Warm-Up', description: 'Each player with a ball. Coach calls moves: toe taps, inside rolls, outside rolls, sole rolls, scissors.', coaching_points: 'Soft first touch, stay on toes, use both feet.', duration_minutes: 5, players_needed: 'Any', equipment: '1 ball per player' },
  { id: 'wu04', category: 'Warm-Up', name: 'Rondo 4v1', description: 'Four players in a square keep possession from one defender in the middle. Rotate the defender every 30 seconds.', coaching_points: 'One-touch when possible, create angles, communicate.', duration_minutes: 6, players_needed: '5', equipment: 'Cones, 1 ball' },
  { id: 'wu05', category: 'Warm-Up', name: 'Tag with a Ball', description: 'All players dribble a ball. Coach designates 2 taggers who also dribble. Tagged players do 5 toe taps to rejoin.', coaching_points: 'Head up while dribbling, protect the ball with body.', duration_minutes: 5, players_needed: '6+', equipment: '1 ball per player' },
  { id: 'wu06', category: 'Warm-Up', name: 'Mirror Dribbling', description: 'Pairs face each other. One player leads with the ball, partner mirrors their movements without a ball. Switch after 60 seconds.', coaching_points: 'Quick changes of direction, stay on your toes.', duration_minutes: 4, players_needed: 'Even number', equipment: '1 ball per pair' },
  { id: 'wu07', category: 'Warm-Up', name: 'Passing to Feet Warm-Up', description: 'Pairs 10 yards apart, pass back and forth focusing on accuracy and correct surface (inside of foot).', coaching_points: 'Plant foot beside ball, follow through toward target, receive across body.', duration_minutes: 4, players_needed: 'Even number', equipment: '1 ball per pair' },
  { id: 'wu08', category: 'Warm-Up', name: 'Cone Slalom', description: 'Set up 6 cones in a line 2 yards apart. Players dribble through with speed, return on outside.', coaching_points: 'Tight touches, use both feet, accelerate out of the last cone.', duration_minutes: 5, players_needed: 'Any', equipment: 'Cones, 1 ball per player' },
  { id: 'wu09', category: 'Warm-Up', name: 'Sharks and Minnows', description: 'Designated "sharks" try to kick balls out of the grid. "Minnows" protect their ball. Last minnow with ball wins.', coaching_points: 'Shield with body, use both feet, keep head up to spot danger.', duration_minutes: 5, players_needed: '8+', equipment: 'Cones, 1 ball per minnow' },
  { id: 'wu10', category: 'Warm-Up', name: 'Red Light Green Light', description: 'Players dribble across the field. Coach calls green (dribble fast), yellow (slow), red (stop and put foot on ball).', coaching_points: 'Quick reactions, close control at speed.', duration_minutes: 4, players_needed: '4+', equipment: 'Cones, 1 ball per player' },

  // ── PASSING & RECEIVING (15) ──────────────────────────────────
  { id: 'pa01', category: 'Passing & Receiving', name: 'Triangle Passing', description: 'Three players at triangle points 10-15 yards apart. Pass clockwise then counterclockwise. Follow your pass.', coaching_points: 'Pass to the correct foot, open body to receive, communicate.', duration_minutes: 8, players_needed: '3+', equipment: 'Cones, 1 ball per group' },
  { id: 'pa02', category: 'Passing & Receiving', name: 'Square Passing', description: 'Four players at corners of a square 12 yards each side. Pass and follow. Add a fifth player as central option.', coaching_points: 'Sharp passes, check runs before receiving, first touch forward.', duration_minutes: 8, players_needed: '4-5', equipment: 'Cones, 1 ball' },
  { id: 'pa03', category: 'Passing & Receiving', name: 'Pass and Move Grid', description: '10x10 yard grid, 4 players with 1 ball. Pass then immediately move to a new space. No standing still.', coaching_points: 'Move after every pass, create new angles, weight of pass.', duration_minutes: 7, players_needed: '4', equipment: 'Cones, 1 ball' },
  { id: 'pa04', category: 'Passing & Receiving', name: 'Long Passing Pairs', description: 'Pairs 25-30 yards apart practise driven passes along the ground. Alternate feet each repetition.', coaching_points: 'Strike through centre of ball, non-kicking foot beside ball, follow through.', duration_minutes: 6, players_needed: 'Even number', equipment: '1 ball per pair' },
  { id: 'pa05', category: 'Passing & Receiving', name: 'Wall Pass (1-2)', description: 'Player A passes to Player B, makes a run, B plays one-touch return into space. Repeat from opposite side.', coaching_points: 'Timing of run, weight of return pass, first touch into space.', duration_minutes: 8, players_needed: '2+', equipment: 'Cones, 1 ball per pair' },
  { id: 'pa06', category: 'Passing & Receiving', name: 'Switching the Field', description: 'Players practise switching play across the width of the field using long diagonal passes in pairs or small groups.', coaching_points: 'Disguise intention, driven pass with laces, receiver opens body.', duration_minutes: 8, players_needed: '4+', equipment: '1 ball per group' },
  { id: 'pa07', category: 'Passing & Receiving', name: 'Number Sequence Passing', description: 'Players numbered 1-8 in a grid. Must pass in number order (1→2→3→4…). Progress with two balls simultaneously.', coaching_points: 'Head up to find next player, quick release, constant movement.', duration_minutes: 8, players_needed: '6-8', equipment: 'Cones, 1-2 balls' },
  { id: 'pa08', category: 'Passing & Receiving', name: 'Receiving Under Pressure', description: 'Server passes to receiver who has a passive defender behind them. Receiver must control and protect ball.', coaching_points: 'Check away then come to receive, use body to shield, first touch away from pressure.', duration_minutes: 8, players_needed: '3', equipment: '1 ball per group' },
  { id: 'pa09', category: 'Passing & Receiving', name: 'One-Touch Passing Box', description: '4 players around a 6x6 yard box. All passes must be one-touch. Lose a point for two-touch.', coaching_points: 'Set body early, watch ball into foot, play away from pressure.', duration_minutes: 7, players_needed: '4', equipment: 'Cones, 1 ball' },
  { id: 'pa10', category: 'Passing & Receiving', name: 'Breakout Passing', description: 'Teams of 3 pass through a central gate (2 cones). If a pass goes through the gate cleanly, score a point.', coaching_points: 'Creating angles, timing runs, thread the pass.', duration_minutes: 8, players_needed: '6', equipment: 'Cones, 1 ball' },
  { id: 'pa11', category: 'Passing & Receiving', name: 'Volley Passing Pairs', description: 'Server tosses ball in air, partner volleys back. Alternate feet. Progress to half-volley.', coaching_points: 'Watch ball onto foot, lock ankle, lean slightly back for height.', duration_minutes: 6, players_needed: 'Even number', equipment: '1 ball per pair' },
  { id: 'pa12', category: 'Passing & Receiving', name: 'Chest Control Pairs', description: 'Server throws ball at chest height, receiver controls with chest and plays back with foot. Increase distance progressively.', coaching_points: 'Open chest, cushion on contact, let ball drop to feet.', duration_minutes: 6, players_needed: 'Even number', equipment: '1 ball per pair' },
  { id: 'pa13', category: 'Passing & Receiving', name: 'Rondo 5v2', description: '5 players keep ball from 2 defenders in a 12x12 yard grid. Defender who wins ball swaps with player who lost it.', coaching_points: 'Quick circulation, support angles, play away from pressure.', duration_minutes: 10, players_needed: '7', equipment: 'Cones, 1 ball' },
  { id: 'pa14', category: 'Passing & Receiving', name: 'End-to-End Passing Relay', description: 'Teams pass ball from one end of grid to other through at least 3 players. First team to 10 completions wins.', coaching_points: 'Accuracy over pace, receiver moves to create angle.', duration_minutes: 8, players_needed: '6+', equipment: 'Cones, 1 ball per team' },
  { id: 'pa15', category: 'Passing & Receiving', name: 'Give and Go Gates', description: 'Multiple gates (pairs of cones) set up across the field. In pairs, players must pass through gates while moving forward. Count gates in 90 seconds.', coaching_points: 'Communication, weight of pass, timing of run.', duration_minutes: 8, players_needed: 'Even number', equipment: 'Cones, 1 ball per pair' },

  // ── DRIBBLING & BALL CONTROL (12) ─────────────────────────────
  { id: 'dr01', category: 'Dribbling & Ball Control', name: 'Scissors Move', description: 'Static then moving practice of the scissors (step over). Slow → faster. Add change of direction after the move.', coaching_points: 'Sell the fake with your body, plant and explode, use both feet.', duration_minutes: 8, players_needed: 'Any', equipment: '1 ball per player, cones' },
  { id: 'dr02', category: 'Dribbling & Ball Control', name: 'Inside-Outside Cut', description: 'Dribble at a cone, cut inside with left foot, outside with right (or vice versa). Explode away.', coaching_points: 'Drop shoulder to sell the move, touch close, accelerate.', duration_minutes: 7, players_needed: 'Any', equipment: 'Cones, 1 ball per player' },
  { id: 'dr03', category: 'Dribbling & Ball Control', name: '1v1 Attacking', description: 'One attacker vs one defender. Attacker tries to dribble past defender and cross a line. Rotate roles every 3 goes.', coaching_points: 'Use body feints, change pace, commit the defender then go.', duration_minutes: 10, players_needed: 'Even number', equipment: 'Cones, 1 ball per pair' },
  { id: 'dr04', category: 'Dribbling & Ball Control', name: 'Speed Dribbling Race', description: 'Players race to dribble to a cone 20 yards away, stop ball, return. First back wins. Emphasise control over pace.', coaching_points: 'Push ball ahead at pace, regain control, keep eyes up.', duration_minutes: 6, players_needed: '2+', equipment: 'Cones, 1 ball per player' },
  { id: 'dr05', category: 'Dribbling & Ball Control', name: 'Cruyff Turn', description: 'Practice the Cruyff Turn: fake to pass or cross, drag back behind standing leg, spin away.', coaching_points: 'Sell the fake, use inside of foot to drag, turn tight.', duration_minutes: 7, players_needed: 'Any', equipment: 'Cones, 1 ball per player' },
  { id: 'dr06', category: 'Dribbling & Ball Control', name: 'Juggling Challenge', description: 'Individual juggling. Targets by age: U8=3 touches, U10=8, U12=15, U14=25. Count best of 3 attempts.', coaching_points: 'Soft touch, relax the foot, use thigh when struggling.', duration_minutes: 5, players_needed: 'Any', equipment: '1 ball per player' },
  { id: 'dr07', category: 'Dribbling & Ball Control', name: 'Tick-Tock (Inside Foot Rolls)', description: 'Ball between feet, alternate inside-foot rolls left to right and back. Increase speed. Add a forward step after each roll.', coaching_points: 'Stay on toes, light touch, rhythm.', duration_minutes: 5, players_needed: 'Any', equipment: '1 ball per player' },
  { id: 'dr08', category: 'Dribbling & Ball Control', name: 'Dribble and Stop on Line', description: 'Player dribbles at pace and must stop ball dead on the coaching line using sole of foot. Repeat 8 times.', coaching_points: 'Approach at pace, take a big step, sole plants ball.', duration_minutes: 5, players_needed: 'Any', equipment: '1 ball per player, marked lines' },
  { id: 'dr09', category: 'Dribbling & Ball Control', name: 'King of the Grid', description: '10x10 grid, all players dribbling. Try to kick other players\' balls out while protecting your own. Last one in wins.', coaching_points: 'Head up, shield ball with body, opportunistic tackles.', duration_minutes: 6, players_needed: '6+', equipment: 'Cones, 1 ball per player' },
  { id: 'dr10', category: 'Dribbling & Ball Control', name: 'Laces Dribble Run', description: 'Players dribble 20 yards using only the laces (top of foot), controlling pace. No toe-pokes.', coaching_points: 'Relaxed ankle, gentle pushes, look up every 3 touches.', duration_minutes: 6, players_needed: 'Any', equipment: 'Cones, 1 ball per player' },
  { id: 'dr11', category: 'Dribbling & Ball Control', name: 'Change of Pace Drill', description: 'Set up 3 zones: slow dribble, fast sprint with ball, slow dribble. Coach signals transitions.', coaching_points: 'Explosive acceleration, keep ball close during sprint.', duration_minutes: 7, players_needed: 'Any', equipment: 'Cones, 1 ball per player' },
  { id: 'dr12', category: 'Dribbling & Ball Control', name: 'Dribble to Combination', description: 'Player dribbles at a mannequin/cone, performs a skill move, plays a combination pass with a partner, shoots.', coaching_points: 'Realistic simulation of match situations, commit to the move.', duration_minutes: 10, players_needed: '2+', equipment: 'Cones, goal, 1 ball' },

  // ── SHOOTING & FINISHING (10) ─────────────────────────────────
  { id: 'sh01', category: 'Shooting & Finishing', name: 'Finishing from the Edge', description: 'Players take turns receiving a pass at the edge of the box and shooting on goal first or second touch.', coaching_points: 'Open body to receive, select far post when goalkeeper is central, follow up.', duration_minutes: 10, players_needed: '4+', equipment: 'Goal, cones, balls' },
  { id: 'sh02', category: 'Shooting & Finishing', name: 'One-Two into Shot', description: 'Player passes to a server at edge of box, receives return pass on the run, finishes. Alternate sides.', coaching_points: 'Weight of first pass, burst into space, shoot early.', duration_minutes: 10, players_needed: '3+', equipment: 'Goal, cones, balls' },
  { id: 'sh03', category: 'Shooting & Finishing', name: 'Volley Practice', description: 'Server lobs ball in air at the edge of the box. Player volleys on goal. Full volley then half volley.', coaching_points: 'Side on, watch ball onto foot, lean slightly forward, non-kicking arm out for balance.', duration_minutes: 8, players_needed: '3+', equipment: 'Goal, balls' },
  { id: 'sh04', category: 'Shooting & Finishing', name: 'Penalty Practice', description: 'Each player takes 5 penalty kicks. Vary instruction: pick a corner, shoot high, shot low.', coaching_points: 'Pick target before run-up, non-kicking foot beside ball, strike through centre.', duration_minutes: 8, players_needed: 'Any', equipment: 'Goal, balls' },
  { id: 'sh05', category: 'Shooting & Finishing', name: 'Cross and Finish', description: 'Winger delivers crosses from both sides, strikers attack near and far post. Alternate crossing sides.', coaching_points: 'Anticipate flight, attack the ball, header down on goal.', duration_minutes: 12, players_needed: '4+', equipment: 'Goal, cones, balls' },
  { id: 'sh06', category: 'Shooting & Finishing', name: 'Breakaway Finishing', description: 'Player starts at halfway, receives through ball, beats goalkeeper 1v1. Vary finishing technique each round.', coaching_points: 'Get body between ball and goalkeeper, stay composed, pick spot not power.', duration_minutes: 10, players_needed: '3+', equipment: 'Goal, balls, cones' },
  { id: 'sh07', category: 'Shooting & Finishing', name: 'Rebound Finishing', description: 'Player shoots. If goalkeeper saves, first to the rebound scores. Forces players to follow their shot.', coaching_points: 'Always follow shots, position to receive rebound, quick second touch finish.', duration_minutes: 8, players_needed: '4+', equipment: 'Goal, balls' },
  { id: 'sh08', category: 'Shooting & Finishing', name: 'Around the Cones Shot', description: 'Dribble around two cones set in front of goal and shoot. Alternate left and right approach runs.', coaching_points: 'Set up touch to open angle, shoot across goalkeeper, keep shot low.', duration_minutes: 8, players_needed: 'Any', equipment: 'Goal, cones, balls' },
  { id: 'sh09', category: 'Shooting & Finishing', name: 'Shooting on Turn', description: 'Player faces away from goal, server plays ball to feet, player turns and shoots in 2 touches maximum.', coaching_points: 'Feel pressure behind, touch to side before turning, hit early.', duration_minutes: 8, players_needed: '2+', equipment: 'Goal, balls' },
  { id: 'sh10', category: 'Shooting & Finishing', name: 'Shooting Competition', description: 'Players take turns shooting from different marked spots. Points for hitting corners of goal. Most points wins.', coaching_points: 'Placement over power, visualise target before striking.', duration_minutes: 10, players_needed: 'Any', equipment: 'Goal, cones, balls' },

  // ── DEFENDING (8) ─────────────────────────────────────────────
  { id: 'de01', category: 'Defending', name: '1v1 Defending', description: 'Attacker tries to dribble past defender and cross a line. Defender must stay goal-side and delay.', coaching_points: 'Stay on toes, delay and jockey, tackle only when certain.', duration_minutes: 10, players_needed: 'Even number', equipment: 'Cones, 1 ball per pair' },
  { id: 'de02', category: 'Defending', name: 'Pressing Trigger Drill', description: 'Server passes ball between two targets. Defender must react to a "bad touch" signal and press aggressively.', coaching_points: 'Stay compact until trigger, sprint at angle to cut off pass, arrive at pace.', duration_minutes: 8, players_needed: '3+', equipment: 'Cones, 1 ball' },
  { id: 'de03', category: 'Defending', name: 'Tracking Runner', description: 'Attacker makes runs across and behind the defensive line. Defender must track without ball, maintaining goal-side position.', coaching_points: 'Goal-side at all times, communicate, do not ball-watch.', duration_minutes: 8, players_needed: '2', equipment: 'Cones' },
  { id: 'de04', category: 'Defending', name: 'Blocking Shots', description: 'Attacker shoots from inside the box. Defender starts behind the line and sprints to block. Switch roles each round.', coaching_points: 'Sprint at angle not straight, get body in line, block with side foot.', duration_minutes: 8, players_needed: '2+', equipment: 'Goal, cones, balls' },
  { id: 'de05', category: 'Defending', name: '2v1 Defending', description: 'Two attackers vs one defender. Defender must delay until support arrives. Switch roles every 3 attacks.', coaching_points: 'Show attacker down the line, prevent through ball, buy time.', duration_minutes: 10, players_needed: '3+', equipment: 'Cones, 1 ball' },
  { id: 'de06', category: 'Defending', name: 'Header Clearance', description: 'Server lofts crosses into box. Defenders head ball away as far and as high as possible. Compete for highest clearance.', coaching_points: 'Attack the ball, eyes open, head through top half of ball.', duration_minutes: 8, players_needed: '3+', equipment: 'Goal, balls' },
  { id: 'de07', category: 'Defending', name: 'Sliding Tackle Practice', description: 'Controlled practice of the sliding tackle in pairs. Slow motion first, then at pace. Safety and timing emphasis.', coaching_points: 'Come from side not behind, lead with near foot, make contact with inside of foot.', duration_minutes: 8, players_needed: 'Even number', equipment: 'Cones, 1 ball per pair' },
  { id: 'de08', category: 'Defending', name: 'Compactness and Shape', description: 'Defensive unit of 4 moves together as a block across the field as coach walks an attacker around. No gaps.', coaching_points: 'Shift together, compress space, communicate, no daylight between defenders.', duration_minutes: 10, players_needed: '5+', equipment: 'Cones' },

  // ── SMALL-SIDED GAMES (10) ────────────────────────────────────
  { id: 'ss01', category: 'Small-Sided Games', name: '3v3 No Goalkeeper', description: 'Two teams of three, small goals, no goalkeeper. Encourages all players to defend and attack.', coaching_points: 'High tempo, everyone involved, press immediately when losing ball.', duration_minutes: 10, players_needed: '6', equipment: 'Cones/small goals, 1 ball' },
  { id: 'ss02', category: 'Small-Sided Games', name: '4v4 with Goalkeepers', description: 'Classic small-sided game. Focus theme changes each week (e.g. pressing, possession, switching play).', coaching_points: 'Apply the session theme, play with intensity.', duration_minutes: 12, players_needed: '8', equipment: 'Goals, cones, ball' },
  { id: 'ss03', category: 'Small-Sided Games', name: 'Possession Game (Keep Away)', description: 'Two teams try to keep the ball for 10 consecutive passes. Defenders win ball back on a turnover.', coaching_points: 'Move to create angles, quick circulation, support the ball carrier.', duration_minutes: 10, players_needed: '6-10', equipment: 'Cones, 1 ball' },
  { id: 'ss04', category: 'Small-Sided Games', name: 'End Zone Game', description: 'Score by dribbling into opponent\'s end zone. No shooting. Forces dribbling and 1v1 play.', coaching_points: 'Drive forward with ball, when to dribble vs pass, end zone awareness.', duration_minutes: 10, players_needed: '6-10', equipment: 'Cones, 1 ball' },
  { id: 'ss05', category: 'Small-Sided Games', name: 'Numbers Up Attack', description: 'Attackers always have one extra player (3v2, 4v3). Defenders must work harder. Switch roles after 5 attacks.', coaching_points: 'Use the extra man wisely, create 1v1 situations wide, quick decision-making.', duration_minutes: 12, players_needed: '5+', equipment: 'Cones, goal, ball' },
  { id: 'ss06', category: 'Small-Sided Games', name: 'Transition Game', description: 'One team attacks, the other defends. On turnover, teams immediately switch. Fast, intense transitions.', coaching_points: 'Instant reaction on ball loss, first pass forward, pressure immediately after losing ball.', duration_minutes: 12, players_needed: '6-10', equipment: 'Goals, cones, ball' },
  { id: 'ss07', category: 'Small-Sided Games', name: 'Directional Possession', description: 'Possession game with gates on two ends. Score by passing through a gate to a teammate. No shooting.', coaching_points: 'Circulation, probe for gate opportunities, switch play quickly.', duration_minutes: 10, players_needed: '6-8', equipment: 'Cones, 1 ball' },
  { id: 'ss08', category: 'Small-Sided Games', name: 'Two-Touch Game', description: 'Normal game but all players limited to 2 touches max. Increases passing speed and first touch quality.', coaching_points: 'Set body to receive, know your next action before the ball arrives.', duration_minutes: 10, players_needed: '6-10', equipment: 'Goals, cones, ball' },
  { id: 'ss09', category: 'Small-Sided Games', name: 'Island Game (Zones)', description: 'Playing field divided into 3 horizontal zones. Ball must visit each zone before a shot is allowed.', coaching_points: 'Patience in build-up, switch play to find the open zone, timing of forward runs.', duration_minutes: 12, players_needed: '8-12', equipment: 'Cones, goals, ball' },
  { id: 'ss10', category: 'Small-Sided Games', name: 'Target Player Game', description: 'Each team has a target player who stays in opponent\'s half. Score by playing into target player who holds up, combines, and finishes.', coaching_points: 'Support the target player, timing of runs to combine, target player\'s first touch.', duration_minutes: 12, players_needed: '8-12', equipment: 'Goals, cones, ball' },

  // ── COOL-DOWN (5) ─────────────────────────────────────────────
  { id: 'cd01', category: 'Cool-Down', name: 'Light Jog and Walk', description: 'Players jog one lap of the field then walk half a lap. Gradually bring heart rate down.', coaching_points: 'Slow and steady, breathe deeply, loosen up the legs.', duration_minutes: 4, players_needed: 'Any', equipment: 'None' },
  { id: 'cd02', category: 'Cool-Down', name: 'Static Stretching Circle', description: 'Team in a circle. Coach leads through: hamstrings, quads, hip flexors, calves, groin, shoulders. Hold each 20 seconds.', coaching_points: 'Breathe into the stretch, no bouncing, feel the pull not pain.', duration_minutes: 7, players_needed: 'Any', equipment: 'None' },
  { id: 'cd03', category: 'Cool-Down', name: 'Partner Stretch', description: 'In pairs, partner-assisted hamstring and shoulder stretches. Switch roles after each stretch.', coaching_points: 'Communicate, gentle pressure only, hold 20-25 seconds.', duration_minutes: 5, players_needed: 'Even number', equipment: 'None' },
  { id: 'cd04', category: 'Cool-Down', name: 'Slow Ball Juggling', description: 'Individual juggling at slow pace to wind down. Count touches. Celebrate personal bests.', coaching_points: 'Relaxed, focus on technique, no competition.', duration_minutes: 3, players_needed: 'Any', equipment: '1 ball per player' },
  { id: 'cd05', category: 'Cool-Down', name: 'Team Huddle and Review', description: 'Team sits in a circle. Coach reviews the session: one thing done well, one thing to work on. Players share one word about the practice.', coaching_points: 'Reinforce positives, one improvement focus, build team culture.', duration_minutes: 5, players_needed: 'Any', equipment: 'None' },
]
```

---

## sampleData.js

```js
import { createPlayer, createSession, createMatch } from './localStorage'

export function loadSampleData() {
  const today = new Date()
  const sub = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
  const add = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }

  const players = [
    { first_name: 'Marcus', last_name: 'Rivera',  number: '1',  position: 'GK',  dob: '2016-03-12', parent_name: 'Carlos Rivera',  parent_phone: '555-0101', parent_email: '', medical_notes: '' },
    { first_name: 'Jayden', last_name: 'Thompson',number: '4',  position: 'DEF', dob: '2015-07-22', parent_name: 'Lisa Thompson',  parent_phone: '555-0102', parent_email: '', medical_notes: '' },
    { first_name: 'Amara',  last_name: 'Johnson', number: '6',  position: 'DEF', dob: '2016-01-05', parent_name: 'Grace Johnson',  parent_phone: '555-0103', parent_email: '', medical_notes: 'Mild asthma - has inhaler' },
    { first_name: 'Tyler',  last_name: 'Chen',    number: '8',  position: 'MID', dob: '2015-09-18', parent_name: 'Wei Chen',       parent_phone: '555-0104', parent_email: '', medical_notes: '' },
    { first_name: 'Sofia',  last_name: 'Martinez',number: '10', position: 'MID', dob: '2016-04-30', parent_name: 'Ana Martinez',   parent_phone: '555-0105', parent_email: '', medical_notes: '' },
    { first_name: 'Noah',   last_name: 'Williams',number: '7',  position: 'FWD', dob: '2015-11-14', parent_name: 'James Williams', parent_phone: '555-0106', parent_email: '', medical_notes: '' },
    { first_name: 'Layla',  last_name: 'Brown',   number: '9',  position: 'FWD', dob: '2016-02-28', parent_name: 'Donna Brown',    parent_phone: '555-0107', parent_email: '', medical_notes: '' },
    { first_name: 'Ethan',  last_name: 'Davis',   number: '3',  position: 'DEF', dob: '2015-08-09', parent_name: 'Paul Davis',     parent_phone: '555-0108', parent_email: '', medical_notes: '' },
    { first_name: 'Mia',    last_name: 'Garcia',  number: '11', position: 'FWD', dob: '2016-06-17', parent_name: 'Rosa Garcia',    parent_phone: '555-0109', parent_email: '', medical_notes: '' },
    { first_name: 'Liam',   last_name: 'Wilson',  number: '5',  position: 'MID', dob: '2015-12-03', parent_name: 'Kate Wilson',    parent_phone: '555-0110', parent_email: '', medical_notes: '' },
    { first_name: 'Zoe',    last_name: 'Anderson',number: '2',  position: 'DEF', dob: '2016-05-21', parent_name: 'Beth Anderson',  parent_phone: '555-0111', parent_email: '', medical_notes: '' },
    { first_name: 'Caleb',  last_name: 'Lee',     number: '12', position: 'MID', dob: '2015-10-08', parent_name: 'John Lee',       parent_phone: '555-0112', parent_email: '', medical_notes: '' },
  ]

  const created = players.map(p => createPlayer(p))

  createSession({
    date: sub(7),
    theme: '1v1 Attacking & Defending',
    location: 'Riverside Fields - Field 2',
    duration_minutes: 60,
    drills: [
      { drill_id: 'wu03', source: 'library' },
      { drill_id: 'dr01', source: 'library' },
      { drill_id: 'de01', source: 'library' },
      { drill_id: 'ss01', source: 'library' },
      { drill_id: 'cd02', source: 'library' },
    ],
    attendance: created.map((p, i) => ({ player_id: p.id, status: i === 2 || i === 8 ? 'absent' : 'present' })),
    post_session_notes: 'Good energy today. Tyler and Sofia linking up well in midfield. Jayden needs to work on staying goal-side. End the session earlier next time — kids were tired by the SSG.',
    status: 'done',
  })

  createSession({
    date: add(3),
    theme: 'Passing & Possession',
    location: 'Riverside Fields - Field 2',
    duration_minutes: 60,
    drills: [
      { drill_id: 'wu01', source: 'library' },
      { drill_id: 'pa01', source: 'library' },
      { drill_id: 'pa03', source: 'library' },
      { drill_id: 'pa13', source: 'library' },
      { drill_id: 'ss03', source: 'library' },
      { drill_id: 'cd05', source: 'library' },
    ],
    attendance: [],
    post_session_notes: '',
    status: 'planned',
  })

  createMatch({
    date: sub(4),
    opponent: 'Eastside FC',
    home_away: 'home',
    competition: 'league',
    our_score: 3,
    their_score: 1,
    appearances: created.map(p => ({ player_id: p.id, played: 'full' })),
    goals: [
      { player_id: created[6].id, minute: 12 },
      { player_id: created[5].id, minute: 28 },
      { player_id: created[6].id, minute: 44 },
    ],
    assists: [
      { player_id: created[3].id, minute: 12 },
      { player_id: created[4].id, minute: 28 },
    ],
    match_notes: 'Great team performance. Layla was excellent with 2 goals. Defended well in the second half when they pushed forward. Need to work on set pieces - gave away a cheap goal from a corner.',
  })
}
```

---

## Page Specifications

### Onboarding Screen

Dark background. Top: "Charter" wordmark bold white.
Below: "For coaches who show up every Saturday."

Three feature rows with emoji:
- 📋 "Plan your practice in minutes"
- ✅ "Take attendance in 30 seconds"
- 📊 "Track every player's development"

"Get Started" button (green accent).
On tap: loadSampleData(), setOnboarded(), navigate to '/squad'

---

### Squad.jsx — Screen 1

**Header:** "Charter" left · team name right (from settings)

**Two buttons at top:**
- "Take Register" (green) → opens a full-screen modal listing all active players with Present / Absent / Late buttons
- "+ Add Player" (outline) → opens AddPlayerModal

**Player list** — sorted by jersey number:
Each PlayerCard shows:
- Jersey number badge (coloured circle, green)
- Full name (bold)
- Position pill (GK/DEF/MID/FWD)
- Attendance % from past sessions (green if >80%, amber if 60-80%, red if <60%)

Tap a player card → expand inline to show:
- Parent name + phone
- Medical notes (red warning if present)
- Development notes from last session
- "View Full Profile" link → navigates to /player/:id (player detail page)

**Player detail page (/player/:id):**
Four tabs:
- Info — all contact and medical fields, editable
- Attendance — list of past sessions with status icon
- Development — list of coach notes per session
- Match Record — appearances, goals, assists

---

### Sessions.jsx — Screen 2

**Header:** "Sessions" · "+" add button top right

**Tab row:** [Planned] [Done]

**Session cards** sorted by date:
- Date (large)
- Theme (bold)
- Location (muted)
- Drill count badge
- Attendance fraction (e.g. "10/12 present")
- Status badge (Planned = blue, Done = green)

**Tap a session** → Session Detail page:
Shows all fields. If status = 'planned', shows "Start Session" button which triggers:
1. Register modal (take attendance)
2. Drill run view (drills in order, check off as you go)
3. Post-session notes field
4. "Mark as Done" button

**Add New Session modal:**
- Date (date picker, defaults today)
- Theme (text input)
- Location (text input)
- Duration (number, minutes)
- Drills section: tap "Add Drills" → opens DrillPicker modal

---

### DrillPicker.jsx — Modal

Full-screen modal with two tabs at top: **[Library]** [My Drills]

**Library tab:**
- Search bar at top
- Category filter pills (horizontal scroll): All · Warm-Up · Passing · Dribbling · Shooting · Defending · Small-Sided Games · Cool-Down
- Drill list: name, category badge, duration badge, players needed
- Tap a drill → expands to show full description + coaching points
- Green "Add to Session" button on each drill
- A green check replaces the button if already added

**My Drills tab (Custom Drills):**
- Lists all custom drills from `charter_custom_drills`
- Same expand/add behaviour as library
- "Create New Drill" button at bottom → opens **AddDrillModal**

**"Create New Drill" button is always visible** on both tabs as a floating amber button at the bottom of the DrillPicker so coaches can quickly create a drill without leaving the session planner.

---

### AddDrillModal.jsx — Custom Drill Creation

Slides up from bottom. Fields:
- Name (required, text)
- Category (selector: same 7 categories)
- Description (textarea — what does the drill look like?)
- Coaching Points (textarea — what do you say to players?)
- Duration (number, minutes)
- Players Needed (text — "8-12", "Any", "6")
- Equipment (text — "Cones, balls, bibs")

"Save Drill" button → saves to charter_custom_drills, shows in My Drills tab, auto-adds to current session.

---

### Matches.jsx — Screen 3

**Header:** "Matches" · "+" add button top right

**Season summary bar** at top (auto-calculated):
W-D-L record · Goals For · Goals Against

**Match cards** sorted by date descending:
- Date
- vs [Opponent] (Home / Away / Tournament badge)
- Score (large, bold — green if win, red if loss, amber if draw)
- Competition badge (League / Cup / Friendly / Tournament)

**Tap a match** → Match Detail page:
- Full score and details
- Appearances list (Full / Half / Sub / DNP per player)
- Goal scorers with minutes
- Assist providers
- Match notes (editable)
- "Edit" button to modify all fields

**Add Match modal:**
- Date
- Opponent name
- Home / Away / Neutral (3 buttons)
- Competition (4 buttons)
- Our score / Their score (number steppers, + and − buttons)
- Squad selector (tap players to mark appearance and type)
- Goal and assist logging per player
- Match notes
- "Save Match" button

---

### Settings.jsx — Screen 4

**Section 1 — Team Info**
- Team name
- Age group (dropdown: U6 through U18)
- Sport (Soccer / Basketball / Flag Football / Lacrosse / Other)
- State (dropdown of all 50 US states + DC)
- Home field name

**Section 2 — Season**
- Season start date
- Season end date

**Section 3 — Coach Info**
- Coach name
- License number (optional)

**Section 4 — Data**
- Export Attendance Report (generates plain text summary)
- Clear All Data (danger zone with confirmation)

**Section 5 — About**
- App name, tagline, version 1.0

---

### BottomNav.jsx

4 tabs:
- Squad (person icon) → /squad
- Sessions (clipboard icon) → /sessions
- Matches (trophy icon) → /matches
- Settings (gear icon) → /settings

Active: green accent. Inactive: muted.
Fixed bottom, max-w-[430px] centred.

---

### App.jsx

Check isOnboarded():
- false → Onboarding screen (full page, no nav)
- true → app routes + BottomNav

Default route: /squad

---

## PWA Setup

### public/manifest.json
```json
{
  "name": "Charter",
  "short_name": "Charter",
  "description": "Practice and squad management for youth soccer coaches",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#238636",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### index.html
```html
<meta name="theme-color" content="#238636" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Charter" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<link rel="manifest" href="/manifest.json" />
```

---

## vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: 'localhost', port: 3000, open: true },
  base: './',
})
```

---

## Package

```
npm install react-router-dom
```

No Supabase. No backend. No other dependencies.

---

## Key UX Rules

1. **Register screen must be fastest interaction in the app** — player list with 3-tap status, done in under 20 seconds for 12 players
2. **Green accent** throughout — sport energy, success state
3. **Offline always** — all data in localStorage, no network calls ever
4. **Medical notes are red** — always visually prominent on player cards and register
5. **Custom drills clearly labelled "Custom"** — distinct from library drills with a tag
6. **US terminology only** — "practice" not "training", "field" not "pitch", "State" not "County" or "Region"
7. **Session drill order is drag-reorderable** or at minimum can be reordered with up/down arrows
8. **FAB for adding players/sessions/matches** — fixed bottom-right, above nav bar

---

## What NOT to build

- No parent-facing features (messaging, notifications)
- No multi-coach shared access
- No video content
- No Supabase or user accounts
- No American football (different sport entirely)

---

Build the complete app with all files populated. Sample data pre-loads on first launch showing a realistic squad of 12 players, 2 sessions, and 1 match result. Must run with `npm run dev` and deploy to Replit live URL with zero configuration.
