import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Grain, Particles, Divider, GoldBtn } from '../components/UI'

export default function Splash() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(0)
  const [regOpen, setRegOpen] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const timers = [300, 900, 1600, 2300, 3000].map((t, i) =>
      setTimeout(() => setPhase(i + 1), t)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

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

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      setCheckingStatus(true)

      const deadline = new Date('2026-04-08T23:59:59')
      if (new Date() > deadline) {
        setRegOpen(false)
        setCheckingStatus(false)
        return
      }

      try {
        const { data } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'registration_open')
          .single()

        setRegOpen(data?.value === 'true')
      } catch {
        setRegOpen(true)
      }

      setCheckingStatus(false)
    }

    checkRegistrationStatus()
  }, [])

  const registrationClosed = !regOpen
    

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
              marginBottom: 16,
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

            {/* Registration closed banner */}
            {!checkingStatus && registrationClosed && (
              <div style={{
                background: 'rgba(192,57,43,0.15)',
                border: '1px solid #C0392B44',
                borderRadius: 12,
                padding: '10px 20px',
                marginBottom: 16,
                fontFamily: "'Poppins', sans-serif",
                color: '#ff6b6b',
                fontSize: 12,
                textAlign: 'center',
              }}>
                ⛔ Registration is now closed!<br />
                <span style={{ color: '#FFF8E766', fontSize: 11 }}>
                  See you at VIGAM 2026 on April 8th 🎬
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        {phase >= 5 && !checkingStatus && !registrationClosed && (
          <div className="animate-slideUp">
            <GoldBtn onClick={() => navigate('/branch')}>
              🎬 Start Your Last Registration
            </GoldBtn>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#fff8e793', fontSize: 12,
              marginTop: 12, letterSpacing: 1,
            }}>
              📅 April 8, 2026
            </div>
          </div>
        )}

        {/* Developer Credit + Contact */}
        {phase >= 5 && (
          <div className="animate-fadeIn" style={{
            marginTop: 28,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #FFD70022',
            borderRadius: 12,
            textAlign: 'center',
            width: '100%',
          }}>
            {/* Contact + Credit */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#fff8e777', fontSize: 11, marginBottom: 10,
              }}>
                Facing any issue? Contact us!
              </p>
              <a href="https://wa.me/916232730128?text=Hi%20Jatin!%20I%20need%20help%20with%20VIGAM%202026%20registration." 
              target="_blank"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#ffd90089', fontSize: 12,
                textDecoration: 'none', display: 'block', marginBottom: 4,
              }}>
                
                WhatsApp: +91 6232730128
              </a>              
              <a href="tel:+916232730128" style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#ffd90080', fontSize: 12,
                textDecoration: 'none', display: 'block', marginBottom: 4,
              }}>
                📱 +91 6232730128
              </a>
              <a href="mailto:jatinnaiknawa2@gmail.com" style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#ffd90084', fontSize: 12,
                textDecoration: 'none', display: 'block', marginBottom: 12,
              }}>
                📧 jatinnaiknawa2@gmail.com
              </a>
              <p style={{
                fontFamily: "'Caveat', cursive",
                color: '#ffd90077', fontSize: 12,
              }}>
                Designed & Developed by Jatin Naik 🎬
                <br />With ❤️ for VIGAM 2026
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}