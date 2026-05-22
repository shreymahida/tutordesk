import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Dashboard from './components/Dashboard'
import Students from './components/Students'
import Sessions from './components/Sessions'
import CalendarPage from './components/Calendar'
import Payments from './components/Payments'
import Progress from './components/Progress'
import Team from './pages/Team'
import ParentPortal from './pages/ParentPortal'
import { LayoutDashboard, Users, Calendar, CalendarDays, DollarSign, TrendingUp, GraduationCap, Menu, X, LogOut, UserCircle2, Loader2 } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'team', label: 'Team', icon: UserCircle2 },
]

const PAGES = { dashboard: Dashboard, students: Students, sessions: Sessions, calendar: CalendarPage, payments: Payments, progress: Progress, team: Team }

function MainApp() {
  const { profile, signOut, isAdmin } = useAuth()
  const { dataLoading } = useApp()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const Page = PAGES[page]

  const visibleNav = NAV.filter(n => n.id !== 'team' || isAdmin)

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
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">TutorHQ</p>
              <p className="text-xs text-gray-400">Business Manager</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {visibleNav.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page === id ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
              {(profile?.name || profile?.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{profile?.name || profile?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-gray-900 capitalize">{page}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Page />
        </main>
      </div>
    </div>
  )
}

function AppShell() {
  const { user, loading } = useAuth()

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
      <MainApp />
    </AppProvider>
  )
}

function PublicRouter() {
  // Simple path matcher for parent portal: /parent/<uuid>
  const path = window.location.pathname
  const match = path.match(/^\/parent\/([0-9a-fA-F-]{36})\/?$/)
  if (match) return <ParentPortal token={match[1]} />
  return null
}

export default function App() {
  const publicPage = PublicRouter()
  if (publicPage) return publicPage
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
