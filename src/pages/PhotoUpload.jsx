import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldBtn, ReelLabel, BackBtn, ProgressDots } from '../components/UI'

const STEPS = ['branch', 'verify', 'profile', 'photo', 'superlative']

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
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Photo too large! Max 5MB.')
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

  const handleContinue = () => {
    if (!file) {
      toast.error('Please upload your photo first!')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      sessionStorage.setItem('photoBase64', e.target.result)
      sessionStorage.setItem('photoType', file.type)
      navigate('/superlative')
    }
    reader.readAsDataURL(file)
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
              Max 5MB — Images only
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