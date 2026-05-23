import { useState, useMemo } from 'react'
import { useApp } from '../store'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, ChevronRight, Video } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TutorCalendar() {
  const { user } = useAuth()
  const { sessions, students } = useApp()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState(null)

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const mine = useMemo(() => sessions.filter(s => s.tutorId === user.id), [sessions, user.id])

  const grid = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        date: dateStr,
        day: d,
        sessions: mine.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time)),
      })
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [cursor, mine])

  const today = new Date().toISOString().split('T')[0]
  const selected = selectedDay ? grid.find(c => c?.date === selectedDay) : null

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Your sessions only</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { const n = new Date(cursor); n.setMonth(n.getMonth() - 1); setCursor(n) }}
            className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-gray-900 min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => { const n = new Date(cursor); n.setMonth(n.getMonth() + 1); setCursor(n) }}
            className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-50">
          {WEEKDAYS.map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square min-h-[70px] bg-gray-50/30 border-b border-r border-gray-50" />
            const isToday = cell.date === today
            const isSelected = cell.date === selectedDay
            return (
              <button key={i} onClick={() => setSelectedDay(cell.date)}
                className={`aspect-square min-h-[70px] p-1.5 border-b border-r border-gray-50 hover:bg-violet-50/40 transition-colors text-left flex flex-col ${isSelected ? 'bg-violet-50 ring-2 ring-violet-300 ring-inset' : ''}`}>
                <div className={`text-xs font-semibold mb-1 ${isToday ? 'bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-700'}`}>
                  {cell.day}
                </div>
                <div className="space-y-0.5 overflow-hidden flex-1">
                  {cell.sessions.slice(0, 2).map(s => {
                    const student = students.find(st => st.id === s.studentId)
                    return (
                      <div key={s.id} className={`text-xs px-1.5 py-0.5 rounded truncate ${s.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-violet-100 text-violet-800'}`}>
                        {student?.name?.split(' ')[0]}
                      </div>
                    )
                  })}
                  {cell.sessions.length > 2 && (
                    <div className="text-xs text-gray-400 px-1.5">+{cell.sessions.length - 2}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selected && selected.sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <div className="space-y-3">
            {selected.sessions.map(s => {
              const student = students.find(st => st.id === s.studentId)
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-violet-700">{formatTime(s.time)}</div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{student?.name}</p>
                      <p className="text-xs text-gray-500">{s.subject} · {s.duration} min</p>
                    </div>
                  </div>
                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                      <Video size={12} /> Join
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
