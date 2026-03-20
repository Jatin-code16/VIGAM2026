import { useState } from 'react'

// ============================================
// GRAIN TEXTURE OVERLAY
// ============================================
export function Grain() {
  return (
    <div
      className="animate-grain"
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
      }}
    />
  )
}

// ============================================
// FLOATING PARTICLES
// ============================================
export function Particles() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${(i % 3) + 2}px`, height: `${(i % 3) + 2}px`,
          borderRadius: '50%',
          background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFF8E7' : '#C0392B',
          left: `${(i * 5.5) % 100}%`,
          opacity: 0.3,
          animation: `floatUp ${7 + i % 5}s linear ${i * 0.7}s infinite`,
          filter: i % 3 === 0 ? 'drop-shadow(0 0 3px #FFD700)' : 'none',
        }} />
      ))}
    </div>
  )
}

// ============================================
// GOLD DIVIDER
// ============================================
export function Divider() {
  return (
    <div style={{
      textAlign: 'center', color: '#FFD700',
      fontSize: 14, margin: '10px 0',
      letterSpacing: 4, opacity: 0.7
    }}>
      ——✦——✦——
    </div>
  )
}

// ============================================
// GOLD BUTTON
// ============================================
export function GoldBtn({ children, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(90deg,#FFD700,#FFF8E7,#FFD700)'
          : '#FFD700',
        backgroundSize: '200% auto',
        animation: hovered ? 'shimmer 1s linear infinite' : 'none',
        color: '#0A0A0A',
        border: '2px solid #FFD700',
        borderRadius: 8,
        padding: '13px 20px',
        fontFamily: "'Cinzel Decorative', serif",
        fontWeight: 700,
        fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        letterSpacing: 1.5,
        boxShadow: hovered
          ? '0 0 22px #FFD700, 0 0 44px #FFD70055'
          : '0 0 10px #FFD70066',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.15s, box-shadow 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

// ============================================
// GOLD CARD
// ============================================
export function GoldCard({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${glow ? '#FFD700' : '#FFD70044'}`,
      borderRadius: 12,
      backdropFilter: 'blur(12px)',
      padding: '22px 18px',
      boxShadow: glow ? '0 0 28px #FFD70033' : 'none',
      animation: glow ? 'goldPulse 2.5s ease-in-out infinite' : 'none',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ============================================
// REEL LABEL (Chapter indicator)
// ============================================
export function ReelLabel({ number }) {
  return (
    <div style={{
      fontFamily: "'Caveat', cursive",
      color: '#FFD70077',
      fontSize: 12,
      letterSpacing: 3,
      marginBottom: 6,
      textTransform: 'uppercase'
    }}>
      Reel No. {number}
    </div>
  )
}

// ============================================
// PROGRESS DOTS
// ============================================
export function ProgressDots({ steps, current }) {
  return (
    <div style={{
      position: 'fixed', top: 14, right: 14,
      zIndex: 10, display: 'flex', gap: 5
    }}>
      {steps.map((s, i) => (
        <div key={s} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: current === s
            ? '#FFD700'
            : steps.indexOf(current) > i
              ? '#FFD70066'
              : '#FFD70022',
          transition: 'background 0.3s'
        }} />
      ))}
    </div>
  )
}

// ============================================
// BACK BUTTON
// ============================================
export function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', top: 14, left: 14, zIndex: 10,
        background: 'rgba(255,215,0,0.1)',
        border: '1px solid #FFD70044',
        color: '#FFD700',
        padding: '7px 14px',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 11,
      }}
    >
      ← Back
    </button>
  )
}

// ============================================
// GOLD INPUT
// ============================================
export function GoldInput({ value, onChange, onKeyDown, placeholder, type = 'text', maxLength }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid #FFD70055',
        borderRadius: 8,
        padding: '14px 16px',
        color: '#FFF8E7',
        fontFamily: "'Poppins', sans-serif",
        fontSize: 15,
        letterSpacing: 2,
        textTransform: type === 'password' ? 'none' : 'uppercase',
      }}
    />
  )
}