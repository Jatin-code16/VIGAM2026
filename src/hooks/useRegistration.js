import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerStudent, sendConfirmationEmail, uploadPhoto } from '../utils/db'
import { buildQRValue } from '../constants/event'
import { buildDemoQRValue, createDemoRegistration } from '../utils/demo'

const ERROR_MESSAGES = {
  already_registered: 'Already registered! Check your institute email for your QR pass.',
  invalid_phone: 'Please enter a valid 10-digit phone number!',
  not_found: 'ERP ID not found in our records.',
}

// Registers the student stored in sessionStorage exactly once.
// The result is cached in sessionStorage so refreshing the pass page
// shows the same pass instead of registering (and emailing) again.
export function useRegistration({ failPath }) {
  const navigate = useNavigate()
  const started = useRef(false)
  const [student, setStudent] = useState(null)
  const [saving, setSaving] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // StrictMode runs effects twice in dev — don't register twice
    if (started.current) return
    started.current = true

    const register = async () => {
      const data = sessionStorage.getItem('studentData')
      if (!data) { navigate('/branch'); return }
      const parsed = JSON.parse(data)
      const photoBase64 = sessionStorage.getItem('photoBase64')
      if (photoBase64) setPhotoPreview(photoBase64)

      const cached = sessionStorage.getItem('registration')
      if (cached) {
        setStudent({ ...parsed, ...JSON.parse(cached) })
        setSaving(false)
        return
      }

      // Demo: fake pass, nothing saved, no email
      if (parsed.is_demo) {
        const result = createDemoRegistration()
        sessionStorage.setItem('registration', JSON.stringify(result))
        setTimeout(() => {
          setStudent({ ...parsed, ...result })
          setSaving(false)
        }, 1200)
        return
      }

      try {
        const photoPath = photoBase64 ? await uploadPhoto(parsed.erp_id, photoBase64) : null

        const { data: result, error } = await registerStudent({
          erpId: parsed.erp_id,
          phone: parsed.phone,
          superlative: parsed.superlative,
          photoPath,
          wantsToVolunteer: parsed.wants_to_volunteer,
        })

        if (error || !result) {
          const code = error?.message
          toast.error(ERROR_MESSAGES[code] || 'Registration failed! Please try again.')
          navigate(code === 'already_registered' ? '/' : failPath)
          return
        }

        sessionStorage.setItem('registration', JSON.stringify(result))
        setStudent({ ...parsed, ...result })
        setSaving(false)

        if (await sendConfirmationEmail(parsed.erp_id)) {
          setEmailSent(true)
          toast.success('Confirmation email sent! 📧')
        }

        // Clear session after 30 seconds (shared devices)
        setTimeout(() => sessionStorage.clear(), 30000)
      } catch {
        toast.error('Something went wrong! Please try again.')
        navigate(failPath)
      }
    }
    register()
  }, [navigate, failPath])

  return {
    student,
    saving,
    photoPreview,
    emailSent,
    isDemo: !!student?.is_demo,
    rank: student?.is_demo ? 'DEMO' : student?.registered_rank,
    qrValue: !student?.qr_token
      ? null
      : student.is_demo ? buildDemoQRValue(student.qr_token) : buildQRValue(student.qr_token),
  }
}
