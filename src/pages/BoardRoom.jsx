import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BoardCanvas from '../components/BoardCanvas'
import { GraduationCap, Loader2 } from 'lucide-react'

// Public, no-login whiteboard room for students who open a shared link.
export default function BoardRoom({ roomId }) {
  const [board, setBoard] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound
  const [name, setName] = useState('')
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    supabase.from('whiteboards').select('*').eq('room_id', roomId).maybeSingle().then(({ data }) => {
      if (data) { setBoard(data); setStatus('ready') } else setStatus('notfound')
    })
  }, [roomId])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-canvas)' }}><Loader2 size={26} className="animate-spin text-violet-600" /></div>
  }
  if (status === 'notfound') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-canvas)' }}>
        <div className="card p-8 max-w-md text-center">
          <p className="font-semibold text-gray-900">Board not found</p>
          <p className="text-gray-500 text-sm mt-1">This whiteboard link is invalid or was deleted.</p>
        </div>
      </div>
    )
  }

  // Ask for a first name so the tutor sees who joined
  if (!entered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-canvas)' }}>
        <div className="w-full max-w-sm scale-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{board.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Join the live whiteboard with your tutor.</p>
          </div>
          <div className="card p-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Your first name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. Emma" autoFocus
              onKeyDown={e => e.key === 'Enter' && name.trim() && setEntered(true)} />
            <button onClick={() => name.trim() && setEntered(true)} disabled={!name.trim()}
              className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors">
              Join board
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--color-canvas)' }}>
      <header className="frosted border-b border-gray-200/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
          <GraduationCap size={16} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{board.name}</p>
          <p className="text-xs text-gray-400">TutorHQ Whiteboard</p>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <BoardCanvas roomId={roomId} displayName={name} />
      </div>
    </div>
  )
}
