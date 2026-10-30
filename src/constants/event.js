// IST so it doesn't depend on the visitor's device timezone
export const EVENT_START = '2026-04-08T18:00:00+05:30'

export const VALID_BRANCHES = ['IT', 'Cyber', 'DS', 'MCA']

// QR payload: VIGAM2026|<qr_token uuid>
const QR_PREFIX = 'VIGAM2026'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const buildQRValue = (token) => `${QR_PREFIX}|${token}`

export const parseQRValue = (text) => {
  const [prefix, token] = (text || '').trim().split('|')
  return prefix === QR_PREFIX && UUID_RE.test(token || '') ? token : null
}
