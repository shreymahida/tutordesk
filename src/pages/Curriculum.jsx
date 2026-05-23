import { useState } from 'react'
import {
  COURSES, RESOURCES, SUBJECTS, STREAMS, DEMAND_META, courseByCode, prereqChain,
  ONTARIO_ASSESSMENTS, OUAC_TIMELINE, UNIVERSITY_REQUIREMENTS,
} from '../data/ontarioCurriculum'
import {
  BookOpen, ExternalLink, GraduationCap, ArrowRight, X, AlertTriangle,
  Calendar, Library, ChevronRight, Sparkles,
} from 'lucide-react'

export default function Curriculum() {
  const [tab, setTab] = useState('courses')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [openCourse, setOpenCourse] = useState(null)

  const filtered = COURSES.filter(c =>
    (subjectFilter === 'all' || c.subject === subjectFilter) &&
    (gradeFilter === 'all' || c.grade === Number(gradeFilter))
  )

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Ontario Curriculum</h1>
        <p className="text-gray-500 text-sm mt-1">Course codes, prerequisites, university requirements & resources</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'pathways', label: 'University Pathways', icon: GraduationCap },
          { id: 'assessments', label: 'EQAO / OSSLT / OUAC', icon: Calendar },
          { id: 'resources', label: 'Resource Library', icon: Library },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <>
          <div className="flex flex-wrap gap-2">
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input max-w-[180px]">
              <option value="all">All subjects</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className="input max-w-[140px]">
              <option value="all">All grades</option>
              {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => (
              <button key={c.code} onClick={() => setOpenCourse(c)}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-violet-200 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono font-bold text-violet-700 text-sm">{c.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEMAND_META[c.demand].color}`}>{DEMAND_META[c.demand].label}</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{c.title}</p>
                <p className="text-xs text-gray-500 mt-1">Grade {c.grade} · {STREAMS[c.stream]}</p>
                {c.universities.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-1">→ {c.universities.slice(0, 2).join(', ')}{c.universities.length > 2 ? '…' : ''}</p>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'pathways' && <Pathways />}
      {tab === 'assessments' && <Assessments />}
      {tab === 'resources' && <ResourceLibrary />}

      {openCourse && <CourseModal course={openCourse} onClose={() => setOpenCourse(null)} onJump={setOpenCourse} />}
    </div>
  )
}

function CourseModal({ course, onClose, onJump }) {
  const chain = prereqChain(course.code)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-violet-700">{course.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEMAND_META[course.demand].color}`}>{DEMAND_META[course.demand].label} demand</span>
            </div>
            <h2 className="font-semibold text-gray-900 mt-1">{course.title} — Grade {course.grade}</h2>
            <p className="text-xs text-gray-500">{STREAMS[course.stream]} stream</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {course.note && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex gap-2">
              <Sparkles size={15} className="text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-violet-800 leading-relaxed">{course.note}</p>
            </div>
          )}

          {/* Prereq chain */}
          {(chain.length > 0 || course.leadsTo.length > 0) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pathway</h3>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {chain.map(code => (
                  <span key={code} className="contents">
                    <button onClick={() => onJump(courseByCode[code])} className="font-mono px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">{code}</button>
                    <ArrowRight size={12} className="text-gray-300" />
                  </span>
                ))}
                <span className="font-mono px-2 py-1 bg-violet-600 text-white rounded-lg">{course.code}</span>
                {course.leadsTo.map(code => (
                  <span key={code} className="contents">
                    <ArrowRight size={12} className="text-gray-300" />
                    <button onClick={() => courseByCode[code] && onJump(courseByCode[code])} className="font-mono px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">{code}</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Units */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Curriculum units</h3>
            <div className="flex flex-wrap gap-1.5">
              {course.units.map(u => <span key={u} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{u}</span>)}
            </div>
          </div>

          {/* Pain points */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Common struggle points</h3>
            <ul className="space-y-1">
              {course.painPoints.map(p => (
                <li key={p} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-amber-500 mt-1">•</span> {p}</li>
              ))}
            </ul>
          </div>

          {/* Universities */}
          {course.universities.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required for</h3>
              <div className="flex flex-wrap gap-1.5">
                {course.universities.map(u => <span key={u} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{u}</span>)}
              </div>
            </div>
          )}

          {/* Resources */}
          {course.resources.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resources</h3>
              <div className="space-y-2">
                {course.resources.map(rid => {
                  const r = RESOURCES[rid]
                  if (!r) return null
                  return (
                    <a key={rid} href={r.url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name} {r.free && <span className="text-xs text-green-600 font-normal">· Free</span>}</p>
                        <p className="text-xs text-gray-500">{r.kind}</p>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-violet-500" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Pathways() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Grade 12 courses required by common Ontario university programs.</p>
      {UNIVERSITY_REQUIREMENTS.map(req => (
        <div key={req.program} className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-900 mb-2">{req.program}</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {req.courses.map(c => (
              <span key={c} className="font-mono text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-lg">{c}</span>
            ))}
          </div>
          {req.note && <p className="text-xs text-gray-400">{req.note}</p>}
        </div>
      ))}
    </div>
  )
}

function Assessments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Ontario standardized assessments</h2>
        <div className="space-y-3">
          {ONTARIO_ASSESSMENTS.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{a.name}</p>
                <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">Grade {a.grade}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{a.when}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.weight}</p>
              {RESOURCES[a.prep] && (
                <a href={RESOURCES[a.prep].url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline mt-2">
                  <ExternalLink size={11} /> {RESOURCES[a.prep].name} prep
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">OUAC application timeline (Grade 12)</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {OUAC_TIMELINE.map((t, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 ${i > 0 ? 'border-t border-gray-50' : ''} ${t.critical ? 'bg-amber-50/50' : ''}`}>
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${t.critical ? 'bg-amber-500' : 'bg-gray-300'}`} />
              <div>
                <p className={`text-sm font-medium ${t.critical ? 'text-amber-800' : 'text-gray-900'}`}>{t.date}</p>
                <p className="text-xs text-gray-500">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResourceLibrary() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Free, tutor-legal resources. Jensen Math is the gold standard for Ontario math.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(RESOURCES).map(([id, r]) => (
          <a key={id} href={r.url} target="_blank" rel="noreferrer"
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between hover:border-violet-200 hover:bg-violet-50/40 transition-colors group">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{r.name} {r.free ? <span className="text-xs text-green-600 font-normal">· Free</span> : <span className="text-xs text-amber-600 font-normal">· Paid</span>}</p>
              <p className="text-xs text-gray-500">{r.kind}</p>
            </div>
            <ExternalLink size={15} className="text-gray-300 group-hover:text-violet-500" />
          </a>
        ))}
      </div>
    </div>
  )
}
