// Demo mode: lets visitors who aren't students walk through the whole flow.
// Nothing is written to Supabase, no email is sent, and the demo QR uses a
// different prefix so the gate scanner always rejects it.

const DEMO_KEY = 'demoMode'
const DEMO_QR_PREFIX = 'VIGAM2026-DEMO'

export const isDemo = () => {
  try {
    return sessionStorage.getItem(DEMO_KEY) === 'true'
  } catch {
    return false
  }
}

export const startDemo = (navigate) => {
  sessionStorage.clear()
  sessionStorage.setItem(DEMO_KEY, 'true')
  navigate('/branch')
}

// Real registration must never inherit a leftover demo session
export const startRealRegistration = (navigate) => {
  sessionStorage.clear()
  navigate('/branch')
}

export const createDemoStudent = (branch, role, erpId) => ({
  erp_id: (erpId || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    || 'DEMO' + Math.floor(1000 + Math.random() * 9000),
  name: 'Demo Guest',
  branch,
  year: role === 'senior' ? (branch === 'MCA' ? 2 : 4) : 1,
  role,
  is_registered: false,
  is_demo: true,
})

export const createDemoRegistration = () => ({
  qr_token: crypto.randomUUID(),
  registered_rank: null,
  is_demo: true,
})

export const buildDemoQRValue = (token) => `${DEMO_QR_PREFIX}|${token}`
