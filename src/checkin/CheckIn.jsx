import { Grain, Particles, GoldBtn, GoldCard, GoldInput } from '../components/UI'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import QRScanner from './QRScanner'

const CHECKIN_PASSWORD = 'vigam2026gate'

export default function CheckIn() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [screen, setScreen] = useState('scanner')
  const [result, setResult] = useState(null)
  const [manualERP, setManualERP] = useState('')
  const [presentCount, setPresentCount] = useState(0)
  const [scannerKey, setScannerKey] = useState(0)

  useEffect(() => {
    const saved = sessionStorage.getItem('checkinAuthed')
    if (saved === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchPresentCount()
    const channel = supabase
      .channel('checkin-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'students'
      }, () => fetchPresentCount())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [authed])

  const fetchPresentCount = async () => {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_present', true)
    setPresentCount(count || 0)
  }

  const handleScan = async (qrText) => {
    // Switch away from scanner IMMEDIATELY
    // This unmounts QRScanner component → camera stops
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

      if (!data.is_registered) {
        showResult('invalid', data)
        return
      }

      if (data.is_present) {
        showResult('duplicate', data)
        return
      }

      await supabase
        .from('students')
        .update({
          is_present: true,
          checked_in_at: new Date().toISOString()
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

    setTimeout(() => {
      resetScanner()
    }, 3000)
  }

  const resetScanner = () => {
    setResult(null)
    setManualERP('')
    // Increment key → React destroys old QRScanner, mounts fresh one
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
    if (password === CHECKIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('checkinAuthed', 'true')
    } else {
      toast.error('Wrong password!')
    }
  }

  const resultConfig = {
    success: {
      bg: 'bg-green-500',
      emoji: '✅',
      title: 'ACCESS GRANTED',
      subtitle: (s) => `Welcome, ${s?.name}! 🎉`,
      detail: (s) => `${s?.branch} | ${s?.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}`,
    },
    duplicate: {
      bg: 'bg-yellow-500',
      emoji: '⚠️',
      title: 'ALREADY CHECKED IN',
      subtitle: (s) => `${s?.name} is already inside!`,
      detail: () => 'This QR was already scanned',
    },
    invalid: {
      bg: 'bg-red-500',
      emoji: '❌',
      title: 'INVALID QR',
      subtitle: () => 'QR not recognised!',
      detail: () => 'Ask them to show their pass again',
    },
  }

  // ============================================
  // LOGIN
  // ============================================
    // LOGIN
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
            <div style={{ fontSize: 52, marginBottom: 8 }}>🚪</div>
            <h1 style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: '#FFD700', fontSize: 22,
                textShadow: '0 0 20px #FFD70055', marginBottom: 6,
            }}>
                Gate Access
            </h1>
            <p style={{
                fontFamily: "'Caveat', cursive",
                color: '#FFD70077', fontSize: 14,
            }}>
                VIGAM 2026 Entry System
            </p>
            </div>
            <GoldCard>
            <div style={{ marginBottom: 14 }}>
                <GoldInput
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter gate password..."
                />
            </div>
            <GoldBtn onClick={handleLogin}>
                Open The Gates →
            </GoldBtn>
            </GoldCard>
        </div>
        </div>
    )
}

  // ============================================
  // PROCESSING
  // ============================================
 // PROCESSING
if (screen === 'processing') {
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
      <p style={{
        fontFamily: "'Cinzel Decorative', serif",
        color: '#FFD700', fontSize: 14, letterSpacing: 2,
      }}>
        Verifying...
      </p>
    </div>
  )
}

  // RESULT
if (screen === 'result' && result) {
  const config = resultConfig[result.type]
  return (
    <div
      style={{
        minHeight: '100vh',
        background: result.type === 'success'
          ? 'linear-gradient(135deg, #052e16, #14532d)'
          : result.type === 'duplicate'
            ? 'linear-gradient(135deg, #422006, #78350f)'
            : 'linear-gradient(135deg, #3f0d0d, #7f1d1d)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative',
      }}
    >
      <Grain />
      <div className="animate-burst" style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', width: '100%', maxWidth: 360,
      }}>
        {/* Result border card */}
        <div style={{
          border: `2px solid ${result.type === 'success' ? '#4ade80' : result.type === 'duplicate' ? '#fbbf24' : '#f87171'}`,
          borderRadius: 16, padding: '32px 24px',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 0 40px ${result.type === 'success' ? '#4ade8033' : result.type === 'duplicate' ? '#fbbf2433' : '#f8717133'}`,
        }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>
            {config.emoji}
          </div>

          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: result.type === 'success' ? '#4ade80' : result.type === 'duplicate' ? '#fbbf24' : '#f87171',
            fontSize: 'clamp(20px, 5vw, 28px)',
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

          {/* Superlative for seniors on success */}
          {result.type === 'success' && result.student?.superlative && (
            <div style={{
              marginTop: 16,
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid #FFD70033',
              borderRadius: 10, padding: '10px 16px',
            }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFD70088', fontSize: 10,
                letterSpacing: 1, marginBottom: 4,
              }}>
                🏆 AWARD
              </p>
              <p style={{
                fontFamily: "'Caveat', cursive",
                color: '#FFD700', fontSize: 14,
              }}>
                {result.student.superlative}
              </p>
            </div>
          )}

          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: '#FFF8E733', fontSize: 11, marginTop: 20,
          }}>
            Resetting in 3 seconds...
          </div>
        </div>
      </div>
    </div>
  )
}

// SCANNER
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
          🚪 Gate Check-in
        </div>
        <div style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70055', fontSize: 12,
        }}>
          VIGAM 2026
        </div>
      </div>

      {/* Live counter */}
      <div style={{
        background: 'rgba(74,222,128,0.1)',
        border: '1px solid rgba(74,222,128,0.3)',
        borderRadius: 10, padding: '8px 14px', textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#4ade80', fontSize: 22, fontWeight: 900,
        }}>
          {presentCount}
        </div>
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          color: '#4ade8077', fontSize: 9, letterSpacing: 1,
        }}>
          INSIDE
        </div>
      </div>
    </div>

    <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
      <p style={{
        fontFamily: "'Caveat', cursive",
        color: '#FFD70077', fontSize: 14,
        textAlign: 'center', marginBottom: 12, letterSpacing: 2,
      }}>
        Point camera at QR pass
      </p>

      {/* Scanner */}
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