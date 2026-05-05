// Inline SVG icon component — no external deps, renders cleanly in any context
export default function Ic({ n, s = 20, c = 'currentColor' }) {
  const p = {
    squad: <><circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.5" fill="none"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/><circle cx="17" cy="8" r="2.5" stroke={c} strokeWidth="1.5" fill="none"/><path d="M20 20c0-3.5-1.5-5-3-5.5" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/></>,
    sessions: <><rect x="4" y="3" width="14" height="18" rx="2" stroke={c} strokeWidth="1.5" fill="none"/><path d="M8 8h6M8 12h4M8 16h5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
    matches: <><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill="none"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
    settings: <><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5" fill="none"/><path d="M12 2v2M12 20v2M4.22 4.22l1.41 1.41M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.42-1.42" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
    plus: <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/>,
    x: <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>,
    check: <path d="M5 12l4 4L19 7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chevron: <path d="M9 6l6 6-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    back: <path d="M19 12H5M12 5l-7 7 7 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    search: <><circle cx="10" cy="10" r="6" stroke={c} strokeWidth="1.5" fill="none"/><path d="M16 16l3.5 3.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
    trash: <><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M10 11v6M14 11v6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
    up: <path d="M12 19V5M5 12l7-7 7 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    down: <path d="M12 5v14M19 12l-7 7-7-7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    warn: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={c} strokeWidth="1.5" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill={c} stroke={c}/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/></>,
    export: <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006 6l1.51-1.51a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>,
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {p[n] || null}
    </svg>
  )
}
