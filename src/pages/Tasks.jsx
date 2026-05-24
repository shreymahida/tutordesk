import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, X, Check, Trash2, CheckSquare, Square, Calendar, Flag, ListChecks } from 'lucide-react'

const BLANK = { title: '', description: '', assignedTo: '', dueDate: '', priority: 'normal', checklist: [] }
const PRIORITY = { low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-50 text-blue-700', high: 'bg-red-50 text-red-700' }

export default function Tasks() {
  const { user, isAdmin } = useAuth()
  const { tasks, addTask, updateTask, deleteTask } = useApp()
  const [profiles, setProfiles] = useState({})
  const [filter, setFilter] = useState('open')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [checkItem, setCheckItem] = useState('')

  useEffect(() => {
    if (isAdmin) supabase.from('profiles').select('id,name,email,role').then(({ data }) => {
      setProfiles(Object.fromEntries((data || []).map(p => [p.id, p])))
    })
  }, [isAdmin])

  const visible = tasks.filter(t => filter === 'all' || t.status === filter)

  function toggleChecklistItem(task, idx) {
    const checklist = task.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c)
    updateTask(task.id, { checklist })
  }
  function toggleStatus(task) {
    updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' })
  }

  function addChecklistToForm() {
    if (!checkItem.trim()) return
    setForm(f => ({ ...f, checklist: [...f.checklist, { text: checkItem.trim(), done: false }] }))
    setCheckItem('')
  }
  function save() {
    if (!form.title.trim()) return
    addTask({ ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null })
    setForm(BLANK); setModal(false)
  }

  const name = id => profiles[id]?.name || profiles[id]?.email || 'Unassigned'

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-gray-500 text-[15px] mt-1">{isAdmin ? 'Assign and track work across your team.' : 'Your assigned tasks.'}</p>
        </div>
        {isAdmin && <button onClick={() => { setForm(BLANK); setModal(true) }} className="btn-primary"><Plus size={16} /> New task</button>}
      </div>

      <div className="flex gap-2">
        {['open', 'done', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(t => {
          const done = t.status === 'done'
          const checklistDone = t.checklist?.filter(c => c.done).length || 0
          return (
            <div key={t.id} className={`card p-4 transition-all duration-200 ${done ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleStatus(t)} className="mt-0.5 flex-shrink-0 text-violet-600">
                  {done ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300 hover:text-violet-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-gray-900 ${done ? 'line-through' : ''}`}>{t.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY[t.priority]}`}>{t.priority}</span>
                    {t.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} /> {formatDate(t.dueDate)}</span>}
                    {isAdmin && t.assignedTo && <span className="text-xs text-violet-600 font-medium">{name(t.assignedTo)}</span>}
                  </div>
                  {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}

                  {t.checklist?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-400 flex items-center gap-1"><ListChecks size={12} /> {checklistDone}/{t.checklist.length}</p>
                      {t.checklist.map((c, i) => (
                        <button key={i} onClick={() => toggleChecklistItem(t, i)} className="flex items-center gap-2 text-sm text-left w-full">
                          {c.done ? <CheckSquare size={15} className="text-violet-600 flex-shrink-0" /> : <Square size={15} className="text-gray-300 flex-shrink-0" />}
                          <span className={c.done ? 'line-through text-gray-400' : 'text-gray-700'}>{c.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0"><Trash2 size={15} /></button>
                )}
              </div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <div className="card p-12 text-center">
            <CheckSquare size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">{filter === 'open' ? 'No open tasks. Nice.' : 'No tasks here.'}</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">New task</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Task title" autoFocus />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input min-h-[70px] resize-none" placeholder="Description (optional)" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assign to</label>
                  <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input">
                    <option value="">Unassigned</option>
                    {Object.values(profiles).filter(p => p.role === 'tutor').map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input">
                    <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Checklist</label>
                {form.checklist.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 mb-1"><Check size={13} className="text-violet-500" /> {c.text}</div>
                ))}
                <div className="flex gap-2">
                  <input value={checkItem} onChange={e => setCheckItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistToForm())} className="input flex-1" placeholder="Add checklist item + Enter" />
                  <button onClick={addChecklistToForm} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">Add</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="flex-1 btn-primary justify-center">Create task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
