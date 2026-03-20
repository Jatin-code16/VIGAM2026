import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SUPERLATIVES } from '../constants/superlatives'

export default function Superlative() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [superlative, setSuperlative] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [shuffling, setShuffling] = useState(true)
  const [shuffleText, setShuffleText] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) { navigate('/branch'); return }
    const parsed = JSON.parse(data)
    setStudent(parsed)

    // Check if already assigned
    if (parsed.superlative) {
      setSuperlative(parsed.superlative)
      setShuffling(false)
      setRevealed(true)
      return
    }

    // Shuffle animation
    let count = 0
    const interval = setInterval(() => {
      setShuffleText(SUPERLATIVES[Math.floor(Math.random() * SUPERLATIVES.length)])
      count++
      if (count > 15) {
        clearInterval(interval)
        // Pick final superlative
        const final = SUPERLATIVES[Math.floor(Math.random() * SUPERLATIVES.length)]
        setSuperlative(final)
        setShuffling(false)

        // Save to sessionStorage
        const updated = { ...parsed, superlative: final }
        sessionStorage.setItem('studentData', JSON.stringify(updated))

        // Reveal after short delay
        setTimeout(() => setRevealed(true), 300)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!student) return null

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black to-black pointer-events-none" />

      {/* Confetti particles when revealed */}
      {revealed && (
        [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
              left: `${Math.random() * 100}%`,
              top: '-10px',
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: 'easeIn',
            }}
          />
        ))
      )}

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-yellow-400/60 text-sm uppercase tracking-widest mb-2">
            🎬 VIGAM 2026 presents
          </p>
          <h1 className="text-3xl font-black text-white">
            Your <span className="text-yellow-400">Award</span>
          </h1>
        </motion.div>

        {/* Award Card */}
        <AnimatePresence mode="wait">
          {shuffling ? (
            // Shuffling state
            <motion.div
              key="shuffling"
              className="w-full bg-white/5 border border-yellow-400/30 rounded-3xl p-8 mb-8"
              animate={{ borderColor: ['rgba(250,204,21,0.3)', 'rgba(250,204,21,0.8)', 'rgba(250,204,21,0.3)'] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <div className="text-4xl mb-4">🎭</div>
              <p className="text-yellow-400/60 text-sm font-medium min-h-[3rem] flex items-center justify-center">
                {shuffleText}
              </p>
              <p className="text-white/20 text-xs mt-4">
                Finding your award...
              </p>
            </motion.div>
          ) : (
            // Revealed state
            <motion.div
              key="revealed"
              className="w-full bg-gradient-to-b from-yellow-400/20 to-yellow-900/10 border-2 border-yellow-400/60 rounded-3xl p-8 mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                🏆
              </motion.div>

              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                {student.name} is officially...
              </p>

              <motion.p
                className="text-yellow-400 text-xl font-black leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {superlative}
              </motion.p>

              <motion.div
                className="mt-4 pt-4 border-t border-yellow-400/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-white/30 text-xs">
                  Class of 2026 • {student.branch}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button — only shows after reveal */}
        <AnimatePresence>
          {revealed && (
            <motion.button
              onClick={() => navigate('/pass')}
              className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/25"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
            >
              Claim Your Pass 🎟️
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}