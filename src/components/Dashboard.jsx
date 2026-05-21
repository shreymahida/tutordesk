import { useApp } from '../store'
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const { students, sessions, payments } = useApp()

  const today = new Date().toISOString().split('T')[0]
  const activeStudents = students.filter(s => s.status === 'active').length
  const upcomingSessions = sessions.filter(s => s.date >= today && s.status === 'scheduled').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  const recentSessions = [...sessions]
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? -1 : 1)
    .slice(0, 5)

  const upcoming = sessions
    .filter(s => s.date >= today && s.status === 'scheduled')
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here's your business at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Active Students" value={activeStudents} color="blue" />
        <StatCard icon={<Calendar size={20} />} label="Upcoming Sessions" value={upcomingSessions} color="violet" />
        <StatCard icon={<CheckCircle size={20} />} label="Sessions Done" value={completedSessions} color="green" />
        <StatCard icon={<DollarSign size={20} />} label="Revenue Collected" value={`$${totalRevenue.toFixed(0)}`} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
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
                {payments.filter(p => p.status === 'pending').map(p => {
                  const student = students.find(s => s.id === p.studentId)
                  return (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{student?.name}</span>
                      <span className="font-medium text-gray-900">${p.amount.toFixed(2)}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Recent Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSessions.map(s => {
                const student = students.find(st => st.id === s.studentId)
                return (
                  <tr key={s.id}>
                    <td className="py-2 font-medium text-gray-900">{student?.name}</td>
                    <td className="py-2 text-gray-600">{s.subject}</td>
                    <td className="py-2 text-gray-600">{formatDate(s.date)}</td>
                    <td className="py-2 text-gray-600">{s.duration}min</td>
                    <td className="py-2"><StatusBadge status={s.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}
