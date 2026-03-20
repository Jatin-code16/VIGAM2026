import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const BRANCHES = [
  {
    id: 'IT',
    name: 'Information Technology',
    short: 'IT',
    emoji: '💻',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-400/50',
    glow: 'shadow-blue-500/25',
  },
  {
    id: 'Cyber',
    name: 'Cyber Security',
    short: 'Cyber',
    emoji: '🔐',
    color: 'from-red-600 to-red-800',
    border: 'border-red-400/50',
    glow: 'shadow-red-500/25',
  },
  {
    id: 'DS',
    name: 'Data Science',
    short: 'DS',
    emoji: '📊',
    color: 'from-green-600 to-green-800',
    border: 'border-green-400/50',
    glow: 'shadow-green-500/25',
  },
  {
    id: 'MCA',
    name: 'Master of Computer Applications',
    short: 'MCA',
    emoji: '🎓',
    color: 'from-purple-600 to-purple-800',
    border: 'border-purple-400/50',
    glow: 'shadow-purple-500/25',
  },
]

export default function BranchSelect() {
  const navigate = useNavigate()

  const handleSelect = (branch) => {
    // Save branch to sessionStorage
    sessionStorage.setItem('selectedBranch', branch.id)
    navigate('/verify')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 py-10">

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back hint */}
        <p
          className="text-yellow-400/50 text-sm mb-6 cursor-pointer"
          onClick={() => navigate('/')}
        >
          ← Back
        </p>

        <h1 className="text-3xl font-black text-white">
          Select Your <span className="text-yellow-400">Branch</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Which department are you from?
        </p>
      </motion.div>

      {/* Branch Cards */}
      <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        {BRANCHES.map((branch, index) => (
          <motion.button
            key={branch.id}
            onClick={() => handleSelect(branch)}
            className={`
              w-full bg-gradient-to-r ${branch.color}
              border ${branch.border}
              rounded-2xl p-5 text-left
              shadow-lg ${branch.glow}
              active:scale-95 transition-transform
            `}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              {/* Emoji */}
              <span className="text-4xl">{branch.emoji}</span>

              {/* Text */}
              <div>
                <p className="text-white font-black text-xl">
                  {branch.short}
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  {branch.name}
                </p>
              </div>

              {/* Arrow */}
              <span className="ml-auto text-white/40 text-xl">→</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <motion.p
        className="text-center text-white/20 text-xs mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        🎬 VIGAM 2026
      </motion.p>
    </div>
  )
}