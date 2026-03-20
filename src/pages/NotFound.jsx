import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <div className="text-7xl mb-6">🎬</div>
        <h1 className="text-6xl font-black text-yellow-400 mb-2">404</h1>
        <p className="text-white font-black text-2xl mb-2">Scene Not Found!</p>
        <p className="text-white/40 text-sm mb-8">
          This page got cut from the final edit.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-yellow-400 text-black font-black px-8 py-4 rounded-2xl active:scale-95 transition-transform"
        >
          Back to Home 🏠
        </button>
      </motion.div>
    </div>
  )
}