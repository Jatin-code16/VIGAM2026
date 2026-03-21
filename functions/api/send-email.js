export async function onRequest(context) {
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Only allow POST
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const { name, email, erp_id, branch, role, superlative, qr_data } = await context.request.json()

    if (!name || !email || !erp_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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
        <p style="color:#FFF8E7;font-size:15px;margin:0;font-family:monospace;">${erp_id}</p>
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
        <p style="color:#0A0A0A;font-size:13px;margin:0 0 8px;font-weight:bold;">🎟️ Your QR Pass</p>
        <p style="color:#0A0A0A;font-size:12px;margin:0;font-family:monospace;">${erp_id}</p>
        <p style="color:#555;font-size:11px;margin:8px 0 0;">
          Your QR pass is shown on the registration screen.<br/>
          Screenshot it and bring it to the event!
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

    // Send via Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': context.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'VIGAM 2026',
          email: 'jatinnaiknawa2@gmail.com',
        },
        to: [{ email, name }],
        subject: `🎬 VIGAM 2026 - Registration Confirmed, ${name}!`,
        htmlContent,
      })
    })

    const responseText = await brevoResponse.text()

    if (!brevoResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: responseText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}
