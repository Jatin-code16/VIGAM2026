import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, erp_id, branch, role, superlative, qr_data } = req.body

  if (!name || !email || !erp_id) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Generate QR code as base64 image
    const QRCode = await import('qrcode')
    const qrBase64 = await QRCode.toDataURL(
      qr_data || `VIGAM2026|${erp_id}|${name}`,
      { width: 300, margin: 2 }
    )
    const qrBuffer = Buffer.from(qrBase64.split(',')[1], 'base64')

    // Email content based on role
    const isSenior = role === 'senior'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Georgia',serif;">
  
  <div style="max-width:500px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:30px 20px;background:linear-gradient(135deg,#1a1100,#0A0A0A);border:2px solid #FFD700;border-radius:16px;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:10px;">🎬</div>
      <h1 style="color:#FFD700;font-size:28px;margin:0;letter-spacing:4px;">VIGAM 2026</h1>
      <p style="color:#FFF8E7;font-size:14px;margin:6px 0 0;font-style:italic;">Where Bollywood Meets Binary</p>
    </div>

    <!-- Success Message -->
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#FFF8E7;font-size:20px;">
        ✅ Registration Confirmed!
      </h2>
      <p style="color:#FFF8E7aa;font-size:14px;line-height:1.6;">
        Hey <strong style="color:#FFD700;">${name}</strong>! 🌟<br/>
        You're officially registered for VIGAM 2026!
      </p>
    </div>

    <!-- Pass Card -->
    <div style="background:linear-gradient(135deg,#0d0d0d,#1a1100);border:2px solid #FFD700;border-radius:14px;padding:24px;margin-bottom:20px;">
      
      <div style="border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Name</p>
        <p style="color:#FFF8E7;font-size:18px;margin:0;font-weight:bold;">${name}</p>
      </div>

      <div style="display:flex;gap:20px;border-bottom:1px solid #FFD70033;padding-bottom:14px;margin-bottom:14px;">
        <div>
          <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Branch</p>
          <p style="color:#FFF8E7;font-size:15px;margin:0;">${branch}</p>
        </div>
        <div>
          <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">ERP ID</p>
          <p style="color:#FFF8E7;font-size:15px;margin:0;font-family:monospace;">${erp_id}</p>
        </div>
        <div>
          <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Role</p>
          <p style="color:#FFD700;font-size:15px;margin:0;">${isSenior ? '🎓 Senior' : '⚡ Junior'}</p>
        </div>
      </div>

      ${isSenior && superlative ? `
      <div style="background:rgba(255,215,0,0.08);border:1px solid #FFD70033;border-radius:10px;padding:12px;margin-bottom:14px;">
        <p style="color:#FFD70077;font-size:10px;letter-spacing:2px;margin:0 0 6px;text-transform:uppercase;">🏆 Your Award</p>
        <p style="color:#FFD700;font-size:14px;margin:0;font-style:italic;">"${superlative}"</p>
      </div>
      ` : ''}

      <!-- QR Code -->
      <div style="text-align:center;background:#FFF8E7;border-radius:12px;padding:16px;">
        <img src="cid:qrcode" alt="QR Pass" style="width:200px;height:200px;"/>
        <p style="color:#0A0A0A;font-size:11px;margin:8px 0 0;font-family:monospace;">${erp_id}</p>
      </div>

      <p style="color:#FFF8E755;font-size:10px;text-align:center;margin:12px 0 0;letter-spacing:1px;">
        SHOW THIS QR AT THE GATE • APRIL 8, 2026
      </p>
    </div>

    <!-- Event Details -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid #FFD70022;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="color:#FFD700;font-size:13px;margin:0 0 8px;font-weight:bold;">📅 Event Details</p>
      <p style="color:#FFF8E7aa;font-size:12px;margin:4px 0;line-height:1.6;">
        Date: <strong style="color:#FFF8E7;">April 8, 2026</strong><br/>
        Screenshot your QR pass above!<br/>
        You'll receive a reminder before the event.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#FFD70044;font-size:11px;">
        🎬 VIGAM 2026 — Where Bollywood Meets Binary<br/>
        <span style="font-size:10px;color:#FFF8E722;">
          This is an automated email. Please don't reply.
        </span>
      </p>
    </div>

  </div>
</body>
</html>`

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'VIGAM 2026 <onboarding@resend.dev>',
      to: email,
      subject: `🎬 VIGAM 2026 — Registration Confirmed, ${name}!`,
      html: htmlContent,
      attachments: [
        {
          filename: `VIGAM2026_${erp_id}_Pass.png`,
          content: qrBuffer,
        }
      ]
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ success: false, error })
    }

    console.log(`✅ Email sent to ${email}`)
    return res.status(200).json({ success: true, data })

  } catch (err) {
    console.error('Email error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}