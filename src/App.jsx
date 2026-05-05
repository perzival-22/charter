import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isOnboarded, setOnboarded } from './lib/localStorage'
import { loadSampleData } from './lib/sampleData'
import BottomNav from './components/BottomNav'
import Splash from './components/Splash'
import Squad from './pages/Squad'
import Sessions from './pages/Sessions'
import Matches from './pages/Matches'
import Settings from './pages/Settings'
import PlayerProfile from './pages/PlayerProfile'

function Onboarding({ onDone }) {
  function handleStartFresh() { setOnboarded(); onDone() }
  function handleLoadDemo() { loadSampleData(); setOnboarded(); onDone() }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: 'var(--bg)', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(200,241,53,.3)' }}>
        <svg viewBox="0 0 24 24" width="38" height="38" fill="none"><circle cx="12" cy="12" r="10" stroke="#0e0e10" strokeWidth="1.5" fill="none"/><path d="M12 6l2 4h4l-3 3 1 4-4-3-4 3 1-4-3-3h4z" fill="#0e0e10"/></svg>
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 40, letterSpacing: '-1.5px', lineHeight: 1 }}>Charter</div>
      <div style={{ fontSize: 14, color: 'var(--txt2)', marginTop: 10, fontStyle: 'italic' }}>For coaches who show up every Saturday.</div>

      <div style={{ width: '100%', maxWidth: 320, margin: '40px 0 32px' }}>
        {[
          ['Plan your practice in minutes'],
          ['Take attendance in 30 seconds'],
          ['Track every player\'s development'],
          ['Works offline - no signal needed'],
        ].map(([t]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border2)' }}>
            <span style={{ fontSize: 15, fontWeight: 500, textAlign: 'left' }}>{t}</span>
          </div>
        ))}
      </div>

      <button onClick={handleStartFresh} style={{ width: '100%', maxWidth: 320, padding: '16px', background: 'var(--lime)', color: '#0e0e10', fontSize: 17, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,241,53,.3)', marginBottom: 12 }}>
        Set Up My Team
      </button>
      <button onClick={handleLoadDemo} style={{ width: '100%', maxWidth: 320, padding: '13px', background: 'transparent', color: 'var(--txt2)', fontSize: 14, fontWeight: 600, borderRadius: 12, border: '1px solid var(--border)' }}>
        Explore with Demo Squad
      </button>
      <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 20, maxWidth: 280 }}>
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
    window.addEventListener('charter-sw-update', handler)
    return () => window.removeEventListener('charter-sw-update', handler)
  }, [])

  const applyUpdate = () => {
    if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    setShow(false)
  }

  if (!show) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'var(--lime)', color: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: 13, fontWeight: 600, gap: 12 }}>
      <span>New version available</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={applyUpdate} style={{ background: '#0e0e10', color: 'var(--lime)', padding: '4px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Update now</button>
        <button onClick={() => setShow(false)} style={{ background: 'transparent', color: 'rgba(14,14,16,0.6)', fontSize: 18, lineHeight: 1, border: 'none', cursor: 'pointer' }}>x</button>
      </div>
    </div>
  )
}

function InstallPrompt() {
  const [dp, setDp] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setDp(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const install = () => {
    if (!dp) return
    dp.prompt()
    dp.userChoice.then((c) => { if (c.outcome === 'accepted') setShow(false) })
  }

  if (!show || !dp) return null
  return (
    <div style={{ position: 'fixed', bottom: 88, left: 16, right: 16, zIndex: 900, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="10" stroke="#0e0e10" strokeWidth="1.5" fill="none"/><path d="M12 6l2 4h4l-3 3 1 4-4-3-4 3 1-4-3-3h4z" fill="#0e0e10"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Add Charter to Home Screen</div>
        <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>Works offline, no internet needed</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={install} style={{ background: 'var(--lime)', color: '#0e0e10', padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Install</button>
        <button onClick={() => setShow(false)} style={{ background: 'transparent', color: 'var(--txt2)', fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Not now</button>
      </div>
    </div>
  )
}

function FeedbackButton() {
  const location = useLocation()
  const openFeedback = () => {
    const subject = encodeURIComponent('[Charter Beta] Feedback - ' + location.pathname)
    const body = encodeURIComponent('Screen: ' + location.pathname + '\nTime: ' + new Date().toLocaleString('en-US') + '\nApp: Charter v2.0 Beta\n\n---\nFeedback:\n\n')
    window.location.href = 'mailto:kelvinmusiomi99@gmail.com?subject=' + subject + '&body=' + body
  }
  return (
    <button onClick={openFeedback} title="Send beta feedback" style={{ position: 'fixed', bottom: 90, right: 16, zIndex: 800, width: 40, height: 40, borderRadius: '50%', background: 'var(--bg2)', border: '1.5px solid var(--border)', color: 'var(--txt2)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.35)', cursor: 'pointer' }}>
      ?
    </button>
  )
}

function Page({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [onboarded, setOnboardedState] = useState(isOnboarded)
  const [splashDone, setSplashDone] = useState(false)

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
        {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
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
