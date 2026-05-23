import { computeStats, BADGES } from '../data/gamification'
import { Flame, Star, Zap } from 'lucide-react'

export default function Achievements({ sessions, notes }) {
  const s = computeStats(sessions, notes)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Achievements</h2>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="bg-gradient-to-r from-violet-500 to-violet-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">Level {s.level}</span>
          {s.streak > 0 && <span className="flex items-center gap-1 text-orange-600 font-semibold text-xs"><Flame size={13} /> {s.streak}w</span>}
        </div>
      </div>

      {/* XP bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1"><Zap size={12} className="text-violet-500" /> {s.points} XP</span>
          <span>{s.intoLevel}/100 to level {s.level + 1}</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full transition-all duration-500" style={{ width: `${s.intoLevel}%` }} />
        </div>
      </div>

      {/* Badges */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
        {BADGES.map(b => {
          const earned = s.earned.some(e => e.id === b.id)
          return (
            <div key={b.id} title={b.label}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl text-center transition-all ${earned ? 'bg-violet-50' : 'bg-gray-50 opacity-40 grayscale'}`}>
              <span className="text-2xl">{b.icon}</span>
              <span className="text-[10px] font-medium text-gray-600 leading-tight">{b.label}</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">{s.earned.length} of {BADGES.length} badges earned</p>
    </div>
  )
}
