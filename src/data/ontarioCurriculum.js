// Ontario Grade 9-12 curriculum — course codes as first-class objects.
// Sourced from Ontario Ministry of Education (dcp.edu.gov.on.ca) + university admission pages.
// This is TutorHQ's competitive moat: no generic SaaS knows the Ontario curriculum.

export const STREAMS = {
  W: 'De-streamed',
  D: 'Academic',
  P: 'Applied',
  U: 'University',
  M: 'University/College',
  C: 'College',
  O: 'Open',
  E: 'Workplace',
}

// Resource providers (free + tutor-legal) keyed for deep linking
export const RESOURCES = {
  jensen: { name: 'Jensen Math', url: 'https://www.jensenmath.ca/', kind: 'Worksheets + video', free: true },
  cemc: { name: 'CEMC (Waterloo)', url: 'https://cemc.uwaterloo.ca/resources/courseware', kind: 'Courseware + contests', free: true },
  khan: { name: 'Khan Academy', url: 'https://www.khanacademy.org/', kind: 'Video + practice', free: true },
  eqao9: { name: 'EQAO Gr9 Math', url: 'https://www.eqao.com/the-assessments/grade-9-math/', kind: 'Released questions', free: true },
  osslt: { name: 'EQAO OSSLT', url: 'https://www.eqao.com/the-assessments/osslt/', kind: 'Literacy test prep', free: true },
  octutor: { name: 'Organic Chemistry Tutor', url: 'https://www.youtube.com/@TheOrganicChemistryTutor', kind: 'Worked problems', free: true },
  crashcourse: { name: 'CrashCourse', url: 'https://www.youtube.com/user/crashcourse', kind: 'Conceptual video', free: true },
  phet: { name: 'PhET Simulations', url: 'https://phet.colorado.edu/', kind: 'Interactive sims', free: true },
  openstax: { name: 'OpenStax', url: 'https://openstax.org/', kind: 'Free textbooks', free: true },
  litcharts: { name: 'LitCharts', url: 'https://www.litcharts.com/', kind: 'Lit study guides', free: false },
  purdueowl: { name: 'Purdue OWL', url: 'https://owl.purdue.edu/', kind: 'Writing + citation', free: true },
}

// The course catalog. Ordered by subject then grade.
export const COURSES = [
  // ─── MATH ────────────────────────────────────────────────────────────────
  {
    code: 'MTH1W', title: 'Mathematics', grade: 9, stream: 'W', subject: 'Math', demand: 'high',
    prereq: [], leadsTo: ['MPM2D', 'MFM2P'],
    units: ['Number sense', 'Algebra', 'Linear relations', 'Measurement & geometry', 'Data & probability', 'Coding', 'Financial literacy', 'Mathematical modelling'],
    painPoints: ['Algebra fluency', 'Linear relations (slope/intercept)', 'Coding strand', 'EQAO Grade 9 test'],
    universities: [], assessments: ['EQAO Grade 9 Math'],
    resources: ['jensen', 'eqao9', 'khan'],
    note: 'De-streamed since 2021. Largest student population; lowest provincial achievement. Huge remedial demand.',
  },
  {
    code: 'MPM2D', title: 'Principles of Mathematics', grade: 10, stream: 'D', subject: 'Math', demand: 'high',
    prereq: ['MTH1W'], leadsTo: ['MCR3U'],
    units: ['Quadratic relations', 'Analytic geometry', 'Trigonometry (right + acute triangles)', 'Systems of linear equations'],
    painPoints: ['Quadratics (factoring, completing square)', 'Analytic geometry', 'First trig exposure'],
    universities: [], assessments: ['OSSLT (Grade 10)'],
    resources: ['jensen', 'khan'],
    note: 'Gateway to MCR3U. A B+ here often becomes a C in Grade 11 if foundations are weak.',
  },
  {
    code: 'MFM2P', title: 'Foundations of Mathematics', grade: 10, stream: 'P', subject: 'Math', demand: 'low',
    prereq: ['MTH1W'], leadsTo: ['MBF3C'],
    units: ['Proportional reasoning', 'Linear & quadratic relations', 'Measurement & trigonometry'],
    painPoints: ['Applications', 'Word problems'], universities: [], resources: ['jensen'],
  },
  {
    code: 'MCR3U', title: 'Functions', grade: 11, stream: 'U', subject: 'Math', demand: 'critical',
    prereq: ['MPM2D'], leadsTo: ['MHF4U', 'MCV4U', 'MDM4U'],
    units: ['Functions & notation', 'Transformations', 'Rational expressions', 'Exponential functions', 'Trigonometry', 'Discrete (sequences/series, financial math)'],
    painPoints: ['Function notation & transformations', 'Inverse functions', 'Trig identities', 'Logarithms'],
    universities: [], resources: ['jensen', 'cemc', 'khan'],
    note: 'THE most-tutored course in Ontario. Foundation for MHF4U + MCV4U. Win here = 2-year retention.',
  },
  {
    code: 'MCF3M', title: 'Functions & Applications', grade: 11, stream: 'M', subject: 'Math', demand: 'medium',
    prereq: ['MPM2D', 'MFM2P'], leadsTo: ['MAP4C'],
    units: ['Quadratics', 'Exponential functions', 'Trigonometric functions', 'Financial applications'],
    painPoints: ['Applications-heavy'], universities: [], resources: ['jensen'],
  },
  {
    code: 'MHF4U', title: 'Advanced Functions', grade: 12, stream: 'U', subject: 'Math', demand: 'critical',
    prereq: ['MCR3U'], leadsTo: ['MCV4U'],
    units: ['Polynomial functions', 'Rational functions', 'Logarithmic functions', 'Trigonometric functions', 'Combining functions', 'Rates of change'],
    painPoints: ['Log/exponential equations', 'Trig identities (sum/difference, double angle)', 'Polynomial division', 'Rates of change'],
    universities: ['Engineering (all)', 'CS (all)', 'Life Sci', 'Business (Rotman, Ivey)', 'Nursing', 'Kinesiology'],
    resources: ['jensen', 'cemc', 'khan'],
    note: 'Universally required prerequisite for STEM + business university programs.',
  },
  {
    code: 'MCV4U', title: 'Calculus & Vectors', grade: 12, stream: 'U', subject: 'Math', demand: 'critical',
    prereq: ['MHF4U'], leadsTo: [],
    units: ['Limits', 'Derivatives', 'Applications of derivatives (optimization, related rates)', 'Curve sketching', 'Vectors', 'Lines & planes in 3D'],
    painPoints: ['Chain rule', 'Curve sketching', 'Related rates', 'Optimization', 'Vector operations', '3D intersections'],
    universities: ['Engineering (all)', 'Waterloo CS', 'U of T CS', 'Physics/Math majors', 'Rotman Commerce'],
    resources: ['jensen', 'cemc', 'octutor', 'khan'],
    note: 'Hardest course in OSSD math. Highest fail/retake rate. Premium pricing supported ($60-100/hr).',
  },
  {
    code: 'MDM4U', title: 'Data Management', grade: 12, stream: 'U', subject: 'Math', demand: 'high',
    prereq: ['MCR3U'], leadsTo: [],
    units: ['One-variable analysis', 'Two-variable analysis', 'Permutations & combinations', 'Probability', 'Probability distributions', 'Culminating project (ISU)'],
    painPoints: ['Combinatorics', 'Conditional probability', 'Normal distribution', 'The culminating ISU'],
    universities: ['Business admin', 'Social sciences', 'Humanities', 'Some life sci', 'Ivey AEO (any math)'],
    resources: ['jensen', 'khan'],
    note: 'Accepted in place of MCV4U for non-STEM programs. Lighter than MCV4U.',
  },

  // ─── SCIENCE ───────────────────────────────────────────────────────────────
  {
    code: 'SNC1W', title: 'Science', grade: 9, stream: 'W', subject: 'Science', demand: 'medium',
    prereq: [], leadsTo: ['SNC2D'],
    units: ['Biology (ecosystems)', 'Chemistry (atoms/elements)', 'Physics (electricity)', 'Earth & space science'],
    painPoints: ['Breadth of topics', 'Lab skills'], universities: [], resources: ['crashcourse', 'khan'],
  },
  {
    code: 'SNC2D', title: 'Science', grade: 10, stream: 'D', subject: 'Science', demand: 'high',
    prereq: ['SNC1W'], leadsTo: ['SBI3U', 'SCH3U', 'SPH3U'],
    units: ['Biology (tissues/organs/systems)', 'Chemistry (atoms/bonding/reactions)', 'Physics (light/optics)', 'Earth & space (climate)'],
    painPoints: ['Chemical reactions/balancing', 'Optics', 'Genetics intro'],
    universities: [], resources: ['crashcourse', 'octutor', 'khan'],
    note: 'Required for all Grade 11 university sciences.',
  },
  {
    code: 'SBI3U', title: 'Biology', grade: 11, stream: 'U', subject: 'Science', demand: 'high',
    prereq: ['SNC2D'], leadsTo: ['SBI4U'],
    units: ['Diversity of living things', 'Evolution', 'Genetic processes', 'Animal anatomy', 'Plants'],
    painPoints: ['Genetics (Punnett squares, meiosis)', 'Evolution mechanisms', 'Memorization load'],
    universities: [], resources: ['crashcourse', 'khan'],
  },
  {
    code: 'SCH3U', title: 'Chemistry', grade: 11, stream: 'U', subject: 'Science', demand: 'high',
    prereq: ['SNC2D'], leadsTo: ['SCH4U'],
    units: ['Matter & chemical bonding', 'Chemical reactions', 'Quantities (stoichiometry)', 'Solutions & solubility', 'Gases'],
    painPoints: ['Stoichiometry', 'Mole calculations', 'Limiting reagents', 'Naming compounds'],
    universities: [], resources: ['octutor', 'crashcourse', 'khan'],
  },
  {
    code: 'SPH3U', title: 'Physics', grade: 11, stream: 'U', subject: 'Science', demand: 'high',
    prereq: ['SNC2D'], leadsTo: ['SPH4U'],
    units: ['Kinematics', 'Forces', 'Energy & work', 'Waves & sound', 'Electricity & magnetism'],
    painPoints: ['Vector decomposition', 'Free-body diagrams', 'Projectile motion'],
    universities: [], resources: ['octutor', 'phet', 'khan'],
  },
  {
    code: 'SBI4U', title: 'Biology', grade: 12, stream: 'U', subject: 'Science', demand: 'high',
    prereq: ['SBI3U'], leadsTo: [],
    units: ['Biochemistry', 'Metabolism', 'Molecular genetics', 'Homeostasis', 'Population dynamics'],
    painPoints: ['Biochemistry pathways', 'Molecular genetics', 'Cellular respiration/photosynthesis'],
    universities: ['Life sciences', 'Nursing', 'Kinesiology', 'Pre-med pathway', 'Health sci'],
    resources: ['crashcourse', 'khan'],
  },
  {
    code: 'SCH4U', title: 'Chemistry', grade: 12, stream: 'U', subject: 'Science', demand: 'critical',
    prereq: ['SCH3U'], leadsTo: [],
    units: ['Organic chemistry', 'Structure & properties', 'Energy changes & rates', 'Chemical equilibrium', 'Electrochemistry'],
    painPoints: ['Organic naming & reactions', 'Equilibrium (ICE tables)', 'Redox/electrochem cells'],
    universities: ['Engineering (all)', 'Nursing', 'Pharmacy', 'Life sci', 'Medical sci'],
    resources: ['octutor', 'crashcourse', 'khan'],
  },
  {
    code: 'SPH4U', title: 'Physics', grade: 12, stream: 'U', subject: 'Science', demand: 'critical',
    prereq: ['SPH3U'], leadsTo: [],
    units: ['Dynamics', 'Energy & momentum', 'Gravitational/electric/magnetic fields', 'Wave nature of light', 'Modern physics'],
    painPoints: ['Rotational dynamics', '2D momentum', 'EM fields', 'Modern physics (relativity, quantum)'],
    universities: ['Engineering (all)', 'Physics/astronomy', 'CS (Waterloo)', 'Optometry'],
    resources: ['octutor', 'phet', 'khan'],
  },

  // ─── ENGLISH ─────────────────────────────────────────────────────────────
  {
    code: 'ENG1D', title: 'English', grade: 9, stream: 'D', subject: 'English', demand: 'medium',
    prereq: [], leadsTo: ['ENG2D'],
    units: ['Reading & literature', 'Writing', 'Oral communication', 'Media studies'],
    painPoints: ['Essay structure', 'Literary analysis'], universities: [], resources: ['litcharts', 'purdueowl'],
  },
  {
    code: 'ENG2D', title: 'English', grade: 10, stream: 'D', subject: 'English', demand: 'medium',
    prereq: ['ENG1D'], leadsTo: ['ENG3U'],
    units: ['Literature', 'Writing', 'Media', 'Oral communication'],
    painPoints: ['Thesis development', 'OSSLT writing'], universities: [], assessments: ['OSSLT (Grade 10)'],
    resources: ['litcharts', 'osslt', 'purdueowl'],
  },
  {
    code: 'ENG3U', title: 'English', grade: 11, stream: 'U', subject: 'English', demand: 'medium',
    prereq: ['ENG2D'], leadsTo: ['ENG4U'],
    units: ['Literature studies', 'Writing', 'Media', 'Language conventions'],
    painPoints: ['Comparative essays', 'Independent study'], universities: [], resources: ['litcharts', 'purdueowl'],
  },
  {
    code: 'ENG4U', title: 'English', grade: 12, stream: 'U', subject: 'English', demand: 'high',
    prereq: ['ENG3U'], leadsTo: [],
    units: ['Literature studies', 'Essay writing', 'The research process', 'Media studies'],
    painPoints: ['University-level essays', 'Independent Study Unit (ISU)', 'Timed writing'],
    universities: ['Universally required for all university programs'],
    resources: ['litcharts', 'purdueowl'],
    note: 'Required for EVERY Ontario university program. Min grade is an admission gatekeeper. High volume.',
  },

  // ─── COMPUTER SCIENCE ──────────────────────────────────────────────────────
  {
    code: 'ICS3U', title: 'Introduction to Computer Science', grade: 11, stream: 'U', subject: 'Computer Science', demand: 'medium',
    prereq: [], leadsTo: ['ICS4U'],
    units: ['Programming basics (Python/Java)', 'Data types & control structures', 'Software design', 'Environment & careers'],
    painPoints: ['Loops & arrays', 'Functions/methods', 'Debugging'], universities: [], resources: ['khan'],
  },
  {
    code: 'ICS4U', title: 'Computer Science', grade: 12, stream: 'U', subject: 'Computer Science', demand: 'medium',
    prereq: ['ICS3U'], leadsTo: [],
    units: ['Object-oriented programming', 'Software engineering', 'Data structures', 'Algorithms'],
    painPoints: ['OOP concepts', 'Recursion', 'Data structures', 'Big-O'],
    universities: ['CS programs (supplementary)'], resources: ['khan'],
  },

  // ─── FRENCH ──────────────────────────────────────────────────────────────
  {
    code: 'FSF4U', title: 'Core French', grade: 12, stream: 'U', subject: 'French', demand: 'low',
    prereq: ['FSF3U'], leadsTo: [],
    units: ['Listening', 'Speaking', 'Reading', 'Writing'],
    painPoints: ['Verb conjugation', 'Oral fluency'], universities: ['French programs'], resources: [],
  },

  // ─── BUSINESS ──────────────────────────────────────────────────────────────
  {
    code: 'BAF3M', title: 'Financial Accounting Fundamentals', grade: 11, stream: 'M', subject: 'Business', demand: 'low',
    prereq: [], leadsTo: ['BAT4M'],
    units: ['Accounting cycle', 'Financial statements', 'Merchandising', 'Spreadsheets'],
    painPoints: ['Debits/credits', 'Trial balance'], universities: [], resources: [],
  },
  {
    code: 'BAT4M', title: 'Financial Accounting Principles', grade: 12, stream: 'M', subject: 'Business', demand: 'low',
    prereq: ['BAF3M'], leadsTo: [],
    units: ['Partnerships & corporations', 'Inventory', 'Cash control', 'Financial analysis'],
    painPoints: ['Adjusting entries', 'Financial ratios'], universities: ['Business programs'], resources: [],
  },

  // ─── SOCIAL SCIENCES ───────────────────────────────────────────────────────
  {
    code: 'HSP3U', title: 'Intro to Anthropology, Psychology & Sociology', grade: 11, stream: 'U', subject: 'Social Science', demand: 'medium',
    prereq: [], leadsTo: ['HSB4U'],
    units: ['Anthropology', 'Psychology', 'Sociology', 'Research methods'],
    painPoints: ['Research essays', 'Theory comparison'], universities: ['Social science programs'], resources: [],
  },
]

// Ontario-specific high-stakes assessments + key dates
export const ONTARIO_ASSESSMENTS = [
  { id: 'eqao9', name: 'EQAO Grade 9 Math', grade: 9, when: 'During the semester the student takes MTH1W', weight: 'Often counts 10-30% of final grade', prep: 'eqao9' },
  { id: 'osslt', name: 'OSSLT (Literacy Test)', grade: 10, when: 'Typically late March', weight: 'Required to graduate. Pass = Level 3 / ~75%', prep: 'osslt' },
]

export const OUAC_TIMELINE = [
  { date: 'Early September', event: 'OUAC opens for Grade 12 students' },
  { date: 'January 15', event: 'Equal-consideration deadline for OUAC 101 (Ontario HS students)', critical: true },
  { date: 'February 12', event: 'Deadline for schools to report midterm 4U/M grades' },
  { date: 'April', event: 'Universities send first-round offers' },
  { date: 'May 28', event: 'Latest date to receive a response from Ontario universities' },
  { date: 'June 1', event: 'Earliest accept-by + deposit deadline', critical: true },
  { date: 'Mid-July', event: 'Final marks transmitted to universities' },
]

// University program → required Grade 12 courses
export const UNIVERSITY_REQUIREMENTS = [
  { program: 'Engineering', courses: ['ENG4U', 'MHF4U', 'MCV4U', 'SCH4U', 'SPH4U'], note: 'All Ontario universities. Real admit averages mid-90s.' },
  { program: 'Computer Science (Waterloo)', courses: ['ENG4U', 'MHF4U', 'MCV4U'], note: 'SPH4U recommended.' },
  { program: 'Life Sciences / Pre-Med', courses: ['ENG4U', 'MHF4U', 'SBI4U', 'SCH4U'], note: 'SPH4U often required too.' },
  { program: 'Nursing', courses: ['ENG4U', 'MHF4U', 'SCH4U', 'SBI4U'], note: '' },
  { program: 'Kinesiology', courses: ['ENG4U', 'SBI4U', 'MHF4U'], note: 'SCH4U may substitute SBI4U.' },
  { program: 'Business (Rotman/Ivey/Schulich)', courses: ['ENG4U', 'MHF4U'], note: 'MCV4U for Rotman; MDM4U accepted at some.' },
  { program: 'Humanities / Social Sciences', courses: ['ENG4U', 'MHF4U'], note: 'MDM4U accepted in place of MHF4U at many.' },
]

// Lookups
export const courseByCode = Object.fromEntries(COURSES.map(c => [c.code, c]))
export const SUBJECTS = [...new Set(COURSES.map(c => c.subject))]

export function prereqChain(code) {
  const chain = []
  let cur = courseByCode[code]
  while (cur && cur.prereq.length) {
    const prev = courseByCode[cur.prereq[0]]
    if (!prev) break
    chain.unshift(prev.code)
    cur = prev
  }
  return chain
}

export const DEMAND_META = {
  critical: { label: 'Critical', color: 'bg-red-50 text-red-700' },
  high: { label: 'High', color: 'bg-amber-50 text-amber-700' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-500' },
}
