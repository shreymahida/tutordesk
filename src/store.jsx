import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, camelize, snakify } from './lib/supabase'
import { useAuth } from './context/AuthContext'

const AppContext = createContext(null)

const fromDB = rows => (rows || []).map(camelize)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [progressNotes, setProgressNotes] = useState([])
  const [families, setFamilies] = useState([])
  const [leads, setLeads] = useState([])
  const [settings, setSettings] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadAll()
    const channel = supabase.channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, loadStudents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, loadSessions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, loadPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_notes' }, loadProgressNotes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, loadFamilies)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadAll() {
    setDataLoading(true)
    // RLS handles tutor scoping — tutors will get empty/filtered results automatically
    // and won't see payments/leads/families at all.
    await Promise.all([loadStudents(), loadSessions(), loadProgressNotes(), loadAssignments(), loadPayments(), loadFamilies(), loadLeads(), loadSettings()])
    setDataLoading(false)
  }

  async function loadAssignments() {
    const { data } = await supabase.from('student_assignments').select('*')
    setAssignments(fromDB(data))
  }
  async function assignStudent(studentId, tutorId) {
    const { data, error } = await supabase.from('student_assignments').insert({ student_id: studentId, tutor_id: tutorId }).select().single()
    if (!error && data) setAssignments(p => [...p, camelize(data)])
    return error
  }
  async function unassignStudent(studentId, tutorId) {
    await supabase.from('student_assignments').delete().eq('student_id', studentId).eq('tutor_id', tutorId)
    setAssignments(p => p.filter(a => !(a.studentId === studentId && a.tutorId === tutorId)))
  }

  async function loadFamilies() {
    const { data } = await supabase.from('families').select('*').order('created_at', { ascending: false })
    setFamilies(fromDB(data))
  }
  async function loadLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(fromDB(data))
  }
  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle()
    setSettings(data ? camelize(data) : null)
  }
  async function updateSettings(patch) {
    const { data } = await supabase.from('settings').update(snakify(patch)).eq('id', 1).select().single()
    if (data) setSettings(camelize(data))
  }

  // ── Families ─────────────────────────────────────────────────────────────
  async function addFamily(f) {
    const { data } = await supabase.from('families').insert(snakify(f)).select().single()
    if (data) setFamilies(p => [camelize(data), ...p])
    return data ? camelize(data) : null
  }
  async function updateFamily(id, f) {
    const { data } = await supabase.from('families').update(snakify(f)).eq('id', id).select().single()
    if (data) setFamilies(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteFamily(id) {
    await supabase.from('families').delete().eq('id', id)
    setFamilies(p => p.filter(x => x.id !== id))
  }

  // ── Leads ────────────────────────────────────────────────────────────────
  async function updateLead(id, patch) {
    const { data } = await supabase.from('leads').update(snakify(patch)).eq('id', id).select().single()
    if (data) setLeads(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteLead(id) {
    await supabase.from('leads').delete().eq('id', id)
    setLeads(p => p.filter(x => x.id !== id))
  }

  // ── Time clock ─────────────────────────────────────────────────────────────
  async function getMyOpenEntry() {
    const { data } = await supabase.from('time_entries').select('*').eq('user_id', user.id).is('clock_out', null).order('clock_in', { ascending: false }).limit(1).maybeSingle()
    return data ? camelize(data) : null
  }
  async function clockIn(note = '') {
    const { data } = await supabase.from('time_entries').insert({ user_id: user.id, note }).select().single()
    return data ? camelize(data) : null
  }
  async function clockOut(entryId) {
    const { data } = await supabase.from('time_entries').update({ clock_out: new Date().toISOString() }).eq('id', entryId).select().single()
    return data ? camelize(data) : null
  }
  async function getTimeEntries({ allUsers = false } = {}) {
    let q = supabase.from('time_entries').select('*').order('clock_in', { ascending: false })
    if (!allUsers) q = q.eq('user_id', user.id)
    const { data } = await q.limit(200)
    return fromDB(data)
  }

  // ── Lesson plans ───────────────────────────────────────────────────────────
  async function saveLessonPlan(plan) {
    const row = snakify({ ...plan, tutorId: user.id })
    const { data } = await supabase.from('lesson_plans').insert(row).select().single()
    return data ? camelize(data) : null
  }
  async function getLessonPlans(studentId) {
    const { data } = await supabase.from('lesson_plans').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
    return fromDB(data)
  }
  // Calls the AI lesson planner edge function
  async function generateLessonPlan(payload) {
    const { data: { session } } = await supabase.auth.getSession()
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lesson-planner`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(payload),
    })
    return res.json()
  }

  // ── Monthly invoicing ────────────────────────────────────────────────────
  // Find completed sessions for monthly-billing students in the given month
  // that don't yet have a payment, and create one bundled invoice per student.
  async function generateMonthlyInvoices(year, month) {
    const ymStart = `${year}-${String(month).padStart(2, '0')}-01`
    const ymEnd = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const period = `${year}-${String(month).padStart(2, '0')}`

    const monthlyStudents = students.filter(s => s.billingFrequency === 'monthly' && s.status === 'active')
    let created = 0
    for (const student of monthlyStudents) {
      const studentSessions = sessions.filter(
        s => s.studentId === student.id && s.status === 'completed' &&
        s.date >= ymStart && s.date < ymEnd
      )
      if (studentSessions.length === 0) continue
      // Skip if a billing-period invoice already exists for this student
      const existing = payments.find(p => p.studentId === student.id && p.billingPeriod === period)
      if (existing) continue

      const totalMinutes = studentSessions.reduce((sum, s) => sum + s.duration, 0)
      const amount = parseFloat(((totalMinutes / 60) * student.rate).toFixed(2))
      await addPayment({
        studentId: student.id,
        amount,
        date: ymEnd,
        status: 'pending',
        method: '',
        billingPeriod: period,
      })
      created++
    }
    return created
  }

  async function loadStudents() {
    const { data } = await supabase.from('students').select('*').order('name')
    setStudents(fromDB(data))
  }
  async function loadSessions() {
    const { data } = await supabase.from('sessions').select('*').order('date', { ascending: false }).order('time', { ascending: false })
    setSessions(fromDB(data))
  }
  async function loadPayments() {
    const { data } = await supabase.from('payments').select('*').order('date', { ascending: false })
    setPayments(fromDB(data))
  }
  async function loadProgressNotes() {
    const { data } = await supabase.from('progress_notes').select('*').order('date', { ascending: false })
    setProgressNotes(fromDB(data))
  }

  // ── Students ─────────────────────────────────────────────────────────────
  async function addStudent(s) {
    const { data } = await supabase.from('students').insert(snakify(s)).select().single()
    if (data) setStudents(p => [...p, camelize(data)].sort((a, b) => a.name.localeCompare(b.name)))
    return data ? camelize(data) : null
  }
  async function addStudents(arr) {
    const rows = arr.map(s => snakify(s))
    const { data } = await supabase.from('students').insert(rows).select()
    if (data) setStudents(p => [...p, ...data.map(camelize)].sort((a, b) => a.name.localeCompare(b.name)))
    return data?.length || 0
  }
  async function updateStudent(id, s) {
    const { data } = await supabase.from('students').update(snakify(s)).eq('id', id).select().single()
    if (data) setStudents(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteStudent(id) {
    await supabase.from('students').delete().eq('id', id)
    setStudents(p => p.filter(x => x.id !== id))
  }

  // ── Sessions ─────────────────────────────────────────────────────────────
  // Detects overlapping scheduled sessions for the same tutor or same student.
  function findConflict(date, time, duration, ignoreId = null) {
    if (!date || !time || !duration) return null
    const start = toMin(time)
    const end = start + duration
    return sessions.find(s => {
      if (s.id === ignoreId) return null
      if (s.date !== date) return null
      if (s.status === 'cancelled') return null
      const sStart = toMin(s.time)
      const sEnd = sStart + (s.duration || 60)
      return start < sEnd && end > sStart
    }) || null
  }

  async function addSession(s, { repeatWeeks = 0 } = {}) {
    const base = snakify({ ...s, tutorId: user.id })
    const rows = [base]
    if (repeatWeeks > 0) {
      const recurrenceId = crypto.randomUUID()
      base.recurrence_id = recurrenceId
      for (let i = 1; i <= repeatWeeks; i++) {
        const d = new Date(s.date + 'T12:00:00')
        d.setDate(d.getDate() + i * 7)
        rows.push(snakify({ ...s, tutorId: user.id, date: d.toISOString().split('T')[0], recurrenceId }))
      }
    }
    const { data } = await supabase.from('sessions').insert(rows).select()
    if (data) setSessions(p => [...data.map(camelize), ...p])
    return data?.length || 0
  }
  async function updateSession(id, s) {
    const { data } = await supabase.from('sessions').update(snakify(s)).eq('id', id).select().single()
    if (data) setSessions(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteSession(id) {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(p => p.filter(x => x.id !== id))
  }
  async function deleteRecurrence(recurrenceId) {
    await supabase.from('sessions').delete().eq('recurrence_id', recurrenceId)
    setSessions(p => p.filter(x => x.recurrenceId !== recurrenceId))
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  async function addPayment(pay) {
    const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true })
    const invoiceNum = `INV-${String((count || 0) + 1).padStart(3, '0')}`
    const row = snakify({ ...pay, invoiceNum, amount: parseFloat(pay.amount) })
    const { data } = await supabase.from('payments').insert(row).select().single()
    if (data) setPayments(p => [camelize(data), ...p])
  }
  async function updatePayment(id, pay) {
    const { data } = await supabase.from('payments').update(snakify(pay)).eq('id', id).select().single()
    if (data) setPayments(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deletePayment(id) {
    await supabase.from('payments').delete().eq('id', id)
    setPayments(p => p.filter(x => x.id !== id))
  }

  // ── Progress Notes ────────────────────────────────────────────────────────
  async function addProgressNote(n) {
    const row = snakify({ ...n, tutorId: user.id })
    const { data } = await supabase.from('progress_notes').insert(row).select().single()
    if (data) setProgressNotes(p => [camelize(data), ...p])
  }
  async function updateProgressNote(id, n) {
    const { data } = await supabase.from('progress_notes').update(snakify(n)).eq('id', id).select().single()
    if (data) setProgressNotes(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteProgressNote(id) {
    await supabase.from('progress_notes').delete().eq('id', id)
    setProgressNotes(p => p.filter(x => x.id !== id))
  }

  return (
    <AppContext.Provider value={{
      dataLoading,
      students, addStudent, addStudents, updateStudent, deleteStudent,
      sessions, addSession, updateSession, deleteSession, deleteRecurrence, findConflict,
      payments, addPayment, updatePayment, deletePayment,
      progressNotes, addProgressNote, updateProgressNote, deleteProgressNote,
      families, addFamily, updateFamily, deleteFamily,
      leads, updateLead, deleteLead,
      settings, updateSettings,
      assignments, assignStudent, unassignStudent,
      generateMonthlyInvoices,
      saveLessonPlan, getLessonPlans, generateLessonPlan,
      getMyOpenEntry, clockIn, clockOut, getTimeEntries,
    }}>
      {children}
    </AppContext.Provider>
  )
}

function toMin(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

export const useApp = () => useContext(AppContext)
