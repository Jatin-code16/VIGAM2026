import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUPERLATIVES } from '../constants/superlatives'
import { Grain, Particles, GoldBtn, GoldCard, Divider } from '../components/UI'

export default function Superlative() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [superlative, setSuperlative] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [shuffleText, setShuffleText] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) { navigate('/branch'); return }
    const parsed = JSON.parse(data)
    setStudent(parsed)

    if (parsed.superlative) {
      setSuperlative(parsed.superlative)
      setRevealed(true)
      return
    }

    let count = 0
    const interval = setInterval(() => {
      setShuffleText(SUPERLATIVES[Math.floor(Math.random() * SUPERLATIVES.length)])
      count++
      if (count > 15) {
        clearInterval(interval)
        const final = SUPERLATIVES[Math.floor(Math.random() * SUPERLATIVES.length)]
        setSuperlative(final)
        const updated = { ...parsed, superlative: final }
        sessionStorage.setItem('studentData', JSON.stringify(updated))
        setTimeout(() => setRevealed(true), 300)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

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
        textAlign: 'center', width: '100%', maxWidth: 360,
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎭</div>

        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700',
          fontSize: 'clamp(14px, 4vw, 20px)',
          textAlign: 'center', marginBottom: 4,
          textShadow: '0 0 20px #FFD70055',
        }}>
          And the award goes to...
        </h2>

        <p style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFF8E777', fontSize: 14,
          marginBottom: 22, lineHeight: 1.6,
        }}>
          Our committee studied your college career carefully.<br />
          (Not really. But we tried. 😂)
        </p>

        {/* Award Card */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(255,215,0,0.07),rgba(192,57,43,0.04))',
          border: '2px solid #FFD700',
          borderRadius: 12, padding: '24px 20px',
          marginBottom: 22,
          boxShadow: '0 0 36px #FFD70033',
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 12,
            letterSpacing: 2, marginBottom: 8,
          }}>
            🏆 VIGAM 2026 AWARDS
          </div>

          <Divider />

          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#FFF8E7aa',
            fontSize: 12, marginBottom: 8,
          }}>
            This certifies that
          </div>

          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700',
            fontSize: 'clamp(16px, 4.5vw, 22px)',
            marginBottom: 8,
            textShadow: '0 0 15px #FFD70066',
          }}>
            {student.name}
          </div>

          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#FFF8E7aa',
            fontSize: 12, marginBottom: 14,
          }}>
            is officially declared:
          </div>

          {/* Shuffling / Revealed text */}
          <div style={{
            fontFamily: "'Caveat', cursive",
            color: revealed ? '#FFF8E7' : '#FFD70088',
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            lineHeight: 1.55, minHeight: 54,
            transition: 'color 0.3s',
          }}>
            "{revealed ? superlative : shuffleText}"
          </div>

          <Divider />

          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFD70066', fontSize: 9, letterSpacing: 2,
          }}>
            VIGAM COMMITTEE — 2026
          </div>
        </div>

        {revealed && (
          <div className="animate-fadeIn">
            <GoldBtn onClick={() => navigate('/pass')}>
              Haha, sahi pakde! Complete karo →
            </GoldBtn>
          </div>
        )}
      </div>
    </div>
  )
}