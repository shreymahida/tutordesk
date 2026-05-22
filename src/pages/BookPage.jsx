import { useEffect, useState } from 'react'
import { supabase, camelize, snakify } from '../lib/supabase'
import { GraduationCap, Send, Loader2, CheckCircle } from 'lucide-react'

const SUBJECTS = ['Math', 'Algebra', 'Geometry', 'Calculus', 'Physics', 'Chemistry', 'Biology', 'English', 'Writing', 'History', 'SAT Prep', 'ACT Prep', 'Spanish', 'French', 'Computer Science']
const GRADES = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Adult']

export default function BookPage() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({ parentName: '', parentEmail: '', parentPhone: '', studentName: '', studentGrade: '9th', subjects: [], message: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      setSettings(data ? camelize(data) : null)
      setLoading(false)
    })
  }, [])

  function toggleSubject(s) {
    setForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.parentName || !form.parentEmail || !form.studentName) { setError('Please fill in all required fields.'); return }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.from('leads').insert(snakify(form))
    if (err) { setError(err.message); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={28} className="text-violet-600 animate-spin" /></div>
  }
  if (settings && !settings.bookingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <p className="text-gray-900 font-semibold mb-2">Booking closed</p>
          <p className="text-gray-500 text-sm">Public booking isn't enabled right now. Reach out directly.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <p className="text-gray-900 font-semibold mb-2 text-lg">Request received!</p>
          <p className="text-gray-500 text-sm">We'll reach out within 24 hours to set up the first session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{settings?.businessName || 'TutorHQ'}</h1>
          <p className="text-gray-500 text-sm mt-1">Request a tutoring session</p>
          {settings?.bookingBlurb && (
            <p className="text-gray-600 text-sm mt-4 max-w-md mx-auto">{settings.bookingBlurb}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-2">Tell us about your child</h2>

          <Section label="Parent / guardian info">
            <div className="space-y-3">
              <Input label="Your full name *" value={form.parentName} onChange={v => setForm(f => ({ ...f, parentName: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email *" type="email" value={form.parentEmail} onChange={v => setForm(f => ({ ...f, parentEmail: v }))} />
                <Input label="Phone" value={form.parentPhone} onChange={v => setForm(f => ({ ...f, parentPhone: v }))} />
              </div>
            </div>
          </Section>

          <Section label="Student info">
            <div className="space-y-3">
              <Input label="Student's name *" value={form.studentName} onChange={v => setForm(f => ({ ...f, studentName: v }))} />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                <select value={form.studentGrade} onChange={e => setForm(f => ({ ...f, studentGrade: e.target.value }))} className="input">
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Subjects needed</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.subjects.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Anything else we should know?</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="input min-h-[80px] resize-none" placeholder="Goals, schedule preferences, etc..." />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send request</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="input" />
    </div>
  )
}
