// Competitive admission averages for common Ontario university programs (top-6 6U/M average).
// Sources: published cutoffs + admit-average reporting (2024-25). These are competitive
// realities, not the published minimums (which are far lower).

export const PROGRAM_TARGETS = [
  { program: 'Waterloo — Software Engineering', avg: 95, courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SPH4U'] },
  { program: 'Waterloo — Computer Science', avg: 93, courses: ['ENG4U', 'MHF4U', 'MCV4U'] },
  { program: 'Waterloo — Engineering (other)', avg: 90, courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SCH4U', 'SPH4U'] },
  { program: 'U of T — Engineering', avg: 92, courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SCH4U', 'SPH4U'] },
  { program: 'U of T — Computer Science (St. George)', avg: 93, courses: ['ENG4U', 'MHF4U', 'MCV4U'] },
  { program: 'U of T — Life Sciences', avg: 88, courses: ['ENG4U', 'MHF4U', 'SBI4U', 'SCH4U'] },
  { program: 'McMaster — Health Sciences', avg: 95, courses: ['ENG4U', 'MHF4U', 'SBI4U', 'SCH4U'] },
  { program: 'McMaster — Engineering', avg: 90, courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SCH4U', 'SPH4U'] },
  { program: 'Western — Medical Sciences', avg: 90, courses: ['ENG4U', 'MHF4U', 'SBI4U', 'SCH4U'] },
  { program: 'Western — Ivey AEO (Business)', avg: 90, courses: ['ENG4U', 'MHF4U'] },
  { program: 'Queen\'s — Commerce', avg: 90, courses: ['ENG4U', 'MHF4U'] },
  { program: 'Queen\'s — Engineering', avg: 89, courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SCH4U', 'SPH4U'] },
  { program: 'Toronto Metropolitan — Nursing', avg: 87, courses: ['ENG4U', 'SBI4U', 'SCH4U'] },
  { program: 'York — Business (Schulich)', avg: 90, courses: ['ENG4U', 'MHF4U'] },
  { program: 'Guelph — Veterinary / Animal Bio', avg: 85, courses: ['ENG4U', 'SBI4U', 'SCH4U'] },
]

// Given a student's course_marks map and a target program, compute the picture.
export function evaluateAdmission(courseMarks = {}, programName) {
  const program = PROGRAM_TARGETS.find(p => p.program === programName)
  if (!program) return null

  const have = program.courses.filter(c => courseMarks[c] != null)
  const missing = program.courses.filter(c => courseMarks[c] == null)
  const marks = have.map(c => Number(courseMarks[c]))
  const currentAvg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null

  const gap = currentAvg != null ? program.avg - currentAvg : null

  let status = 'unknown'
  if (currentAvg != null) {
    if (currentAvg >= program.avg) status = 'on-track'
    else if (currentAvg >= program.avg - 3) status = 'borderline'
    else status = 'below'
  }

  return {
    program: program.program,
    targetAvg: program.avg,
    requiredCourses: program.courses,
    haveCourses: have,
    missingCourses: missing,
    currentAvg: currentAvg != null ? Math.round(currentAvg * 10) / 10 : null,
    gap: gap != null ? Math.round(gap * 10) / 10 : null,
    status,
  }
}

export const STATUS_META = {
  'on-track': { label: 'On track', color: 'bg-green-50 text-green-700', ring: 'ring-green-200' },
  'borderline': { label: 'Borderline', color: 'bg-amber-50 text-amber-700', ring: 'ring-amber-200' },
  'below': { label: 'Below target', color: 'bg-red-50 text-red-700', ring: 'ring-red-200' },
  'unknown': { label: 'Add marks', color: 'bg-gray-100 text-gray-500', ring: 'ring-gray-200' },
}
