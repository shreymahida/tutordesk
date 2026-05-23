import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../store'
import { useTheme } from '../context/ThemeContext'
import BoardCanvas from '../components/BoardCanvas'
import { Plus, Pencil, Trash2, Share2, Check, ArrowLeft, X, PenTool } from 'lucide-react'

function newRoomId() {
  return Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6)
}

export default function Whiteboard() {
  const { user, profile } = useAuth()
  const { students } = useApp()
  const { mode } = useTheme()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [openBoard, setOpenBoard] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', studentId: '' })
  const [copied, setCopied] = useState(null)

  async function loadBoards() {
    const { data } = await supabase.from('whiteboards').select('*').order('updated_at', { ascending: false })
    setBoards(data || [])
    setLoading(false)
  }
  useEffect(() => { loadBoards() }, [])

  async function createBoard() {
    const roomId = newRoomId()
    const { data } = await supabase.from('whiteboards').insert({
      room_id: roomId,
      name: form.name || 'Untitled board',
      student_id: form.studentId || null,
      created_by: user.id,
      scene: { elements: [] },
    }).select().single()
    setCreating(false)
    setForm({ name: '', studentId: '' })
    if (data) { setBoards(b => [data, ...b]); setOpenBoard(data) }
  }

  async function deleteBoard(id) {
    if (!confirm('Delete this whiteboard?')) return
    await supabase.from('whiteboards').delete().eq('id', id)
    setBoards(b => b.filter(x => x.id !== id))
  }

  function copyLink(roomId) {
    navigator.clipboard.writeText(`${window.location.origin}/board/${roomId}`)
    setCopied(roomId)
    setTimeout(() => setCopied(null), 2000)
  }

  const studentName = id => students.find(s => s.id === id)?.name

  if (openBoard) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-canvas)' }}>
        <header className="frosted border-b border-gray-200/50 px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => { setOpenBoard(null); loadBoards() }} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Boards</span>
            </button>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{openBoard.name}</p>
              {openBoard.student_id && <p className="text-xs text-gray-400">{studentName(openBoard.student_id)}</p>}
            </div>
          </div>
          <button onClick={() => copyLink(openBoard.room_id)}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-full transition-colors">
            {copied === openBoard.room_id ? <><Check size={13} /> Link copied</> : <><Share2 size={13} /> Share with student</>}
          </button>
        </header>
        <div className="flex-1 min-h-0">
          <BoardCanvas roomId={openBoard.room_id} displayName={profile?.name || 'Tutor'} dark={mode === 'dark'} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Whiteboard</h1>
          <p className="text-gray-500 text-[15px] mt-1">Draw together with students in real time. Share a link — no account needed.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> New board
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : boards.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
            <PenTool size={26} className="text-violet-500" />
          </div>
          <p className="font-semibold text-gray-900">No whiteboards yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Create one for a lesson — solve problems, sketch diagrams, work through it together live.</p>
          <button onClick={() => setCreating(true)} className="btn-primary mx-auto"><Plus size={16} /> New board</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map(b => (
            <div key={b.id} className="card p-5">
              <button onClick={() => setOpenBoard(b)} className="w-full text-left">
                <div className="h-28 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                  <PenTool size={28} className="text-violet-300" />
                </div>
                <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                <p className="text-xs text-gray-400">
                  {b.student_id ? studentName(b.student_id) + ' · ' : ''}{timeAgo(b.updated_at)}
                </p>
              </button>
              <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                <button onClick={() => setOpenBoard(b)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors">
                  <Pencil size={13} /> Open
                </button>
                <button onClick={() => copyLink(b.room_id)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-violet-600 hover:bg-violet-50 py-1.5 rounded-lg transition-colors">
                  {copied === b.room_id ? <><Check size={13} /> Copied</> : <><Share2 size={13} /> Share</>}
                </button>
                <button onClick={() => deleteBoard(b.id)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">New whiteboard</h2>
              <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Board name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. MCV4U — Related Rates" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link to student (optional)</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="input">
                  <option value="">None</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setCreating(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={createBoard} className="flex-1 btn-primary justify-center">Create & open</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
