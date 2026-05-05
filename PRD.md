# Charter — Product Requirements Document

**Version:** 1.0
**Date:** 2026-05-02
**Status:** Pre-build
**Market:** United States

---

## Overview

Charter is a mobile-first PWA for volunteer youth sports coaches in the United States. It replaces paper registers, notebook session plans, and WhatsApp chaos with a single offline-first app that works on a sideline with no signal.

**Tagline:** "Run the session. Log the session. Know your squad."

**Primary sport:** Youth soccer (most universal US youth sport)
**Platform:** PWA (installable on iPhone / Android home screen)
**Stack:** React + Vite + Tailwind CSS, localStorage only — fully offline

---

## The Problem

There are millions of volunteer youth sports coaches across the United States. Most are parents who stepped up because nobody else would. They show up every Saturday morning with a half-formed plan, a paper register they never finish, and a group chat they barely manage.

The admin around coaching is scattered, repetitive, and never done properly:
- Session plans are written in a notes app and forgotten after the session
- Attendance is tracked on paper scraps or not at all
- Player development notes exist only in the coach's head
- Match results live in a WhatsApp message or a photo of a scoreboard
- When a parent asks why their kid isn't getting game time, the coach has no evidence

Charter solves all five of these in one offline app.

---

## Target User

**Primary: "Coach Mike" — volunteer youth soccer coach, USA**

- Age 28–52, usually a parent volunteer or young coach building experience
- Coaching U6s through U16s, one or two practices per week + weekend game
- Has a basic USSF (US Soccer) or state association coaching license
- Tech comfort: confident with smartphone, uses apps daily, not a developer
- Current tools: paper notebook, notes app, WhatsApp group, maybe a Google Sheet
- Personal budget: $0 for coaching tools, but the club might pay $10–15/month
- Pain: admin takes longer than it should, nothing is in one place

**Start with:** Youth soccer (ages 6–16, recreational and travel leagues)
**Phase 2 expansion:** Basketball, flag football, lacrosse, volleyball, baseball

---

## Four Core Screens

### Screen 1 — Squad
Player roster management and quick attendance register.

### Screen 2 — Sessions
Practice planner with built-in drill library (70 drills) + custom drill input.

### Screen 3 — Matches
Game log with results, appearances, and season stats.

### Screen 4 — Settings
Team info, state, season dates, export options.

---

## Data Models

### Player object
```
id, first_name, last_name, number (jersey), position,
dob, parent_name, parent_phone, parent_email,
medical_notes, status ('active'|'inactive'),
created_at
```

### Session object
```
id, date, theme, location, duration_minutes,
drill_ids (array of drill IDs from library + custom),
custom_drills_used (array of custom drill objects),
attendance (array of { player_id, status: 'present'|'absent'|'late' }),
post_session_notes, status ('planned'|'done'),
created_at
```

### Match object
```
id, date, opponent, home_away ('home'|'away'|'neutral'),
competition ('league'|'cup'|'friendly'|'tournament'),
our_score, their_score,
appearances (array of { player_id, played: 'full'|'half'|'sub'|'dnp' }),
goals (array of { player_id, minute }),
assists (array of { player_id, minute }),
match_notes, created_at
```

### Custom drill object
```
id, name, category, description, coaching_points,
duration_minutes, players_needed, equipment,
created_at
```

### Settings object
```
team_name, age_group, sport, state,
home_ground, season_start, season_end,
coach_name, license_number
```

### localStorage keys
- `charter_players`
- `charter_sessions`
- `charter_matches`
- `charter_custom_drills`
- `charter_settings`
- `charter_onboarded`

---

## Built-in Drill Library (70 drills, 7 categories)

All drills ship as a local JS constant — no database, no API.

Categories:
1. Warm-Up (10 drills)
2. Passing & Receiving (15 drills)
3. Dribbling & Ball Control (12 drills)
4. Shooting & Finishing (10 drills)
5. Defending (8 drills)
6. Small-Sided Games (10 drills)
7. Cool-Down / Stretching (5 drills)

Each drill has: id, name, category, description, coaching_points, duration_minutes, players_needed, equipment, age_suitability.

### Custom Drill Input
Coaches can add their own drills via a form on Screen 2. Custom drills have the same fields as built-in drills and are saved to `charter_custom_drills` in localStorage. They appear in the drill picker alongside built-in drills, clearly labelled "Custom."

---

## Design Principles

1. **Works offline always** — pitches have no signal, non-negotiable
2. **Sideline speed** — taking attendance must be faster than paper
3. **Thumb-friendly** — large tap targets, minimal typing during a session
4. **US terminology** — "soccer," "State," "practice" not "training," "field" not "pitch"
5. **No learning curve** — usable by a first-time coach on day one
6. **Dark and clean** — works in bright sunlight on a phone screen

---

## Monetisation

| Plan | Price | Features |
|------|-------|---------|
| Free | $0 | 1 coach, 1 team, full features |
| Club | $12/month | Up to 10 coaches, shared roster, club branding |
| League | Custom | District-wide or league-wide rollout, white label |

Free plan drives individual coach adoption. Club plan sells to the club director or registrar. League plan is the long-term revenue.

---

## US Youth Sports Market Context

- US Youth Soccer has ~3 million registered players and hundreds of thousands of volunteer coaches
- AYSO (American Youth Soccer Organization) alone has 50,000+ volunteer coaches
- US Lacrosse, USA Basketball, Little League Baseball all have similar volunteer coach populations
- No app currently targets this workflow specifically — TeamSnap does scheduling and communication but not session planning or player development

---

## Phase 2 Roadmap

- Parent communication (practice reminders, attendance confirmations)
- Shared assistant coach access
- Tournament bracket tracker
- Season summary report (PDF for end-of-season parent meeting)
- Multi-sport support (basketball, lacrosse, flag football)
- State association compliance export (USSF session log format)

## Phase 3

- Video drill library (short clips per drill)
- Player development pathways (age-appropriate skill milestones)
- Club-wide analytics (attendance trends, participation rates)
- Integration with US Soccer national coaching curriculum

---

## Success Metrics (90 days)

| Metric | Target |
|--------|--------|
| Registered coaches | 500 |
| Active weekly users | 200 |
| Sessions logged | 2,000+ |
| Club plan conversions | 20 |
| App Store rating | 4.5+ |

---

**GitHub repo:** TBD
**Supabase:** Not needed for MVP
**Live URL:** TBD (Replit deployment)
