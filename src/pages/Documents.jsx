import { useState, useEffect, useRef } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, FileText, Upload, Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react'

const DOC_TYPES = ['Background check', 'Certification', 'Teaching qualification', 'ID', 'Contract', 'Resume', 'Other']

export default function Documents() {
  const { isAdmin } = useAuth()
  const { getDocuments, addDocument, deleteDocument } = useApp()
  const [docs, setDocs] = useState([])
  const [profiles, setProfiles] = useState({})
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', docType: 'Certification', expiresOn: '', fileUrl: '' })
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  async function refresh() { setDocs(await getDocuments({ allUsers: isAdmin })) }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (isAdmin) supabase.from('profiles').select('id,name,email').then(({ data }) => setProfiles(Object.fromEntries((data || []).map(p => [p.id, p.name || p.email]))))
  }, [isAdmin])

  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('documents').getPublicUrl(path)
      setForm(f => ({ ...f, fileUrl: data.publicUrl, name: f.name || file.name }))
    }
    setUploading(false)
    e.target.value = ''
  }

  async function save() {
    if (!form.name.trim()) return
    await addDocument({ ...form, expiresOn: form.expiresOn || null })
    setForm({ name: '', docType: 'Certification', expiresOn: '', fileUrl: '' })
    setModal(false); refresh()
  }

  const today = new Date().toISOString().split('T')[0]
  const expStatus = (d) => {
    if (!d) return null
    const days = Math.ceil((new Date(d + 'T12:00:00') - new Date()) / 86400000)
    if (days < 0) return { label: 'Expired', cls: 'bg-red-50 text-red-700', icon: AlertTriangle }
    if (days <= 30) return { label: `Expires in ${days}d`, cls: 'bg-amber-50 text-amber-700', icon: AlertTriangle }
    return { label: `Valid · ${fmtDate(d)}`, cls: 'bg-green-50 text-green-700', icon: CheckCircle }
  }

  // Sort: expired/expiring first
  const sorted = [...docs].sort((a, b) => (a.expiresOn || '9999').localeCompare(b.expiresOn || '9999'))
  const expiringCount = docs.filter(d => d.expiresOn && Math.ceil((new Date(d.expiresOn + 'T12:00:00') - new Date()) / 86400000) <= 30).length

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Documents</h1>
          <p className="text-gray-500 text-[15px] mt-1">{isAdmin ? 'Certifications, background checks & contracts — with expiry alerts.' : 'Your documents and certifications.'}</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Add document</button>
      </div>

      {expiringCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">{expiringCount} document{expiringCount !== 1 ? 's' : ''} expired or expiring within 30 days.</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(d => {
          const st = expStatus(d.expiresOn)
          return (
            <div key={d.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0"><FileText size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{d.name}</p>
                <p className="text-xs text-gray-500">{d.docType}{isAdmin && d.userId ? ` · ${profiles[d.userId] || '—'}` : ''}</p>
              </div>
              {st && <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${st.cls}`}><st.icon size={11} /> {st.label}</span>}
              {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"><Download size={15} /></a>}
              {isAdmin && <button onClick={() => deleteDocument(d.id).then(refresh)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>}
            </div>
          )
        })}
        {docs.length === 0 && (
          <div className="card p-12 text-center">
            <FileText size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">No documents yet. Add certifications, background checks, or contracts.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Add document</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Vulnerable Sector Check" autoFocus /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} className="input">{DOC_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Expires on</label><input type="date" value={form.expiresOn} onChange={e => setForm(f => ({ ...f, expiresOn: e.target.value }))} className="input" /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">File</label>
                <input ref={fileRef} type="file" onChange={upload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-violet-400 rounded-xl text-gray-500 hover:text-violet-600 transition-colors text-sm flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : form.fileUrl ? <><CheckCircle size={16} className="text-green-500" /> File attached</> : <><Upload size={16} /> Choose file</>}
                </button>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="flex-1 btn-primary justify-center">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function fmtDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
