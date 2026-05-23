import { useState, useRef, useEffect } from 'react'
import Papa from 'papaparse'
import { useApp } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, X, Search, User, Upload, Share2, Copy, Check, UserCheck } from 'lucide-react'
import { COURSES } from '../data/ontarioCurriculum'

// Ontario course codes (primary) + generic fallbacks
const ONTARIO_CODES = COURSES.map(c => `${c.code} — ${c.title} (Gr ${c.grade})`)
const GENERIC_SUBJECTS = ['Math', 'English', 'Physics', 'Chemistry', 'Biology', 'French', 'Computer Science', 'SAT Prep', 'Other']
const SUBJECTS = [...ONTARIO_CODES, ...GENERIC_SUBJECTS]
const GRADES = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Adult']

const BLANK = { name: '', email: '', phone: '', grade: '9th', subjects: [], rate: '', status: 'active', notes: '', familyId: null, billingFrequency: 'per-session' }

export default function Students() {
  const { students, addStudent, addStudents, updateStudent, deleteStudent, families, addFamily, assignments, assignStudent, unassignStudent } = useApp()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [importModal, setImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [shareModal, setShareModal] = useState(null)
  const [copiedToken, setCopiedToken] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [tutors, setTutors] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => setTutors(data || []))
  }, [])

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

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) { setImportError('CSV parse error: ' + errors[0].message); return }
        const cleaned = data.map(row => ({
          name: (row.name || row.Name || '').trim(),
          email: (row.email || row.Email || '').trim(),
          phone: (row.phone || row.Phone || '').trim(),
          grade: (row.grade || row.Grade || '9th').trim(),
          subjects: (row.subjects || row.Subjects || '').split(/[,;|]/).map(s => s.trim()).filter(Boolean),
          rate: parseFloat(row.rate || row.Rate || 0) || 0,
          status: (row.status || row.Status || 'active').trim() || 'active',
          notes: (row.notes || row.Notes || '').trim(),
        })).filter(r => r.name)
        if (cleaned.length === 0) { setImportError('No valid rows found. Make sure the CSV has a "name" column.'); return }
        setImportPreview(cleaned)
      },
      error: (err) => setImportError('Failed to read file: ' + err.message),
    })
    e.target.value = ''
  }

  async function confirmImport() {
    const added = await addStudents(importPreview)
    setImportModal(false)
    setImportPreview(null)
    alert(`Imported ${added} student${added !== 1 ? 's' : ''}.`)
  }

  function copyShareLink(token) {
    const url = `${window.location.origin}/parent/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} student{students.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setImportError(''); setImportPreview(null); setImportModal(true) }}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Upload size={15} /> Import CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Student
          </button>
        </div>
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

            <div className="flex flex-wrap gap-1 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors min-w-[60px]">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => setAssignModal(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors min-w-[60px]">
                <UserCheck size={13} /> Tutors
              </button>
              <button onClick={() => setShareModal(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors min-w-[60px]">
                <Share2 size={13} /> Share
              </button>
              <button onClick={() => setConfirmDelete(s)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors min-w-[60px]">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                  <option>active</option>
                  <option>inactive</option>
                  <option>on-hold</option>
                </select>
              </Field>
              <Field label="Billing">
                <select value={form.billingFrequency} onChange={e => setForm(f => ({ ...f, billingFrequency: e.target.value }))} className="input">
                  <option value="per-session">Per session</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
            </div>
            <Field label="Family (link siblings)">
              <select value={form.familyId || ''} onChange={e => setForm(f => ({ ...f, familyId: e.target.value || null }))} className="input">
                <option value="">No family / solo student</option>
                {families.map(fam => (
                  <option key={fam.id} value={fam.id}>{fam.parentName || fam.parentEmail || '(unnamed)'}{fam.parentEmail ? ` — ${fam.parentEmail}` : ''}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Manage families separately to share one parent portal link for all siblings.</p>
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

      {/* CSV Import modal */}
      {importModal && (
        <Modal title="Import students from CSV" onClose={() => setImportModal(false)}>
          {!importPreview ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV with these columns (case insensitive):<br />
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">name, email, phone, grade, subjects, rate, status, notes</code>
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Only <strong>name</strong> is required. Separate multiple subjects with commas or semicolons inside the cell.
              </p>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-300 hover:border-violet-400 rounded-xl text-gray-500 hover:text-violet-600 transition-colors">
                <Upload size={24} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Click to choose a CSV file</p>
              </button>
              {importError && (
                <p className="text-sm text-red-600 mt-3">{importError}</p>
              )}
              <a
                href={'data:text/csv;charset=utf-8,' + encodeURIComponent('name,email,phone,grade,subjects,rate,status,notes\nJane Doe,jane@example.com,555-0101,10th,"Math,Physics",60,active,\n')}
                download="students-template.csv"
                className="block text-center text-xs text-violet-600 hover:underline mt-4">
                Download template CSV
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">Found <strong>{importPreview.length}</strong> students to import.</p>
              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Grade</th>
                      <th className="px-3 py-2 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importPreview.map((r, i) => (
                      <tr key={i}><td className="px-3 py-1.5">{r.name}</td><td className="px-3 py-1.5">{r.grade}</td><td className="px-3 py-1.5">${r.rate}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setImportPreview(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Back</button>
                <button onClick={confirmImport} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">Import {importPreview.length}</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Assign tutors modal */}
      {assignModal && (
        <Modal title={`Assign tutors to ${assignModal.name}`} onClose={() => setAssignModal(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Pick which tutors can see this student in their portal. Tutors automatically see any student they have sessions with too.
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {tutors.filter(t => t.role === 'tutor').map(t => {
              const isAssigned = assignments.some(a => a.studentId === assignModal.id && a.tutorId === t.id)
              return (
                <button key={t.id}
                  onClick={() => isAssigned ? unassignStudent(assignModal.id, t.id) : assignStudent(assignModal.id, t.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-colors flex items-center gap-3 text-left ${isAssigned ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-violet-200'}`}>
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
                    {(t.name || t.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{t.name || t.email}</p>
                    <p className="text-xs text-gray-500 truncate">{t.email}</p>
                  </div>
                  {isAssigned && <Check size={16} className="text-violet-600 flex-shrink-0" />}
                </button>
              )
            })}
            {tutors.filter(t => t.role === 'tutor').length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No tutors yet. Invite one from the Team page.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Share parent link modal */}
      {shareModal && (
        <Modal title={`Parent link for ${shareModal.name}`} onClose={() => setShareModal(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Send this link to {shareModal.name.split(' ')[0]}'s parent — they'll see sessions, payments, and progress notes (view only, no login).
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/parent/${shareModal.shareToken}`}
              className="input text-xs font-mono"
            />
            <button onClick={() => copyShareLink(shareModal.shareToken)}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium flex items-center gap-1">
              {copiedToken === shareModal.shareToken ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
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
