import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { Video, Clock, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function TutorToday() {
  const { user } = useAuth()
  const { sessions, students } = useApp()

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const myToday = sessions.filter(s => s.tutorId === user.id && s.date === today && s.status === 'scheduled').sort((a, b) => a.time.localeCompare(b.time))
  const myTomorrow = sessions.filter(s => s.tutorId === user.id && s.date === tomorrow && s.status === 'scheduled').sort((a, b) => a.time.localeCompare(b.time))
  const upcomingWeek = sessions.filter(s => s.tutorId === user.id && s.date > tomorrow && s.date <= addDays(today, 7) && s.status === 'scheduled').length
  const completedWeek = sessions.filter(s => s.tutorId === user.id && s.status === 'completed' && s.date >= addDays(today, -7)).length
  const hoursWeek = sessions.filter(s => s.tutorId === user.id && s.status === 'completed' && s.date >= addDays(today, -7)).reduce((sum, s) => sum + s.duration / 60, 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Greeting */}
      <div>
        <p className="text-2xl font-bold text-gray-900">{greeting}.</p>
        <p className="text-gray-500 text-sm mt-1">
          {myToday.length === 0 ? "No sessions on your plate today — enjoy the breather." : `You have ${myToday.length} session${myToday.length !== 1 ? 's' : ''} today.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="This week" value={completedWeek} sub="completed" />
        <StatCard label="Hours" value={hoursWeek.toFixed(1)} sub="taught" />
        <StatCard label="Upcoming" value={upcomingWeek} sub="next 7 days" />
      </div>

      {/* Today */}
      <Section title="Today" empty={myToday.length === 0 ? "Nothing scheduled today." : null}>
        <div className="space-y-2">
          {myToday.map(s => <SessionRow key={s.id} session={s} student={students.find(st => st.id === s.studentId)} highlight />)}
        </div>
      </Section>

      {/* Tomorrow */}
      {myTomorrow.length > 0 && (
        <Section title="Tomorrow">
          <div className="space-y-2">
            {myTomorrow.map(s => <SessionRow key={s.id} session={s} student={students.find(st => st.id === s.studentId)} />)}
          </div>
        </Section>
      )}

      {myToday.length === 0 && myTomorrow.length === 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-8 text-center border border-violet-100">
          <Sparkles size={28} className="mx-auto mb-2 text-violet-600" />
          <p className="font-semibold text-gray-900">All clear ahead</p>
          <p className="text-sm text-gray-500 mt-1">No sessions in the next 48 hours.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

function Section({ title, children, empty }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {empty ? <p className="text-sm text-gray-400">{empty}</p> : children}
    </div>
  )
}

function SessionRow({ session, student, highlight }) {
  const now = new Date()
  const sessionDt = new Date(session.date + 'T' + (session.time || '00:00'))
  const minsAway = Math.floor((sessionDt - now) / 60000)
  const isSoon = highlight && minsAway > 0 && minsAway < 60
  const isLive = highlight && minsAway <= 0 && minsAway > -session.duration

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center justify-between gap-3 ${isLive ? 'border-green-300 ring-2 ring-green-100' : isSoon ? 'border-amber-200 ring-2 ring-amber-50' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${isLive ? 'bg-green-100 text-green-700' : 'bg-violet-50 text-violet-700'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">{formatTime(session.time).replace(/[: ]/g, '').replace(/[ap]m/i, '')}</span>
          <span className="text-[10px] font-bold">{formatTime(session.time).slice(-2)}</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{student?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{session.subject} · {session.duration}min</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE</span>}
        {isSoon && !isLive && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">in {minsAway}min</span>}
        {session.meetingLink ? (
          <a href={session.meetingLink} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors">
            <Video size={13} /> Join
          </a>
        ) : (
          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors">
            <Video size={13} /> New Meet
          </a>
        )}
      </div>
    </div>
  )
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`
}
