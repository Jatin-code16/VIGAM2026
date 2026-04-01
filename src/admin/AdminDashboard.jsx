import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { Grain, Particles, GoldBtn, GoldCard, GoldInput, Divider } from '../components/UI'

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
    total: 0, registered: 0, seniors: 0,
    juniors: 0, present: 0, volunteers: 0,
  })

  useEffect(() => {
    const saved = sessionStorage.getItem('adminAuthed')
    if (saved === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchStudents()
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' },
        () => fetchStudents())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [authed])

  const fetchStudents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('registered_rank', { ascending: true, nullsFirst: false })

    if (error) { toast.error('Failed to fetch!'); setLoading(false); return }

    setStudents(data || [])
    const reg = data.filter(s => s.is_registered)
    setStats({
      total: data.length,
      registered: reg.length,
      seniors: reg.filter(s => s.role === 'senior').length,
      juniors: reg.filter(s => s.role === 'junior').length,
      volunteers: data.filter(s => s.wants_to_volunteer).length,
      present: data.filter(s => s.is_present).length,
      dinner: data.filter(s => s.is_at_dinner).length,
    })
    setLoading(false)
  }

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('adminAuthed', 'true')
      toast.success('Welcome, Director! 🎬')
    } else {
      toast.error('Wrong password! Retake needed. 🎬')
    }
  }

  const exportCSV = () => {
    const headers = ['ERP ID', 'Name', 'Branch', 'Year', 'Role', 'Phone', 'Superlative', 'Registered At', 'Is Present', 'Checked In At']
    const rows = students
      .filter(s => s.is_registered)
      .map(s => [
        s.erp_id, s.name, s.branch, s.year, s.role, s.phone,
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

  const downloadQRsAsZip = async () => {
    setDownloading(true)
    toast('Generating QR ZIP... this may take a minute!', { icon: '⏳' })
    const registered = students.filter(s => s.is_registered)
    const zip = new JSZip()
    const qrFolder = zip.folder('VIGAM2026_QRs')

    for (const student of registered) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 500
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0A0A0A'
        ctx.fillRect(0, 0, 400, 500)
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 4
        ctx.strokeRect(10, 10, 380, 480)
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 22px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('VIGAM 2026', 200, 50)
        ctx.fillStyle = '#FFF8E7'
        ctx.font = 'bold 16px Arial'
        ctx.fillText(student.name, 200, 80)
        ctx.fillStyle = '#FFD70088'
        ctx.font = '12px Arial'
        ctx.fillText(`${student.branch} | ${student.erp_id}`, 200, 102)

        const QRCodeLib = await import('qrcode')
        const qrDataUrl = await QRCodeLib.toDataURL(
          `VIGAM2026|${student.erp_id}|${student.name}`,
          { width: 280, margin: 1 }
        )
        const qrImg = new Image()
        await new Promise(resolve => { qrImg.onload = resolve; qrImg.src = qrDataUrl })
        ctx.drawImage(qrImg, 60, 120, 280, 280)

        if (student.superlative) {
          ctx.fillStyle = '#FFD700'
          ctx.font = 'italic 11px Arial'
          ctx.fillText(student.superlative.slice(0, 50), 200, 430)
        }
        ctx.fillStyle = '#FFD70055'
        ctx.font = '11px Arial'
        ctx.fillText('April 8, 2026 • VIGAM 2026', 200, 478)

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        qrFolder.file(`${student.erp_id}_${student.name.replace(/\s/g, '_')}.png`, blob)
      } catch (err) {
        console.log(`Failed QR for ${student.erp_id}`)
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'VIGAM2026_QR_Passes.zip')
    setDownloading(false)
    toast.success(`Downloaded ${registered.length} QR passes! ✅`)
  }

  const downloadPhotosAsZip = async () => {
    const registered = students.filter(s => s.is_registered && s.photo_url)

    if (registered.length === 0) {
      toast.error('No photos found!')
      return
    }

    toast(`Downloading ${registered.length} photos...`, { icon: '⏳' })

    const zip = new JSZip()
    const photoFolder = zip.folder('VIGAM2026_Photos')
    let downloaded = 0
    let failed = 0

    for (const student of registered) {
      try {
        const response = await fetch(student.photo_url)
        const blob = await response.blob()
        const ext = blob.type.includes('png') ? 'png' : 'jpg'
        photoFolder.file(
          `${student.branch}_${student.erp_id}_${student.name.replace(/\s/g, '_')}.${ext}`,
          blob
        )
        downloaded++
      } catch (err) {
        failed++
        console.log(`Failed photo for ${student.erp_id}`)
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'VIGAM2026_Photos.zip')
    toast.success(`Downloaded ${downloaded} photos! ✅`)
  }

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
  // LOGIN
  // ============================================
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, position: 'relative',
      }}>
        <Particles />
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 340 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🎬</div>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 22,
              textShadow: '0 0 20px #FFD70055', marginBottom: 6,
            }}>
              Director's Access
            </h1>
            <p style={{
              fontFamily: "'Caveat', cursive",
              color: '#FFD70077', fontSize: 14,
            }}>
              VIGAM 2026 Control Room
            </p>
          </div>

          <GoldCard>
            <div style={{ marginBottom: 14 }}>
              <GoldInput
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter director's password..."
              />
            </div>
            <GoldBtn onClick={handleLogin}>
              Enter Control Room →
            </GoldBtn>
          </GoldCard>
        </div>
      </div>
    )
  }

  // ============================================
  // DASHBOARD
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFF8E7', position: 'relative' }}>
      <Grain />

      {/* Header */}
      <div style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #FFD70033',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 16,
            textShadow: '0 0 10px #FFD70055',
          }}>
            🎬 VIGAM 2026
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70055', fontSize: 12,
          }}>
            Director's Control Room
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportCSV}
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.4)',
              color: '#4ade80',
              padding: '8px 14px', borderRadius: 8,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11, cursor: 'pointer',
            }}
          >
            📊 Export CSV
          </button>
          <button
            onClick={downloadQRsAsZip}
            disabled={downloading}
            style={{
              background: downloading ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.15)',
              border: '1px solid #FFD70044',
              color: '#FFD700',
              padding: '8px 14px', borderRadius: 8,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11, cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.5 : 1,
            }}
          >
            {downloading ? '⏳ Generating...' : '📦 Download QRs'}
          </button>
          <button
            onClick={downloadPhotosAsZip}
            style={{
              background: 'rgba(192,132,252,0.15)',
              border: '1px solid #c084fc44',
              color: '#c084fc',
              padding: '8px 14px', borderRadius: 8,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11, cursor: 'pointer',
            }}
          >
            📸 Download Photos
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, marginBottom: 24,
        }}>
          {[
            { label: 'Total Students', value: stats.total, color: '#FFF8E7' },
            { label: 'Registered', value: stats.registered, color: '#FFD700' },
            { label: 'Seniors', value: stats.seniors, color: '#fb923c' },
            { label: 'Juniors', value: stats.juniors, color: '#60a5fa' },
            { label: 'Volunteers', value: stats.volunteers, color: '#c084fc' },
            { label: 'Present', value: stats.present, color: '#4ade80' },
            { label: 'At Dinner', value: stats.dinner, color: '#fbbf24', bg: 'bg-yellow-400/10' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #FFD70022',
              borderRadius: 12, padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: stat.color, fontSize: 28, fontWeight: 900,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#FFF8E744', fontSize: 10, marginTop: 4,
                letterSpacing: 1,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ERP, or branch..."
            style={{
              flex: 1, minWidth: 200,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #FFD70033',
              borderRadius: 8, padding: '10px 14px',
              color: '#FFF8E7',
              fontFamily: "'Poppins', sans-serif", fontSize: 13,
            }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #FFD70033',
              borderRadius: 8, padding: '10px 14px',
              color: '#FFF8E7',
              fontFamily: "'Poppins', sans-serif", fontSize: 13,
            }}
          >
            <option value="all" style={{ background: '#0A0A0A' }}>All Students</option>
            <option value="registered" style={{ background: '#0A0A0A' }}>Registered</option>
            <option value="seniors" style={{ background: '#0A0A0A' }}>Seniors</option>
            <option value="juniors" style={{ background: '#0A0A0A' }}>Juniors</option>
            <option value="present" style={{ background: '#0A0A0A' }}>Present</option>
            <option value="volunteers" style={{ background: '#0A0A0A' }}>Volunteers</option>
          </select>
          <button
            onClick={fetchStudents}
            style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid #FFD70033',
              color: '#FFD700', padding: '10px 16px',
              borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif", fontSize: 12,
            }}
          >
            🔄 Refresh
          </button>
        </div>

        <div style={{
          fontFamily: "'Poppins', sans-serif",
          color: '#FFD70055', fontSize: 11,
          marginBottom: 12, letterSpacing: 1,
        }}>
          Showing {filteredStudents.length} students
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#FFD700', fontSize: 32,
              animation: 'stamp 0.5s ease infinite alternate',
            }}>
              🎬
            </div>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              color: '#FFD70055', marginTop: 12,
            }}>
              Loading students...
            </p>
          </div>
        ) : (
          <div style={{
            border: '1px solid #FFD70022',
            borderRadius: 12, overflow: 'auto',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #FFD70022' }}>
                  {['Rank', 'Student', 'Branch', 'Role', 'Photo', 'QR', 'Status', 'Present'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontFamily: "'Poppins', sans-serif",
                      color: '#FFD70066', fontSize: 10,
                      letterSpacing: 2, textTransform: 'uppercase',
                      background: 'rgba(255,215,0,0.03)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.erp_id}
                    style={{ borderBottom: '1px solid #FFD70011' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: "'Cinzel Decorative', serif",
                        color: '#FFD700', fontSize: 12,
                      }}>
                        {student.registered_rank ? `#${student.registered_rank}` : '—'}
                      </span>
                    </td>

                    {/* Student */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: '#FFF8E7', fontWeight: 600, fontSize: 13,
                      }}>
                        {student.name}
                      </div>
                      <div style={{
                        fontFamily: "'Poppins', monospace",
                        color: '#FFD70066', fontSize: 10,
                      }}>
                        {student.erp_id}
                      </div>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: '#FFF8E733', fontSize: 10,
                      }}>
                        {student.phone}
                      </div>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: '#FFF8E7aa', fontSize: 12,
                      }}>
                        {student.branch}
                      </div>
                      <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: '#FFF8E744', fontSize: 10,
                      }}>
                        Year {student.year}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 10, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 20,
                        background: student.role === 'senior'
                          ? 'rgba(255,215,0,0.15)'
                          : 'rgba(96,165,250,0.15)',
                        color: student.role === 'senior' ? '#FFD700' : '#60a5fa',
                        border: `1px solid ${student.role === 'senior' ? '#FFD70033' : '#60a5fa33'}`,
                      }}>
                        {student.role === 'senior' ? '🎓 Senior' : '⚡ Junior'}
                      </span>
                    </td>

                    {/* Photo */}
                    <td style={{ padding: '12px 16px' }}>
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #FFD70044',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(255,215,0,0.05)',
                          border: '1px solid #FFD70022',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFD70033', fontSize: 10,
                        }}>
                          —
                        </div>
                      )}
                    </td>

                    {/* QR */}
                    <td style={{ padding: '12px 16px' }}>
                      {student.is_registered ? (
                        <div style={{
                          background: '#FFF8E7',
                          padding: 4, borderRadius: 6,
                          display: 'inline-block',
                        }}>
                          <QRCodeCanvas
                            value={`VIGAM2026|${student.erp_id}|${student.name}`}
                            size={40}
                          />
                        </div>
                      ) : (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: '#FFF8E722', fontSize: 10,
                        }}>
                          Not registered
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {student.is_registered ? (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: '#4ade80', fontSize: 11, fontWeight: 600,
                        }}>
                          ✅ Registered
                        </span>
                      ) : (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: '#FFF8E733', fontSize: 11,
                        }}>
                          ⬜ Pending
                        </span>
                      )}
                      {student.wants_to_volunteer && (
                        <div style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: '#c084fc', fontSize: 10, marginTop: 2,
                        }}>
                          🙋 Volunteer
                        </div>
                      )}
                    </td>

                    {/* Present */}
                    <td style={{ padding: '12px 16px' }}>
                      {student.is_present ? (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: '#4ade80', fontWeight: 700, fontSize: 13,
                        }}>
                          ✅
                        </span>
                      ) : (
                        <span style={{ color: '#FFF8E722' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                <p style={{
                  fontFamily: "'Caveat', cursive",
                  color: '#FFD70055', fontSize: 16,
                }}>
                  No students found in this scene!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}