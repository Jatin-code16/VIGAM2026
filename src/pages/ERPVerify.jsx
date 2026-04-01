import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
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
  const [regOpen, setRegOpen] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const validBranches = ['IT', 'Cyber', 'DS', 'MCA']
    const branch = sessionStorage.getItem('selectedBranch')
    if (!branch || !validBranches.includes(branch)) navigate('/branch')
    checkRegistrationStatus()
  }, [])

  const checkRegistrationStatus = async () => {
    setCheckingStatus(true)

    const deadline = new Date('2026-04-07T23:59:59')
    const now = new Date()

    if (now > deadline) {
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

  const handleVerify = async () => {
    if (!erpId.trim()) {
      toast.error('Please enter your ERP ID!')
      return
    }

    const deadline = new Date('2026-04-01T23:59:59')
    if (new Date() > deadline) {
      toast.error('Registration is closed!')
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
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('erp_id', erpId.trim().toUpperCase())
          .single()

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

        const role = data.branch === 'MCA'
          ? (data.year >= 2 ? 'senior' : 'junior')
          : (data.year >= 4 ? 'senior' : 'junior')

        sessionStorage.setItem('studentData', JSON.stringify({ ...data, role }))
        navigate('/profile')

      } catch (err) {
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

  // Registration closed screen
  if (!checkingStatus && !regOpen) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', textAlign: 'center',
      }}>
        <Particles />
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 360 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700',
            fontSize: 'clamp(18px, 5vw, 26px)',
            textShadow: '0 0 20px #FFD70055', marginBottom: 12,
          }}>
            Registration Closed!
          </h1>
          <div style={{
            background: 'rgba(192,57,43,0.1)',
            border: '1px solid #C0392B44',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic', color: '#FFF8E7bb',
              fontSize: 14, lineHeight: 1.8, margin: 0,
            }}>
              Registration for VIGAM 2026 is now closed.<br />
              If you already registered, check your institute email for your QR pass! If you have any questions, feel free to reach out to us. See you at the event! 🎉
            </p>
          </div>
          <div style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid #FFD70033',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          }}>
            <p style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 13, marginBottom: 6,
            }}>
              📅 April 8, 2026
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E777', fontSize: 12, margin: 0,
            }}>
              See you at VIGAM 2026! 🎉
            </p>
          </div>

          {/* Contact on closed screen too */}
          <div style={{ marginTop: 8 }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E733', fontSize: 11, marginBottom: 8,
            }}>
              Need help? Contact the developer!
            </p>
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
              textDecoration: 'none', display: 'block',
            }}>
              📧 jatinnaiknawa2@gmail.com
            </a>
          </div>

          <div style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70044', fontSize: 13, marginTop: 16,
          }}>
            Designed & Developed by Jatin Naik 🚀
          </div>
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

        <GoldInput
          value={erpId}
          onChange={e => { setErpId(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder="Enter your ERP ID..."
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