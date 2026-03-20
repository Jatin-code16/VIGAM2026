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
  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚪</div>
            <h1 className="text-3xl font-black text-white">
              Gate <span className="text-yellow-400">Check-in</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">VIGAM 2026 Entry System</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter gate password"
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-yellow-400/60 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl"
          >
            Open Gate System →
          </button>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // PROCESSING
  // ============================================
  if (screen === 'processing') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⏳
        </motion.div>
        <p className="text-yellow-400 font-black text-xl">Checking...</p>
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
        className={`min-h-screen ${config.bg} flex flex-col items-center justify-center px-6 text-white`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <div className="text-center">
          <div className="text-8xl mb-6">{config.emoji}</div>
          <h1 className="text-4xl font-black mb-3">{config.title}</h1>
          <p className="text-white/90 text-xl font-bold mb-2">
            {config.subtitle(result.student)}
          </p>
          <p className="text-white/60 text-sm">
            {config.detail(result.student)}
          </p>
          {result.type === 'success' && result.student?.superlative && (
            <motion.div
              className="mt-6 bg-white/20 rounded-2xl px-6 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/60 text-xs mb-1">🏆 Award</p>
              <p className="text-white font-bold text-sm">
                {result.student.superlative}
              </p>
            </motion.div>
          )}
          <p className="text-white/40 text-sm mt-8">
            Resetting in 3 seconds...
          </p>
        </div>
      </motion.div>
    )
  }

  // ============================================
  // SCANNER
  // ============================================
  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Header */}
      <div className="bg-black border-b border-yellow-400/20 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-yellow-400">🚪 Gate Check-in</h1>
          <p className="text-white/40 text-xs">VIGAM 2026</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-2 text-center">
          <p className="text-green-400 font-black text-xl">{presentCount}</p>
          <p className="text-green-400/60 text-xs">Inside</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-6 py-6">
        <p className="text-white/40 text-xs text-center mb-3 uppercase tracking-widest">
          Point camera at QR code
        </p>

        {/* KEY PROP = fresh component every scan! */}
        <QRScanner
          key={scannerKey}

          onScan={handleScan}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-white/30 text-xs">or enter manually</p>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Manual Input */}
        <div className="flex gap-3 max-w-sm mx-auto w-full">
          <input
            type="text"
            value={manualERP}
            onChange={(e) => setManualERP(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Enter ERP ID manually"
            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-yellow-400/60"
            maxLength={15}
          />
          <button
            onClick={handleManualSubmit}
            className="bg-yellow-400 text-black font-black px-5 py-3 rounded-xl active:scale-95 transition-transform"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
