import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme, ACCENTS } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Sun, Moon, Check, User, Palette, LogOut, Mail, Shield } from 'lucide-react'

export default function Settings() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { mode, setMode, accent, setAccent } = useTheme()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function saveName() {
    setSaving(true)
    await supabase.from('profiles').update({ name }).eq('id', profile.id)
    await refreshProfile?.()
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-[15px] mt-1">Make TutorHQ yours.</p>
      </div>

      {/* Profile */}
      <section className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User size={17} /> Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xl font-semibold">
            {(profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 text-gray-600"><Mail size={13} /> {profile?.email}</p>
            <p className="flex items-center gap-2 text-gray-600"><Shield size={13} /> <span className="capitalize">{profile?.role}</span></p>
          </div>
        </div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Display name</label>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} className="input flex-1" placeholder="Your name" />
          <button onClick={saveName} disabled={saving} className="btn-primary whitespace-nowrap">
            {saved ? <><Check size={15} /> Saved</> : 'Save'}
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Palette size={17} /> Appearance</h2>

        <p className="text-xs font-medium text-gray-700 mb-2">Theme</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setMode('light')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${mode === 'light' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <Sun size={20} className="text-amber-500" />
            <span className="font-medium text-sm text-gray-900">Light</span>
            {mode === 'light' && <Check size={16} className="text-violet-600 ml-auto" />}
          </button>
          <button onClick={() => setMode('dark')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${mode === 'dark' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <Moon size={20} className="text-indigo-400" />
            <span className="font-medium text-sm text-gray-900">Dark</span>
            {mode === 'dark' && <Check size={16} className="text-violet-600 ml-auto" />}
          </button>
        </div>

        <p className="text-xs font-medium text-gray-700 mb-2">Accent colour</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(ACCENTS).map(([key, a]) => (
            <button key={key} onClick={() => setAccent(key)} title={a.label}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${accent === key ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              style={{ background: a.swatch }}>
              {accent === key && <Check size={18} className="text-white" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Your choice applies instantly across the whole app and is saved on this device.</p>
      </section>

      {/* Sign out */}
      <section className="card p-6">
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
          <LogOut size={15} /> Sign out
        </button>
      </section>
    </div>
  )
}
