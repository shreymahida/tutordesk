import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Plus, X, Trash2, Play, CheckCircle, Award, ChevronRight, Video, FileText } from 'lucide-react'

export default function Training() {
  const { isAdmin } = useAuth()
  const { getCourses, saveCourse, deleteCourse, getMyCourseProgress, getAllCourseProgress, completeCourse } = useApp()
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [open, setOpen] = useState(null)
  const [builder, setBuilder] = useState(null)

  async function refresh() {
    setCourses(await getCourses())
    setProgress(await getMyCourseProgress())
    if (isAdmin) setAllProgress(await getAllCourseProgress())
  }
  useEffect(() => { refresh() }, [])

  const doneIds = new Set(progress.map(p => p.courseId))
  const completionCount = id => allProgress.filter(p => p.courseId === id).length

  if (builder !== null) return <CourseBuilder course={builder} onSave={async c => { await saveCourse(c); setBuilder(null); refresh() }} onCancel={() => setBuilder(null)} />
  if (open) return <CoursePlayer course={open} done={doneIds.has(open.id)} onComplete={async score => { await completeCourse(open.id, score); setOpen(null); refresh() }} onBack={() => setOpen(null)} />

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Training</h1>
          <p className="text-gray-500 text-[15px] mt-1">{isAdmin ? 'Build onboarding courses and track tutor completion.' : 'Courses to complete for your role.'}</p>
        </div>
        {isAdmin && <button onClick={() => setBuilder({ title: '', description: '', lessons: [], quiz: [] })} className="btn-primary"><Plus size={16} /> New course</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => {
          const done = doneIds.has(c.id)
          return (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 mb-3"><GraduationCap size={20} /></div>
                {done && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={11} /> Completed</span>}
              </div>
              <p className="font-semibold text-gray-900">{c.title}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-400 mt-2">{c.lessons?.length || 0} lessons · {c.quiz?.length || 0} quiz questions{isAdmin ? ` · ${completionCount(c.id)} completed` : ''}</p>
              <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                <button onClick={() => setOpen(c)} className="flex-1 flex items-center justify-center gap-1 text-xs text-violet-700 hover:bg-violet-50 py-1.5 rounded-lg font-medium"><Play size={13} /> {done ? 'Review' : 'Start'}</button>
                {isAdmin && <>
                  <button onClick={() => setBuilder(c)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg font-medium">Edit</button>
                  <button onClick={() => deleteCourse(c.id).then(refresh)} className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg"><Trash2 size={13} /></button>
                </>}
              </div>
            </div>
          )
        })}
        {courses.length === 0 && (
          <div className="card p-12 text-center md:col-span-2">
            <GraduationCap size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">{isAdmin ? 'No courses yet — build your first tutor onboarding course.' : 'No training assigned yet.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CoursePlayer({ course, done, onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const lessons = course.lessons || []
  const quiz = course.quiz || []
  const total = lessons.length + (quiz.length ? 1 : 0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const onQuiz = step >= lessons.length && quiz.length > 0

  function submitQuiz() {
    let correct = 0
    quiz.forEach((q, i) => { if (answers[i] === q.correct) correct++ })
    const score = Math.round((correct / quiz.length) * 100)
    setResult(score)
    onComplete(score)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={onBack} className="text-sm text-violet-600 font-medium hover:underline">← Back to courses</button>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
          {done && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">Completed</span>}
        </div>
        <p className="text-sm text-gray-500 mb-4">{course.description}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-violet-500 transition-all" style={{ width: `${(Math.min(step, total) / total) * 100}%` }} />
        </div>

        {result !== null ? (
          <div className="text-center py-8">
            <Award size={40} className={`mx-auto mb-3 ${result >= 70 ? 'text-green-500' : 'text-amber-500'}`} />
            <p className="text-2xl font-bold text-gray-900">{result}%</p>
            <p className="text-sm text-gray-500 mt-1">{result >= 70 ? 'Passed — nice work!' : 'Course marked complete. Review and retake anytime.'}</p>
            <button onClick={onBack} className="btn-primary mx-auto mt-5">Done</button>
          </div>
        ) : onQuiz ? (
          <div className="space-y-5">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Quiz</p>
            {quiz.map((q, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900 text-sm mb-2">{i + 1}. {q.question}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers(a => ({ ...a, [i]: oi }))}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-colors ${answers[i] === oi ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-gray-200 text-gray-700 hover:border-violet-200'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.length} className="btn-primary w-full justify-center disabled:opacity-50">Submit quiz</button>
          </div>
        ) : lessons[step] ? (
          <div>
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Lesson {step + 1} of {lessons.length}</p>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{lessons[step].title}</h2>
            {lessons[step].videoUrl && (
              <a href={lessons[step].videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline mb-3"><Video size={14} /> Watch video</a>
            )}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{lessons[step].body}</p>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="text-sm text-gray-500 disabled:opacity-40">Previous</button>
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">{step + 1 < lessons.length || quiz.length ? <>Next <ChevronRight size={15} /></> : 'Finish'}</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle size={36} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-gray-900">Course complete</p>
            <button onClick={() => onComplete(100)} className="btn-primary mx-auto mt-4">Mark complete</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseBuilder({ course, onSave, onCancel }) {
  const [c, setC] = useState({ ...course, lessons: course.lessons || [], quiz: course.quiz || [] })
  const addLesson = () => setC(x => ({ ...x, lessons: [...x.lessons, { title: '', body: '', videoUrl: '' }] }))
  const addQ = () => setC(x => ({ ...x, quiz: [...x.quiz, { question: '', options: ['', '', '', ''], correct: 0 }] }))

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={onCancel} className="text-sm text-violet-600 font-medium hover:underline">← Cancel</button>
      <div className="card p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">{course.id ? 'Edit course' : 'New course'}</h1>
        <input value={c.title} onChange={e => setC(x => ({ ...x, title: e.target.value }))} className="input" placeholder="Course title" />
        <textarea value={c.description} onChange={e => setC(x => ({ ...x, description: e.target.value }))} className="input min-h-[60px] resize-none" placeholder="Short description" />

        <div>
          <div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold text-gray-900 flex items-center gap-1"><FileText size={14} /> Lessons</p><button onClick={addLesson} className="text-xs text-violet-600 font-medium">+ Add lesson</button></div>
          <div className="space-y-3">
            {c.lessons.map((l, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={l.title} onChange={e => setC(x => ({ ...x, lessons: x.lessons.map((y, j) => j === i ? { ...y, title: e.target.value } : y) }))} className="input flex-1" placeholder={`Lesson ${i + 1} title`} />
                  <button onClick={() => setC(x => ({ ...x, lessons: x.lessons.filter((_, j) => j !== i) }))} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                <textarea value={l.body} onChange={e => setC(x => ({ ...x, lessons: x.lessons.map((y, j) => j === i ? { ...y, body: e.target.value } : y) }))} className="input min-h-[60px] resize-none" placeholder="Lesson content" />
                <input value={l.videoUrl} onChange={e => setC(x => ({ ...x, lessons: x.lessons.map((y, j) => j === i ? { ...y, videoUrl: e.target.value } : y) }))} className="input" placeholder="Video URL (optional)" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold text-gray-900">Quiz questions</p><button onClick={addQ} className="text-xs text-violet-600 font-medium">+ Add question</button></div>
          <div className="space-y-3">
            {c.quiz.map((q, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={q.question} onChange={e => setC(x => ({ ...x, quiz: x.quiz.map((y, j) => j === i ? { ...y, question: e.target.value } : y) }))} className="input flex-1" placeholder={`Question ${i + 1}`} />
                  <button onClick={() => setC(x => ({ ...x, quiz: x.quiz.filter((_, j) => j !== i) }))} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" checked={q.correct === oi} onChange={() => setC(x => ({ ...x, quiz: x.quiz.map((y, j) => j === i ? { ...y, correct: oi } : y) }))} title="Mark correct" />
                    <input value={opt} onChange={e => setC(x => ({ ...x, quiz: x.quiz.map((y, j) => j === i ? { ...y, options: y.options.map((o, k) => k === oi ? e.target.value : o) } : y) }))} className="input flex-1" placeholder={`Option ${oi + 1}`} />
                  </div>
                ))}
                <p className="text-xs text-gray-400">Select the radio next to the correct answer.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => c.title.trim() && onSave(c)} className="flex-1 btn-primary justify-center">Save course</button>
        </div>
      </div>
    </div>
  )
}
