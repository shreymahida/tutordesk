import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme, ACCENTS } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Sun, Moon, Check, User, Palette, LogOut, Mail, Shield, Image, Upload, Loader2, GraduationCap } from 'lucide-react'

export default function Settings() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { mode, setMode, accent, setAccent, logoUrl, setLogoUrl } = useTheme()
  const [name, setName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [pronouns, setPronouns] = useState(profile?.pronouns || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef(null)
  const avatarRef = useRef(null)
  const isAdmin = profile?.role === 'admin'

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ name, phone, pronouns }).eq('id', profile.id)
    await refreshProfile?.()
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      await refreshProfile?.()
    }
    setAvatarUploading(false)
    e.target.value = ''
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('branding').getPublicUrl(path)
      await supabase.from('settings').update({ logo_url: data.publicUrl }).eq('id', 1)
      setLogoUrl(data.publicUrl)
    }
    setUploading(false)
    e.target.value = ''
  }

  async function removeLogo() {
    await supabase.from('settings').update({ logo_url: '' }).eq('id', 1)
    setLogoUrl('')
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
          <button onClick={() => avatarRef.current?.click()} className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden group">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : (profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {avatarUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            </span>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 text-gray-600"><Mail size={13} /> {profile?.email}</p>
            <p className="flex items-center gap-2 text-gray-600"><Shield size={13} /> <span className="capitalize">{profile?.role}</span></p>
            <button onClick={() => avatarRef.current?.click()} className="text-xs text-violet-600 hover:underline">Change photo</button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Display name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="555-0100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pronouns</label>
              <input value={pronouns} onChange={e => setPronouns(e.target.value)} className="input" placeholder="she/her, he/him, they/them" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input value={profile?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email is tied to your login — contact your admin to change it.</p>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary">
            {saved ? <><Check size={15} /> Saved</> : 'Save profile'}
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

      {/* Branding — admin only */}
      {isAdmin && (
        <section className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Image size={17} /> Branding</h2>
          <p className="text-xs text-gray-500 mb-4">Upload your business logo — it replaces the graduation cap across the app and parent portals.</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" /> : <GraduationCap size={28} className="text-white" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload logo</>}
            </button>
            {logoUrl && <button onClick={removeLogo} className="text-sm text-red-500 hover:underline">Remove</button>}
          </div>
        </section>
      )}

      {/* Sign out */}
      <section className="card p-6">
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
          <LogOut size={15} /> Sign out
        </button>
      </section>
    </div>
  )
}
