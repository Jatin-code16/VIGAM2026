import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldBtn, GoldCard, Divider } from '../components/UI'

const GOOGLE_FORM_URL = 'https://forms.gle/KSp77PTp8nu98Hgk7'

export default function JuniorSuccess() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [saving, setSaving] = useState(true)

  useEffect(() => {
    const register = async () => {
      const data = sessionStorage.getItem('studentData')
      if (!data) { navigate('/branch'); return }
      const parsed = JSON.parse(data)
      setStudent(parsed)

      try {
        const { error } = await supabase
          .from('students')
          .update({
            phone: parsed.phone,
            is_registered: true,
            registered_at: new Date().toISOString(),
          })
          .eq('erp_id', parsed.erp_id)

        if (error) {
          toast.error('Registration failed!')
          navigate('/profile')
          return
        }
        setSaving(false)
      } catch (err) {
        toast.error('Something went wrong!')
        setSaving(false)
      }
    }
    register()
  }, [])

  const handleVolunteer = async () => {
    await supabase
      .from('students')
      .update({ wants_to_volunteer: true })
      .eq('erp_id', student.erp_id)
    window.open(GOOGLE_FORM_URL, '_blank')
  }

  if (saving) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <Grain />
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700', fontSize: 36,
        }}>
          ⚡
        </div>
        <p style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700', fontSize: 14, letterSpacing: 2,
        }}>
          Registering you...
        </p>
      </div>
    )
  }

  if (!student) return null

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <Particles />
      <Grain />

      <div className="animate-burst" style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 360, textAlign: 'center',
      }}>

        <div style={{ fontSize: 52, marginBottom: 8 }}>✅</div>

        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700',
          fontSize: 'clamp(18px, 5vw, 28px)',
          textShadow: '0 0 20px #FFD70055',
          marginBottom: 6,
        }}>
          You're In!
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic', color: '#FFF8E7bb',
          fontSize: 13, marginBottom: 22, lineHeight: 1.7,
        }}>
          Hey {student.name}! See you at VIGAM 2026 🎬
        </p>

        {/* Registration Card */}
        <GoldCard glow style={{ marginBottom: 20, textAlign: 'left' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid #FFD70044',
            borderRadius: 20, padding: '4px 12px',
            fontFamily: "'Poppins', sans-serif",
            color: '#FFD700', fontSize: 10,
            letterSpacing: 1, marginBottom: 12,
          }}>
            ⚡ JUNIOR
          </div>

          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFF8E7',
            fontSize: 'clamp(14px, 4vw, 18px)',
            marginBottom: 4,
          }}>
            {student.name}
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFD70077', fontSize: 11,
          }}>
            {student.branch} — Year {student.year} | {student.erp_id}
          </div>

          <Divider />

          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E733', fontSize: 10,
          }}>
            📅 VIGAM 2026 • April 8, 2026
          </div>
        </GoldCard>

        {/* Volunteer Section */}
        <div style={{
          background: 'rgba(255,215,0,0.04)',
          border: '1.5px solid #FFD70033',
          borderRadius: 12, padding: '18px 16px',
          marginBottom: 14, textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 12, marginBottom: 6,
          }}>
            🙋 Want to help organise?
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E766', fontSize: 11, lineHeight: 1.6,
          }}>
            Join the VIGAM 2026 coordination team!
            Fill the form to volunteer.
          </p>
        </div>

        <GoldBtn onClick={handleVolunteer}>
          Yes, I want to volunteer! 🙌
        </GoldBtn>

        <div
          onClick={() => {
            sessionStorage.clear()
            navigate('/')
          }}
          style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFF8E733', fontSize: 14,
            cursor: 'pointer', marginTop: 14,
          }}
        >
          No thanks, I'll just attend →
        </div>

        <div style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70044', fontSize: 12, marginTop: 16,
        }}>
          🎬 VIGAM 2026 — Where Bollywood Meets Binary
        </div>
      </div>
    </div>
  )
}