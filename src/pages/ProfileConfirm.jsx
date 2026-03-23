import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldBtn, GoldCard, Divider, ReelLabel, BackBtn, ProgressDots } from '../components/UI'

const STEPS = ['branch', 'verify', 'profile', 'photo', 'superlative']

export default function ProfileConfirm() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [phone, setPhone] = useState('')
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) { navigate('/branch'); return }
    const parsed = JSON.parse(data)
    setStudent(parsed)
    setPhone(parsed.phone || '')

    const timers = [400, 1100, 1900].map((t, i) =>
      setTimeout(() => setPhase(i + 1), t)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleConfirm = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number!')
      return
    }

    // Auto generate email from ERP ID
    const email = `${student.erp_id}@rungta.org`

    const updated = { ...student, phone, email }
    sessionStorage.setItem('studentData', JSON.stringify(updated))

    if (student.role === 'senior') {
      navigate('/photo')
    } else {
      navigate('/junior-volunteer')
    }
  }

  if (!student) return null

  // Auto generated email
  const autoEmail = `${student?.erp_id}@rungta.org`

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <Particles />
      <Grain />
      <BackBtn onClick={() => navigate('/verify')} />
      <ProgressDots steps={STEPS} current="profile" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 340 }}>
        <ReelLabel number={3} />

        {/* Clapperboard badge */}
        {phase >= 1 && (
          <div className="animate-stamp" style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{
              display: 'inline-block',
              background: '#1a1a1a',
              border: '2px solid #FFD700',
              borderRadius: 8,
              padding: '8px 18px',
              fontFamily: "'Poppins', monospace",
              fontSize: 10, color: '#FFD700', letterSpacing: 1.5,
            }}>
              🎬 VIGAM 2026 | {student.role.toUpperCase()} | ERP: {student.erp_id} | TAKE 1
            </div>
          </div>
        )}

        {phase >= 2 && (
          <h2 className="animate-fadeIn" style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700',
            fontSize: 'clamp(16px, 4.5vw, 24px)',
            textAlign: 'center', marginBottom: 18,
            textShadow: '0 0 20px #FFD70066',
          }}>
            Hazir ho, {student.name}! 🎬
          </h2>
        )}

        {phase >= 2 && (
          <div className="animate-slideUp">
            <GoldCard glow>

              {/* Name */}
              {[
                ['👤', 'Name', student.name],
                ['🆔', 'ERP ID', student.erp_id],
                ['🏛️', 'Branch', `${student.branch} — Year ${student.year}`],
              ].map(([icon, label, value]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, marginBottom: 14,
                }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Poppins', sans-serif",
                      color: '#FFD70077', fontSize: 9,
                      letterSpacing: 2, textTransform: 'uppercase',
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#FFF8E7', fontSize: 15,
                    }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}

              {/* Email — auto generated */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 14,
              }}>
                <span style={{ fontSize: 20 }}>📧</span>
                <div>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#FFD70077', fontSize: 9,
                    letterSpacing: 2, textTransform: 'uppercase',
                    marginBottom: 2,
                  }}>
                    Email (auto)
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#FFF8E7aa', fontSize: 13,
                  }}>
                    {autoEmail}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>📱</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#FFD70077', fontSize: 9,
                    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
                  }}>
                    Phone (editable)
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(255,215,0,0.07)',
                    border: '1px solid #FFD70044',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      padding: '7px 10px',
                      color: '#FFD700',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      borderRight: '1px solid #FFD70044',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}>
                      +91
                    </span>
                    <input
                      value={phone.replace('+91', '')}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setPhone(`+91${digits}`);
                      }}
                      maxLength={10}
                      placeholder="10 digit mobile number"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        padding: '7px 10px',
                        color: '#FFF8E7',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 13,
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
              </div>

            </GoldCard>

            {phase >= 3 && (
              <div className="animate-fadeIn">
                <Divider />
                <div style={{
                  fontFamily: "'Caveat', cursive",
                  color: '#FFD700aa', fontSize: 16,
                  textAlign: 'center', margin: '14px 0',
                  fontStyle: 'italic',
                }}>
                  "4 saal ki mehnat. Ek last registration." ✨
                </div>
                <GoldBtn onClick={handleConfirm}>
                  Bilkul sahi. Aage chalte hain →
                </GoldBtn>
                <p
                  onClick={() => navigate('/verify')}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#FFF8E733', fontSize: 10,
                    textAlign: 'center', marginTop: 12,
                    cursor: 'pointer',
                  }}
                >
                  Not you? Go back
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}