import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isOnboarded, setOnboarded } from './lib/localStorage'
import { loadSampleData } from './lib/sampleData'
import BottomNav from './components/BottomNav'
import Squad from './pages/Squad'
import Sessions from './pages/Sessions'
import Matches from './pages/Matches'
import Settings from './pages/Settings'
import PlayerProfile from './pages/PlayerProfile'

function Onboarding({ onDone }) {
  function handleStartFresh() { setOnboarded(); onDone() }
  function handleLoadDemo() { loadSampleData(); setOnboarded(); onDone() }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: "var(--color-primary)", textAlign: "center" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(35,134,54,0.4)" }}>
          {"\u26BD"}
        </div>
        <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: "-1.5px", lineHeight: 1 }}>Charter</div>
        <div style={{ fontSize: 15, color: "var(--color-text-muted)", marginTop: 10, fontStyle: "italic" }}>
          For coaches who show up every Saturday.
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 320, margin: "40px 0 36px" }}>
        {[
          { e: "\u{1F4CB}", t: "Plan your practice in minutes" },
          { e: "\u2705", t: "Take attendance in 30 seconds" },
          { e: "\u{1F4CA}", t: "Track every player's development" },
          { e: "\u{1F4F5}", t: "Works offline - no signal needed" },
        ].map(({ e, t }) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 0", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{e}</span>
            <span style={{ fontSize: 15, fontWeight: 500, textAlign: "left" }}>{t}</span>
          </div>
        ))}
      </div>

      <button onClick={handleStartFresh} style={{ width: "100%", maxWidth: 320, padding: "16px", background: "var(--color-accent)", color: "#fff", fontSize: 18, fontWeight: 700, borderRadius: 12, boxShadow: "0 4px 20px rgba(35,134,54,0.4)", marginBottom: 12 }}>
        Set Up My Team
      </button>
      <button onClick={handleLoadDemo} style={{ width: "100%", maxWidth: 320, padding: "13px", background: "transparent", color: "var(--color-text-muted)", fontSize: 14, fontWeight: 600, borderRadius: 12, border: "1px solid var(--color-border)" }}>
        Explore with Demo Squad
      </button>
      <p style={{ fontSize: 11, color: "var(--color-border)", marginTop: 20, maxWidth: 280 }}>
        All data stays on your device - No account needed - Works offline
      </p>
    </div>
  )
}

function UpdateBanner() {
  const [show, setShow] = useState(false)
  const [reg, setReg] = useState(null)

  useEffect(() => {
    const handler = (e) => { setReg(e.detail); setShow(true) }
    window.addEventListener("charter-sw-update", handler)
    return () => window.removeEventListener("charter-sw-update", handler)
  }, [])

  const applyUpdate = () => {
    if (reg && reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" })
    setShow(false)
  }

  if (!show) return null
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, fontWeight: 600, gap: 12 }}>
      <span>New version available</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={applyUpdate} style={{ background: "#fff", color: "var(--color-accent)", padding: "4px 12px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Update now</button>
        <button onClick={() => setShow(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1 }}>x</button>
      </div>
    </div>
  )
}

function InstallPrompt() {
  const [dp, setDp] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setDp(e); setShow(true) }
    window.addEventListener("beforeinstallprompt", h)
    return () => window.removeEventListener("beforeinstallprompt", h)
  }, [])

  const install = () => {
    if (!dp) return
    dp.prompt()
    dp.userChoice.then((c) => { if (c.outcome === "accepted") setShow(false) })
  }

  if (!show || !dp) return null
  return (
    <div style={{ position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 900, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 28 }}>{"\u26BD"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Add Charter to Home Screen</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>Works offline, no internet needed</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={install} style={{ background: "var(--color-accent)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontWeight: 700, fontSize: 12 }}>Install</button>
        <button onClick={() => setShow(false)} style={{ background: "transparent", color: "var(--color-text-muted)", fontSize: 11, fontWeight: 500 }}>Not now</button>
      </div>
    </div>
  )
}

function FeedbackButton() {
  const location = useLocation()
  const openFeedback = () => {
    const subject = encodeURIComponent("[Charter Beta] Feedback - " + location.pathname)
    const body = encodeURIComponent("Screen: " + location.pathname + "\nTime: " + new Date().toLocaleString("en-US") + "\nApp: Charter v1.0 Beta\n\n---\nFeedback:\n\n")
    window.location.href = "mailto:kelvinmusiomi99@gmail.com?subject=" + subject + "&body=" + body
  }
  return (
    <button onClick={openFeedback} title="Send beta feedback" style={{ position: "fixed", bottom: 88, right: 16, zIndex: 800, width: 44, height: 44, borderRadius: "50%", background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.35)", cursor: "pointer" }}>
      ?
    </button>
  )
}

function Page({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="page-content" style={{ paddingBottom: 0, display: "flex", flexDirection: "column", flex: 1 }}>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [onboarded, setOnboardedState] = useState(isOnboarded)

  if (!onboarded) {
    return (
      <div className="app-shell">
        <Onboarding onDone={() => setOnboardedState(true)} />
      </div>
    )
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <UpdateBanner />
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<Navigate to="/squad" replace />} />
          <Route path="/squad"    element={<Page><Squad /></Page>} />
          <Route path="/sessions" element={<Page><Sessions /></Page>} />
          <Route path="/matches"  element={<Page><Matches /></Page>} />
          <Route path="/settings" element={<Page><Settings /></Page>} />
          <Route path="/player/:id" element={<PlayerProfile />} />
        </Routes>
        <FeedbackButton />
      </div>
    </HashRouter>
  )
}
