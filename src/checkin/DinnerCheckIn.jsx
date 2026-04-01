import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldCard, GoldInput } from '../components/UI'
import QRScanner from './QRScanner'

const DINNER_PASSWORD = 'vigam2026dinner'

export default function DinnerCheckIn() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [screen, setScreen] = useState('scanner')
  const [result, setResult] = useState(null)
  const [manualERP, setManualERP] = useState('')
  const [dinnerCount, setDinnerCount] = useState(0)
  const [scannerKey, setScannerKey] = useState(0)

  useEffect(() => {
    const saved = sessionStorage.getItem('dinnerAuthed')
    if (saved === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchDinnerCount()
    const channel = supabase
      .channel('dinner-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'students'
      }, () => fetchDinnerCount())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [authed])

  const fetchDinnerCount = async () => {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_at_dinner', true)
    setDinnerCount(count || 0)
  }

  const handleScan = async (qrText) => {
    setScreen('processing')
    await processCheckIn(qrText)
  }

  const processCheckIn = async (qrText) => {
    try {
      const parts = qrText.split('|')

      if (parts[0] !== 'VIGAM2026' || parts.length < 2) {
        showResult('invalid', null)
        return
      }

      const erpId = parts[1]

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('erp_id', erpId)
        .single()

      if (error || !data) {
        showResult('invalid', null)
        return
      }

      // Not registered at all?
      if (!data.is_registered) {
        showResult('not_registered', data)
        return
      }

      // ⚠️ KEY CHECK — Did they enter through gate?
      if (!data.is_present) {
        showResult('not_at_gate', data)
        return
      }

      // Already had dinner?
      if (data.is_at_dinner) {
        showResult('duplicate', data)
        return
      }

      // ✅ Valid! Mark dinner
      await supabase
        .from('students')
        .update({
          is_at_dinner: true,
          dinner_checked_at: new Date().toISOString()
        })
        .eq('erp_id', erpId)

      showResult('success', data)

    } catch (err) {
      toast.error('Something went wrong!')
      resetScanner()
    }
  }

  const showResult = (type, student) => {
    setResult({ type, student })
    setScreen('result')
    setTimeout(() => resetScanner(), 3000)
  }

  const resetScanner = () => {
    setResult(null)
    setManualERP('')
    setScannerKey(prev => prev + 1)
    setScreen('scanner')
  }

  const handleManualSubmit = async () => {
    if (!manualERP.trim()) {
      toast.error('Enter an ERP ID!')
      return
    }
    setScreen('processing')
    await processCheckIn(`VIGAM2026|${manualERP.trim().toUpperCase()}|MANUAL`)
  }

  const handleLogin = () => {
    if (password === DINNER_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('dinnerAuthed', 'true')
    } else {
      toast.error('Wrong password!')
    }
  }

  const resultConfig = {
    success: {
      bg: 'linear-gradient(135deg, #052e16, #14532d)',
      border: '#4ade80',
      emoji: '🍽️',
      title: 'ENJOY YOUR DINNER!',
      subtitle: (s) => `Welcome, ${s?.name}! 🎉`,
      detail: (s) => `${s?.branch} | ${s?.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}`,
    },
    duplicate: {
      bg: 'linear-gradient(135deg, #422006, #78350f)',
      border: '#fbbf24',
      emoji: '⚠️',
      title: 'ALREADY AT DINNER',
      subtitle: (s) => `${s?.name} already checked in!`,
      detail: () => 'This QR was already scanned at dinner',
    },
    not_at_gate: {
      bg: 'linear-gradient(135deg, #3f0d0d, #7f1d1d)',
      border: '#f87171',
      emoji: '🚫',
      title: 'NOT CHECKED IN AT GATE',
      subtitle: (s) => `${s?.name} never entered the event!`,
      detail: () => 'Must enter through main gate first!',
    },
    invalid: {
      bg: 'linear-gradient(135deg, #3f0d0d, #7f1d1d)',
      border: '#f87171',
      emoji: '❌',
      title: 'INVALID QR',
      subtitle: () => 'QR not recognised!',
      detail: () => 'Ask them to show their pass again',
    },
    not_registered: {
      bg: 'linear-gradient(135deg, #3f0d0d, #7f1d1d)',
      border: '#f87171',
      emoji: '❌',
      title: 'NOT REGISTERED',
      subtitle: (s) => `${s?.name || 'This person'} is not registered!`,
      detail: () => 'Not a valid VIGAM 2026 attendee',
    },
  }

  // ============================================
  // LOGIN
  // ============================================
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, position: 'relative',
      }}>
        <Particles />
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 340 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🍽️</div>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 22,
              textShadow: '0 0 20px #FFD70055', marginBottom: 6,
            }}>
              Dinner Check-in
            </h1>
            <p style={{
              fontFamily: "'Caveat', cursive",
              color: '#FFD70077', fontSize: 14,
            }}>
              VIGAM 2026 Dinner Stall
            </p>
          </div>
          <GoldCard>
            <div style={{ marginBottom: 14 }}>
              <GoldInput
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter dinner password..."
              />
            </div>
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                background: '#FFD700',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: 8,
                padding: '13px 20px',
                fontFamily: "'Cinzel Decorative', serif",
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                letterSpacing: 1.5,
              }}
            >
              Open Dinner Gate →
            </button>
          </GoldCard>
        </div>
      </div>
    )
  }

  // ============================================
  // PROCESSING
  // ============================================
  if (screen === 'processing') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <Grain />
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 48 }}
        >
          🍽️
        </motion.div>
        <p style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700', fontSize: 14, letterSpacing: 2,
        }}>
          Checking...
        </p>
      </div>
    )
  }

  // ============================================
  // RESULT
  // ============================================
  if (screen === 'result' && result) {
    const config = resultConfig[result.type]
    return (
      <motion.div
        style={{
          minHeight: '100vh',
          background: config.bg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, position: 'relative',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <Grain />
        <div className="animate-burst" style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', width: '100%', maxWidth: 360,
        }}>
          <div style={{
            border: `2px solid ${config.border}`,
            borderRadius: 16, padding: '32px 24px',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 40px ${config.border}33`,
          }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>
              {config.emoji}
            </div>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: config.border,
              fontSize: 'clamp(18px, 5vw, 24px)',
              marginBottom: 12, letterSpacing: 2,
            }}>
              {config.title}
            </h1>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              color: '#FFF8E7cc',
              fontSize: 18, marginBottom: 8, fontWeight: 700,
            }}>
              {config.subtitle(result.student)}
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E777', fontSize: 12,
            }}>
              {config.detail(result.student)}
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E733', fontSize: 11, marginTop: 20,
            }}>
              Resetting in 3 seconds...
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ============================================
  // SCANNER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7', display: 'flex', flexDirection: 'column' }}>
      <Grain />

      {/* Header */}
      <div style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #FFD70033',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 14,
          }}>
            🍽️ Dinner Check-in
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70055', fontSize: 12,
          }}>
            VIGAM 2026
          </div>
        </div>

        {/* Dinner counter */}
        <div style={{
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 10, padding: '8px 14px', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#fbbf24', fontSize: 22, fontWeight: 900,
          }}>
            {dinnerCount}
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#fbbf2477', fontSize: 9, letterSpacing: 1,
          }}>
            AT DINNER
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70077', fontSize: 14,
          textAlign: 'center', marginBottom: 12, letterSpacing: 2,
        }}>
          Scan student QR pass
        </p>

        <QRScanner
          key={scannerKey}
          scannerKey={scannerKey}
          onScan={handleScan}
        />

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#FFD70022' }} />
          <p style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70055', fontSize: 13,
          }}>
            or enter manually
          </p>
          <div style={{ flex: 1, height: 1, background: '#FFD70022' }} />
        </div>

        {/* Manual Input */}
        <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <input
            type="text"
            value={manualERP}
            onChange={e => setManualERP(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Enter ERP ID manually..."
            maxLength={15}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid #FFD70033',
              borderRadius: 8, padding: '12px 14px',
              color: '#FFF8E7',
              fontFamily: "'Poppins', monospace",
              fontSize: 13, letterSpacing: 2,
            }}
          />
          <button
            onClick={handleManualSubmit}
            style={{
              background: '#FFD700', color: '#0A0A0A',
              border: 'none', borderRadius: 8,
              padding: '12px 18px', cursor: 'pointer',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 14, fontWeight: 700,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}