import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { Grain, Particles, Divider } from '../components/UI'
import { useCountdown } from '../hooks/useCountdown'
import { useRegistration } from '../hooks/useRegistration'
import { EVENT_START } from '../constants/event'

export default function SuccessPass() {
  const navigate = useNavigate()
  const { student, saving, rank, qrValue, photoPreview, emailSent, isDemo } = useRegistration({ failPath: '/photo' })
  const t = useCountdown(EVENT_START)

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
          animation: 'stamp 0.5s ease infinite alternate',
        }}>
          🎬
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 14, letterSpacing: 2,
          }}>
            Saving your legacy...
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E744', fontSize: 11, marginTop: 6,
          }}>
            Please don't close this screen!
          </p>
        </div>
      </div>
    )
  }

  if (!student) return null


  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: 24,
      position: 'relative',
    }}>
      <Particles />
      <Grain />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div className="animate-burst" style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🎊</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700',
            fontSize: 'clamp(20px, 5.5vw, 32px)',
            textShadow: '0 0 30px #FFD700, 0 0 60px #FFD70055',
            marginBottom: 6,
          }}>
            ✅ ACCESS GRANTED
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#FFF8E7bb',
            fontSize: 13, lineHeight: 1.7,
          }}>
            Welcome to your last chapter, {student.name}.<br />
            The best scene is still coming.
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
          background: 'linear-gradient(135deg,#0d0d0d,#1a1100)',
          border: '2px solid #FFD700',
          borderRadius: 14, padding: '22px 18px',
          marginBottom: 18,
          boxShadow: '0 0 40px #FFD70033, inset 0 1px 0 #FFD70022',
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 11, letterSpacing: 2,
          }}>
            {isDemo ? '🎭 DEMO PASS — NOT VALID FOR ENTRY' : '🎬 VIGAM 2026 - OFFICIAL PASS'}
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E755', fontSize: 10, letterSpacing: 1, marginBottom: 10,
          }}>
            Where Bollywood Meets Binary
          </div>

          <div style={{
            height: 1,
            background: 'linear-gradient(90deg,transparent,#FFD700,transparent)',
            marginBottom: 14,
          }} />

          {/* Photo polaroid */}
          {photoPreview ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{
                background: '#FFF8E7',
                padding: '6px 6px 20px',
                transform: 'rotate(-1deg)',
                boxShadow: '0 4px 20px #00000066',
              }}>
                <img
                  src={photoPreview}
                  alt=""
                  style={{ width: 72, height: 72, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 10 }}>🎭</div>
          )}

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
            color: '#FFD70099', fontSize: 11,
            textAlign: 'center',
          }}>
            {student.branch} • {isDemo ? 'Demo' : `#${rank} to Register`}
          </div>

          {/* Superlative */}
          {student.superlative && (
            <div style={{
              fontFamily: "'Caveat', cursive",
              color: '#FFF8E7aa', fontSize: 14,
              textAlign: 'center', marginTop: 10,
            }}>
              "{student.superlative}" 🏆
            </div>
          )}

          <Divider />

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
            color: '#FFD70055', fontSize: 9,
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
                  background: 'rgba(255,215,0,0.1)',
                  border: '1.5px solid #FFD70055',
                  borderRadius: 8, padding: '8px 10px',
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#FFD700',
                  fontSize: 'clamp(18px, 5vw, 26px)',
                  minWidth: 46,
                  textShadow: '0 0 10px #FFD70077',
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

        <div style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70055', fontSize: 13,
          textAlign: 'center', marginBottom: 16,
        }}>
          {isDemo ? (
            <>
              🎭 This was a demo — nothing was saved and no email was sent.<br/>
              <span style={{ fontSize: 11, color: '#FFD70033' }}>
                The demo QR is rejected at the gate.
              </span>
            </>
          ) : (
            <>
              📧 Check your institute email!<br/>
              <span style={{ fontSize: 11, color: '#FFD70033' }}>
                If not found, check spam folder and mark as "Not Spam"
              </span>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div
          onClick={() => {
            sessionStorage.clear()
            navigate('/')
          }}
          style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70033', fontSize: 14,
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