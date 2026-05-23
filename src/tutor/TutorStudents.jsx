import { useState } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { Search, User, Star, Plus, X, ChevronRight, Sparkles } from 'lucide-react'
import LessonPlannerModal from '../components/LessonPlannerModal'

export default function TutorStudents() {
  const { user } = useAuth()
  const { students, sessions, progressNotes, addProgressNote } = useApp()
  const [search, setSearch] = useState('')
  const [openStudent, setOpenStudent] = useState(null)
  const [noteDraft, setNoteDraft] = useState({ subject: '', content: '', rating: 4 })

  // Students this tutor has touched (assigned OR has sessions with)
  // RLS already filters this server-side, but we also filter client-side for safety
  const myStudents = students.filter(s => {
    return sessions.some(ses => ses.studentId === s.id && ses.tutorId === user.id)
  })

  const filtered = myStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subjects.some(sub => sub.toLowerCase().includes(search.toLowerCase()))
  )

  async function submitNote() {
    if (!noteDraft.content.trim() || !openStudent) return
    await addProgressNote({
      studentId: openStudent.id,
      subject: noteDraft.subject || openStudent.subjects[0] || 'General',
      content: noteDraft.content,
      rating: noteDraft.rating,
      date: new Date().toISOString().split('T')[0],
    })
    setNoteDraft({ subject: '', content: '', rating: 4 })
  }

  if (openStudent) return (
    <StudentDetail
      student={openStudent}
      sessions={sessions.filter(s => s.studentId === openStudent.id)}
      notes={progressNotes.filter(n => n.studentId === openStudent.id)}
      noteDraft={noteDraft}
      setNoteDraft={setNoteDraft}
      onSubmitNote={submitNote}
      onBack={() => { setOpenStudent(null); setNoteDraft({ subject: '', content: '', rating: 4 }) }}
    />
  )

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 text-sm mt-1">{myStudents.length} student{myStudents.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      <div className="space-y-2">
        {filtered.map(s => {
          const lastSession = sessions.filter(se => se.studentId === s.id && se.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0]
          return (
            <button key={s.id} onClick={() => setOpenStudent(s)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
              <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-500">{s.grade} · {s.subjects.join(', ')}</p>
                {lastSession && <p className="text-xs text-gray-400 mt-0.5">Last session {formatDate(lastSession.date)}</p>}
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <User size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{myStudents.length === 0 ? 'No students assigned yet.' : 'No students match your search.'}</p>
            {myStudents.length === 0 && <p className="text-xs mt-1">Ask your admin to assign you a student.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function StudentDetail({ student, sessions, notes, noteDraft, setNoteDraft, onSubmitNote, onBack }) {
  const completed = sessions.filter(s => s.status === 'completed').length
  const [plannerOpen, setPlannerOpen] = useState(false)

  return (
    <div className="space-y-5 max-w-3xl">
      <button onClick={onBack} className="text-sm text-violet-600 font-medium hover:underline flex items-center gap-1">
        ← Back to students
      </button>

      {/* Student header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-500">{student.grade} Grade · {student.subjects.join(', ')}</p>
          <p className="text-xs text-gray-400 mt-1">{completed} session{completed !== 1 ? 's' : ''} completed</p>
        </div>
        <button onClick={() => setPlannerOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
          <Sparkles size={15} /> AI Lesson Plan
        </button>
      </div>

      {plannerOpen && <LessonPlannerModal student={student} onClose={() => setPlannerOpen(false)} />}

      {/* Quick note */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Plus size={15} /> Add progress note</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={noteDraft.subject} onChange={e => setNoteDraft(n => ({ ...n, subject: e.target.value }))}
              className="input text-sm">
              <option value="">Subject...</option>
              {student.subjects.map(s => <option key={s}>{s}</option>)}
              <option value="General">General</option>
            </select>
            <div className="flex items-center gap-1 justify-end">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setNoteDraft(d => ({ ...d, rating: n }))}
                  className="p-0.5">
                  <Star size={18} className={n <= noteDraft.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={noteDraft.content} onChange={e => setNoteDraft(n => ({ ...n, content: e.target.value }))}
            className="input text-sm min-h-[80px] resize-none" placeholder="What did you cover? How did the student do?" />
          <button onClick={onSubmitNote} disabled={!noteDraft.content.trim()}
            className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
            Save note
          </button>
        </div>
      </div>

      {/* Notes timeline */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress history</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.sort((a, b) => b.date.localeCompare(a.date)).map(n => (
              <li key={n.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{n.subject}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} className={s <= n.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(n.date)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
