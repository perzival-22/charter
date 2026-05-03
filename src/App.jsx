import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isOnboarded, setOnboarded } from './lib/localStorage'
import { loadSampleData } from './lib/sampleData'
import BottomNav from './components/BottomNav'
import Squad from './pages/Squad'
import Sessions from './pages/Sessions'
import Matches from './pages/Matches'
import Settings from './pages/Settings'
import PlayerProfile from './pages/PlayerProfile'

function Onboarding({ onDone }) {
  function handleStart() {
    loadSampleData()
    setOnboarded()
    onDone()
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--color-primary)',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(35,134,54,0.4)',
        }}>
          ⚽
        </div>
        <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: '-1.5px', lineHeight: 1 }}>Charter</div>
        <div style={{ fontSize: 15, color: 'var(--color-text-muted)', marginTop: 10, fontStyle: 'italic' }}>
          For coaches who show up every Saturday.
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 320, margin: '48px 0' }}>
        {[
          { emoji: '📋', text: 'Plan your practice in minutes' },
          { emoji: '✅', text: 'Take attendance in 30 seconds' },
          { emoji: '📊', text: 'Track every player\'s development' },
        ].map(({ emoji, text }) => (
          <div key={text} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 0',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{emoji}</span>
            <span style={{ fontSize: 16, fontWeight: 500, textAlign: 'left' }}>{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '16px',
          background: 'var(--color-accent)',
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(35,134,54,0.4)',
        }}
      >
        Get Started
      </button>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 16 }}>
        Demo squad loaded automatically. All data stays on your device.
      </p>
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
        <Routes>
          <Route path="/" element={<Navigate to="/squad" replace />} />
          <Route path="/squad" element={<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><div className="page-content" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', flex: 1 }}><Squad /></div><BottomNav /></div>} />
          <Route path="/sessions" element={<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><div className="page-content" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', flex: 1 }}><Sessions /></div><BottomNav /></div>} />
          <Route path="/matches" element={<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><div className="page-content" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', flex: 1 }}><Matches /></div><BottomNav /></div>} />
          <Route path="/settings" element={<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><div className="page-content" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', flex: 1 }}><Settings /></div><BottomNav /></div>} />
          <Route path="/player/:id" element={<PlayerProfile />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
