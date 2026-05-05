# Charter — Squad Management PWA

**Tagline:** "Run the session. Log the session. Know your squad."

A mobile-first Progressive Web App for volunteer youth soccer coaches in the US.

## Tech Stack
- React 18 + Vite + React Router v6 (HashRouter)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- 100% offline — localStorage only, no backend, no API calls
- PWA: manifest.json + Apple meta tags

## Architecture
- **Port:** 5000 (Vite dev server, host 0.0.0.0)
- **Routing:** HashRouter (works with Vite's `base: './'`)
- **Storage:** localStorage keys prefixed with `charter_`

## Project Structure
```
src/
  lib/
    localStorage.js     — all CRUD helpers + uuid
    drillLibrary.js     — 70 built-in drills constant
    sampleData.js       — demo squad + sessions loader
  pages/
    Squad.jsx           — roster management + register
    Sessions.jsx        — session planner + drill run
    Matches.jsx         — match log + results
    Settings.jsx        — team info, export, clear data
    PlayerProfile.jsx   — player detail (info/attendance/matches tabs)
  components/
    BottomNav.jsx       — 4-tab fixed nav
    PlayerCard.jsx      — expandable player card with attendance %
    DrillPicker.jsx     — fullscreen drill browser modal
    AddPlayerModal.jsx  — add player sheet
    AddDrillModal.jsx   — custom drill creation sheet
    Icons.jsx           — SVG icon components
  App.jsx               — onboarding gate + HashRouter routes
  main.jsx
  index.css             — CSS variables, global styles
public/
  manifest.json         — PWA manifest
index.html              — PWA meta tags
```

## Data Models
All stored in localStorage:
- `charter_players` — Player objects (id, name, number, position, dob, parent info, medical_notes, status)
- `charter_sessions` — Session objects (id, date, theme, location, duration, drills[], attendance[], notes, status)
- `charter_matches` — Match objects (id, date, opponent, home/away, score, appearances[], goals[], assists[], notes)
- `charter_custom_drills` — Custom drill objects
- `charter_settings` — Team/coach settings
- `charter_onboarded` — Boolean flag for onboarding

## Color Palette (Dark theme)
- Primary bg: `#0d1117`
- Surface: `#161b22`, Surface-2: `#21262d`
- Accent (green): `#238636` / `#2ea043`
- Warning (amber): `#d29922`
- Danger (red): `#da3633`
- Blue: `#388bfd`
- Purple: `#8957e5`

## Key Features
- Onboarding screen with demo data auto-load
- Squad roster with jersey number badges, position pills, attendance %
- Quick register modal (3-tap per player: Present/Late/Absent)
- Session planner with drill picker (70 library + custom drills)
- Drill run mode (check off drills during practice)
- Match log with W-D-L season bar, goals/assists tracking
- Player profiles with attendance history and match record
- Settings with attendance export and data clear
