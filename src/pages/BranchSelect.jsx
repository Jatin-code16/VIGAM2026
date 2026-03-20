import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grain, Particles, GoldBtn, ReelLabel, BackBtn, ProgressDots } from '../components/UI'

const BRANCHES = [
  { id: 'IT', label: 'Information Technology', icon: '🖥️', tagline: 'The Builders' },
  { id: 'Cyber', label: 'Cyber Security', icon: '🔐', tagline: 'The Guardians' },
  { id: 'DS', label: 'Data Science', icon: '📊', tagline: 'The Analysts' },
  { id: 'MCA', label: 'MCA', icon: '🎓', tagline: 'The Masters' },
]

const STEPS = ['branch', 'verify', 'profile', 'photo', 'superlative']

function BranchCard({ branch, selected, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? 'rgba(255,215,0,0.15)'
          : hovered ? 'rgba(255,215,0,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected || hovered ? '#FFD700' : '#FFD70033'}`,
        borderRadius: 10, padding: '16px 10px',
        textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.25s',
        transform: selected ? 'scale(1.05)' : hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 20px #FFD70066'
          : hovered ? '0 0 10px #FFD70033' : 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 5 }}>{branch.icon}</div>
      <div style={{
        fontFamily: "'Cinzel Decorative', serif",
        color: '#FFD700', fontSize: 9,
        fontWeight: 700, letterSpacing: 0.5, marginBottom: 3,
      }}>
        {branch.id}
      </div>
      <div style={{
        fontFamily: "'Poppins', sans-serif",
        color: '#FFF8E7aa', fontSize: 9, marginBottom: 2,
      }}>
        {branch.label}
      </div>
      <div style={{
        fontFamily: "'Caveat', cursive",
        color: '#FFD70077', fontSize: 12,
      }}>
        {branch.tagline}
      </div>
    </div>
  )
}

export default function BranchSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const handleSelect = (branch) => {
    setSelected(branch.id)
    sessionStorage.setItem('selectedBranch', branch.id)
    setTimeout(() => navigate('/verify'), 400)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      fontFamily: "'Poppins', sans-serif", overflowX: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', position: 'relative',
    }}>
      <Particles />
      <Grain />
      <BackBtn onClick={() => navigate('/')} />
      <ProgressDots steps={STEPS} current="branch" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 360 }}>
        <ReelLabel number={1} />

        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700',
          fontSize: 'clamp(16px, 5vw, 26px)',
          textAlign: 'center', marginBottom: 6,
          textShadow: '0 0 20px #FFD70055',
        }}>
          Kaun si duniya se ho tum?
        </h2>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          color: '#FFF8E777', fontSize: 12,
          marginBottom: 24, textAlign: 'center',
        }}>
          Select your branch to enter the VIGAM universe
        </p>

        {/* Branch Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10, width: '100%',
        }}>
          {BRANCHES.map(branch => (
            <BranchCard
              key={branch.id}
              branch={branch}
              selected={selected === branch.id}
              onClick={() => handleSelect(branch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}