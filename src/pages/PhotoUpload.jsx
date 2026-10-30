import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { readStudentData } from '../utils/session'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldBtn, ReelLabel, BackBtn, ProgressDots } from '../components/UI'

const STEPS = ['branch', 'verify', 'profile', 'photo', 'superlative']
const MAX_SIDE = 1024

// Resize + re-encode as JPEG so the data URL fits in sessionStorage (~5MB limit)
const compressImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/jpeg', 0.85))
  }
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
  img.src = url
})

export default function PhotoUpload() {
  const navigate = useNavigate()
  const [student] = useState(readStudentData)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!student) navigate('/branch')
  }, [student, navigate])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (selected.size > 15 * 1024 * 1024) {
      toast.error('Photo too large! Max 15MB.')
      return
    }
    if (!selected.type.startsWith('image/')) {
      toast.error('Please select an image file!')
      return
    }
    setFile(selected)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(selected)
  }

  const handleContinue = async () => {
    if (!file) {
      toast.error('Please upload your photo first!')
      return
    }
    try {
      sessionStorage.setItem('photoBase64', await compressImage(file))
      navigate('/superlative')
    } catch {
      toast.error('Could not process this photo. Try a different one!')
    }
  }

  if (!student) return null

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <Particles />
      <Grain />
      <BackBtn onClick={() => navigate('/profile')} />
      <ProgressDots steps={STEPS} current="photo" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <ReelLabel number={4} />

        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#FFD700',
          fontSize: 'clamp(15px, 4.5vw, 22px)',
          textAlign: 'center', marginBottom: 6,
          textShadow: '0 0 20px #FFD70055',
        }}>
          Apni best photo daalo, star! 📸
        </h2>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          color: '#FFF8E777', fontSize: 12,
          marginBottom: 22, textAlign: 'center', lineHeight: 1.7,
        }}>
          Goes in the Memory Reel, Awards & Personalized Gift.<br />
          Choose wisely. Posterity is watching. 😄
        </p>

        {/* Upload / Preview */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #FFD70055',
              borderRadius: 12, padding: '44px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: 'rgba(255,215,0,0.02)',
              marginBottom: 18, transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#FFD700'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#FFD70055'}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>📽️</div>
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 11, letterSpacing: 1,
            }}>
              Tap to Upload Your Star Moment
            </div>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFF8E744', fontSize: 10, marginTop: 5,
            }}>
              Max 15MB — Images only
            </div>
          </div>
        ) : (
          <div className="animate-slideUp" style={{ textAlign: 'center', marginBottom: 18 }}>
            {/* Polaroid */}
            <div style={{
              display: 'inline-block',
              background: '#FFF8E7',
              padding: '10px 10px 32px',
              boxShadow: '0 8px 40px #00000088',
              transform: 'rotate(-1.5deg)',
              borderRadius: 2,
            }}>
              <img
                src={preview}
                alt="preview"
                style={{ width: 180, height: 180, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                fontFamily: "'Caveat', cursive",
                color: '#0A0A0A', fontSize: 13,
                textAlign: 'center', paddingTop: 7,
              }}>
                {student.name} - VIGAM 2026
              </div>
            </div>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#4CAF50', fontSize: 13, marginTop: 14,
            }}>
              Picture perfect! 🌟 Bilkul filmy!
            </div>
            <div
              onClick={() => { setPreview(null); setFile(null) }}
              style={{
                fontFamily: "'Caveat', cursive",
                color: '#FFD70077', fontSize: 12,
                cursor: 'pointer', marginTop: 5,
              }}
            >
              Change photo
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <GoldBtn onClick={handleContinue}>
          {preview ? 'Yeh wali pakki. Complete karo →' : 'Choose Photo 📽️'}
        </GoldBtn>
      </div>
    </div>
  )
}