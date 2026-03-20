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

  useEffect(() => {
    const validBranches = ['IT', 'Cyber', 'DS', 'MCA']
    const branch = sessionStorage.getItem('selectedBranch')
    if (!branch || !validBranches.includes(branch)) navigate('/branch')
  }, [])

  const handleVerify = async () => {
    if (!erpId.trim()) {
      toast.error('Please enter your ERP ID!')
      return
    }

    setError('')
    setLoading(true)
    setLines([])

    // Show cinematic loading lines
    LOADING_LINES.forEach((line, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, { text: line, index: i }])
      }, i * 450 + 200)
    })

    // Actually query Supabase in parallel
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
          setError('🎟️ Already registered! Your pass is ready. Check WhatsApp before event.')
          return
        }

        // Detect role
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
              🎞️ VIGAM MAINFRAME — INITIATING...
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
              <div style={{ color: '#FFD700', fontSize: 12, animation: 'fadeIn 0.5s infinite alternate' }}>_</div>
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
          Your ERP ID — your college identity, one last time.
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
      </div>
    </div>
  )
}