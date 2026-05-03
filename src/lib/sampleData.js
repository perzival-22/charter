import { createPlayer, createSession, createMatch, saveSettings } from './localStorage'

export function loadSampleData() {
  const today = new Date()
  const sub = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
  const add = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }

  saveSettings({
    team_name: 'Riverside FC',
    age_group: 'U10',
    state: 'CA',
    home_ground: 'Riverside Fields',
    season_start: sub(60),
    season_end: add(60),
    coach_name: 'Coach Taylor',
    sport: 'Soccer',
  })

  const players = [
    { first_name: 'Marcus', last_name: 'Rivera',   number: '1',  position: 'GK',  dob: '2016-03-12', parent_name: 'Carlos Rivera',  parent_phone: '555-0101', parent_email: '', medical_notes: '' },
    { first_name: 'Jayden', last_name: 'Thompson', number: '4',  position: 'DEF', dob: '2015-07-22', parent_name: 'Lisa Thompson',  parent_phone: '555-0102', parent_email: '', medical_notes: '' },
    { first_name: 'Amara',  last_name: 'Johnson',  number: '6',  position: 'DEF', dob: '2016-01-05', parent_name: 'Grace Johnson',  parent_phone: '555-0103', parent_email: '', medical_notes: 'Mild asthma - has inhaler' },
    { first_name: 'Tyler',  last_name: 'Chen',     number: '8',  position: 'MID', dob: '2015-09-18', parent_name: 'Wei Chen',       parent_phone: '555-0104', parent_email: '', medical_notes: '' },
    { first_name: 'Sofia',  last_name: 'Martinez', number: '10', position: 'MID', dob: '2016-04-30', parent_name: 'Ana Martinez',   parent_phone: '555-0105', parent_email: '', medical_notes: '' },
    { first_name: 'Noah',   last_name: 'Williams', number: '7',  position: 'FWD', dob: '2015-11-14', parent_name: 'James Williams', parent_phone: '555-0106', parent_email: '', medical_notes: '' },
    { first_name: 'Layla',  last_name: 'Brown',    number: '9',  position: 'FWD', dob: '2016-02-28', parent_name: 'Donna Brown',    parent_phone: '555-0107', parent_email: '', medical_notes: '' },
    { first_name: 'Ethan',  last_name: 'Davis',    number: '3',  position: 'DEF', dob: '2015-08-09', parent_name: 'Paul Davis',     parent_phone: '555-0108', parent_email: '', medical_notes: '' },
    { first_name: 'Mia',    last_name: 'Garcia',   number: '11', position: 'FWD', dob: '2016-06-17', parent_name: 'Rosa Garcia',    parent_phone: '555-0109', parent_email: '', medical_notes: '' },
    { first_name: 'Liam',   last_name: 'Wilson',   number: '5',  position: 'MID', dob: '2015-12-03', parent_name: 'Kate Wilson',    parent_phone: '555-0110', parent_email: '', medical_notes: '' },
    { first_name: 'Zoe',    last_name: 'Anderson', number: '2',  position: 'DEF', dob: '2016-05-21', parent_name: 'Beth Anderson',  parent_phone: '555-0111', parent_email: '', medical_notes: '' },
    { first_name: 'Caleb',  last_name: 'Lee',      number: '12', position: 'MID', dob: '2015-10-08', parent_name: 'John Lee',       parent_phone: '555-0112', parent_email: '', medical_notes: '' },
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
    match_notes: 'Great team performance. Layla was excellent with 2 goals. Defended well in the second half when they pushed forward. Need to work on set pieces.',
  })
}
