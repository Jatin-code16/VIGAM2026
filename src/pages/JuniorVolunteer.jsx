import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Grain, Particles, GoldCard } from '../components/UI'

const GOOGLE_FORM_URL = 'https://forms.gle/KSp77PTp8nu98Hgk7'

export default function JuniorVolunteer() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) { navigate('/branch'); return }
    setStudent(JSON.parse(data))
  }, [])

  const handleYes = async () => {
    // Save volunteer interest
    await supabase
      .from('students')
      .update({ wants_to_volunteer: true })
      .eq('erp_id', student.erp_id)

    // Open Google Form in new tab
    window.open(GOOGLE_FORM_URL, '_blank')

    // Go to pass
    navigate('/junior-success')
  }

  const handleNo = () => {
    navigate('/junior-success')
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

        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#60a5fa',
          fontSize: 'clamp(16px, 4.5vw, 22px)',
          textShadow: '0 0 20px #60a5fa55',
          marginBottom: 8,
        }}>
          One Last Thing!
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          color: '#FFF8E7bb',
          fontSize: 14, lineHeight: 1.7,
          marginBottom: 28,
        }}>
          Hey {student.name}!<br />
          Would you like to help organise VIGAM 2026?
        </p>

        {/* Card */}
        <GoldCard style={{
          borderColor: '#60a5fa44',
          background: 'rgba(96,165,250,0.04)',
          marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#60a5fa', fontSize: 11,
            letterSpacing: 1, marginBottom: 10,
          }}>
            🙋 VIGAM 2026 Volunteer Team
          </p>

          {[
            '🎭 Stage & Event Management',
            '📸 Photography & Reels',
            '🎵 Music & Entertainment',
            '🍽️ Food & Hospitality',
            '🎨 Decoration & Setup',
            '📋 Registration & Coordination',
          ].map(item => (
            <div key={item} style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E7aa', fontSize: 12,
              padding: '5px 0',
              borderBottom: '1px solid #60a5fa11',
            }}>
              {item}
            </div>
          ))}

          <p style={{
            fontFamily: "'Caveat', cursive",
            color: '#60a5fa88', fontSize: 13,
            marginTop: 10,
          }}>
            Be part of something memorable! ✨
          </p>
        </GoldCard>

        {/* Yes Button */}
        <button
          onClick={handleYes}
          style={{
            width: '100%',
            background: 'rgba(96,165,250,0.15)',
            border: '2px solid #60a5fa',
            borderRadius: 10,
            padding: '14px 20px',
            fontFamily: "'Cinzel Decorative', serif",
            color: '#60a5fa',
            fontSize: 11, letterSpacing: 1.5,
            cursor: 'pointer',
            marginBottom: 12,
            boxShadow: '0 0 20px #60a5fa22',
          }}
        >
          Yes! I want to volunteer 🙌
        </button>

        {/* No Button */}
        <button
          onClick={handleNo}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #FFF8E722',
            borderRadius: 10,
            padding: '14px 20px',
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E744',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          No thanks, just attending →
        </button>

        <p style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFF8E733', fontSize: 12,
          marginTop: 16,
        }}>
          Either way, your pass is waiting! 🎟️
        </p>
      </div>
    </div>
  )
}