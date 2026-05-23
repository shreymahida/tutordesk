import { useState } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { Video, CheckCircle, XCircle, UserX, Edit2, Save, X, Clock } from 'lucide-react'

export default function TutorSessions() {
  const { user } = useAuth()
  const { sessions, students, updateSession } = useApp()
  const [filter, setFilter] = useState('upcoming')
  const [editing, setEditing] = useState(null) // session id
  const [notesDraft, setNotesDraft] = useState('')
  const [linkDraft, setLinkDraft] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const mine = sessions.filter(s => s.tutorId === user.id)
  const filtered = mine.filter(s => {
    if (filter === 'upcoming') return s.date >= today && s.status === 'scheduled'
    if (filter === 'past') return s.status !== 'scheduled' || s.date < today
    return true
  }).sort((a, b) => (filter === 'upcoming' ? 1 : -1) * (a.date + a.time).localeCompare(b.date + b.time))

  function startEdit(s) {
    setEditing(s.id)
    setNotesDraft(s.notes || '')
    setLinkDraft(s.meetingLink || '')
  }
  async function saveEdit(s) {
    await updateSession(s.id, { notes: notesDraft, meetingLink: linkDraft })
    setEditing(null)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">{mine.length} session{mine.length !== 1 ? 's' : ''} total</p>
      </div>

      <div className="flex gap-2">
        {['upcoming', 'past', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:border-violet-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(s => {
          const student = students.find(st => st.id === s.studentId)
          const isEditing = editing === s.id
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex gap-3 items-start min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-50 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-violet-700">{formatMonth(s.date)}</span>
                    <span className="text-lg font-bold text-violet-900 leading-none">{formatDay(s.date)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{student?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{s.subject} · {s.duration} min · {formatTime(s.time)}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              {isEditing ? (
                <div className="space-y-2 mt-3">
                  <input value={linkDraft} onChange={e => setLinkDraft(e.target.value)}
                    className="input text-sm" placeholder="Meeting link (Google Meet, Zoom, etc.)" />
                  <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)}
                    className="input text-sm min-h-[80px] resize-none" placeholder="Session notes..." />
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)} className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => saveEdit(s)} className="flex-1 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center justify-center gap-1">
                      <Save size={13} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {s.notes && <p className="text-xs text-gray-500 mt-1 mb-3 italic">{s.notes}</p>}
                  <div className="flex flex-wrap gap-2">
                    {s.meetingLink ? (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors">
                        <Video size={13} /> Join
                      </a>
                    ) : (
                      <a href="https://meet.google.com/new" target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                        <Video size={13} /> Generate Meet
                      </a>
                    )}
                    <button onClick={() => startEdit(s)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                      <Edit2 size={13} /> Notes / Link
                    </button>
                    {s.status === 'scheduled' && (
                      <>
                        <button onClick={() => updateSession(s.id, { status: 'completed' })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          <CheckCircle size={13} /> Complete
                        </button>
                        <button onClick={() => updateSession(s.id, { status: 'no-show' })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                          <UserX size={13} /> No-show
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Clock size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {filter} sessions.</p>
          </div>
        )}
      </div>
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
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}
function formatMonth(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
function formatDay(d) { return new Date(d + 'T12:00:00').getDate() }
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
