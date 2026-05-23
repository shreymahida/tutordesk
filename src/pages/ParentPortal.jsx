import { useEffect, useState } from 'react'
import { supabase, camelize } from '../lib/supabase'
import { GraduationCap, Calendar, DollarSign, TrendingUp, Star, Loader2, FileText, Video } from 'lucide-react'
import { exportProgressPDF } from '../lib/pdfReport'
import Achievements from '../components/Achievements'

export default function ParentPortal({ token }) {
  const [student, setStudent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: studentRows, error: stuErr } = await supabase.from('students').select('*').eq('share_token', token).maybeSingle()
      if (stuErr || !studentRows) { setError('This link is invalid or has expired.'); setLoading(false); return }
      const stu = camelize(studentRows)
      setStudent(stu)
      const [{ data: ses }, { data: pay }, { data: nts }] = await Promise.all([
        supabase.from('sessions').select('*').eq('student_id', stu.id).order('date', { ascending: false }),
        supabase.from('payments').select('*').eq('student_id', stu.id).order('date', { ascending: false }),
        supabase.from('progress_notes').select('*').eq('student_id', stu.id).order('date', { ascending: false }),
      ])
      setSessions((ses || []).map(camelize))
      setPayments((pay || []).map(camelize))
      setNotes((nts || []).map(camelize))
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <p className="text-gray-900 font-semibold mb-2">Link not found</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = sessions.filter(s => s.date >= today && s.status === 'scheduled')
  const completed = sessions.filter(s => s.status === 'completed')
  const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">TutorHQ</p>
              <p className="text-xs text-gray-500">Parent View</p>
            </div>
          </div>
          <button onClick={() => exportProgressPDF({ student, notes, sessions })}
            className="flex items-center gap-2 text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-2 rounded-lg font-medium">
            <FileText size={14} /> Download Report
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
        {/* Student hero */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-500 text-sm">{student.grade} Grade · {student.subjects.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<Calendar size={16} />} label="Upcoming" value={upcoming.length} color="violet" />
          <Stat icon={<TrendingUp size={16} />} label="Completed" value={completed.length} color="green" />
          <Stat icon={<DollarSign size={16} />} label="Paid" value={`$${totalPaid.toFixed(0)}`} color="emerald" />
          <Stat icon={<DollarSign size={16} />} label="Outstanding" value={`$${outstanding.toFixed(0)}`} color="amber" />
        </div>

        {/* Achievements */}
        <Achievements sessions={sessions} notes={notes} />

        {/* Upcoming */}
        <Section title="Upcoming Sessions">
          {upcoming.length === 0 ? <Empty text="No upcoming sessions." /> : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map(s => (
                <li key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{s.subject}</p>
                    <p className="text-xs text-gray-500">{formatDate(s.date)} · {formatTime(s.time)} · {s.duration} min</p>
                  </div>
                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium">
                      <Video size={12} /> Join
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Progress notes */}
        <Section title="Progress Notes">
          {notes.length === 0 ? <Empty text="No progress notes yet." /> : (
            <ul className="space-y-4">
              {notes.map(n => (
                <li key={n.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{n.subject}</span>
                    <StarRating value={n.rating} />
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(n.date)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{n.content}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Payments */}
        <Section title="Payments & Invoices">
          {payments.length === 0 ? <Empty text="No invoices yet." /> : (
            <ul className="divide-y divide-gray-100">
              {payments.map(p => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{p.invoiceNum}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${Number(p.amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <p className="text-center text-xs text-gray-400 pt-2 pb-8">
          Questions? Reach out to your tutor directly.
        </p>
      </main>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Stat({ icon, label, value, color }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card p-4">
      <div className={`inline-flex p-1.5 rounded-lg ${colors[color]} mb-2`}>{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Empty({ text }) { return <p className="text-sm text-gray-400">{text}</p> }
function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={10} className={s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  )
}
function formatDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
