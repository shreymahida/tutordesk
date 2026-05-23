import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../store'
import TutorToday from './TutorToday'
import TutorSessions from './TutorSessions'
import TutorCalendar from './TutorCalendar'
import TutorStudents from './TutorStudents'
import Messages from '../pages/Messages'
import Curriculum from '../pages/Curriculum'
import { Home, Calendar, CalendarDays, Users, MessageSquare, LogOut, GraduationCap, Loader2, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

const NAV = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'curriculum', label: 'Resources', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

const PAGES = { today: TutorToday, sessions: TutorSessions, calendar: TutorCalendar, students: TutorStudents, curriculum: Curriculum, messages: Messages }

export default function TutorApp() {
  const { profile, signOut } = useAuth()
  const { dataLoading } = useApp()
  const [page, setPage] = useState('today')
  const Page = PAGES[page]
  const [unreadCount, setUnreadCount] = useState(0)

  // Track unread admin messages
  useState(() => {
    async function poll() {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('thread_user', profile?.id)
        .is('read_at', null)
      setUnreadCount(count || 0)
    }
    poll()
    const t = setInterval(poll, 15000)
    return () => clearInterval(t)
  })

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col">
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">TutorHQ</p>
              <p className="text-xs text-gray-400">Tutor portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${page === id ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {id === 'messages' && unreadCount > 0 && (
                <span className="text-xs bg-violet-600 text-white rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
              {(profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{profile?.name || profile?.email}</p>
              <p className="text-xs text-gray-400">Tutor</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <p className="font-bold text-gray-900 text-sm">TutorHQ</p>
          </div>
          <button onClick={signOut} className="text-gray-400 hover:text-red-600">
            <LogOut size={16} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 pb-20 md:pb-6">
          <Page />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 grid grid-cols-5 py-1 z-30">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`flex flex-col items-center gap-0.5 py-2 transition-colors relative ${page === id ? 'text-violet-600' : 'text-gray-400'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
              {id === 'messages' && unreadCount > 0 && (
                <span className="absolute top-1 right-[28%] text-[9px] bg-violet-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
