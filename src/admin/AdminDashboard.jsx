import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

// ============================================
// CHANGE THIS PASSWORD!
// ============================================
const ADMIN_PASSWORD = 'jatin@1612'

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [downloading, setDownloading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    seniors: 0,
    juniors: 0,
    present: 0,
    volunteers: 0,
  })

  // Check if already authed in session
  useEffect(() => {
    const saved = sessionStorage.getItem('adminAuthed')
    if (saved === 'true') setAuthed(true)
  }, [])

  // Fetch students when authed
  useEffect(() => {
    if (!authed) return
    fetchStudents()

    // Realtime subscription
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'students'
      }, () => fetchStudents())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [authed])

  const fetchStudents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('registered_rank', { ascending: true, nullsFirst: false })

    if (error) {
      toast.error('Failed to fetch students!')
      setLoading(false)
      return
    }

    setStudents(data || [])

    // Calculate stats
    const registered = data.filter(s => s.is_registered)
    setStats({
      total: data.length,
      registered: registered.length,
      seniors: registered.filter(s => s.role === 'senior').length,
      juniors: registered.filter(s => s.role === 'junior').length,
      present: data.filter(s => s.is_present).length,
      volunteers: data.filter(s => s.wants_to_volunteer).length,
    })

    setLoading(false)
  }

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('adminAuthed', 'true')
      toast.success('Welcome, Admin! 👋')
    } else {
      toast.error('Wrong password!')
    }
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['ERP ID', 'Name', 'Branch', 'Year', 'Role', 'Phone', 'Superlative', 'Registered At', 'Is Present', 'Checked In At']
    const rows = students
      .filter(s => s.is_registered)
      .map(s => [
        s.erp_id,
        s.name,
        s.branch,
        s.year,
        s.role,
        s.phone,
        s.superlative || '',
        s.registered_at ? new Date(s.registered_at).toLocaleString() : '',
        s.is_present ? 'Yes' : 'No',
        s.checked_in_at ? new Date(s.checked_in_at).toLocaleString() : '',
      ])

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    saveAs(blob, 'vigam2026_attendance.csv')
    toast.success('CSV exported! ✅')
  }

  // Download all QRs as ZIP
  const downloadQRsAsZip = async () => {
    setDownloading(true)
    toast('Generating QR ZIP... this may take a minute!', { icon: '⏳' })

    const registered = students.filter(s => s.is_registered)
    const zip = new JSZip()
    const qrFolder = zip.folder('VIGAM2026_QRs')

    for (const student of registered) {
      try {
        // Create canvas for each QR
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 500

        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, 400, 500)

        // Gold border
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 4
        ctx.strokeRect(10, 10, 380, 480)

        // Title
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('VIGAM 2026', 200, 50)

        // Name
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 18px Arial'
        ctx.fillText(student.name, 200, 80)

        // Branch + ERP
        ctx.fillStyle = '#999999'
        ctx.font = '14px Arial'
        ctx.fillText(`${student.branch} | ${student.erp_id}`, 200, 105)

        // QR Code using qrcode library
        const QRCodeLib = await import('qrcode')
        const qrDataUrl = await QRCodeLib.toDataURL(
          `VIGAM2026|${student.erp_id}|${student.name}`,
          { width: 280, margin: 1 }
        )

        // Draw QR on canvas
        const qrImg = new Image()
        await new Promise((resolve) => {
          qrImg.onload = resolve
          qrImg.src = qrDataUrl
        })
        ctx.drawImage(qrImg, 60, 120, 280, 280)

        // Superlative
        if (student.superlative) {
          ctx.fillStyle = '#FFD700'
          ctx.font = 'italic 12px Arial'
          ctx.textAlign = 'center'
          const words = student.superlative.split(' ')
          const line1 = words.slice(0, 4).join(' ')
          const line2 = words.slice(4).join(' ')
          ctx.fillText(line1, 200, 430)
          if (line2) ctx.fillText(line2, 200, 450)
        }

        // Date
        ctx.fillStyle = '#666666'
        ctx.font = '12px Arial'
        ctx.fillText('April 8, 2026', 200, 480)

        // Convert to blob and add to ZIP
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        qrFolder.file(`${student.erp_id}_${student.name.replace(/\s/g, '_')}.png`, blob)

      } catch (err) {
        console.log(`Failed QR for ${student.erp_id}:`, err)
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'VIGAM2026_QR_Passes.zip')
    setDownloading(false)
    toast.success(`Downloaded ${registered.length} QR passes! ✅`)
  }

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.erp_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'seniors') return matchesSearch && s.role === 'senior'
    if (filter === 'juniors') return matchesSearch && s.role === 'junior'
    if (filter === 'registered') return matchesSearch && s.is_registered
    if (filter === 'present') return matchesSearch && s.is_present
    if (filter === 'volunteers') return matchesSearch && s.wants_to_volunteer
    return matchesSearch
  })

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-black text-white">
              Admin <span className="text-yellow-400">Access</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">
              VIGAM 2026 Control Panel
            </p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-yellow-400/60 mb-4"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-2xl"
          >
            Enter Dashboard →
          </button>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // MAIN DASHBOARD
  // ============================================
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-black border-b border-yellow-400/20 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black text-yellow-400">VIGAM 2026</h1>
          <p className="text-white/40 text-xs">Admin Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform"
          >
            📊 Export CSV
          </button>
          <button
            onClick={downloadQRsAsZip}
            disabled={downloading}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {downloading ? '⏳ Generating...' : '📦 Download QRs'}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Students', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Registered', value: stats.registered, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Seniors', value: stats.seniors, color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { label: 'Juniors', value: stats.juniors, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Present', value: stats.present, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Volunteers', value: stats.volunteers, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} border border-white/10 rounded-2xl p-4 text-center`}
            >
              <p className={`${stat.color} text-3xl font-black`}>{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ERP, or branch..."
            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/60"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none"
          >
            <option value="all">All Students</option>
            <option value="registered">Registered Only</option>
            <option value="seniors">Seniors Only</option>
            <option value="juniors">Juniors Only</option>
            <option value="present">Present at Event</option>
            <option value="volunteers">Volunteers</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-white/40 text-sm">
            Showing {filteredStudents.length} students
          </p>
          <button
            onClick={fetchStudents}
            className="text-yellow-400/60 text-sm underline"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🎬
            </motion.div>
            <p className="text-white/40">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Rank</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Student</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Branch</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Role</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Photo</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">QR</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-white/40 text-xs uppercase tracking-widest">Present</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.erp_id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <span className="text-yellow-400 font-bold">
                        {student.registered_rank ? `#${student.registered_rank}` : '—'}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3">
                      <p className="text-white font-bold">{student.name}</p>
                      <p className="text-white/40 text-xs font-mono">{student.erp_id}</p>
                      <p className="text-white/30 text-xs">{student.phone}</p>
                    </td>

                    {/* Branch */}
                    <td className="px-4 py-3">
                      <span className="text-white/70 text-sm">{student.branch}</span>
                      <p className="text-white/30 text-xs">Year {student.year}</p>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`
                        text-xs font-bold px-2 py-1 rounded-full
                        ${student.role === 'senior'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-blue-400/20 text-blue-400'}
                      `}>
                        {student.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}
                      </span>
                    </td>

                    {/* Photo */}
                    <td className="px-4 py-3">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-yellow-400/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/20 text-xs">
                          No photo
                        </div>
                      )}
                    </td>

                    {/* QR */}
                    <td className="px-4 py-3">
                      {student.is_registered ? (
                        <div className="bg-white p-1 rounded-lg inline-block">
                          <QRCodeCanvas
                            value={`VIGAM2026|${student.erp_id}|${student.name}`}
                            size={50}
                          />
                        </div>
                      ) : (
                        <span className="text-white/20 text-xs">Not registered</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {student.is_registered ? (
                        <span className="text-green-400 text-xs font-bold">✅ Registered</span>
                      ) : (
                        <span className="text-white/30 text-xs">⬜ Pending</span>
                      )}
                      {student.wants_to_volunteer && (
                        <p className="text-purple-400 text-xs mt-1">🙋 Volunteer</p>
                      )}
                    </td>

                    {/* Present */}
                    <td className="px-4 py-3">
                      {student.is_present ? (
                        <span className="text-green-400 font-bold text-sm">✅ Present</span>
                      ) : (
                        <span className="text-white/20 text-sm">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/30">No students found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
