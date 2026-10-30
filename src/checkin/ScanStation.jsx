import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Grain } from '../components/UI'
import { checkIn, getEventCounts } from '../utils/db'
import { parseQRValue } from '../constants/event'
import QRScanner from './QRScanner'

const GREEN = { bg: 'linear-gradient(135deg, #052e16, #14532d)', border: '#4ade80' }
const YELLOW = { bg: 'linear-gradient(135deg, #422006, #78350f)', border: '#fbbf24' }
const RED = { bg: 'linear-gradient(135deg, #3f0d0d, #7f1d1d)', border: '#f87171' }

const roleLabel = (s) => `${s?.branch} | ${s?.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}`

// Shared results; each station overrides success/duplicate and can add its own
const BASE_RESULTS = {
  invalid: {
    ...RED,
    emoji: '❌',
    title: 'INVALID QR',
    subtitle: () => 'QR not recognised!',
    detail: () => 'Ask them to show their pass again',
  },
  not_registered: {
    ...RED,
    emoji: '❌',
    title: 'NOT REGISTERED',
    subtitle: (s) => `${s?.name || 'This person'} is not registered!`,
    detail: () => 'Not a valid VIGAM 2026 attendee',
  },
}

const STATIONS = {
  gate: {
    icon: '🚪',
    title: 'Gate Check-in',
    scanHint: 'Point camera at QR pass',
    counterKey: 'present',
    counterLabel: 'INSIDE',
    counterColor: '#4ade80',
    results: {
      success: {
        ...GREEN,
        emoji: '✅',
        title: 'ACCESS GRANTED',
        subtitle: (s) => `Welcome, ${s?.name}! 🎉`,
        detail: roleLabel,
        showSuperlative: true,
      },
      duplicate: {
        ...YELLOW,
        emoji: '⚠️',
        title: 'ALREADY CHECKED IN',
        subtitle: (s) => `${s?.name} is already inside!`,
        detail: () => 'This QR was already scanned',
      },
    },
  },
  dinner: {
    icon: '🍽️',
    title: 'Dinner Check-in',
    scanHint: 'Scan student QR pass',
    counterKey: 'at_dinner',
    counterLabel: 'AT DINNER',
    counterColor: '#fbbf24',
    results: {
      success: {
        ...GREEN,
        emoji: '🍽️',
        title: 'ENJOY YOUR DINNER!',
        subtitle: (s) => `Welcome, ${s?.name}! 🎉`,
        detail: roleLabel,
      },
      duplicate: {
        ...YELLOW,
        emoji: '⚠️',
        title: 'ALREADY AT DINNER',
        subtitle: (s) => `${s?.name} already checked in!`,
        detail: () => 'This QR was already scanned at dinner',
      },
      not_at_gate: {
        ...RED,
        emoji: '🚫',
        title: 'NOT CHECKED IN AT GATE',
        subtitle: (s) => `${s?.name} never entered the event!`,
        detail: () => 'Must enter through main gate first!',
      },
    },
  },
}

export default function ScanStation({ station }) {
  const config = STATIONS[station]
  const results = { ...BASE_RESULTS, ...config.results }
  const [screen, setScreen] = useState('scanner')
  const [result, setResult] = useState(null)
  const [manualERP, setManualERP] = useState('')
  const [counter, setCounter] = useState(0)
  const [scannerKey, setScannerKey] = useState(0)

  const [counterTick, setCounterTick] = useState(0)

  // Poll so counts from other scanners show up too; counterTick refreshes after each scan
  useEffect(() => {
    let active = true
    const load = () => getEventCounts().then(c => {
      if (active) setCounter(c[config.counterKey] || 0)
    })
    load()
    const id = setInterval(load, 10000)
    return () => { active = false; clearInterval(id) }
  }, [config.counterKey, counterTick])

  const resetScanner = () => {
    setResult(null)
    setManualERP('')
    // Increment key → React destroys old QRScanner, mounts fresh one
    setScannerKey(prev => prev + 1)
    setScreen('scanner')
  }

  const showResult = (student) => {
    setResult({ type: results[student.status] ? student.status : 'invalid', student })
    setScreen('result')
    setTimeout(resetScanner, 3000)
  }

  const runCheckIn = async (params) => {
    // Switch away from scanner IMMEDIATELY → QRScanner unmounts → camera stops
    setScreen('processing')
    try {
      showResult(await checkIn(station, params))
      setCounterTick(t => t + 1)
    } catch (err) {
      toast.error(err?.message === 'forbidden' ? 'Not authorised for this station!' : 'Something went wrong!')
      resetScanner()
    }
  }

  const handleScan = (qrText) => {
    const token = parseQRValue(qrText)
    if (!token) {
      setScreen('processing')
      showResult({ status: 'invalid' })
      return
    }
    runCheckIn({ token })
  }

  const handleManualSubmit = () => {
    if (!manualERP.trim()) {
      toast.error('Enter an ERP ID!')
      return
    }
    runCheckIn({ erpId: manualERP })
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
        <div style={{ fontSize: 40, animation: 'stamp 0.5s ease infinite alternate' }}>
          {config.icon}
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

  // ============================================
  // RESULT
  // ============================================
  if (screen === 'result' && result) {
    const r = results[result.type]
    return (
      <div style={{
        minHeight: '100vh',
        background: r.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative',
      }}>
        <Grain />
        <div className="animate-burst" style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', width: '100%', maxWidth: 360,
        }}>
          <div style={{
            border: `2px solid ${r.border}`,
            borderRadius: 16, padding: '32px 24px',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 40px ${r.border}33`,
          }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>
              {r.emoji}
            </div>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: r.border,
              fontSize: 'clamp(18px, 5vw, 28px)',
              marginBottom: 12, letterSpacing: 2,
            }}>
              {r.title}
            </h1>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              color: '#FFF8E7cc',
              fontSize: 18, marginBottom: 8, fontWeight: 700,
            }}>
              {r.subtitle(result.student)}
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E777', fontSize: 12,
            }}>
              {r.detail(result.student)}
            </p>

            {/* Superlative for seniors on success */}
            {r.showSuperlative && result.student?.superlative && (
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

            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E733', fontSize: 11, marginTop: 20,
            }}>
              Resetting in 3 seconds...
            </p>
          </div>
        </div>
      </div>
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
            {config.icon} {config.title}
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
          background: `${config.counterColor}1a`,
          border: `1px solid ${config.counterColor}4d`,
          borderRadius: 10, padding: '8px 14px', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: config.counterColor, fontSize: 22, fontWeight: 900,
          }}>
            {counter}
          </div>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            color: `${config.counterColor}77`, fontSize: 9, letterSpacing: 1,
          }}>
            {config.counterLabel}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontFamily: "'Caveat', cursive",
          color: '#FFD70077', fontSize: 14,
          textAlign: 'center', marginBottom: 12, letterSpacing: 2,
        }}>
          {config.scanHint}
        </p>

        <QRScanner key={scannerKey} onScan={handleScan} />

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
