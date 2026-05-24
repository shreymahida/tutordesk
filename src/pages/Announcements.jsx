import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Pin, Trash2, Megaphone, Edit2 } from 'lucide-react'

const BLANK = { title: '', body: '', pinned: false }

export default function Announcements() {
  const { isAdmin } = useAuth()
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, markAnnouncementRead } = useApp()
  const [modal, setModal] = useState(null) // null | 'new' | announcement
  const [form, setForm] = useState(BLANK)

  // Mark all visible announcements as read on view
  useEffect(() => {
    announcements.forEach(a => markAnnouncementRead(a.id))
  }, [announcements.length])

  function openNew() { setForm(BLANK); setModal('new') }
  function openEdit(a) { setForm({ title: a.title, body: a.body, pinned: a.pinned }); setModal(a) }
  function save() {
    if (!form.title.trim()) return
    if (modal === 'new') addAnnouncement(form)
    else updateAnnouncement(modal.id, form)
    setModal(null)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Announcements</h1>
          <p className="text-gray-500 text-[15px] mt-1">{isAdmin ? 'Broadcast updates to your whole team.' : 'Updates from your team.'}</p>
        </div>
        {isAdmin && <button onClick={openNew} className="btn-primary"><Plus size={16} /> Post update</button>}
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className={`card p-5 ${a.pinned ? 'ring-1 ring-violet-200' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                  <Megaphone size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin size={13} className="text-violet-500" />}
                    <h2 className="font-semibold text-gray-900">{a.title}</h2>
                  </div>
                  <p className="text-xs text-gray-400">{formatWhen(a.createdAt)}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => updateAnnouncement(a.id, { pinned: !a.pinned })} title="Pin" className={`p-1.5 rounded-lg hover:bg-gray-100 ${a.pinned ? 'text-violet-600' : 'text-gray-400'}`}><Pin size={14} /></button>
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><Edit2 size={14} /></button>
                  <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            {a.body && <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">{a.body}</p>}
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="card p-12 text-center">
            <Megaphone size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">{isAdmin ? 'No announcements yet — post your first update.' : 'No announcements yet.'}</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Post update' : 'Edit update'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Title" autoFocus />
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="input min-h-[120px] resize-none" placeholder="What's the update?" />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} /> Pin to top
              </label>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="flex-1 btn-primary justify-center">{modal === 'new' ? 'Post' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatWhen(iso) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
