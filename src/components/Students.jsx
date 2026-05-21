import { useState } from 'react'
import { useApp } from '../store'
import { Plus, Edit2, Trash2, X, Search, User } from 'lucide-react'

const SUBJECTS = ['Math', 'Algebra', 'Geometry', 'Calculus', 'Physics', 'Chemistry', 'Biology', 'English', 'Writing', 'History', 'SAT Prep', 'ACT Prep', 'Spanish', 'French', 'Computer Science']
const GRADES = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Adult']

const BLANK = { name: '', email: '', phone: '', grade: '9th', subjects: [], rate: '', status: 'active', notes: '' }

export default function Students() {
  const { students, addStudent, updateStudent, deleteStudent } = useApp()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | student object
  const [form, setForm] = useState(BLANK)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.subjects.some(sub => sub.toLowerCase().includes(search.toLowerCase()))
  )

  function openAdd() { setForm(BLANK); setModal('add') }
  function openEdit(s) { setForm({ ...s }); setModal(s) }
  function closeModal() { setModal(null) }

  function handleSubjectToggle(sub) {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(sub)
        ? f.subjects.filter(s => s !== sub)
        : [...f.subjects, sub]
    }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (modal === 'add') addStudent(form)
    else updateStudent(modal.id, form)
    closeModal()
  }

  function handleDelete(id) {
    deleteStudent(id)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} student{students.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.grade} Grade</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
            </div>

            <div className="space-y-1.5 text-sm text-gray-600 mb-3">
              {s.email && <p className="truncate">{s.email}</p>}
              {s.phone && <p>{s.phone}</p>}
              <p className="font-medium text-gray-800">${s.rate}/hr</p>
            </div>

            {s.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {s.subjects.map(sub => (
                  <span key={sub} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{sub}</span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => setConfirmDelete(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Full Name *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Jane Smith" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="email@example.com" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="555-0100" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Grade">
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input">
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Hourly Rate ($)">
                <input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} className="input" placeholder="60" />
              </Field>
            </div>
            <Field label="Subjects">
              <div className="flex flex-wrap gap-2 mt-1">
                {SUBJECTS.map(sub => (
                  <button key={sub} type="button"
                    onClick={() => handleSubjectToggle(sub)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.subjects.includes(sub) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-400'}`}>
                    {sub}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                <option>active</option>
                <option>inactive</option>
                <option>on-hold</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input min-h-[80px] resize-none" placeholder="Any notes about this student..." />
            </Field>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">Save Student</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="Delete Student?" onClose={() => setConfirmDelete(null)}>
          <p className="text-gray-600 text-sm">Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
