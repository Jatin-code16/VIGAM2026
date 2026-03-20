import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

// 🔴 REPLACE THIS with your actual Google Form link!
const GOOGLE_FORM_URL = 'https://forms.gle/5W85z5XaP9wHithZ8'

export default function JuniorSuccess() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [saving, setSaving] = useState(true)

  useEffect(() => {
    const registerJunior = async () => {
      const data = sessionStorage.getItem('studentData')
      if (!data) { navigate('/branch'); return }

      const parsed = JSON.parse(data)
      setStudent(parsed)

      try {
        // Save junior registration to Supabase
        const { error } = await supabase
          .from('students')
          .update({
            phone: parsed.phone,
            is_registered: true,
            registered_at: new Date().toISOString(),
          })
          .eq('erp_id', parsed.erp_id)

        if (error) {
          toast.error('Registration failed! Please try again.')
          navigate('/profile')
          return
        }

        setSaving(false)

      } catch (err) {
        toast.error('Something went wrong!')
        setSaving(false)
      }
    }

    registerJunior()
  }, [])

  const handleVolunteer = async () => {
    // Save volunteer interest
    await supabase
      .from('students')
      .update({ wants_to_volunteer: true })
      .eq('erp_id', student.erp_id)

    // Open Google Form
    window.open(GOOGLE_FORM_URL, '_blank')
  }

  if (saving) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </motion.div>
        <div className="text-center">
          <p className="text-blue-400 font-black text-xl">Registering you...</p>
          <p className="text-white/40 text-sm mt-2">Please don't close this screen!</p>
        </div>
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-10">

      {/* Success Animation */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ✅
        </motion.div>

        <h1 className="text-3xl font-black text-white">
          You're <span className="text-blue-400">Registered!</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Hey {student.name}! See you at VIGAM 2026 🎬
        </p>
      </motion.div>

      {/* Registration Card */}
      <motion.div
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-blue-400/20 text-blue-400 border border-blue-400/30">
            ⚡ Junior
          </span>
          <span className="text-white/30 text-xs font-mono">
            {student.erp_id}
          </span>
        </div>

        <p className="text-white font-black text-2xl mb-1">{student.name}</p>
        <p className="text-white/40 text-sm">{student.branch} — Year {student.year}</p>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/30 text-xs">
            📅 VIGAM 2026 • April 8, 2026
          </p>
        </div>
      </motion.div>

      {/* Volunteer Section */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-blue-400/10 border border-blue-400/30 rounded-3xl p-6 mb-4">
          <p className="text-blue-400 font-black text-lg mb-2">
            🙋 Want to help organise?
          </p>
          <p className="text-white/50 text-sm">
            We're looking for enthusiastic juniors to help coordinate VIGAM 2026!
            Fill the form to join the team.
          </p>
        </div>

        {/* Volunteer Button */}
        <motion.button
          onClick={handleVolunteer}
          className="w-full bg-blue-500 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-transform mb-3"
          whileTap={{ scale: 0.95 }}
        >
          Yes, I want to volunteer! 🙌
        </motion.button>

        {/* Skip Button */}
        <button
          onClick={() => {
            sessionStorage.clear()
            navigate('/')
          }}
          className="w-full border border-white/10 text-white/40 font-bold py-3 rounded-2xl active:scale-95 transition-transform"
        >
          No thanks, I'll just attend
        </button>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="text-white/20 text-xs text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        🎬 VIGAM 2026 — Where Bollywood Meets Binary
      </motion.p>
    </div>
  )
}