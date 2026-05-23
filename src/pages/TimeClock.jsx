import { useState, useEffect, useRef } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Clock, Play, Square, Calendar, Users, TrendingUp } from 'lucide-react'

export default function TimeClock() {
  const { isAdmin } = useAuth()
  const { getMyOpenEntry, clockIn, clockOut, getTimeEntries } = useApp()
  const [openEntry, setOpenEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState({})
  const [now, setNow] = useState(Date.now())
  const [scope, setScope] = useState('me')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const tick = useRef(null)

  async function refresh() {
    const open = await getMyOpenEntry()
    setOpenEntry(open)
    const list = await getTimeEntries({ allUsers: isAdmin && scope === 'all' })
    setEntries(list)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [scope])

  // Load names for admin all-view
  useEffect(() => {
    if (isAdmin) supabase.from('profiles').select('id,name,email').then(({ data }) => {
      setProfiles(Object.fromEntries((data || []).map(p => [p.id, p.name || p.email])))
    })
  }, [isAdmin])

  // Live ticking clock
  useEffect(() => {
    tick.current = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick.current)
  }, [])

  async function handleClockIn() {
    const e = await clockIn(note)
    setNote('')
    setOpenEntry(e)
    refresh()
  }
  async function handleClockOut() {
    if (!openEntry) return
    await clockOut(openEntry.id)
    setOpenEntry(null)
    refresh()
  }

  // Elapsed for the open shift
  const elapsedMs = openEntry ? now - new Date(openEntry.clockIn).getTime() : 0

  // Totals
  const todayStr = new Date().toISOString().split('T')[0]
  const myEntries = entries.filter(e => !isAdmin || scope === 'me')
  const todayTotal = sumHours(entries.filter(e => e.clockIn.startsWith(todayStr)))
  const weekTotal = sumHours(entries.filter(e => e.clockIn >= addDays(todayStr, -7)))

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Time Clock</h1>
        <p className="text-gray-500 text-[15px] mt-1">Track your hours — clock in when you start, out when you're done.</p>
      </div>

      {/* The big clock card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 text-center transition-colors ${openEntry ? 'bg-gradient-to-br from-violet-600 to-violet-800' : 'bg-white card'}`}>
        {openEntry && (
          <>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-30%] left-[-5%] w-72 h-72 bg-white/5 rounded-full blur-2xl" />
          </>
        )}
        <div className="relative">
          <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full mb-5 ${openEntry ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${openEntry ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            {openEntry ? 'On the clock' : 'Clocked out'}
          </div>

          <div className={`text-6xl font-semibold tracking-tight tabular-nums ${openEntry ? 'text-white' : 'text-gray-900'}`}>
            {openEntry ? formatDuration(elapsedMs) : '00:00:00'}
          </div>

          {openEntry && (
            <p className="text-violet-200 text-sm mt-3">
              Started at {formatTime(openEntry.clockIn)}{openEntry.note ? ` · ${openEntry.note}` : ''}
            </p>
          )}

          {!openEntry && (
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="What are you working on? (optional)"
              className="mt-5 w-full max-w-sm mx-auto input text-center" />
          )}

          <div className="mt-6">
            {openEntry ? (
              <button onClick={handleClockOut}
                className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Square size={18} className="fill-violet-700" /> Clock Out
              </button>
            ) : (
              <button onClick={handleClockIn}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Play size={18} className="fill-white" /> Clock In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="inline-flex p-2 rounded-xl bg-violet-50 text-violet-600 mb-3"><Calendar size={18} /></div>
          <p className="text-3xl font-semibold text-gray-900 tracking-tight">{todayTotal.toFixed(1)}<span className="text-lg text-gray-400 font-normal">h</span></p>
          <p className="text-sm text-gray-500">Today</p>
        </div>
        <div className="card p-5">
          <div className="inline-flex p-2 rounded-xl bg-blue-50 text-blue-600 mb-3"><TrendingUp size={18} /></div>
          <p className="text-3xl font-semibold text-gray-900 tracking-tight">{weekTotal.toFixed(1)}<span className="text-lg text-gray-400 font-normal">h</span></p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">History</h2>
          {isAdmin && (
            <div className="flex gap-1 bg-gray-100 rounded-full p-0.5">
              <button onClick={() => setScope('me')} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${scope === 'me' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Me</button>
              <button onClick={() => setScope('all')} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${scope === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}><Users size={11} /> Everyone</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No time entries yet. Clock in to start.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {entries.map(e => {
              const dur = e.clockOut ? new Date(e.clockOut) - new Date(e.clockIn) : null
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{formatMonth(e.clockIn)}</span>
                      <span className="text-sm font-bold text-gray-700 leading-none">{formatDay(e.clockIn)}</span>
                    </div>
                    <div className="min-w-0">
                      {isAdmin && scope === 'all' && <p className="text-xs font-medium text-violet-600 truncate">{profiles[e.userId] || '—'}</p>}
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(e.clockIn)} → {e.clockOut ? formatTime(e.clockOut) : <span className="text-green-600">in progress</span>}
                      </p>
                      {e.note && <p className="text-xs text-gray-400 truncate">{e.note}</p>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {dur != null ? (
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">{(dur / 3600000).toFixed(2)}h</p>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">active</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function sumHours(entries) {
  return entries.reduce((sum, e) => {
    if (!e.clockOut) return sum
    return sum + (new Date(e.clockOut) - new Date(e.clockIn)) / 3600000
  }, 0)
}
function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function formatMonth(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
function formatDay(iso) { return new Date(iso).getDate() }
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00'); d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
