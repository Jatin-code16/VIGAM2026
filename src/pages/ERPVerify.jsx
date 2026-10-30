import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { lookupStudent } from '../utils/db'
import { VALID_BRANCHES } from '../constants/event'
import { createDemoStudent, isDemo } from '../utils/demo'
import { Grain, Particles, GoldBtn, GoldCard, GoldInput, ReelLabel, BackBtn, ProgressDots } from '../components/UI'

const STEPS = ['branch', 'verify', 'profile', 'photo', 'superlative']

const LOADING_LINES = [
  '> Connecting to VIGAM Mainframe...',
  '> Scanning college database...',
  '> Fetching your legacy...',
  '> Counting your late submissions... 👀',
  '> Scanning for attendance defaulters... 😅',
  '> Just kidding. You\'re clear. 😂',
  '> ████████████████ FOUND. 100%',
  '> IDENTITY CONFIRMED. WELCOME.',
]

export default function ERPVerify() {
  const navigate = useNavigate()
  const [erpId, setErpId] = useState('')
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState([])
  const [error, setError] = useState('')
  const [demo] = useState(isDemo)
  const [demoRole, setDemoRole] = useState('senior')

  useEffect(() => {
    const branch = sessionStorage.getItem('selectedBranch')
    if (!branch || !VALID_BRANCHES.includes(branch)) navigate('/branch')
  }, [navigate])

  const handleVerify = async () => {
    if (demo) {
      setLoading(true)
      setLines([])
      LOADING_LINES.forEach((line, i) => {
        setTimeout(() => setLines(prev => [...prev, { text: line, index: i }]), i * 450 + 200)
      })
      setTimeout(() => {
        const branch = sessionStorage.getItem('selectedBranch')
        sessionStorage.setItem('studentData', JSON.stringify(createDemoStudent(branch, demoRole, erpId)))
        navigate('/profile')
      }, LOADING_LINES.length * 450 + 600)
      return
    }

    if (!erpId.trim()) {
      toast.error('Please enter your ERP ID!')
      return
    }

    setError('')
    setLoading(true)
    setLines([])

    LOADING_LINES.forEach((line, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, { text: line, index: i }])
      }, i * 450 + 200)
    })

    setTimeout(async () => {
      try {
        const { data, error } = await lookupStudent(erpId)

        if (error || !data) {
          setLoading(false)
          setLines([])
          setError('🎬 Cut! Retake needed. ERP ID not found in our records.')
          return
        }

        const selectedBranch = sessionStorage.getItem('selectedBranch')
        if (data.branch !== selectedBranch) {
          setLoading(false)
          setLines([])
          setError(`🎬 Wrong set! This ERP belongs to ${data.branch}, not ${selectedBranch}.`)
          return
        }

        if (data.is_registered) {
          setLoading(false)
          setLines([])
          setError('🎟️ Already registered! Check your institute email for your QR pass.')
          return
        }

        // role is computed server-side (student_role) and saved on registration
        sessionStorage.setItem('studentData', JSON.stringify(data))
        navigate('/profile')

      } catch {
        setLoading(false)
        setLines([])
        setError('Something went wrong. Try again!')
      }
    }, LOADING_LINES.length * 450 + 600)
  }

  // Cinematic loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
        position: 'relative',
      }}>
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380 }}>
          <GoldCard>
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 11,
              marginBottom: 10, textAlign: 'center', letterSpacing: 2,
            }}>
              🎞️ VIGAM MAINFRAME - INITIATING...
            </div>
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg,transparent,#FFD700,transparent)',
              marginBottom: 14,
            }} />
            {lines.map(({ text, index }) => (
              <div key={index} className="animate-fadeIn" style={{
                fontFamily: "'Poppins', monospace",
                color: index === lines.length - 1 ? '#FFD700' : '#FFF8E7bb',
                fontSize: 11, marginBottom: 7, lineHeight: 1.6,
              }}>
                {text} {index < 3 && <span style={{ color: '#4CAF50' }}>✅</span>}
              </div>
            ))}
            {lines.length < LOADING_LINES.length && (
              <div style={{ color: '#FFD700', fontSize: 12 }}>_</div>
            )}
          </GoldCard>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <Particles />
      <Grain />
      <BackBtn onClick={() => navigate('/branch')} />
      <ProgressDots steps={STEPS} current="verify" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 340 }}>
        <ReelLabel number={2} />

        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700',
          fontSize: 'clamp(15px, 4.5vw, 24px)',
          textAlign: 'center', marginBottom: 6,
          textShadow: '0 0 20px #FFD70055',
        }}>
          Prove you belong here.
        </h2>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          color: '#FFF8E777', fontSize: 12,
          marginBottom: 28, textAlign: 'center',
        }}>
          Your ERP ID - your college identity, one last time.
        </p>

        {demo && (
          <GoldCard style={{ marginBottom: 14, padding: '14px 16px' }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFD700', fontSize: 12, marginBottom: 4,
            }}>
              🎭 Demo mode
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E777', fontSize: 11, lineHeight: 1.6, marginBottom: 10,
            }}>
              Any ID works. Nothing is saved, no email is sent, and the demo pass won't open the gate.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['senior', '🎓 Senior'], ['junior', '⚡ Junior']].map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => setDemoRole(role)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif", fontSize: 11,
                    background: demoRole === role ? '#FFD700' : 'rgba(255,215,0,0.08)',
                    color: demoRole === role ? '#0A0A0A' : '#FFD700',
                    border: '1px solid #FFD70055',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </GoldCard>
        )}

        <GoldInput
          value={erpId}
          onChange={e => { setErpId(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder={demo ? 'Any ID, e.g. DEMO123 (optional)' : 'Enter your ERP ID...'}
          maxLength={15}
        />

        {error && (
          <GoldCard style={{
            borderColor: '#C0392B',
            background: 'rgba(192,57,43,0.08)',
            margin: '14px 0',
          }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E7', fontSize: 12, lineHeight: 1.6,
            }}>
              {error}
            </p>
          </GoldCard>
        )}

        <div style={{ marginTop: 14 }}>
          <GoldBtn onClick={handleVerify}>
            VERIFY IDENTITY 🎬
          </GoldBtn>
        </div>

        {/* Contact + Credit */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFF8E733', fontSize: 11, marginBottom: 10,
              }}>
                ERP Not Found? Contact us!
              </p>
              <a href="https://wa.me/916232730128?text=Hi%20Jatin!%20I%20need%20help%20with%20VIGAM%202026%20registration."
              target="_blank"
              rel="noopener noreferrer"
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