import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId, attempt = 0) {
    // maybeSingle() returns null (no throw) when the row isn't there yet.
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (!data && attempt < 5) {
      // Brand-new signup: the handle_new_user trigger may not have committed
      // the profile row yet. Retry briefly before giving up.
      setTimeout(() => fetchProfile(userId, attempt + 1), 600)
      return
    }
    // Fallback profile so the app never renders without one (defaults to tutor view).
    setProfile(data || { id: userId, role: 'tutor', name: '', email: '' })
    setLoading(false)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function signUp(email, password, name) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    return error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function inviteTutor(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    return error
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, inviteTutor, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
