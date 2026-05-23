import { useState, useEffect, useRef } from 'react'
import { supabase, camelize, snakify } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Send, Loader2, Search, ArrowLeft } from 'lucide-react'

export default function Messages() {
  const { user, profile, isAdmin } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [allMessages, setAllMessages] = useState([])
  const [activeUserId, setActiveUserId] = useState(null) // who you're chatting WITH
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Auto-pick: tutors instantly chat with admin; admin sees their list.
  useEffect(() => {
    async function init() {
      const { data: prof } = await supabase.from('profiles').select('*').order('name')
      const pf = prof || []
      setProfiles(pf)
      if (!isAdmin) {
        const admin = pf.find(p => p.role === 'admin' && p.id !== user.id)
        if (admin) setActiveUserId(admin.id)
      }
      const { data: msgs } = await supabase.from('messages').select('*').order('created_at')
      setAllMessages((msgs || []).map(camelize))
      setLoading(false)
    }
    init()

    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setAllMessages(p => [...p, camelize(payload.new)])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
        setAllMessages(p => p.map(m => m.id === payload.new.id ? camelize(payload.new) : m))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user.id, isAdmin])

  // Mark active thread messages as read
  useEffect(() => {
    if (!activeUserId) return
    const unread = allMessages.filter(m =>
      m.senderId === activeUserId && m.threadUser === user.id && !m.readAt
    )
    if (unread.length === 0) return
    supabase.from('messages').update({ read_at: new Date().toISOString() })
      .in('id', unread.map(m => m.id))
  }, [activeUserId, allMessages, user.id])

  // For admin: list of contactable profiles excluding self
  // For tutor: only admin profile(s)
  const contactList = isAdmin
    ? profiles.filter(p => p.id !== user.id)
    : profiles.filter(p => p.role === 'admin' && p.id !== user.id)

  const filteredContacts = contactList.filter(p =>
    (p.name || p.email || '').toLowerCase().includes(search.toLowerCase())
  )

  function threadWith(otherId) {
    return allMessages.filter(m =>
      (m.senderId === user.id && m.threadUser === otherId) ||
      (m.senderId === otherId && m.threadUser === user.id)
    ).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  function lastMessage(otherId) {
    const thread = threadWith(otherId)
    return thread[thread.length - 1]
  }

  function unreadCount(otherId) {
    return allMessages.filter(m =>
      m.senderId === otherId && m.threadUser === user.id && !m.readAt
    ).length
  }

  async function sendMessage(content) {
    if (!content.trim() || !activeUserId) return
    await supabase.from('messages').insert(snakify({
      threadUser: activeUserId,
      senderId: user.id,
      content: content.trim(),
    }))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-violet-600" /></div>

  const active = profiles.find(p => p.id === activeUserId)

  return (
    <div className="-m-4 lg:-m-6 h-[calc(100vh-64px)] flex bg-white">
      {/* Sidebar — admins see list; tutors see no list (only one option = admin) */}
      {isAdmin && (
        <aside className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                placeholder="Search team..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(p => {
              const last = lastMessage(p.id)
              const unread = unreadCount(p.id)
              return (
                <button key={p.id} onClick={() => setActiveUserId(p.id)}
                  className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 text-left transition-colors ${activeUserId === p.id ? 'bg-violet-50' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm flex-shrink-0">
                    {(p.name || p.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">{p.name || p.email}</p>
                      {last && <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(last.createdAt)}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 truncate">{last?.content || 'Start a conversation'}</p>
                      {unread > 0 && <span className="text-xs bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">{unread}</span>}
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No team members.</div>
            )}
          </div>
        </aside>
      )}

      {/* Thread */}
      <main className={`flex-1 flex flex-col ${isAdmin && !activeUserId ? 'hidden md:flex' : 'flex'}`}>
        {!activeUserId ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={26} className="text-violet-500" />
              </div>
              <p className="font-semibold text-gray-900">Select a conversation</p>
              <p className="text-sm text-gray-500 mt-1">Pick a teammate to start chatting.</p>
            </div>
          </div>
        ) : (
          <Thread
            other={active}
            messages={threadWith(activeUserId)}
            user={user}
            onSend={sendMessage}
            onBack={isAdmin ? () => setActiveUserId(null) : null}
          />
        )}
      </main>
    </div>
  )
}

function Thread({ other, messages, user, onSend, onBack }) {
  const [draft, setDraft] = useState('')
  const scrollerRef = useRef(null)

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function submit(e) {
    e?.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <>
      <header className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700 md:hidden">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
          {(other?.name || other?.email || '?').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{other?.name || other?.email}</p>
          <p className="text-xs text-gray-400 capitalize">{other?.role}</p>
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">No messages yet — say hi 👋</p>
        ) : (
          <div className="space-y-2 max-w-2xl mx-auto">
            {messages.map((m, i) => {
              const isMine = m.senderId === user.id
              const showTime = i === 0 || (new Date(m.createdAt) - new Date(messages[i - 1].createdAt)) > 5 * 60 * 1000
              return (
                <div key={m.id}>
                  {showTime && (
                    <p className="text-center text-xs text-gray-400 my-3">{formatFullTime(m.createdAt)}</p>
                  )}
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMine ? 'bg-violet-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="p-3 lg:p-4 border-t border-gray-100 bg-white flex items-center gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button type="submit" disabled={!draft.trim()}
          className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-full transition-colors">
          <Send size={16} />
        </button>
      </form>
    </>
  )
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}
function formatFullTime(iso) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  return sameDay
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
