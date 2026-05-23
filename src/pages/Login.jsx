import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isConfigured } from '../lib/supabase'
import { GraduationCap, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(form.email, form.password)
      if (err) setError(err.message)
    } else {
      if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return }
      const err = await signUp(form.email, form.password, form.name)
      if (err) setError(err.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--color-canvas)' }}>
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-10%] left-[15%] w-96 h-96 bg-violet-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">TutorHQ</h1>
          <p className="text-gray-500 text-[15px] mt-1.5">Run your tutoring business, beautifully.</p>
        </div>

        {!isConfigured && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <div className="flex gap-2 font-semibold mb-1"><AlertTriangle size={15} className="mt-0.5 flex-shrink-0" /> Supabase not connected</div>
            <p className="text-xs leading-relaxed">Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code> and add your Supabase URL and anon key. See the setup guide below.</p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-[0_4px_12px_rgba(17,24,39,0.06),0_16px_48px_rgba(17,24,39,0.08)] p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="Jane Smith"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pr-10"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-full text-sm font-medium mt-2 shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] active:scale-[0.98] transition-all duration-150">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError('') }} className="text-violet-600 font-medium hover:underline">Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError('') }} className="text-violet-600 font-medium hover:underline">Sign in</button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          The first person to sign up becomes the admin.
        </p>
      </div>
    </div>
  )
}
