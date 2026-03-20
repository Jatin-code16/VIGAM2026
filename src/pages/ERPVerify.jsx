import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function ERPVerify() {
  const navigate = useNavigate()
  const [erpId, setErpId] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if branch was selected
  useEffect(() => {
  const validBranches = ['IT', 'Cyber', 'DS', 'MCA']
  const branch = sessionStorage.getItem('selectedBranch')
  if (!branch || !validBranches.includes(branch)) {
    navigate('/branch')
  }
}, [])

  const handleVerify = async () => {
  if (!erpId.trim()) {
    toast.error('Please enter your ERP ID!')
    return
  }

  setLoading(true)

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('erp_id', erpId.trim().toUpperCase())
      .single()

    if (error || !data) {
      toast.error('ERP ID not found! Check and try again.')
      setLoading(false)
      return
    }

    // Check branch matches
    const selectedBranch = sessionStorage.getItem('selectedBranch')
    if (data.branch !== selectedBranch) {
      toast.error(`This ERP belongs to ${data.branch}, not ${selectedBranch}!`)
      setLoading(false)
      return
    }

    // Already registered?
    if (data.is_registered) {
      toast.error('You are already registered! 🎟️')
      setLoading(false)
      return
    }

    // Auto detect role
    const detectRole = (branch, year) => {
      if (branch === 'MCA') {
        return year >= 2 ? 'senior' : 'junior'
      } else {
        return year >= 4 ? 'senior' : 'junior'
      }
    }

    const detectedRole = detectRole(data.branch, data.year)
    const studentWithRole = { ...data, role: detectedRole }

    // Save to sessionStorage
    sessionStorage.setItem('studentData', JSON.stringify(studentWithRole))

    navigate('/profile')

  } catch (err) {
    toast.error('Something went wrong. Try again!')
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 py-10">

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p
          className="text-yellow-400/50 text-sm mb-6 cursor-pointer"
          onClick={() => navigate('/branch')}
        >
          ← Back
        </p>

        <div className="text-5xl mb-4">🎟️</div>

        <h1 className="text-3xl font-black text-white">
          Enter Your <span className="text-yellow-400">ERP ID</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">
          We'll fetch your details automatically
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        className="max-w-sm mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={erpId}
          onChange={(e) => setErpId(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="e.g. IT2024001"
          className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg font-mono tracking-widest placeholder:text-white/20 focus:outline-none focus:border-yellow-400/60 text-center"
          maxLength={15}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Hint */}
        <p className="text-white/20 text-xs text-center mt-3">
          Your ERP ID is on your college ID card
        </p>

        {/* Verify Button */}
        <motion.button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/25 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⏳
              </motion.span>
              Checking...
            </span>
          ) : (
            'Verify ERP ID →'
          )}
        </motion.button>
      </motion.div>

      {/* Decorative */}
      <motion.p
        className="text-center text-white/20 text-xs mt-auto pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🎬 VIGAM 2026 — Where Bollywood Meets Binary
      </motion.p>
    </div>
  )
}