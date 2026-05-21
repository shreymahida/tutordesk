import { useState } from 'react'
import { useApp } from '../store'
import { Plus, X, Star, TrendingUp, Edit2, Trash2 } from 'lucide-react'

const BLANK = { studentId: '', subject: '', date: '', content: '', rating: 3 }

export default function Progress() {
  const { students, progressNotes, addProgressNote, updateProgressNote, deleteProgressNote } = useApp()
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const filtered = progressNotes
    .filter(n => selectedStudent === 'all' || n.studentId === selectedStudent)
    .sort((a, b) => b.date.localeCompare(a.date))

  function openAdd() {
    setForm({ ...BLANK, date: today, studentId: selectedStudent !== 'all' ? selectedStudent : '' })
    setModal('add')
  }
  function openEdit(n) { setForm({ ...n }); setModal(n) }
  function closeModal() { setModal(null) }

  function handleSave() {
    if (!form.studentId || !form.content.trim()) return
    const student = students.find(s => s.id === form.studentId)
    const subject = form.subject || student?.subjects[0] || 'General'
    const note = { ...form, subject }
    if (modal === 'add') addProgressNote(note)
    else updateProgressNote(modal.id, note)
    closeModal()
  }

  const studentSubjects = (id) => students.find(s => s.id === id)?.subjects || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
          <p className="text-gray-500 text-sm mt-1">Track student progress over time</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Note
        </button>
      </div>

      {/* Student filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStudent('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedStudent === 'all' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
          All Students
        </button>
        {students.map(s => (
          <button key={s.id} onClick={() => setSelectedStudent(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedStudent === s.id ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Progress cards */}
      <div className="space-y-4">
        {filtered.map(note => {
          const student = students.find(s => s.id === note.studentId)
          return (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs flex-shrink-0">
                    {student?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{student?.name || 'Unknown'}</p>
                      <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{note.subject}</span>
                      <StarRating value={note.rating} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(note.date)}</p>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{note.content}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
            <p>No progress notes yet</p>
            <button onClick={openAdd} className="mt-3 text-sm text-violet-600 hover:underline">Add the first note</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === 'add' ? 'Add Progress Note' : 'Edit Note'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value, subject: '' }))} className="input">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input">
                    <option value="">Select...</option>
                    {studentSubjects(form.studentId).map(s => <option key={s}>{s}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Performance Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${form.rating >= r ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input min-h-[120px] resize-none"
                  placeholder="What did you cover? How did the student do? What needs more work?" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">Save Note</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Delete this note?</h2>
            <p className="text-gray-600 text-sm mb-5">This progress entry will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { deleteProgressNote(confirmDelete.id); setConfirmDelete(null) }} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} className={s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  )
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
