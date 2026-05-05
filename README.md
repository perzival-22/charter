# Charter

**Practice and squad management for youth sports coaches.**

Charter is an offline-first Progressive Web App (PWA) built for coaches who want a fast, no-fuss way to plan sessions, take attendance, log matches, and track every player's development — with zero internet required on the sideline.

---

## What it does

### Squad
- Add and manage your full roster with jersey numbers, positions, date of birth, and parent contacts
- Flag players with medical notes so they're always visible at a glance
- View last-5-session attendance dots per player on the roster

### Sessions
- Plan sessions with a date, theme, duration, and location
- Build a drill plan from a curated drill library (passing, shooting, pressing, SSGs, and more) or create your own custom drills
- Run sessions with an interactive drill checklist
- Take a full register (present / late / absent) per player
- Log post-session notes and mark sessions complete

### Matches
- Log every match with opponent, date, venue (home/away), and competition type
- Record the score with a tap-based stepper
- Track appearances (starter / sub), goals, and assists per player
- View season summary: W-D-L record, goals for, and goals against

### Player Profiles
- Full editable profile: name, kit number, position, DOB, parent/guardian contacts
- Attendance tab: per-session history and attendance percentage
- Matches tab: career appearances, goals, and assists

### Offline & Data
- Works completely offline — no account, no server, no internet needed
- All data stored locally via `localStorage`
- Export a full JSON backup and restore it on any device
- Export an attendance report as a `.txt` file
- Splash screen with animated ball-into-goal intro
- PWA install prompt for Android Chrome ("Add to Home Screen")

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | **React 19** (functional components, hooks) |
| Build tool | **Vite 8** (with Rolldown bundler) |
| Styling | **CSS custom properties** (design tokens, no Tailwind) |
| Fonts | **Space Grotesk**, **IBM Plex Sans**, **IBM Plex Mono** (Google Fonts) |
| Routing | **React Router v7** (HashRouter for static hosting) |
| Offline | Manual **Service Worker** (`public/sw.js`) — cache-first for assets, network-first for navigation |
| Data | **localStorage** — fully offline, no backend |
| Icons | Inline SVG component (`src/components/Ic.jsx`) |
| Hosting | **Netlify** (static, `dist/`) |
| Language | **JavaScript** (JSX) |

---

## Project structure

```
src/
  App.jsx              — root: onboarding, splash, routing, update banner
  index.css            — full design token system + utility classes
  components/
    BottomNav.jsx      — tab navigation
    Ic.jsx             — inline SVG icon component
    Splash.jsx         — animated intro screen
    RegisterModal.jsx  — fullscreen attendance taking
    DrillPicker.jsx    — drill search and selection sheet
    AddDrillModal.jsx  — custom drill creator
  pages/
    Squad.jsx          — roster + attendance overview
    Sessions.jsx       — session planning and logging
    Matches.jsx        — match tracking and season stats
    Settings.jsx       — team setup, backup, and restore
    PlayerProfile.jsx  — individual player editing and history
  lib/
    localStorage.js    — typed CRUD helpers for all data
    sampleData.js      — demo squad loader for onboarding
    drillLibrary.js    — built-in drill catalogue
public/
  sw.js                — service worker (cache-first PWA)
  manifest.json        — PWA web app manifest
```

---

## Getting started (development)

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The `dist/` folder is ready to deploy to any static host (Netlify, Vercel, GitHub Pages).

---

## Live app

Hosted at: **[glittering-capybara-2bffda.netlify.app](https://glittering-capybara-2bffda.netlify.app)**

---

## License

MIT
