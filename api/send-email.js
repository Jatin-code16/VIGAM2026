import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

// Vercel serverless function: POST /api/send-email { erp_id }
//
// The client only says *who* just registered. Everything else (recipient,
// name, QR token) is read from the database with the service-role key, so
// this endpoint can only ever email a student's own address, once, shortly
// after they register.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_SENDER_EMAIL

const SEND_WINDOW_MS = 15 * 60 * 1000

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const erpId = typeof req.body?.erp_id === 'string' ? req.body.erp_id.trim().toUpperCase() : ''
  if (!erpId || erpId.length > 20) {
    return res.status(400).json({ success: false, error: 'Missing erp_id' })
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // Claim the send atomically so concurrent/repeated calls can't send twice
  const { data: student, error: claimError } = await supabase
    .from('students')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('erp_id', erpId)
    .eq('is_registered', true)
    .is('email_sent_at', null)
    .gte('registered_at', new Date(Date.now() - SEND_WINDOW_MS).toISOString())
    .select('name, email, branch, role, superlative, qr_token')
    .maybeSingle()

  if (claimError) {
    console.error('Claim error:', claimError)
    return res.status(500).json({ success: false, error: 'Database error' })
  }
  if (!student || !student.email || !student.qr_token) {
    return res.status(409).json({ success: false, error: 'Nothing to send' })
  }

  const releaseClaim = () => supabase
    .from('students')
    .update({ email_sent_at: null })
    .eq('erp_id', erpId)

  try {
    const qrValue = `VIGAM2026|${student.qr_token}`
    const qrPng = await QRCode.toBuffer(qrValue, { width: 300, margin: 2 })

    // Host the QR so it shows inline (most mail clients block data: URIs).
    // The file name is the unguessable token itself.
    let qrImageUrl = null
    const { error: uploadError } = await supabase.storage
      .from('qrcodes')
      .upload(`${student.qr_token}.png`, qrPng, { contentType: 'image/png', upsert: true })
    if (!uploadError) {
      qrImageUrl = supabase.storage.from('qrcodes').getPublicUrl(`${student.qr_token}.png`).data.publicUrl
    } else {
      console.error('QR upload failed, sending attachment only:', uploadError)
    }

    const name = escapeHtml(student.name)
    const branch = escapeHtml(student.branch)
    const erp = escapeHtml(erpId)
    const superlative = escapeHtml(student.superlative)
    const isSenior = student.role === 'senior'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Georgia',serif;">
  <div style="max-width:500px;margin:0 auto;padding:20px;">

    <div style="text-align:center;padding:30px 20px;background:linear-gradient(135deg,#1a1100,#0A0A0A);border:2px solid #FFD700;border-radius:16px;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:10px;">🎬</div>
      <h1 style="color:#FFD700;font-size:28px;margin:0;letter-spacing:4px;">VIGAM 2026</h1>
      <p style="color:#FFF8E7;font-size:14px;margin:6px 0 0;font-style:italic;">Where Bollywood Meets Binary</p>
    </div>

    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#FFF8E7;font-size:20px;">✅ Registration Confirmed!</h2>
      <p style="color:#FFF8E7aa;font-size:14px;line-height:1.6;">
        Hey <strong style="color:#FFD700;">${name}</strong>! 🌟<br/>
        You are officially registered for VIGAM 2026!
      </p>
    </div>

    <div style="background:linear-gradient(135deg,#0d0d0d,#1a1100);border:2px solid #FFD700;border-radius:14px;padding:24px;margin-bottom:20px;">

      <div style="border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Name</p>
        <p style="color:#FFF8E7;font-size:18px;margin:0;font-weight:bold;">${name}</p>
      </div>

      <div style="border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Branch</p>
        <p style="color:#FFF8E7;font-size:15px;margin:0;">${branch}</p>
      </div>

      <div style="border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">ERP ID</p>
        <p style="color:#FFF8E7;font-size:15px;margin:0;font-family:monospace;">${erp}</p>
      </div>

      <div style="border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Role</p>
        <p style="color:#FFD700;font-size:15px;margin:0;">${isSenior ? '🎓 Senior' : '⚡ Junior'}</p>
      </div>

      ${isSenior && superlative ? `
      <div style="background:rgba(255,215,0,0.08);border:1px solid #FFD70033;border-radius:10px;padding:12px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">🏆 Your Award</p>
        <p style="color:#FFD700;font-size:14px;margin:0;font-style:italic;">"${superlative}"</p>
      </div>
      ` : ''}

      <div style="background:#FFF8E7;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:#0A0A0A;font-size:13px;margin:0 0 12px;font-weight:bold;">🎟️ Your Entry QR Pass</p>
        ${qrImageUrl ? `
        <img
          src="${qrImageUrl}"
          alt="QR Pass"
          style="width:200px;height:200px;display:block;margin:0 auto;"
        />` : ''}
        <p style="color:#0A0A0A;font-size:11px;margin:10px 0 0;font-family:monospace;">${erp}</p>
        <p style="color:#555;font-size:11px;margin:6px 0 0;">
          Your QR is also attached to this email. Show it at the gate!
        </p>
      </div>

      <p style="color:#FFF8E755;font-size:10px;text-align:center;margin:12px 0 0;letter-spacing:1px;">
        SHOW QR AT THE GATE - APRIL 8, 2026
      </p>
    </div>

    <div style="background:rgba(255,215,0,0.05);border:1px solid #FFD70022;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="color:#FFD700;font-size:13px;margin:0 0 8px;font-weight:bold;">📅 Event Details</p>
      <p style="color:#FFF8E7aa;font-size:12px;margin:0;line-height:1.8;">
        Date: <strong style="color:#FFF8E7;">April 8, 2026</strong><br/>
        Screenshot your QR from the app!<br/>
        <span style="color:#FFF8E766;font-size:11px;">
          Check spam if this email is not in inbox.
        </span>
      </p>
    </div>

    <div style="text-align:center;">
      <p style="color:#FFD70044;font-size:11px;">
        🎬 VIGAM 2026 - Where Bollywood Meets Binary<br/>
        <span style="font-size:10px;color:#FFF8E722;">
          This is an automated email. Please do not reply.
        </span>
      </p>
    </div>

  </div>
</body>
</html>`

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'VIGAM 2026', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: student.email, name: student.name }],
        subject: `🎬 VIGAM 2026 - Registration Confirmed, ${student.name}!`,
        htmlContent,
        attachment: [{ name: `VIGAM2026_${erpId}_Pass.png`, content: qrPng.toString('base64') }],
      }),
    })

    if (!brevoResponse.ok) {
      console.error('Brevo error:', await brevoResponse.text())
      await releaseClaim()
      return res.status(502).json({ success: false, error: 'Email provider error' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    await releaseClaim()
    return res.status(500).json({ success: false, error: 'Failed to send email' })
  }
}
