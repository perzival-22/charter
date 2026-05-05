import { useState, useEffect } from 'react'

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('ball') // ball -> flash -> logo -> out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flash'), 900)
    const t2 = setTimeout(() => setPhase('logo'),  1400)
    const t3 = setTimeout(() => setPhase('out'),   2800)
    const t4 = setTimeout(() => onDone(),          3200)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onDone])

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--bg)', zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: phase === 'out' ? 'opacity 0.4s' : 'none',
      opacity: phase === 'out' ? 0 : 1,
      pointerEvents: phase === 'out' ? 'none' : 'auto',
    }}>
      <div style={{ position: 'relative', width: 200, height: 160, marginBottom: 24 }}>
        {/* Goal posts */}
        <svg viewBox="0 0 200 130" width="200" height="130" style={{
          position: 'absolute', top: 0, left: 0,
          opacity: phase === 'flash' || phase === 'logo' ? 1 : 0.12,
          transition: 'opacity 0.3s',
        }}>
          <rect x="10" y="20" width="5" height="90" fill="#2a2a30" rx="2"/>
          <rect x="185" y="20" width="5" height="90" fill="#2a2a30" rx="2"/>
          <rect x="10" y="20" width="180" height="5" fill="#2a2a30" rx="2"/>
          {[30,50,70,90,110,130,150,170].map(x => <line key={x} x1={x} y1="25" x2={x} y2="110" stroke="#1e1e24" strokeWidth="1"/>)}
          {[40,55,70,85,100].map(y => <line key={y} x1="15" y1={y} x2="185" y2={y} stroke="#1e1e24" strokeWidth="1"/>)}
          <rect x="0" y="110" width="200" height="3" fill="#1e1e24" rx="1"/>
        </svg>

        {/* Animated ball */}
        {phase === 'ball' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            animation: 'ballRoll 1s ease-out forwards',
            width: 40, height: 40,
          }}>
            <svg viewBox="0 0 40 40" width="40" height="40">
              <circle cx="20" cy="20" r="19" fill="#e8eaed" stroke="#1e1e24" strokeWidth="1"/>
              <polygon points="20,5 26,10 24,18 16,18 14,10" fill="#0e0e10"/>
              <polygon points="6,15 12,13 16,18 12,26 5,24" fill="#0e0e10"/>
              <polygon points="34,15 28,13 24,18 28,26 35,24" fill="#0e0e10"/>
              <polygon points="12,32 14,26 20,28 26,26 28,32 20,36" fill="#0e0e10"/>
            </svg>
          </div>
        )}

        {/* Goal flash */}
        {phase === 'flash' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(200,241,53,.35) 0%, transparent 70%)',
            animation: 'goalFlash 0.6s ease-out forwards',
            borderRadius: 8,
          }}/>
        )}
      </div>

      {/* Logo reveal */}
      <div style={{
        opacity: phase === 'logo' || phase === 'out' ? 1 : 0,
        transform: phase === 'logo' || phase === 'out' ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#0e0e10" strokeWidth="1.5" fill="none"/>
              <path d="M12 6l2 4h4l-3 3 1 4-4-3-4 3 1-4-3-3h4z" fill="#0e0e10"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 34, fontWeight: 700, letterSpacing: -1.5 }}>Charter</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(232,234,237,.4)', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1, textTransform: 'uppercase' }}>
          Run &middot; Log &middot; Know your squad
        </p>
      </div>

      <style>{`
        @keyframes ballRoll {
          0%   { transform: translateX(-80px) translateY(20px) rotate(-180deg); opacity: 0 }
          20%  { opacity: 1 }
          75%  { transform: translateX(0) translateY(0) rotate(0); opacity: 1 }
          100% { transform: translateX(0) translateY(0) rotate(0); opacity: 0 }
        }
        @keyframes goalFlash {
          0%   { opacity: 0 }
          60%  { opacity: 0 }
          80%  { opacity: 1 }
          100% { opacity: 0 }
        }
      `}</style>
    </div>
  )
}
