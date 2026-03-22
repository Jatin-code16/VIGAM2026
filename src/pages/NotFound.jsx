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
      <div className="animate-burst" style={{
        position: 'relative', zIndex: 2, maxWidth: 320,
      }}>
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

        {/* Contact + Credit */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFF8E733', fontSize: 11, marginBottom: 10,
              }}>
                Facing any issue? Contact us!
              </p>
              <a href="https://wa.me/916232730128?text=Hi%20Jatin!%20I%20need%20help%20with%20VIGAM%202026%20registration." 
              target="_blank"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFD70066', fontSize: 11,
                textDecoration: 'none', display: 'block', marginBottom: 4,
              }}>
                
                WhatsApp: +91 6232730128
              </a>              
              <a href="tel:+916232730128" style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFD70066', fontSize: 11,
                textDecoration: 'none', display: 'block', marginBottom: 4,
              }}>
                📱 +91 6232730128
              </a>
              <a href="mailto:jatinnaiknawa2@gmail.com" style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFD70066', fontSize: 11,
                textDecoration: 'none', display: 'block', marginBottom: 12,
              }}>
                📧 jatinnaiknawa2@gmail.com
              </a>
              <p style={{
                fontFamily: "'Caveat', cursive",
                color: '#FFD70033', fontSize: 12,
              }}>
                Designed & Developed by Jatin Naik 🎬
                <br />With ❤️ for VIGAM 2026
              </p>
          </div>
      </div>
    </div>
  )
}