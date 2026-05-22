import { useState } from 'react'
import { useApp } from '../store'
import { Plus, X, Calendar, CheckCircle, XCircle, Clock, Video, Repeat, AlertTriangle, UserX } from 'lucide-react'

const BLANK = { studentId: '', subject: '', date: '', time: '', duration: 60, status: 'scheduled', notes: '', meetingLink: '' }

export default function Sessions() {
  const { students, sessions, addSession, updateSession, deleteSession, deleteRecurrence, findConflict, addPayment } = useApp()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [repeatWeeks, setRepeatWeeks] = useState(0)
  const [conflictWarning, setConflictWarning] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const filtered = sessions
    .filter(s => {
      if (filter === 'upcoming') return s.date >= today && s.status === 'scheduled'
      if (filter === 'completed') return s.status === 'completed'
      if (filter === 'cancelled') return s.status === 'cancelled'
      if (filter === 'no-show') return s.status === 'no-show'
      return true
    })
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

  function openAdd() {
    setForm({ ...BLANK, date: today, time: '15:00' })
    setRepeatWeeks(0)
    setConflictWarning(null)
    setModal('add')
  }
  function openEdit(s) {
    setForm({ ...s, meetingLink: s.meetingLink || '' })
    setRepeatWeeks(0)
    setConflictWarning(null)
    setModal(s)
  }
  function closeModal() { setModal(null) }

  // Detect conflicts on form change
  function checkConflict(updated) {
    const c = findConflict(updated.date, updated.time, updated.duration, modal?.id)
    setConflictWarning(c)
  }

  function patchForm(patch) {
    const next = { ...form, ...patch }
    setForm(next)
    if (next.date && next.time && next.duration) checkConflict(next)
  }

  async function handleSave() {
    if (!form.studentId || !form.date || !form.subject) return
    if (modal === 'add') {
      await addSession(form, { repeatWeeks })
    } else {
      await updateSession(modal.id, form)
    }
    closeModal()
  }

  async function markComplete(session) {
    await updateSession(session.id, { status: 'completed' })
    const student = students.find(s => s.id === session.studentId)
    if (student) {
      const amount = (student.rate * session.duration) / 60
      addPayment({ studentId: session.studentId, sessionId: session.id, amount: parseFloat(amount.toFixed(2)), date: session.date, status: 'pending', method: '' })
    }
  }

  function generateMeetLink() {
    // Google Meet "Quick Meeting" URL (creates an instant meeting when opened)
    window.open('https://meet.google.com/new', '_blank')
    // User pastes the resulting URL into the field
  }

  const studentSubjects = (studentId) => students.find(st => st.id === studentId)?.subjects || []

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

      <div className="flex gap-2 flex-wrap">
        {['all', 'upcoming', 'completed', 'no-show', 'cancelled'].map(f => (
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
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{student?.name || 'Unknown Student'}</p>
                      {s.recurrenceId && <Repeat size={12} className="text-violet-500" title="Recurring session" />}
                    </div>
                    <p className="text-sm text-gray-600">{s.subject} · {s.duration} min · {formatTime(s.time)}</p>
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline mt-1">
                        <Video size={11} /> Join meeting
                      </a>
                    )}
                    {s.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={s.status} />
                  <div className="flex gap-1">
                    {s.status === 'scheduled' && (
                      <>
                        <button onClick={() => markComplete(s)} title="Mark complete" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                          <CheckCircle size={15} />
                        </button>
                        <button onClick={() => updateSession(s.id, { status: 'no-show' })} title="No-show" className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                          <UserX size={15} />
                        </button>
                        <button onClick={() => updateSession(s.id, { status: 'cancelled' })} title="Cancel" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <XCircle size={15} />
                        </button>
                      </>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === 'add' ? 'Schedule Session' : 'Edit Session'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
                <select value={form.studentId} onChange={e => patchForm({ studentId: e.target.value, subject: '' })} className="input">
                  <option value="">Select student...</option>
                  {students.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                <select value={form.subject} onChange={e => patchForm({ subject: e.target.value })} className="input">
                  <option value="">Select subject...</option>
                  {(form.studentId ? studentSubjects(form.studentId) : []).map(sub => (
                    <option key={sub}>{sub}</option>
                  ))}
                  <option value="__other">Other</option>
                </select>
                {form.subject === '__other' && (
                  <input className="input mt-2" placeholder="Enter subject" onChange={e => patchForm({ subject: e.target.value })} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => patchForm({ date: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => patchForm({ time: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <select value={form.duration} onChange={e => patchForm({ duration: Number(e.target.value) })} className="input">
                  {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>

              {/* Conflict warning */}
              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 items-start text-xs text-amber-800">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Schedule conflict</p>
                    <p>Overlaps with {students.find(st => st.id === conflictWarning.studentId)?.name}'s {conflictWarning.subject} session at {formatTime(conflictWarning.time)}.</p>
                  </div>
                </div>
              )}

              {/* Meeting link */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Video meeting link</label>
                <div className="flex gap-2">
                  <input
                    value={form.meetingLink}
                    onChange={e => patchForm({ meetingLink: e.target.value })}
                    className="input flex-1"
                    placeholder="https://meet.google.com/..."
                  />
                  <button type="button" onClick={generateMeetLink}
                    title="Open meet.google.com/new in a new tab — copy the URL, paste here"
                    className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-medium border border-violet-200 whitespace-nowrap flex items-center gap-1">
                    <Video size={13} /> New Meet
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Click "New Meet" to open Google Meet in a new tab. Copy the URL it generates and paste back here.</p>
              </div>

              {/* Recurring sessions */}
              {modal === 'add' && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <Repeat size={13} /> Repeat weekly
                  </label>
                  <select value={repeatWeeks} onChange={e => setRepeatWeeks(Number(e.target.value))} className="input mt-2">
                    <option value={0}>Just this session</option>
                    <option value={3}>For 4 weeks (1 month)</option>
                    <option value={7}>For 8 weeks (2 months)</option>
                    <option value={11}>For 12 weeks (3 months)</option>
                    <option value={23}>For 24 weeks (6 months)</option>
                  </select>
                </div>
              )}

              {modal !== 'add' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => patchForm({ status: e.target.value })} className="input">
                    <option>scheduled</option>
                    <option>completed</option>
                    <option>cancelled</option>
                    <option>no-show</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => patchForm({ notes: e.target.value })} className="input min-h-[60px] resize-none" placeholder="Session notes..." />
              </div>

              {modal !== 'add' && modal?.recurrenceId && (
                <button
                  onClick={() => { if (confirm('Delete ALL sessions in this recurring series?')) { deleteRecurrence(modal.recurrenceId); closeModal() } }}
                  className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
                  Delete entire recurring series
                </button>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">
                {modal === 'add' && repeatWeeks > 0 ? `Schedule ${repeatWeeks + 1} sessions` : 'Save'}
              </button>
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
    'no-show': 'bg-orange-50 text-orange-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

function formatMonth(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
function formatDay(d) { return new Date(d + 'T12:00:00').getDate() }
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
