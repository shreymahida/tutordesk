import { useEffect, useState } from 'react'
import { supabase, camelize } from '../lib/supabase'
import { GraduationCap, Calendar, DollarSign, Star, Loader2, Video, ChevronDown, ChevronRight } from 'lucide-react'

export default function FamilyPortal({ token }) {
  const [family, setFamily] = useState(null)
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: fam, error: famErr } = await supabase.from('families').select('*').eq('share_token', token).maybeSingle()
      if (famErr || !fam) { setError('Link is invalid or expired.'); setLoading(false); return }
      setFamily(camelize(fam))

      const { data: stu } = await supabase.from('students').select('*').eq('family_id', fam.id)
      const studentList = (stu || []).map(camelize)
      setStudents(studentList)
      setExpandedId(studentList[0]?.id || null)

      if (studentList.length > 0) {
        const ids = studentList.map(s => s.id)
        const [{ data: ses }, { data: pay }, { data: nts }] = await Promise.all([
          supabase.from('sessions').select('*').in('student_id', ids).order('date', { ascending: false }),
          supabase.from('payments').select('*').in('student_id', ids).order('date', { ascending: false }),
          supabase.from('progress_notes').select('*').in('student_id', ids).order('date', { ascending: false }),
        ])
        setSessions((ses || []).map(camelize))
        setPayments((pay || []).map(camelize))
        setNotes((nts || []).map(camelize))
      }
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return <FullScreenLoader />
  if (error) return <FullScreenError text={error} />

  const today = new Date().toISOString().split('T')[0]
  const allUpcoming = sessions.filter(s => s.date >= today && s.status === 'scheduled')
  const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">TutorHQ</p>
            <p className="text-xs text-gray-500">Family Portal · {family.parentName || family.parentEmail}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat icon={<Calendar size={16} />} label="Students" value={students.length} color="violet" />
          <Stat icon={<Calendar size={16} />} label="Upcoming sessions" value={allUpcoming.length} color="blue" />
          <Stat icon={<DollarSign size={16} />} label="Outstanding" value={`$${outstanding.toFixed(0)}`} color="amber" />
        </div>

        {/* Per-student accordion */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No students linked to this family yet.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map(student => {
              const isOpen = expandedId === student.id
              const stSessions = sessions.filter(s => s.studentId === student.id)
              const stNotes = notes.filter(n => n.studentId === student.id)
              const stUpcoming = stSessions.filter(s => s.date >= today && s.status === 'scheduled')
              return (
                <div key={student.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : student.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.grade} Grade · {stUpcoming.length} upcoming</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-gray-100 space-y-5">
                      <Section title="Upcoming">
                        {stUpcoming.length === 0 ? <Empty text="No upcoming sessions." /> : (
                          <ul className="divide-y divide-gray-100">
                            {stUpcoming.map(s => (
                              <li key={s.id} className="py-2 flex items-center justify-between">
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
                      <Section title="Progress notes">
                        {stNotes.length === 0 ? <Empty text="No progress notes yet." /> : (
                          <ul className="space-y-3">
                            {stNotes.slice(0, 5).map(n => (
                              <li key={n.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{n.subject}</span>
                                  <StarRating value={n.rating} />
                                  <span className="text-xs text-gray-400 ml-auto">{formatDate(n.date)}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{n.content}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Section>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Payments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Invoices</h2>
          {payments.length === 0 ? <Empty text="No invoices yet." /> : (
            <ul className="divide-y divide-gray-100">
              {payments.map(p => {
                const student = students.find(s => s.id === p.studentId)
                return (
                  <li key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{student?.name} · {p.invoiceNum}</p>
                      <p className="text-xs text-gray-500">{formatDate(p.date)}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">${Number(p.amount).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                      </div>
                      {p.status === 'pending' && p.stripeLink && (
                        <a href={p.stripeLink} target="_blank" rel="noreferrer"
                          className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium">Pay now</a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

function FullScreenLoader() {
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={28} className="text-violet-600 animate-spin" /></div>
}
function FullScreenError({ text }) {
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center"><p className="text-gray-900 font-semibold mb-2">Link not found</p><p className="text-gray-500 text-sm">{text}</p></div></div>
}
function Section({ title, children }) { return <div><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>{children}</div> }
function Stat({ icon, label, value, color }) {
  const colors = { violet: 'bg-violet-50 text-violet-600', blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600' }
  return <div className="bg-white rounded-xl border border-gray-200 p-4"><div className={`inline-flex p-1.5 rounded-lg ${colors[color]} mb-2`}>{icon}</div><p className="text-xl font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
}
function Empty({ text }) { return <p className="text-sm text-gray-400">{text}</p> }
function StarRating({ value }) { return <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div> }
function formatDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function formatTime(t) { if (!t) return ''; const [h,m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}` }
