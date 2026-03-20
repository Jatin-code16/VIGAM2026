import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Grain, Particles, Divider, GoldBtn } from '../components/UI'

export default function Splash() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(0)

  // Staggered entrance animation
  useEffect(() => {
    const timers = [300, 900, 1600, 2300, 3000].map((t, i) =>
      setTimeout(() => setPhase(i + 1), t)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Live registration count
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_registered', true)
      setCount(count || 0)
    }
    fetchCount()

    const channel = supabase
      .channel('splash-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' },
        () => fetchCount())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      fontFamily: "'Poppins', sans-serif", overflowX: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 28, textAlign: 'center', position: 'relative',
    }}>
      <Particles />
      <Grain />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 360 }}>

        {/* Tagline */}
        {phase >= 1 && (
          <div className="animate-fadeIn" style={{
            color: '#FFD70077', fontFamily: "'Caveat', cursive",
            fontSize: 16, marginBottom: 18, letterSpacing: 2
          }}>
            The final chapter begins...
          </div>
        )}

        {/* Main Title */}
        {phase >= 2 && (
          <div className="animate-stamp">
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(48px, 13vw, 88px)',
              fontWeight: 900, color: '#FFD700',
              textShadow: '0 0 30px #FFD700, 0 0 60px #FFD70055',
              lineHeight: 1, letterSpacing: 4,
            }}>
              VIGAM
            </div>
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(36px, 9vw, 66px)',
              fontWeight: 900, color: '#FFF8E7',
              lineHeight: 1, letterSpacing: 8,
            }}>
              2026
            </div>
          </div>
        )}

        {phase >= 3 && <Divider />}

        {/* Subtitle */}
        {phase >= 4 && (
          <div className="animate-fadeIn">
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic', color: '#FFF8E7',
              fontSize: 'clamp(13px, 3.5vw, 18px)',
              marginBottom: 6, letterSpacing: 1,
            }}>
              Where Bollywood Meets Binary
            </div>
            <div style={{
              fontFamily: "'Caveat', cursive",
              color: '#FFD70088', fontSize: 15, marginBottom: 10,
            }}>
              Aapka last semester. Aapki biggest party. 🎉
            </div>

            {/* Live Counter */}
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid #FFD70033',
              borderRadius: 20, padding: '8px 20px',
              marginBottom: 24,
            }}>
              <span style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: '#FFD700', fontSize: 22, fontWeight: 900,
              }}>
                {count}
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFD70077', fontSize: 11,
                letterSpacing: 2, marginLeft: 8,
              }}>
                STUDENTS REGISTERED
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {phase >= 5 && (
          <div className="animate-slideUp">
            <GoldBtn onClick={() => navigate('/branch')}>
              🎬 Start Your Last Registration
            </GoldBtn>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E733', fontSize: 10,
              marginTop: 12, letterSpacing: 1,
            }}>
              📅 April 8, 2026
            </div>
          </div>
        )}
      </div>
    </div>
  )
}