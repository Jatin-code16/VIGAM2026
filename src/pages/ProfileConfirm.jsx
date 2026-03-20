import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ProfileConfirm() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [phone, setPhone] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) {
      navigate('/branch')
      return
    }
    const parsed = JSON.parse(data)
    setStudent(parsed)
    setPhone(parsed.phone || '')
  }, [])

  const handleConfirm = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error('Please enter a valid phone number!')
      return
    }

    // Update phone in sessionStorage
    const updated = { ...student, phone }
    sessionStorage.setItem('studentData', JSON.stringify(updated))

    // Route based on role
    if (student.role === 'senior') {
      navigate('/photo')
    } else {
      navigate('/junior-success')
    }
  }

  if (!student) return null

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 py-10">

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p
          className="text-yellow-400/50 text-sm mb-6 cursor-pointer"
          onClick={() => navigate('/verify')}
        >
          ← Back
        </p>

        <div className="text-5xl mb-4">👤</div>

        <h1 className="text-3xl font-black text-white">
          Is this <span className="text-yellow-400">You?</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Confirm your details before registering
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="max-w-sm mx-auto w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">

          {/* Role Badge */}
          <div className="flex justify-between items-center mb-6">
            <span className={`
              text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest
              ${student.role === 'senior'
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'}
            `}>
              {student.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}
            </span>
            <span className="text-white/30 text-xs font-mono">
              {student.erp_id}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-4">

            {/* Name */}
            <div className="flex flex-col gap-1">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Name
              </p>
              <p className="text-white font-bold text-xl">
                {student.name}
              </p>
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Branch
              </p>
              <p className="text-white font-bold text-xl">
                {student.branch} — Year {student.year}
              </p>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Phone Number
              </p>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/10 border border-yellow-400/50 rounded-xl px-4 py-2 text-white font-bold text-xl focus:outline-none"
                  maxLength={10}
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-xl">
                    {phone || 'Not provided'}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-yellow-400/70 text-xs underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Confirm Button */}
        <motion.button
          onClick={handleConfirm}
          className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/25 active:scale-95 transition-transform"
          whileTap={{ scale: 0.95 }}
        >
          Yes, That's Me! ✅
        </motion.button>

        {/* Wrong person */}
        <p
          className="text-center text-white/30 text-xs mt-4 cursor-pointer"
          onClick={() => navigate('/verify')}
        >
          Not you? Go back and try again
        </p>
      </motion.div>
    </div>
  )
}