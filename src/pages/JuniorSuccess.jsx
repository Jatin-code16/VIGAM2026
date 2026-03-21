import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { QRCodeCanvas } from 'qrcode.react'
import { Grain, Particles, Divider } from '../components/UI'

function useCountdown(targetDate) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - new Date())
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

export default function JuniorSuccess() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [saving, setSaving] = useState(true)
  const [rank, setRank] = useState(null)
  const [emailSent, setEmailSent] = useState(false)
  const t = useCountdown('2026-04-08T18:00:00')

  // Send confirmation email
  const sendConfirmationEmail = async (studentData, qrValue) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentData.name,
          email: studentData.email,
          erp_id: studentData.erp_id,
          branch: studentData.branch,
          role: studentData.role,
          superlative: '',
          qr_data: qrValue,
        })
      })
      const data = await response.json()
      if (data.success) {
        setEmailSent(true)
        toast.success('Confirmation email sent! 📧')
      }
    } catch (err) {
      console.log('Email failed silently:', err)
    }
  }

  useEffect(() => {
    const register = async () => {
      const data = sessionStorage.getItem('studentData')
      if (!data) { navigate('/branch'); return }
      const parsed = JSON.parse(data)
      setStudent(parsed)

      try {
        // Get registration rank
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('is_registered', true)
        const registrationRank = (count || 0) + 1
        setRank(registrationRank)

        const { error } = await supabase
          .from('students')
          .update({
            phone: parsed.phone,
            email: parsed.email,
            is_registered: true,
            registered_at: new Date().toISOString(),
            registered_rank: registrationRank,
          })
          .eq('erp_id', parsed.erp_id)

        if (error) {
          toast.error('Registration failed!')
          navigate('/profile')
          return
        }

        const updatedStudent = { ...parsed, registered_rank: registrationRank }
        setStudent(updatedStudent)
        setSaving(false)

        // Send confirmation email
        const qrValue = `VIGAM2026|${parsed.erp_id}|${parsed.name}`
        await sendConfirmationEmail(updatedStudent, qrValue)

        // Clear session after 30 seconds
        setTimeout(() => sessionStorage.clear(), 30000)

      } catch (err) {
        toast.error('Something went wrong!')
        setSaving(false)
      }
    }
    register()
  }, [])

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
          color: '#60a5fa', fontSize: 36,
        }}>
          ⚡
        </div>
        <p style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#60a5fa', fontSize: 14, letterSpacing: 2,
        }}>
          Registering you...
        </p>
      </div>
    )
  }

  if (!student) return null

  const qrValue = `VIGAM2026|${student.erp_id}|${student.name}`

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: 24,
      position: 'relative',
    }}>
      <Particles />
      <Grain />

      <div className="animate-burst" style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 360, textAlign: 'center',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🎊</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#60a5fa',
            fontSize: 'clamp(18px, 5vw, 26px)',
            textShadow: '0 0 20px #60a5fa55',
            marginBottom: 6,
          }}>
            ✅ You're Registered!
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#FFF8E7bb',
            fontSize: 13, lineHeight: 1.7,
          }}>
            Hey {student.name}! See you at VIGAM 2026 🎬
          </p>

          {/* Email sent indicator */}
          {emailSent && (
            <div style={{
              display: 'inline-block',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 20, padding: '4px 14px',
              fontFamily: "'Poppins', sans-serif",
              color: '#4ade80', fontSize: 11,
              marginTop: 8,
            }}>
              📧 Confirmation email sent!
            </div>
          )}
        </div>

        {/* Digital Pass */}
        <div style={{
          background: 'linear-gradient(135deg,#0d0d0d,#001133)',
          border: '2px solid #60a5fa',
          borderRadius: 14, padding: '22px 18px',
          marginBottom: 18,
          boxShadow: '0 0 40px #60a5fa33, inset 0 1px 0 #60a5fa22',
        }}>
          {/* Pass Header */}
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#60a5fa', fontSize: 11, letterSpacing: 2,
          }}>
            🎬 VIGAM 2026 — ENTRY PASS
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E755', fontSize: 10,
            letterSpacing: 1, marginBottom: 10,
          }}>
            Where Bollywood Meets Binary
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg,transparent,#60a5fa,transparent)',
            marginBottom: 14,
          }} />

          {/* Junior Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(96,165,250,0.15)',
            border: '1px solid #60a5fa44',
            borderRadius: 20, padding: '4px 14px',
            fontFamily: "'Poppins', sans-serif",
            color: '#60a5fa', fontSize: 10,
            letterSpacing: 1, marginBottom: 12,
          }}>
            ⚡ JUNIOR
          </div>

          {/* Details */}
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFF8E7',
            fontSize: 'clamp(13px, 3.5vw, 17px)',
            marginBottom: 4, textAlign: 'center',
          }}>
            {student.name}
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#60a5fa99', fontSize: 11,
            textAlign: 'center', marginBottom: 4,
          }}>
            {student.branch} • Year {student.year} • #{rank}
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFF8E7aa', fontSize: 13,
            textAlign: 'center', marginBottom: 12,
          }}>
            ERP: {student.erp_id}
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg,transparent,#60a5fa,transparent)',
            marginBottom: 12,
          }} />

          {/* QR Code */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            background: '#FFF8E7',
            borderRadius: 12, padding: 12, marginBottom: 8,
          }}>
            <QRCodeCanvas
              value={qrValue}
              size={160}
              level="H"
              includeMargin={false}
            />
            <p style={{
              fontFamily: "'Poppins', monospace",
              color: '#0A0A0A', fontSize: 10, marginTop: 6,
            }}>
              {student.erp_id}
            </p>
          </div>

          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#60a5fa55', fontSize: 9,
            letterSpacing: 2, textAlign: 'center',
          }}>
            8TH APRIL 2026 • VIGAM 2026
          </div>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E766', fontSize: 10,
            letterSpacing: 3, textTransform: 'uppercase',
            textAlign: 'center', marginBottom: 10,
          }}>
            VIGAM 2026 STARTS IN
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[
              { v: t.d, l: 'Days' },
              { v: t.h, l: 'Hrs' },
              { v: t.m, l: 'Mins' },
              { v: t.s, l: 'Secs' },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(96,165,250,0.1)',
                  border: '1.5px solid #60a5fa55',
                  borderRadius: 8, padding: '8px 10px',
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#60a5fa',
                  fontSize: 'clamp(18px, 5vw, 26px)',
                  minWidth: 46,
                }}>
                  {String(v).padStart(2, '0')}
                </div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: '#FFF8E744', fontSize: 8,
                  letterSpacing: 1, marginTop: 4,
                  textTransform: 'uppercase',
                }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email note */}
        <div style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70055', fontSize: 13,
          textAlign: 'center', marginBottom: 16,
        }}>
          📧 Check your institute email!<br/>
          <span style={{ fontSize: 11, color: '#FFD70033' }}>
            If not found, check spam folder and mark as "Not Spam"
          </span>
        </div>

        {/* Back to Home */}
        <div
          onClick={() => {
            sessionStorage.clear()
            navigate('/')
          }}
          style={{
            fontFamily: "'Caveat', cursive",
            color: '#60a5fa33', fontSize: 14,
            textAlign: 'center',
            cursor: 'pointer', paddingBottom: 32,
          }}
        >
          ← Back to Home
        </div>

      </div>
    </div>
  )
}