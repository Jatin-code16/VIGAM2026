import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function PhotoUpload() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const data = sessionStorage.getItem('studentData')
    if (!data) { navigate('/branch'); return }
    setStudent(JSON.parse(data))
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    // Check file size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Photo too large! Please use a photo under 5MB')
      return
    }

    // Check file type
    if (!selected.type.startsWith('image/')) {
      toast.error('Please select an image file!')
      return
    }

    setFile(selected)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(selected)
  }

  const handleContinue = () => {
    if (!file) {
      toast.error('Please upload your photo first!')
      return
    }

    // Save file to sessionStorage as base64
    const reader = new FileReader()
    reader.onload = (e) => {
      sessionStorage.setItem('photoBase64', e.target.result)
      sessionStorage.setItem('photoType', file.type)
      navigate('/superlative')
    }
    reader.readAsDataURL(file)
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
          onClick={() => navigate('/profile')}
        >
          ← Back
        </p>

        <div className="text-5xl mb-4">📸</div>

        <h1 className="text-3xl font-black text-white">
          Your <span className="text-yellow-400">Star Moment</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Upload your best photo for the memory reel!
        </p>
      </motion.div>

      <div className="max-w-sm mx-auto w-full flex flex-col items-center">

        {/* Photo Preview / Upload Area */}
        <AnimatePresence mode="wait">
          {preview ? (
            // Polaroid Preview
            <motion.div
              key="preview"
              className="bg-white p-3 pb-10 rounded-lg shadow-2xl shadow-yellow-400/20 mb-6 relative"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ width: '220px' }}
            >
              <img
                src={preview}
                alt="Your photo"
                className="w-full aspect-square object-cover rounded-sm"
              />
              <p className="absolute bottom-2 left-0 right-0 text-center text-gray-600 text-xs font-medium">
                {student?.name}
              </p>
            </motion.div>
          ) : (
            // Upload placeholder
            <motion.div
              key="placeholder"
              onClick={() => fileInputRef.current?.click()}
              className="w-52 h-52 border-2 border-dashed border-yellow-400/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer mb-6 active:scale-95 transition-transform bg-yellow-400/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-5xl mb-3">🤳</span>
              <p className="text-yellow-400/70 text-sm font-medium">
                Tap to upload
              </p>
              <p className="text-white/20 text-xs mt-1">
                JPG, PNG up to 5MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Change photo button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-yellow-400/30 text-yellow-400 font-bold py-3 rounded-2xl active:scale-95 transition-transform"
          >
            {preview ? '🔄 Change Photo' : '📁 Choose from Gallery'}
          </button>

          {/* Continue button */}
          <motion.button
            onClick={handleContinue}
            disabled={!file}
            className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/25 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            whileTap={file ? { scale: 0.95 } : {}}
          >
            Continue →
          </motion.button>
        </div>

        {/* Tip */}
        <motion.p
          className="text-white/20 text-xs text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 This photo will be used for your personalised gift!
        </motion.p>
      </div>
    </div>
  )
}