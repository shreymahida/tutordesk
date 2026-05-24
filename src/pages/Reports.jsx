import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { supabase } from '../lib/supabase'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, Clock, TrendingUp, Users, Download, Calendar } from 'lucide-react'

const PIE = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#ec4899']

export default function Reports() {
  const { students, sessions, payments } = useApp()
  const [range, setRange] = useState(90)
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState({})

  useEffect(() => {
    supabase.from('time_entries').select('*').then(({ data }) => setEntries(data || []))
    supabase.from('profiles').select('id,name,email').then(({ data }) => setProfiles(Object.fromEntries((data || []).map(p => [p.id, p.name || p.email]))))
  }, [])

  const since = new Date(Date.now() - range * 86400000).toISOString().split('T')[0]

  // Revenue
  const paid = payments.filter(p => p.status === 'paid' && p.date >= since)
  const totalRevenue = paid.reduce((s, p) => s + Number(p.amount), 0)
  const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
  const revByMonth = groupByMonth(paid)

  // Sessions
  const inRange = sessions.filter(s => s.date >= since)
  const completed = inRange.filter(s => s.status === 'completed').length
  const noShows = inRange.filter(s => s.status === 'no-show').length
  const noShowRate = (completed + noShows) ? Math.round((noShows / (completed + noShows)) * 100) : 0
  const bySubject = topSubjects(inRange)
  const statusBreakdown = ['scheduled', 'completed', 'cancelled', 'no-show'].map(st => ({ name: st, value: inRange.filter(s => s.status === st).length })).filter(x => x.value)

  // Hours by tutor (from time entries)
  const hoursByTutor = {}
  entries.forEach(e => {
    if (!e.clock_out || e.clock_in < since) return
    const h = (new Date(e.clock_out) - new Date(e.clock_in)) / 3600000
    hoursByTutor[e.user_id] = (hoursByTutor[e.user_id] || 0) + h
  })
  const tutorHours = Object.entries(hoursByTutor).map(([id, h]) => ({ name: (profiles[id] || '—').split(' ')[0], hours: Number(h.toFixed(1)) })).sort((a, b) => b.hours - a.hours).slice(0, 8)

  // Top students by sessions
  const studentCounts = {}
  inRange.forEach(s => { studentCounts[s.studentId] = (studentCounts[s.studentId] || 0) + 1 })
  const topStudents = Object.entries(studentCounts).map(([id, c]) => ({ name: students.find(s => s.id === id)?.name || '—', sessions: c })).sort((a, b) => b.sessions - a.sessions).slice(0, 6)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 text-[15px] mt-1">Your business at a glance — revenue, hours, sessions, retention.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-full p-0.5">
          {[30, 90, 365].map(d => (
            <button key={d} onClick={() => setRange(d)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${range === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {d === 365 ? '1y' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<DollarSign size={18} />} label="Revenue" value={`$${totalRevenue.toFixed(0)}`} color="emerald" />
        <Kpi icon={<DollarSign size={18} />} label="Outstanding" value={`$${outstanding.toFixed(0)}`} color="amber" />
        <Kpi icon={<TrendingUp size={18} />} label="Sessions done" value={completed} color="violet" />
        <Kpi icon={<Users size={18} />} label="No-show rate" value={`${noShowRate}%`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by month">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revByMonth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => `$${v}`} contentStyle={{ borderRadius: 12, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-white)' }} />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Hours by tutor">
          {tutorHours.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tutorHours} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `${v}h`} contentStyle={{ borderRadius: 12, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-white)' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Sessions by status">
          {statusBreakdown.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusBreakdown.map((e, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-white)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusBreakdown.map((s, i) => (
              <span key={s.name} className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: PIE[i % PIE.length] }} /> {s.name} ({s.value})</span>
            ))}
          </div>
        </Card>

        <Card title="Top subjects">
          {bySubject.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySubject} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="subject" width={90} tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-white)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Top students table */}
      <Card title="Most active students">
        {topStudents.length === 0 ? <Empty /> : (
          <div className="divide-y divide-gray-50">
            {topStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-gray-900">{i + 1}. {s.name}</span>
                <span className="text-sm text-gray-500">{s.sessions} sessions</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}
function Kpi({ icon, label, value, color }) {
  const c = { emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', violet: 'bg-violet-50 text-violet-600', red: 'bg-red-50 text-red-600' }
  return (
    <div className="card p-5">
      <div className={`inline-flex p-2 rounded-xl ${c[color]} mb-3`}>{icon}</div>
      <p className="text-3xl font-semibold text-gray-900 tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
function Empty() { return <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No data in this range.</div> }

function groupByMonth(payments) {
  const map = {}
  payments.forEach(p => {
    const k = p.date.slice(0, 7)
    map[k] = (map[k] || 0) + Number(p.amount)
  })
  return Object.entries(map).sort().map(([k, v]) => ({ label: new Date(k + '-01T12:00:00').toLocaleDateString('en-US', { month: 'short' }), amount: Number(v.toFixed(2)) }))
}
function topSubjects(sessions) {
  const map = {}
  sessions.forEach(s => { if (s.status !== 'cancelled') map[s.subject] = (map[s.subject] || 0) + 1 })
  return Object.entries(map).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count).slice(0, 7)
}
