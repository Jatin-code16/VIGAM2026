import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function Splash() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  // Fetch live registration count
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_registered', true)
      setCount(count || 0)
    }

    fetchCount()

    // Realtime subscription
    const channel = supabase
      .channel('registration-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'students'
      }, () => fetchCount())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black to-black pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Film reel emoji as logo */}
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎬
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl font-black text-yellow-400 tracking-tight leading-none">
          VIGAM
        </h1>
        <h2 className="text-2xl font-black text-white tracking-widest mt-1">
          2026
        </h2>

        {/* Tagline */}
        <motion.p
          className="text-yellow-200/70 text-sm tracking-widest uppercase mt-3 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Where Bollywood Meets Binary
        </motion.p>

        {/* Divider */}
        <div className="w-24 h-px bg-yellow-400/50 my-6" />

        {/* Live Counter */}
        <motion.div
          className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-6 py-3 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-yellow-400 text-2xl font-black">{count}</p>
          <p className="text-yellow-200/60 text-xs uppercase tracking-widest">
            Students Registered
          </p>
        </motion.div>

        {/* Register Button */}
        <motion.button
          onClick={() => navigate('/branch')}
          className="w-full max-w-xs bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/25 active:scale-95 transition-transform"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.95 }}
        >
          Register Now 🎟️
        </motion.button>

        {/* Event date */}
        <motion.p
          className="text-white/30 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          📅 April 8, 2026
        </motion.p>
      </motion.div>
    </div>
  )
}