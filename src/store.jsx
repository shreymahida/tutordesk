import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, camelize, snakify } from './lib/supabase'
import { useAuth } from './context/AuthContext'

const AppContext = createContext(null)

const fromDB = rows => (rows || []).map(camelize)
const oneFromDB = row => row ? camelize(row) : null

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [progressNotes, setProgressNotes] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadAll()

    // Real-time sync — all tutors see each other's changes live
    const channel = supabase.channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, loadStudents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, loadSessions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, loadPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_notes' }, loadProgressNotes)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadAll() {
    setDataLoading(true)
    await Promise.all([loadStudents(), loadSessions(), loadPayments(), loadProgressNotes()])
    setDataLoading(false)
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
  async function addSession(s) {
    const row = snakify({ ...s, tutorId: user.id })
    const { data } = await supabase.from('sessions').insert(row).select().single()
    if (data) setSessions(p => [camelize(data), ...p])
  }
  async function updateSession(id, s) {
    const { data } = await supabase.from('sessions').update(snakify(s)).eq('id', id).select().single()
    if (data) setSessions(p => p.map(x => x.id === id ? camelize(data) : x))
  }
  async function deleteSession(id) {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(p => p.filter(x => x.id !== id))
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
      students, addStudent, updateStudent, deleteStudent,
      sessions, addSession, updateSession, deleteSession,
      payments, addPayment, updatePayment, deletePayment,
      progressNotes, addProgressNote, updateProgressNote, deleteProgressNote,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
