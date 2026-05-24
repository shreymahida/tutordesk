import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Star, Heart, Zap, Trophy, ThumbsUp, Send, X, Plus } from 'lucide-react'

const BADGES = {
  star: { icon: Star, label: 'Star', color: 'text-amber-500 bg-amber-50' },
  heart: { icon: Heart, label: 'Team player', color: 'text-rose-500 bg-rose-50' },
  zap: { icon: Zap, label: 'Above & beyond', color: 'text-violet-500 bg-violet-50' },
  trophy: { icon: Trophy, label: 'MVP', color: 'text-emerald-500 bg-emerald-50' },
  thumbs: { icon: ThumbsUp, label: 'Great work', color: 'text-blue-500 bg-blue-50' },
}

export default function Recognition() {
  const { user } = useAuth()
  const { getRecognition, giveRecognition } = useApp()
  const [feed, setFeed] = useState([])
  const [profiles, setProfiles] = useState({})
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ toUser: '', badge: 'star', message: '' })

  async function refresh() { setFeed(await getRecognition()) }
  useEffect(() => {
    refresh()
    supabase.from('profiles').select('id,name,email,avatar_url').then(({ data }) => setProfiles(Object.fromEntries((data || []).map(p => [p.id, p]))))
  }, [])

  const name = id => profiles[id]?.name || profiles[id]?.email || 'Someone'

  // Leaderboard: count received
  const counts = {}
  feed.forEach(r => { counts[r.toUser] = (counts[r.toUser] || 0) + 1 })
  const leaderboard = Object.entries(counts).map(([id, c]) => ({ id, c })).sort((a, b) => b.c - a.c).slice(0, 5)

  async function give() {
    if (!form.toUser) return
    await giveRecognition(form)
    setForm({ toUser: '', badge: 'star', message: '' }); setModal(false); refresh()
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Recognition</h1>
          <p className="text-gray-500 text-[15px] mt-1">Celebrate great work across the team.</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Give kudos</button>
      </div>

      {leaderboard.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Most recognized</h2>
          <div className="flex flex-wrap gap-3">
            {leaderboard.map((l, i) => (
              <div key={l.id} className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold overflow-hidden">
                  {profiles[l.id]?.avatar_url ? <img src={profiles[l.id].avatar_url} className="w-full h-full object-cover" /> : (name(l.id)).slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">{name(l.id).split(' ')[0]}</span>
                <span className="text-xs text-amber-600 font-semibold">{l.c}★</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {feed.map(r => {
          const b = BADGES[r.badge] || BADGES.star
          const Icon = b.icon
          return (
            <div key={r.id} className="card p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${b.color}`}><Icon size={18} /></div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{name(r.fromUser).split(' ')[0]}</span> recognized <span className="font-semibold">{name(r.toUser).split(' ')[0]}</span>
                  <span className="text-gray-400 font-normal"> · {b.label}</span>
                </p>
                {r.message && <p className="text-sm text-gray-600 mt-0.5">"{r.message}"</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(r.createdAt)}</p>
              </div>
            </div>
          )
        })}
        {feed.length === 0 && (
          <div className="card p-12 text-center">
            <Award size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">No kudos yet — be the first to recognize a teammate.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Give kudos</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                <select value={form.toUser} onChange={e => setForm(f => ({ ...f, toUser: e.target.value }))} className="input">
                  <option value="">Choose a teammate…</option>
                  {Object.values(profiles).filter(p => p.id !== user.id).map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Badge</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(BADGES).map(([k, b]) => {
                    const Icon = b.icon
                    return (
                      <button key={k} onClick={() => setForm(f => ({ ...f, badge: k }))}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${form.badge === k ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-200'}`}>
                        <Icon size={15} className={b.color.split(' ')[0]} /> {b.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input min-h-[70px] resize-none" placeholder="What did they do well?" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={give} className="flex-1 btn-primary justify-center"><Send size={14} /> Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
