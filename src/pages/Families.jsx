import { useState } from 'react'
import { useApp } from '../store'
import { Plus, Edit2, Trash2, X, Users2, Share2, Copy, Check, Mail, Phone } from 'lucide-react'

const BLANK = { parentName: '', parentEmail: '', parentPhone: '', notes: '' }

export default function Families() {
  const { families, students, addFamily, updateFamily, deleteFamily } = useApp()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [copiedToken, setCopiedToken] = useState(null)

  function openAdd() { setForm(BLANK); setModal('add') }
  function openEdit(f) { setForm({ ...f }); setModal(f) }
  function closeModal() { setModal(null) }

  async function handleSave() {
    if (!form.parentName?.trim() && !form.parentEmail?.trim()) return
    if (modal === 'add') await addFamily(form)
    else await updateFamily(modal.id, form)
    closeModal()
  }

  function copyLink(token) {
    const url = `${window.location.origin}/family/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  function siblingsOf(familyId) {
    return students.filter(s => s.familyId === familyId)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Families</h1>
          <p className="text-gray-500 text-sm mt-1">Group siblings under one parent contact</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Family
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {families.map(f => {
          const siblings = siblingsOf(f.id)
          return (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700">
                    <Users2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.parentName || '(unnamed)'}</p>
                    <p className="text-xs text-gray-500">{siblings.length} student{siblings.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500 mb-3">
                {f.parentEmail && <p className="flex items-center gap-1.5"><Mail size={11} /> {f.parentEmail}</p>}
                {f.parentPhone && <p className="flex items-center gap-1.5"><Phone size={11} /> {f.parentPhone}</p>}
              </div>

              {siblings.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {siblings.map(s => (
                    <span key={s.id} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{s.name}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => copyLink(f.shareToken)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors">
                  {copiedToken === f.shareToken ? <><Check size={13} /> Copied</> : <><Share2 size={13} /> Parent link</>}
                </button>
                <button onClick={() => openEdit(f)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setConfirmDelete(f)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          )
        })}

        {families.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Users2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No families yet.</p>
            <p className="text-xs mt-1">Create a family to link siblings under one parent contact.</p>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Family' : 'Edit Family'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent name</label>
              <input value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} className="input" placeholder="Sarah Johnson" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} className="input" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} className="input" placeholder="555-0100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input min-h-[60px] resize-none" placeholder="Any notes about this family..." />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">Save Family</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete this family?" onClose={() => setConfirmDelete(null)}>
          <p className="text-gray-600 text-sm">Linked students will stay but won't be grouped anymore. This can't be undone.</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => { deleteFamily(confirmDelete.id); setConfirmDelete(null) }} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
