// Gamification — computed from a student's real session history. No extra storage needed.

export const BADGES = [
  { id: 'first', label: 'First Session', icon: '🎬', test: s => s.completed >= 1 },
  { id: 'five', label: 'High Five', icon: '✋', test: s => s.completed >= 5 },
  { id: 'ten', label: 'Perfect 10', icon: '🔟', test: s => s.completed >= 10 },
  { id: 'quarter', label: '25 Club', icon: '⭐', test: s => s.completed >= 25 },
  { id: 'fifty', label: 'Half Century', icon: '🏆', test: s => s.completed >= 50 },
  { id: 'streak3', label: '3-Week Streak', icon: '🔥', test: s => s.streak >= 3 },
  { id: 'streak8', label: '8-Week Streak', icon: '⚡', test: s => s.streak >= 8 },
  { id: 'allstar', label: 'All-Star', icon: '🌟', test: s => s.avgRating >= 4.5 && s.completed >= 5 },
  { id: 'reliable', label: 'Always There', icon: '💎', test: s => s.completed >= 10 && s.noShows === 0 },
]

// 10 points per completed session, +5 per progress note, streak multiplier
export function computeStats(sessions, notes = []) {
  const completed = sessions.filter(s => s.status === 'completed')
  const noShows = sessions.filter(s => s.status === 'no-show').length
  const avgRating = notes.length ? notes.reduce((a, n) => a + (n.rating || 0), 0) / notes.length : 0

  // Weekly streak: count consecutive ISO weeks (ending this/last week) with a completed session
  const weeks = new Set(completed.map(s => isoWeek(s.date)))
  let streak = 0
  let cursor = isoWeekNum(new Date())
  // allow current or last week to start the streak
  if (!weeks.has(cursor)) cursor -= 1
  while (weeks.has(cursor)) { streak++; cursor -= 1 }

  const points = completed.length * 10 + notes.length * 5 + streak * 15

  const stats = { completed: completed.length, noShows, avgRating, streak, points }
  const earned = BADGES.filter(b => b.test(stats))
  const level = Math.floor(points / 100) + 1
  const intoLevel = points % 100

  return { ...stats, earned, level, intoLevel }
}

function isoWeekNum(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return date.getUTCFullYear() * 100 + week
}
function isoWeek(dateStr) { return isoWeekNum(new Date(dateStr + 'T12:00:00')) }
