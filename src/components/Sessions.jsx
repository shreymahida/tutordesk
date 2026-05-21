import { useState } from 'react'
import { useApp } from '../store'
import { Plus, X, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

const BLANK = { studentId: '', subject: '', date: '', time: '', duration: 60, status: 'scheduled', notes: '' }

export default function Sessions() {
  const { students, sessions, addSession, updateSession, deleteSession, addPayment } = useApp()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const filtered = sessions
    .filter(s => {
      if (filter === 'upcoming') return s.date >= today && s.status === 'scheduled'
      if (filter === 'completed') return s.status === 'completed'
      if (filter === 'cancelled') return s.status === 'cancelled'
      return true
    })
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

  function openAdd() {
    setForm({ ...BLANK, date: today, time: '15:00' })
    setModal('add')
  }
  function openEdit(s) { setForm({ ...s }); setModal(s) }
  function closeModal() { setModal(null) }

  function handleSave() {
    if (!form.studentId || !form.date || !form.subject) return
    if (modal === 'add') addSession(form)
    else updateSession(modal.id, form)
    closeModal()
  }

  function markComplete(session) {
    updateSession(session.id, { status: 'completed' })
    const student = students.find(s => s.id === session.studentId)
    if (student) {
      const amount = (student.rate * session.duration) / 60
      addPayment({ studentId: session.studentId, sessionId: session.id, amount: parseFloat(amount.toFixed(2)), date: session.date, status: 'pending', method: '' })
    }
  }

  const studentSubjects = (studentId) => {
    const s = students.find(st => st.id === studentId)
    return s?.subjects || []
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Schedule Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(s => {
          const student = students.find(st => st.id === s.studentId)
          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-50 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-violet-700">{formatMonth(s.date)}</span>
                    <span className="text-lg font-bold text-violet-900 leading-none">{formatDay(s.date)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{student?.name || 'Unknown Student'}</p>
                    <p className="text-sm text-gray-600">{s.subject} · {s.duration} min · {formatTime(s.time)}</p>
                    {s.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={s.status} />
                  <div className="flex gap-1">
                    {s.status === 'scheduled' && (
                      <button onClick={() => markComplete(s)} title="Mark complete" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {s.status === 'scheduled' && (
                      <button onClick={() => updateSession(s.id, { status: 'cancelled' })} title="Cancel session" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <XCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(s)} title="Edit" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                      <Calendar size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>No sessions found</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === 'add' ? 'Schedule Session' : 'Edit Session'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value, subject: '' }))} className="input">
                  <option value="">Select student...</option>
                  {students.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input">
                  <option value="">Select subject...</option>
                  {(form.studentId ? studentSubjects(form.studentId) : []).map(sub => (
                    <option key={sub}>{sub}</option>
                  ))}
                  <option value="__other">Other</option>
                </select>
                {form.subject === '__other' && (
                  <input className="input mt-2" placeholder="Enter subject" onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="input">
                  {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              {modal !== 'add' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                    <option>scheduled</option>
                    <option>completed</option>
                    <option>cancelled</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input min-h-[80px] resize-none" placeholder="Session notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

function formatMonth(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
function formatDay(d) { return new Date(d + 'T12:00:00').getDate() }
function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
