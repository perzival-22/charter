# Charter — Build Log

**Project:** Charter — Youth Sports Coach Planner
**Stack:** React 18 + Vite + Tailwind CSS + localStorage
**Platform:** PWA (mobile-first, installable on iPhone / Android)
**Market:** United States (youth soccer, volunteer coaches)
**Started:** 2026-05-02

---

## Project Status

| Item | Status |
|------|--------|
| PRD.md | ✅ Done |
| BUILD_PROMPT.md | ✅ Done |
| BUILDLOG.md | ✅ Done |
| GitHub repo | ⏳ Pending — create on github.com |
| Replit build | ⏳ Pending — paste BUILD_PROMPT.md into Replit Agent |
| Local folder | C:\Users\kelvi\Documents\Claude\Projects\Charter |

---

## Pre-Build Checklist

- [ ] Create GitHub repo: `charter-app` (public or private)
- [ ] Open Replit → New Repl → choose React (Vite) template
- [ ] Paste full contents of BUILD_PROMPT.md into Replit Agent
- [ ] Wait for build to complete, then test all 4 screens
- [ ] Push Replit code to GitHub repo
- [ ] Clone to local: `C:\Users\kelvi\Documents\Claude\Projects\Charter`
- [ ] Run locally: `npm install` → `npm run dev`

---

## Build Decisions

### Why no Supabase?
All data lives in `localStorage`. The app is designed for offline use on a soccer field with no signal. Supabase would add complexity and a network dependency that breaks the core use case. Phase 2 (shared roster, club plan) is when sync makes sense.

### Why a local JS drill library?
Shipping 70 drills as a JS constant in `drillLibrary.js` means zero API calls, zero loading state, works offline on day one. The library is complete enough for an MVP — coaches can add their own drills with the custom drill input on Screen 2.

### Why "State" not "Governing body"?
The app is US-only for MVP. A 50-state dropdown is more recognizable and useful to an American coach than a "governing body" field which implies a more international context.

### Color theme
Green `#238636` — the color of the field. Works well in dark mode and reads clearly in bright sunlight.

---

## Screen Summary

| Screen | Purpose | Key Feature |
|--------|---------|-------------|
| Squad | Roster + quick attendance | Tap-to-mark register |
| Sessions | Practice planner | 70-drill library + custom drill input |
| Matches | Game log + season stats | Goals, assists, appearances per player |
| Settings | Team info + export | 50-state dropdown, coach details |

---

## Data Structure (localStorage)

| Key | Contents |
|-----|---------|
| `charter_players` | Array of player objects |
| `charter_sessions` | Array of session objects |
| `charter_matches` | Array of match objects |
| `charter_custom_drills` | Array of coach-created drills |
| `charter_settings` | Team settings object |
| `charter_onboarded` | Boolean flag |

---

## Drill Library Breakdown

| Category | Count |
|----------|-------|
| Warm-Up | 10 |
| Passing & Receiving | 15 |
| Dribbling & Ball Control | 12 |
| Shooting & Finishing | 10 |
| Defending | 8 |
| Small-Sided Games | 10 |
| Cool-Down / Stretching | 5 |
| **Total** | **70** |

---

## Phase 2 Roadmap

- [ ] Parent communication (practice reminders via SMS/email)
- [ ] Shared assistant coach access
- [ ] Tournament bracket tracker
- [ ] Season summary PDF (end-of-season parent meeting report)
- [ ] Multi-sport support (basketball, lacrosse, flag football)
- [ ] State association compliance export (USSF session log format)
- [ ] Supabase sync for Club plan (shared roster, cloud backup)

## Phase 3 Roadmap

- [ ] Video drill library (short clips per drill)
- [ ] Player development pathways (age-appropriate skill milestones)
- [ ] Club-wide analytics (attendance trends, participation rates)
- [ ] Integration with US Soccer national coaching curriculum
- [ ] White-label League plan for district-wide rollout

---

## Success Metrics (90-day targets)

| Metric | Target |
|--------|--------|
| Registered coaches | 500 |
| Active weekly users | 200 |
| Sessions logged | 2,000+ |
| Club plan conversions | 20 |
| App Store rating | 4.5+ |

---

## Links

- **Local folder:** `C:\Users\kelvi\Documents\Claude\Projects\Charter`
- **GitHub repo:** TBD — create at github.com/new
- **Replit:** TBD — build from BUILD_PROMPT.md
- **Related apps:** Grain (film tracker), FieldNotes (job manager), The Lobie (life admin)
- **Pinned for later:** Stockroom (#5 from ideas brainstorm — inventory management)
