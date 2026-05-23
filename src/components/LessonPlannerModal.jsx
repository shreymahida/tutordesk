import { useState } from 'react'
import { useApp } from '../store'
import { COURSES, courseByCode } from '../data/ontarioCurriculum'
import { Sparkles, X, Loader2, Save, Check, AlertTriangle, Copy } from 'lucide-react'

// Extract a course code from a student's subjects array (e.g. "MCR3U — Functions (Gr 11)")
function studentCourseCodes(student) {
  return (student.subjects || [])
    .map(s => s.split(' ')[0])
    .filter(code => courseByCode[code])
}

export default function LessonPlannerModal({ student, onClose }) {
  const { generateLessonPlan, saveLessonPlan } = useApp()
  const codes = studentCourseCodes(student)
  const [courseCode, setCourseCode] = useState(codes[0] || '')
  const [topic, setTopic] = useState('')
  const [examInDays, setExamInDays] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const course = courseByCode[courseCode]
  const currentMark = student.courseMarks?.[courseCode]

  async function generate() {
    if (!courseCode) { setError('Pick a course first.'); return }
    setLoading(true); setError(''); setResult(''); setSaved(false)
    const resp = await generateLessonPlan({
      courseCode,
      courseTitle: course?.title || courseCode,
      topic,
      units: course?.units || [],
      painPoints: course?.painPoints || [],
      studentName: student.name,
      examInDays: examInDays ? Number(examInDays) : null,
      currentMark,
      notes,
    })
    if (resp.ok) setResult(resp.content)
    else setError(resp.error?.includes('ANTHROPIC_API_KEY') || resp.error?.includes('api') ? 'AI not configured yet. Deploy the lesson-planner function and set ANTHROPIC_API_KEY (see INTEGRATIONS.md).' : (resp.error || 'Failed to generate.'))
    setLoading(false)
  }

  async function save() {
    await saveLessonPlan({ studentId: student.id, courseCode, topic: topic || course?.title, content: result, source: 'ai' })
    setSaved(true)
  }

  function copy() {
    navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Lesson Planner</h2>
              <p className="text-xs text-gray-500">{student.name} · Ontario curriculum-aware</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {codes.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-xs text-amber-800">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              This student has no Ontario course codes tagged. Pick one below or add course codes in their profile for better plans.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
              <select value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input">
                <option value="">Select course...</option>
                {codes.length > 0 && (
                  <optgroup label="Student's courses">
                    {codes.map(c => <option key={c} value={c}>{c} — {courseByCode[c].title}</option>)}
                  </optgroup>
                )}
                <optgroup label="All Ontario courses">
                  {COURSES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.title}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Exam in (days)</label>
              <input type="number" value={examInDays} onChange={e => setExamInDays(e.target.value)} className="input" placeholder="e.g. 14 (optional)" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Focus topic (optional)</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} className="input"
              placeholder={course ? `e.g. ${course.painPoints[0]}` : 'e.g. inverse functions'} />
            {course && (
              <div className="flex flex-wrap gap-1 mt-2">
                {course.painPoints.map(p => (
                  <button key={p} onClick={() => setTopic(p)}
                    className="text-xs bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-700 px-2 py-0.5 rounded-full">{p}</button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Extra context (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input min-h-[60px] resize-none"
              placeholder="Anything specific about this student's needs..." />
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Generating plan...</> : <><Sparkles size={15} /> Generate lesson plan</>}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">Generated plan</span>
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs text-gray-600 hover:text-violet-600 flex items-center gap-1">
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                  <button onClick={save} disabled={saved} className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                    {saved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save to student</>}
                  </button>
                </div>
              </div>
              <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
