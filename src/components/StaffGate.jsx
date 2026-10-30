import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'
import { getStaffRole } from '../utils/db'
import { Grain, Particles, GoldBtn, GoldCard, GoldInput } from './UI'

// Supabase Auth login for staff screens. Access is decided by the `staff`
// table server-side — this component only decides what to render.
export default function StaffGate({ allowedRoles, icon, title, subtitle, buttonLabel, children }) {
  const [role, setRole] = useState(undefined) // undefined = checking, null = signed out / not staff
  const [signedIn, setSignedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const refresh = async (session) => {
      setSignedIn(!!session)
      setRole(session ? await getStaffRole() : null)
    }
    supabase.auth.getSession().then(({ data }) => refresh(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't await Supabase calls inside the callback (can deadlock the auth client)
      setTimeout(() => refresh(session), 0)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error('Enter email and password!')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) toast.error('Wrong credentials! Retake needed. 🎬')
    setPassword('')
  }

  const signOut = () => supabase.auth.signOut()

  if (role === undefined) return null

  if (role && allowedRoles.includes(role)) {
    return (
      <>
        {children}
        <button
          onClick={signOut}
          style={{
            position: 'fixed', bottom: 12, left: 12, zIndex: 20,
            background: 'rgba(0,0,0,0.6)', border: '1px solid #FFD70033',
            color: '#FFD70088', padding: '6px 12px', borderRadius: 6,
            fontFamily: "'Poppins', sans-serif", fontSize: 10, cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </>
    )
  }

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
          <div style={{ fontSize: 52, marginBottom: 8 }}>{icon}</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#FFD700', fontSize: 22,
            textShadow: '0 0 20px #FFD70055', marginBottom: 6,
          }}>
            {title}
          </h1>
          <p style={{
            fontFamily: "'Caveat', cursive",
            color: '#FFD70077', fontSize: 14,
          }}>
            {subtitle}
          </p>
        </div>

        <GoldCard>
          {signedIn ? (
            <>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                color: '#f87171', fontSize: 13,
                textAlign: 'center', marginBottom: 14,
              }}>
                This account doesn't have access to this screen.
              </p>
              <GoldBtn onClick={signOut}>Sign out</GoldBtn>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 10 }}>
                <GoldInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Staff email..."
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <GoldInput
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Password..."
                />
              </div>
              <GoldBtn onClick={handleLogin} disabled={busy}>
                {busy ? 'Checking...' : buttonLabel}
              </GoldBtn>
            </>
          )}
        </GoldCard>
      </div>
    </div>
  )
}
