import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Dashboard from './components/Dashboard'
import Students from './components/Students'
import Sessions from './components/Sessions'
import CalendarPage from './components/Calendar'
import Payments from './components/Payments'
import Progress from './components/Progress'
import Team from './pages/Team'
import Families from './pages/Families'
import Leads from './pages/Leads'
import Messages from './pages/Messages'
import Curriculum from './pages/Curriculum'
import TimeClock from './pages/TimeClock'
import Settings from './pages/Settings'
import Whiteboard from './pages/Whiteboard'
import { useTheme } from './context/ThemeContext'
import ParentPortal from './pages/ParentPortal'
import FamilyPortal from './pages/FamilyPortal'
import BookPage from './pages/BookPage'
import TutorApp from './tutor/TutorApp'
import { LayoutDashboard, Users, Users2, Calendar, CalendarDays, DollarSign, TrendingUp, GraduationCap, Menu, X, LogOut, UserCircle2, Loader2, Inbox, MessageSquare, BookOpen, Clock, Settings as SettingsIcon, PenTool, Sun, Moon } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'families', label: 'Families', icon: Users2 },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { id: 'timeclock', label: 'Time Clock', icon: Clock },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'leads', label: 'Leads', icon: Inbox },
  { id: 'team', label: 'Team', icon: UserCircle2 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

const PAGES = { dashboard: Dashboard, students: Students, families: Families, sessions: Sessions, calendar: CalendarPage, whiteboard: Whiteboard, curriculum: Curriculum, timeclock: TimeClock, payments: Payments, progress: Progress, messages: Messages, leads: Leads, team: Team, settings: Settings }

function MainApp() {
  const { profile, signOut, isAdmin } = useAuth()
  const { dataLoading } = useApp()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const Page = PAGES[page]

  const { mode, toggleMode, logoUrl } = useTheme()
  const visibleNav = NAV.filter(n => (n.id !== 'team' && n.id !== 'leads') || isAdmin)

  function navigate(id) { setPage(id); setSidebarOpen(false) }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto mb-3 text-violet-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-canvas)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 frosted border-r border-gray-200/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.3)] overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : <GraduationCap size={18} className="text-white" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-[15px] leading-tight tracking-tight">TutorHQ</p>
              <p className="text-xs text-gray-400">Business Manager</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 ${page === id ? 'bg-violet-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)]' : 'text-gray-600 hover:bg-gray-500/8 hover:text-gray-900'}`}>
              <Icon size={17} strokeWidth={page === id ? 2.4 : 2} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-2">
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
              {(profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{profile?.name || profile?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="frosted border-b border-gray-200/50 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-gray-900 capitalize tracking-tight">{page}</h1>
          <button onClick={toggleMode} title="Toggle theme"
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-500/10 text-gray-500 transition-colors">
            {mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </header>
        <main className="flex-1 p-5 lg:p-8 fade-in" key={page}>
          <Page />
        </main>
      </div>
    </div>
  )
}

function AppShell() {
  const { user, profile, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <AppProvider>
      {isAdmin ? <MainApp /> : <TutorApp />}
    </AppProvider>
  )
}

function PublicRouter() {
  const path = window.location.pathname
  const parentMatch = path.match(/^\/parent\/([0-9a-fA-F-]{36})\/?$/)
  if (parentMatch) return <ParentPortal token={parentMatch[1]} />
  const familyMatch = path.match(/^\/family\/([0-9a-fA-F-]{36})\/?$/)
  if (familyMatch) return <FamilyPortal token={familyMatch[1]} />
  if (path === '/book' || path === '/book/') return <BookPage />
  return null
}

export default function App() {
  const publicPage = PublicRouter()
  return (
    <ThemeProvider>
      {publicPage || (
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      )}
    </ThemeProvider>
  )
}
