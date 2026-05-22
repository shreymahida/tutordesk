import { useState, useMemo } from 'react'
import { useApp } from '../store'
import { ChevronLeft, ChevronRight, Video } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const { sessions, students, updateSession } = useApp()
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState(null)

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const grid = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const cells = []
    // Pad start
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const day = {
        date: dateStr,
        day: d,
        sessions: sessions.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time)),
      }
      cells.push(day)
    }
    // Pad end to fill rows
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [cursor, sessions])

  const today = new Date().toISOString().split('T')[0]

  function nav(delta) {
    const next = new Date(cursor)
    next.setMonth(next.getMonth() + delta)
    setCursor(next)
  }

  const selected = selectedDay ? grid.find(c => c?.date === selectedDay) : null

  function onDrop(targetDate) {
    if (!dragging || dragging.date === targetDate) { setDragging(null); setDragOver(null); return }
    updateSession(dragging.id, { date: targetDate })
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly view of all sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-gray-900 min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => nav(1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) }}
            className="ml-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm">Today</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square min-h-[80px] bg-gray-50/50 border-b border-r border-gray-50" />
            const isToday = cell.date === today
            const isSelected = cell.date === selectedDay
            const isDragOver = dragOver === cell.date
            return (
              <div
                key={i}
                onClick={() => setSelectedDay(cell.date)}
                onDragOver={e => { e.preventDefault(); setDragOver(cell.date) }}
                onDragLeave={() => setDragOver(d => d === cell.date ? null : d)}
                onDrop={() => onDrop(cell.date)}
                className={`aspect-square min-h-[80px] p-1.5 border-b border-r border-gray-50 hover:bg-violet-50/40 transition-colors text-left flex flex-col cursor-pointer ${isSelected ? 'bg-violet-50 ring-2 ring-violet-300 ring-inset' : ''} ${isDragOver ? 'bg-violet-100 ring-2 ring-violet-400 ring-inset' : ''}`}>
                <div className={`text-xs font-semibold mb-1 ${isToday ? 'bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-700'}`}>
                  {cell.day}
                </div>
                <div className="space-y-0.5 overflow-hidden flex-1">
                  {cell.sessions.slice(0, 3).map(s => {
                    const student = students.find(st => st.id === s.studentId)
                    return (
                      <div key={s.id}
                        draggable={s.status === 'scheduled'}
                        onDragStart={e => { setDragging(s); e.dataTransfer.effectAllowed = 'move' }}
                        onDragEnd={() => { setDragging(null); setDragOver(null) }}
                        className={`text-xs px-1.5 py-0.5 rounded truncate ${s.status === 'scheduled' ? 'cursor-grab active:cursor-grabbing' : ''} ${
                          s.status === 'completed' ? 'bg-green-50 text-green-700' :
                          s.status === 'cancelled' ? 'bg-red-50 text-red-500 line-through' :
                          s.status === 'no-show' ? 'bg-orange-50 text-orange-700' :
                          'bg-violet-100 text-violet-800'
                        }`} title={`${student?.name} · ${s.subject}${s.status === 'scheduled' ? ' (drag to reschedule)' : ''}`}>
                        {formatTime(s.time)} {student?.name?.split(' ')[0]}
                      </div>
                    )
                  })}
                  {cell.sessions.length > 3 && (
                    <div className="text-xs text-gray-400 px-1.5">+{cell.sessions.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && selected.sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <div className="space-y-3">
            {selected.sessions.map(s => {
              const student = students.find(st => st.id === s.studentId)
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-violet-700">{formatTime(s.time)}</div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{student?.name}</p>
                      <p className="text-xs text-gray-500">{s.subject} · {s.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer"
                        className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg" title="Join meeting">
                        <Video size={14} />
                      </a>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'completed' ? 'bg-green-50 text-green-700' :
                      s.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                      s.status === 'no-show' ? 'bg-orange-50 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>{s.status}</span>
                  </div>
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
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'p' : 'a'}`
}
