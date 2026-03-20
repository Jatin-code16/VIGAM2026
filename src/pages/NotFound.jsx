import { useNavigate } from 'react-router-dom'
import { Grain, Particles, GoldBtn } from '../components/UI'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center', position: 'relative',
    }}>
      <Particles />
      <Grain />
      <div className="animate-burst" style={{ position: 'relative', zIndex: 2, maxWidth: 320 }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🎬</div>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700', fontSize: 64,
          textShadow: '0 0 30px #FFD700',
          marginBottom: 8,
        }}>
          404
        </div>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFF8E7', fontSize: 18, marginBottom: 8,
        }}>
          Scene Not Found!
        </div>
        <div style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFF8E766', fontSize: 15, marginBottom: 28,
        }}>
          This page got cut from the final edit.
        </div>
        <GoldBtn onClick={() => navigate('/')}>
          Back to Home 🏠
        </GoldBtn>
      </div>
    </div>
  )
}