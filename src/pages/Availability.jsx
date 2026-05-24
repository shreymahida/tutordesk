import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, Check, Clock, CalendarOff, Plane } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const STATUS_META = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  denied: 'bg-red-50 text-red-600',
}

export default function Availability() {
  const { isAdmin } = useAuth()
  const { getMyAvailability, addAvailabilitySlot, deleteAvailabilitySlot, getTimeOff, requestTimeOff, reviewTimeOff, cancelTimeOff } = useApp()
  const [tab, setTab] = useState(isAdmin ? 'requests' : 'availability')
  const [slots, setSlots] = useState([])
  const [timeOff, setTimeOff] = useState([])
  const [profiles, setProfiles] = useState({})
  const [slotForm, setSlotForm] = useState({ dayOfWeek: 1, startTime: '15:00', endTime: '18:00' })
  const [offModal, setOffModal] = useState(false)
  const [offForm, setOffForm] = useState({ startDate: '', endDate: '', reason: '' })

  async function refresh() {
    setSlots(await getMyAvailability())
    setTimeOff(await getTimeOff({ allUsers: isAdmin }))
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (isAdmin) supabase.from('profiles').select('id,name,email').then(({ data }) => setProfiles(Object.fromEntries((data || []).map(p => [p.id, p.name || p.email]))))
  }, [isAdmin])

  async function addSlot() {
    if (slotForm.startTime >= slotForm.endTime) return
    await addAvailabilitySlot(slotForm)
    refresh()
  }
  async function removeSlot(id) { await deleteAvailabilitySlot(id); refresh() }

  async function submitOff() {
    if (!offForm.startDate || !offForm.endDate) return
    await requestTimeOff(offForm)
    setOffForm({ startDate: '', endDate: '', reason: '' }); setOffModal(false); refresh()
  }
  async function review(id, status) { await reviewTimeOff(id, status); refresh() }

  const tabs = isAdmin
    ? [{ id: 'requests', label: 'Time-off requests' }, { id: 'availability', label: 'My availability' }]
    : [{ id: 'availability', label: 'My availability' }, { id: 'requests', label: 'My time off' }]

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Availability & Time Off</h1>
        <p className="text-gray-500 text-[15px] mt-1">{isAdmin ? 'Review requests and manage your own hours.' : 'Set when you can tutor and request time off.'}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${tab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* My weekly availability */}
      {tab === 'availability' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} /> Add a weekly slot</h2>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
                <select value={slotForm.dayOfWeek} onChange={e => setSlotForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))} className="input">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                <input type="time" value={slotForm.startTime} onChange={e => setSlotForm(f => ({ ...f, startTime: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                <input type="time" value={slotForm.endTime} onChange={e => setSlotForm(f => ({ ...f, endTime: e.target.value }))} className="input" />
              </div>
              <button onClick={addSlot} className="btn-primary"><Plus size={15} /> Add</button>
            </div>
          </div>

          <div className="space-y-2">
            {DAYS.map((day, i) => {
              const daySlots = slots.filter(s => s.dayOfWeek === i)
              if (daySlots.length === 0) return null
              return (
                <div key={i} className="card p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(s => (
                      <span key={s.id} className="flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {fmt(s.startTime)} – {fmt(s.endTime)}
                        <button onClick={() => removeSlot(s.id)} className="hover:text-red-500"><X size={13} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            {slots.length === 0 && (
              <div className="card p-10 text-center">
                <Clock size={30} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 text-sm">No availability set. Add slots above so admin knows when you're free.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time off requests */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {!isAdmin && (
            <button onClick={() => setOffModal(true)} className="btn-primary"><Plane size={15} /> Request time off</button>
          )}
          {timeOff.length === 0 ? (
            <div className="card p-10 text-center">
              <CalendarOff size={30} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">{isAdmin ? 'No time-off requests.' : 'No time off requested yet.'}</p>
            </div>
          ) : timeOff.map(r => (
            <div key={r.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && <span className="font-semibold text-gray-900 text-sm">{profiles[r.userId] || '—'}</span>}
                  <span className="text-sm text-gray-700">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_META[r.status]}`}>{r.status}</span>
                </div>
                {r.reason && <p className="text-xs text-gray-400 mt-0.5">{r.reason}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {isAdmin && r.status === 'pending' && (
                  <>
                    <button onClick={() => review(r.id, 'approved')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50" title="Approve"><Check size={16} /></button>
                    <button onClick={() => review(r.id, 'denied')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Deny"><X size={16} /></button>
                  </>
                )}
                {!isAdmin && r.status === 'pending' && (
                  <button onClick={() => { cancelTimeOff(r.id).then(refresh) }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {offModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Request time off</h2>
              <button onClick={() => setOffModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">From</label><input type="date" value={offForm.startDate} onChange={e => setOffForm(f => ({ ...f, startDate: e.target.value }))} className="input" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">To</label><input type="date" value={offForm.endDate} onChange={e => setOffForm(f => ({ ...f, endDate: e.target.value }))} className="input" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Reason (optional)</label><input value={offForm.reason} onChange={e => setOffForm(f => ({ ...f, reason: e.target.value }))} className="input" placeholder="Vacation, exams, etc." /></div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setOffModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={submitOff} className="flex-1 btn-primary justify-center">Submit request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function fmt(t) { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}` }
function fmtDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
