import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

// Countdown hook
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

export default function SuccessPass() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [saving, setSaving] = useState(true)
  const [rank, setRank] = useState(null)
  const timeLeft = useCountdown('2026-04-08T00:00:00')

  useEffect(() => {
    const registerStudent = async () => {
      const data = sessionStorage.getItem('studentData')
      const photoBase64 = sessionStorage.getItem('photoBase64')
      const photoType = sessionStorage.getItem('photoType')

      if (!data) { navigate('/branch'); return }

      const parsed = JSON.parse(data)
      setStudent(parsed)

      try {
        // Step 1 — Upload photo to Supabase Storage
        let photoUrl = null
        if (photoBase64) {
          const base64Data = photoBase64.split(',')[1]
          const byteCharacters = atob(base64Data)
          const byteArray = new Uint8Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i)
          }
          const blob = new Blob([byteArray], { type: photoType })
          const fileName = `${parsed.erp_id}_${Date.now()}.jpg`

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, blob, { contentType: photoType })

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('photos')
              .getPublicUrl(fileName)
            photoUrl = urlData.publicUrl
          }
        }

        // Step 2 — Get registration rank
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('is_registered', true)

        const registrationRank = (count || 0) + 1
        setRank(registrationRank)

        // Step 3 — Update student record in Supabase
        const { error: updateError } = await supabase
          .from('students')
          .update({
            photo_url: photoUrl,
            superlative: parsed.superlative,
            phone: parsed.phone,
            is_registered: true,
            registered_at: new Date().toISOString(),
            registered_rank: registrationRank,
          })
          .eq('erp_id', parsed.erp_id)

        if (updateError) {
          toast.error('Registration failed! Please try again.')
          navigate('/photo')
          return
        }

        // Update local state with rank
        setStudent({ ...parsed, registered_rank: registrationRank })
        setSaving(false)

      } catch (err) {
        toast.error('Something went wrong!')
        setSaving(false)
      }
    }

    registerStudent()
  }, [])

  if (saving) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          🎬
        </motion.div>
        <div className="text-center">
          <p className="text-yellow-400 font-black text-xl">Saving your registration...</p>
          <p className="text-white/40 text-sm mt-2">Please don't close this screen!</p>
        </div>
      </div>
    )
  }

  if (!student) return null

  const qrValue = `VIGAM2026|${student.erp_id}|${student.name}`

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-6 py-10">

      {/* Header */}
      <motion.div
        className="text-center mb-6 w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-5xl mb-3"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-black text-white">
          You're <span className="text-yellow-400">Registered!</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Screenshot your pass below
        </p>
      </motion.div>

      {/* Digital Pass Card */}
      <motion.div
        className="w-full max-w-sm bg-gradient-to-b from-yellow-950 to-black border border-yellow-400/40 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-400/10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        {/* Pass Header */}
        <div className="bg-yellow-400 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-black font-black text-xl">VIGAM 2026</p>
            <p className="text-black/60 text-xs">Where Bollywood Meets Binary</p>
          </div>
          <span className="text-3xl">🎬</span>
        </div>

        {/* Pass Body */}
        <div className="px-6 py-5">

          {/* Student Name */}
          <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">
            Name
          </p>
          <p className="text-white font-black text-2xl mb-4">
            {student.name}
          </p>

          {/* Details Row */}
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">
                Branch
              </p>
              <p className="text-white font-bold">{student.branch}</p>
            </div>
            <div>
              <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">
                ERP ID
              </p>
              <p className="text-white font-bold font-mono">{student.erp_id}</p>
            </div>
            <div>
              <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">
                Rank
              </p>
              <p className="text-yellow-400 font-bold">#{rank}</p>
            </div>
          </div>

          {/* Superlative */}
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl px-4 py-3 mb-5">
            <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">
              🏆 Your Award
            </p>
            <p className="text-yellow-400 font-bold text-sm">
              {student.superlative}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white rounded-2xl p-4 mb-3">
            <QRCode
              value={qrValue}
              size={160}
              level="H"
              includeMargin={false}
            />
            <p className="text-gray-400 text-xs mt-2 font-mono">
              {student.erp_id}
            </p>
          </div>

          <p className="text-white/20 text-xs text-center">
            Show this QR at the gate on April 8th
          </p>
        </div>

        {/* Pass Footer */}
        <div className="border-t border-yellow-400/20 px-6 py-3">
          <p className="text-white/30 text-xs text-center">
            📅 April 8, 2026 • VIGAM 2026
          </p>
        </div>
      </motion.div>

      {/* Countdown Timer */}
      <motion.div
        className="w-full max-w-sm mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-white/40 text-xs text-center uppercase tracking-widest mb-3">
          ⏳ Event starts in
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 flex flex-col items-center"
            >
              <p className="text-yellow-400 font-black text-2xl">
                {String(item.value).padStart(2, '0')}
              </p>
              <p className="text-white/30 text-xs mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom note */}
      <motion.p
        className="text-white/20 text-xs text-center mt-6 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        💡 Screenshot your pass! You'll also receive it on WhatsApp before the event.
      </motion.p>
    </div>
  )
}