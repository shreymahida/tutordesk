import { useState, useEffect, useRef } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Clock, Play, Square, Calendar, Users, TrendingUp, GraduationCap, Fingerprint, Check, Download } from 'lucide-react'

export default function TimeClock() {
  const { isAdmin, profile } = useAuth()
  const { getMyOpenEntry, clockIn, clockOut, getTimeEntries, approveTimeEntry, students, sessions } = useApp()
  const [openEntry, setOpenEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState({})
  const [now, setNow] = useState(Date.now())
  const [scope, setScope] = useState('me')
  const [note, setNote] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const tick = useRef(null)

  // Students this user can pick (tutors: those they have sessions with; admin: all)
  const myStudents = isAdmin ? students : students.filter(s => sessions.some(se => se.studentId === s.id && se.tutorId === profile?.id))
  const studentName = id => students.find(s => s.id === id)?.name

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
    const e = await clockIn(note, studentId || null)
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

  async function toggleApprove(e) {
    await approveTimeEntry(e.id, !e.approved)
    refresh()
  }

  function exportCSV() {
    const rows = [['Name', 'Date', 'Clock in', 'Clock out', 'Hours', 'Student', 'Note', 'Approved']]
    entries.forEach(e => {
      const hours = e.clockOut ? ((new Date(e.clockOut) - new Date(e.clockIn)) / 3600000).toFixed(2) : ''
      rows.push([
        profiles[e.userId] || '', e.clockIn.split('T')[0],
        formatTime(e.clockIn), e.clockOut ? formatTime(e.clockOut) : '',
        hours, studentName(e.studentId) || '', (e.note || '').replace(/,/g, ';'), e.approved ? 'Yes' : 'No',
      ])
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
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

      {/* Digital ID card — tap to clock in/out */}
      <div className="max-w-md mx-auto w-full">
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_8px_32px_rgba(124,58,237,0.3)] transition-all ${openEntry ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-violet-600 to-violet-800'}`}>
          <div className="absolute top-[-25%] right-[-10%] w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-[-30%] left-[-10%] w-56 h-56 bg-black/10 rounded-full blur-2xl" />

          <div className="relative">
            {/* Top row: brand + status */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold tracking-widest uppercase text-white/70">TutorHQ · Staff ID</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${openEntry ? 'bg-white/25' : 'bg-white/15'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${openEntry ? 'bg-green-200 animate-pulse' : 'bg-white/60'}`} />
                {openEntry ? 'On the clock' : 'Clocked out'}
              </span>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold overflow-hidden ring-2 ring-white/30">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : (profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight truncate">{profile?.name || profile?.email}</p>
                <p className="text-white/70 text-sm capitalize">{profile?.role}{profile?.pronouns ? ` · ${profile.pronouns}` : ''}</p>
                <p className="text-white/50 text-xs font-mono mt-0.5 flex items-center gap-1"><Fingerprint size={11} /> {(profile?.id || '').slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Live timer */}
            <div className="text-center mb-5">
              <div className="text-5xl font-semibold tracking-tight tabular-nums">
                {openEntry ? formatDuration(elapsedMs) : '00:00:00'}
              </div>
              {openEntry && (
                <p className="text-white/70 text-sm mt-2">
                  Since {formatTime(openEntry.clockIn)}
                  {openEntry.studentId ? ` · with ${studentName(openEntry.studentId)}` : ''}
                  {openEntry.note ? ` · ${openEntry.note}` : ''}
                </p>
              )}
            </div>

            {/* Pre-clock-in: pick a student + note */}
            {!openEntry && (
              <div className="space-y-2 mb-4">
                <select value={studentId} onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-white/15 border-0 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-gray-900">
                  <option value="">General work (no specific student)</option>
                  {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)"
                  className="w-full bg-white/15 border-0 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40" />
              </div>
            )}

            {/* Big tap button */}
            <button onClick={openEntry ? handleClockOut : handleClockIn}
              className="w-full bg-white text-gray-900 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-lg">
              {openEntry ? <><Square size={18} className="fill-gray-900" /> Tap to clock out</> : <><Play size={18} className="fill-gray-900" /> Tap to clock in</>}
            </button>
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-900">{isAdmin && scope === 'all' ? 'Timesheets' : 'History'}</h2>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={exportCSV} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-violet-300 font-medium">
                <Download size={12} /> Export CSV
              </button>
            )}
            {isAdmin && (
              <div className="flex gap-1 bg-gray-100 rounded-full p-0.5">
                <button onClick={() => setScope('me')} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${scope === 'me' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Me</button>
                <button onClick={() => setScope('all')} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${scope === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}><Users size={11} /> Everyone</button>
              </div>
            )}
          </div>
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
                      {(e.studentId || e.note) && (
                        <p className="text-xs text-gray-400 truncate">
                          {e.studentId && <span className="text-violet-500 font-medium">{studentName(e.studentId)}</span>}
                          {e.studentId && e.note ? ' · ' : ''}{e.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {dur != null ? (
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">{(dur / 3600000).toFixed(2)}h</p>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">active</span>
                    )}
                    {isAdmin && scope === 'all' && dur != null && (
                      <button onClick={() => toggleApprove(e)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${e.approved ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-700'}`}>
                        <Check size={11} /> {e.approved ? 'Approved' : 'Approve'}
                      </button>
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
