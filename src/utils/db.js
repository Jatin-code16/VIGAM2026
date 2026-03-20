import { supabase } from '../supabaseClient'

// Get student by ERP ID
export const getStudentByERP = async (erpId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('erp_id', erpId.trim().toUpperCase())
    .single()
  return { data, error }
}

// Get total registered count
export const getRegisteredCount = async () => {
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_registered', true)
  return count || 0
}

// Get present count
export const getPresentCount = async () => {
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_present', true)
  return count || 0
}

// Mark student as present (for check-in)
export const markPresent = async (erpId) => {
  const { data, error } = await supabase
    .from('students')
    .update({
      is_present: true,
      checked_in_at: new Date().toISOString()
    })
    .eq('erp_id', erpId)
    .select()
    .single()
  return { data, error }
}

// Get all registered students (for admin)
export const getAllStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('registered_rank', { ascending: true })
  return { data, error }
}