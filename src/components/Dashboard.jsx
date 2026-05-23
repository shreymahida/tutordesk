import { useApp } from '../store'
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, UserX } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { students, sessions, payments } = useApp()

  const today = new Date().toISOString().split('T')[0]
  const activeStudents = students.filter(s => s.status === 'active').length
  const upcomingSessions = sessions.filter(s => s.date >= today && s.status === 'scheduled').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const noShowCount = sessions.filter(s => s.status === 'no-show').length
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0)

  // Revenue last 8 weeks
  const revenueData = computeWeeklyRevenue(payments)
  const sessionsBySubject = computeSubjectBreakdown(sessions)

  const upcoming = sessions
    .filter(s => s.date >= today && s.status === 'scheduled')
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)
    .slice(0, 4)

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-500 text-[15px] mt-1.5">Here's your business at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users size={18} />} label="Active Students" value={activeStudents} color="blue" />
        <StatCard icon={<Calendar size={18} />} label="Upcoming" value={upcomingSessions} color="violet" />
        <StatCard icon={<CheckCircle size={18} />} label="Sessions Done" value={completedSessions} color="green" />
        <StatCard icon={<UserX size={18} />} label="No-shows" value={noShowCount} color="orange" />
        <StatCard icon={<DollarSign size={18} />} label="Collected" value={`$${totalRevenue.toFixed(0)}`} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><TrendingUp size={16} /> Revenue (last 8 weeks)</h2>
          <p className="text-xs text-gray-400 mb-3">Paid invoices grouped by week</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={v => `$${v}`} />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject breakdown */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Calendar size={16} /> Sessions by subject</h2>
          <p className="text-xs text-gray-400 mb-3">All-time count</p>
          {sessionsBySubject.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionsBySubject} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock size={16} /> Upcoming Sessions</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming sessions scheduled.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map(s => {
                const student = students.find(st => st.id === s.studentId)
                return (
                  <li key={s.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{student?.name}</p>
                      <p className="text-xs text-gray-500">{s.subject} · {s.duration}min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-violet-600">{formatDate(s.date)}</p>
                      <p className="text-xs text-gray-500">{formatTime(s.time)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Pending payments */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={16} /> Pending Payments</h2>
          {pendingRevenue === 0 ? (
            <p className="text-gray-400 text-sm">All payments collected!</p>
          ) : (
            <>
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-amber-700 font-semibold text-lg">${pendingRevenue.toFixed(2)}</p>
                <p className="text-amber-600 text-xs">outstanding balance</p>
              </div>
              <ul className="space-y-2">
                {payments.filter(p => p.status === 'pending').slice(0, 5).map(p => {
                  const student = students.find(s => s.id === p.studentId)
                  return (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{student?.name}</span>
                      <span className="font-medium text-gray-900">${Number(p.amount).toFixed(2)}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-400 to-blue-600',
    violet: 'from-violet-400 to-violet-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600',
    emerald: 'from-emerald-400 to-emerald-600',
  }
  return (
    <div className="card p-5 hover:shadow-[0_4px_12px_rgba(17,24,39,0.08),0_16px_40px_rgba(17,24,39,0.08)] transition-shadow">
      <div className={`inline-flex p-2.5 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-sm mb-4`}>{icon}</div>
      <p className="text-3xl font-semibold text-gray-900 tracking-tight tabular-nums">{value}</p>
      <p className="text-[13px] text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function computeWeeklyRevenue(payments) {
  const weeks = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() - i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const total = payments
      .filter(p => p.status === 'paid' && p.date >= start.toISOString().split('T')[0] && p.date < end.toISOString().split('T')[0])
      .reduce((s, p) => s + Number(p.amount), 0)
    weeks.push({
      label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Number(total.toFixed(2)),
    })
  }
  return weeks
}

function computeSubjectBreakdown(sessions) {
  const map = {}
  sessions.forEach(s => {
    if (s.status === 'cancelled') return
    map[s.subject] = (map[s.subject] || 0) + 1
  })
  return Object.entries(map).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count).slice(0, 8)
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}
