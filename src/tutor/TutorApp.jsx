import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../store'
import TutorToday from './TutorToday'
import TutorSessions from './TutorSessions'
import TutorCalendar from './TutorCalendar'
import TutorStudents from './TutorStudents'
import Messages from '../pages/Messages'
import Curriculum from '../pages/Curriculum'
import TimeClock from '../pages/TimeClock'
import Settings from '../pages/Settings'
import Whiteboard from '../pages/Whiteboard'
import Tasks from '../pages/Tasks'
import Announcements from '../pages/Announcements'
import Availability from '../pages/Availability'
import Documents from '../pages/Documents'
import { useTheme } from '../context/ThemeContext'
import { Home, Calendar, Clock, Users, MessageSquare, LogOut, GraduationCap, Loader2, BookOpen, MoreHorizontal, PenTool, Settings as SettingsIcon, Sun, Moon, X, CheckSquare, Megaphone, CalendarOff, FolderOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

const NAV = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'timeclock', label: 'Clock', icon: Clock },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

const MORE_NAV = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'availability', label: 'Availability', icon: CalendarOff },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
  { id: 'curriculum', label: 'Resources', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

const PAGES = { today: TutorToday, sessions: TutorSessions, timeclock: TimeClock, calendar: TutorCalendar, students: TutorStudents, whiteboard: Whiteboard, curriculum: Curriculum, messages: Messages, settings: Settings, tasks: Tasks, announcements: Announcements, availability: Availability, documents: Documents }

const ALL_NAV = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'timeclock', label: 'Time Clock', icon: Clock },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'availability', label: 'Availability', icon: CalendarOff },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
  { id: 'curriculum', label: 'Resources', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function TutorApp() {
  const { profile, signOut } = useAuth()
  const { dataLoading } = useApp()
  const { mode, toggleMode } = useTheme()
  const [page, setPage] = useState('today')
  const [moreOpen, setMoreOpen] = useState(false)
  const Page = PAGES[page]
  const [unreadCount, setUnreadCount] = useState(0)

  useState(() => {
    async function poll() {
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('thread_user', profile?.id).is('read_at', null)
      setUnreadCount(count || 0)
    }
    poll()
    const t = setInterval(poll, 15000)
    return () => clearInterval(t)
  })

  function go(id) { setPage(id); setMoreOpen(false) }

  if (dataLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-canvas)' }}><Loader2 size={28} className="text-violet-600 animate-spin" /></div>
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--color-canvas)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 frosted border-r border-gray-200/60 flex-col">
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-[15px] leading-tight tracking-tight">TutorHQ</p>
            <p className="text-xs text-gray-400">Tutor portal</p>
          </div>
        </div>
        {/* Separator below branding */}
        <div className="mx-5 mb-2 h-px bg-gray-200/70" />
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {ALL_NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${page === id ? 'bg-violet-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)]' : 'text-gray-600 hover:bg-gray-500/8 hover:text-gray-900'}`}>
              <Icon size={17} strokeWidth={page === id ? 2.4 : 2} />
              <span className="flex-1 text-left">{label}</span>
              {id === 'messages' && unreadCount > 0 && <span className="text-xs bg-white/90 text-violet-700 rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center font-bold">{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <div className={`flex items-center gap-2.5 mb-2 p-2 rounded-2xl transition-colors ${page === 'settings' ? 'bg-violet-600' : ''}`}>
            <button onClick={() => go('settings')} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                {(profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${page === 'settings' ? 'text-white' : 'text-gray-900'}`}>{profile?.name || profile?.email}</p>
                <p className={`text-xs ${page === 'settings' ? 'text-violet-200' : 'text-gray-400'}`}>Tutor</p>
              </div>
            </button>
            <button onClick={toggleMode} className={`w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-500/10 ${page === 'settings' ? 'text-violet-100' : 'text-gray-400'}`}>
              {mode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden frosted border-b border-gray-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm tracking-tight">TutorHQ</p>
          </div>
          <button onClick={toggleMode} className="text-gray-400 hover:text-gray-700">
            {mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-24 md:pb-8 fade-in" key={page}>
          <Page />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 frosted border-t border-gray-200/50 grid grid-cols-5 py-1 z-30">
          {[...ALL_NAV.slice(0, 4), { id: 'more', label: 'More', icon: MoreHorizontal }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => id === 'more' ? setMoreOpen(true) : go(id)}
              className={`flex flex-col items-center gap-0.5 py-2 transition-colors relative ${page === id ? 'text-violet-600' : 'text-gray-400'}`}>
              <Icon size={20} strokeWidth={page === id ? 2.4 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile "More" sheet */}
        {moreOpen && (
          <div className="md:hidden fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 pb-8 scale-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900">More</p>
                <button onClick={() => setMoreOpen(false)} className="text-gray-400"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ALL_NAV.slice(4).map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => go(id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${page === id ? 'bg-violet-50 text-violet-700' : 'bg-gray-50 text-gray-600'}`}>
                    <Icon size={22} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
