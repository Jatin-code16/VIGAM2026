import { supabase } from '../supabaseClient'

// All student reads/writes go through the Postgres functions in
// supabase/migrations — the anon key can't touch the students table directly.

// { registered, present, at_dinner }
export const getEventCounts = async () => {
  const { data } = await supabase.rpc('event_counts')
  return data || { registered: 0, present: 0, at_dinner: 0 }
}

// Basic profile for the "is this you?" screen
export const lookupStudent = async (erpId) => {
  const { data, error } = await supabase
    .rpc('lookup_student', { p_erp_id: erpId.trim().toUpperCase() })
    .maybeSingle()
  return { data, error }
}

// Upload a compressed JPEG data URL, returns the storage path (or null).
// The random name keeps photo URLs unguessable.
export const uploadPhoto = async (erpId, dataUrl) => {
  const blob = await (await fetch(dataUrl)).blob()
  const path = `${erpId}_${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage
    .from('photos')
    .upload(path, blob, { contentType: 'image/jpeg' })
  return error ? null : path
}

// photo_url holds a storage path (older rows may hold a full URL)
export const photoPublicUrl = (value) => {
  if (!value) return null
  if (/^https?:\/\//.test(value)) return value
  return supabase.storage.from('photos').getPublicUrl(value).data.publicUrl
}

// Atomically registers the student. Returns { data: { qr_token, registered_rank, role, email }, error }
// error.message is one of: invalid_phone, not_found,
// already_registered, invalid_photo (or a network/db error)
export const registerStudent = async ({ erpId, phone, superlative, photoPath, wantsToVolunteer }) => {
  const { data, error } = await supabase
    .rpc('register_student', {
      p_erp_id: erpId,
      p_phone: phone,
      p_superlative: superlative || null,
      p_photo_path: photoPath || null,
      p_wants_to_volunteer: !!wantsToVolunteer,
    })
    .single()
  return { data, error }
}

// Server looks up the recipient itself, so this can only email the student's own inbox, once
export const sendConfirmationEmail = async (erpId) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ erp_id: erpId }),
    })
    const data = await response.json()
    return !!data.success
  } catch (err) {
    console.log('Email failed silently:', err)
    return false
  }
}

// Staff check-in. Pass { token } from a QR or { erpId } for manual entry.
// Returns { status, name, branch, role, superlative }
export const checkIn = async (station, { token, erpId }) => {
  const fn = station === 'dinner' ? 'dinner_check_in' : 'gate_check_in'
  const { data, error } = await supabase.rpc(fn, {
    p_token: token || null,
    p_erp_id: erpId ? erpId.trim().toUpperCase() : null,
  })
  if (error) throw error
  return data
}

// Current user's staff role: 'admin' | 'gate' | 'dinner' | null
export const getStaffRole = async () => {
  const { data } = await supabase.rpc('staff_role')
  return data || null
}
