-- TutorHQ v4 Migration
-- Tutor portal architecture: assignments, messages, audit, tightened RLS.
-- Paste into Supabase SQL Editor → New query → Run.

-- ─── Helper: is_admin() ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ─── Student-Tutor Assignments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, tutor_id)
);

ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all assignments" ON student_assignments;
CREATE POLICY "Admins manage all assignments" ON student_assignments TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Tutors view own assignments" ON student_assignments;
CREATE POLICY "Tutors view own assignments" ON student_assignments FOR SELECT TO authenticated
  USING (tutor_id = auth.uid());

-- ─── Messages (admin ↔ tutor chat) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- For 1:1 chats, thread_id is the "other person's" user id.
  -- For a tutor: thread_id = admin who they're messaging.
  -- For an admin: thread_id = the tutor they're messaging.
  thread_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages(thread_user, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see their own messages" ON messages;
CREATE POLICY "Users see their own messages" ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR thread_user = auth.uid());

DROP POLICY IF EXISTS "Users send messages" ON messages;
CREATE POLICY "Users send messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users mark own threads as read" ON messages;
CREATE POLICY "Users mark own threads as read" ON messages FOR UPDATE TO authenticated
  USING (thread_user = auth.uid() OR sender_id = auth.uid());

-- ─── TIGHTEN existing RLS policies for tutor isolation ───────────────────────

-- Students: admins see all, tutors only see assigned students
DROP POLICY IF EXISTS "Authenticated users manage students" ON students;
DROP POLICY IF EXISTS "Admins manage all students" ON students;
CREATE POLICY "Admins manage all students" ON students TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Tutors view assigned students" ON students;
CREATE POLICY "Tutors view assigned students" ON students FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM student_assignments sa WHERE sa.student_id = students.id AND sa.tutor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM sessions s WHERE s.student_id = students.id AND s.tutor_id = auth.uid())
  );

-- Sessions: admins see all, tutors see only sessions they're the tutor on
DROP POLICY IF EXISTS "Authenticated users manage sessions" ON sessions;
DROP POLICY IF EXISTS "Admins manage all sessions" ON sessions;
CREATE POLICY "Admins manage all sessions" ON sessions TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Tutors view own sessions" ON sessions;
CREATE POLICY "Tutors view own sessions" ON sessions FOR SELECT TO authenticated
  USING (tutor_id = auth.uid());
DROP POLICY IF EXISTS "Tutors update own sessions" ON sessions;
CREATE POLICY "Tutors update own sessions" ON sessions FOR UPDATE TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());
DROP POLICY IF EXISTS "Tutors create their own sessions" ON sessions;
CREATE POLICY "Tutors create their own sessions" ON sessions FOR INSERT TO authenticated
  WITH CHECK (tutor_id = auth.uid());

-- Progress notes: admins all, tutors only for their assigned/sessioned students
DROP POLICY IF EXISTS "Authenticated users manage progress notes" ON progress_notes;
DROP POLICY IF EXISTS "Admins manage all progress notes" ON progress_notes;
CREATE POLICY "Admins manage all progress notes" ON progress_notes TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Tutors view + write progress notes for their students" ON progress_notes;
CREATE POLICY "Tutors view + write progress notes for their students" ON progress_notes
  FOR ALL TO authenticated
  USING (
    tutor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM student_assignments sa WHERE sa.student_id = progress_notes.student_id AND sa.tutor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM sessions s WHERE s.student_id = progress_notes.student_id AND s.tutor_id = auth.uid())
  )
  WITH CHECK (tutor_id = auth.uid());

-- Payments: ADMIN ONLY (tutors cannot read or write)
DROP POLICY IF EXISTS "Authenticated users manage payments" ON payments;
DROP POLICY IF EXISTS "Admins manage payments" ON payments;
CREATE POLICY "Admins manage payments" ON payments TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Families: ADMIN ONLY
DROP POLICY IF EXISTS "Authenticated users manage families" ON families;
DROP POLICY IF EXISTS "Admins manage families" ON families;
CREATE POLICY "Admins manage families" ON families TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Leads: ADMIN ONLY (besides public insert)
DROP POLICY IF EXISTS "Authenticated users manage leads" ON leads;
DROP POLICY IF EXISTS "Admins manage leads" ON leads;
CREATE POLICY "Admins manage leads" ON leads TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Settings: ADMIN write, anyone read (already public for booking page)
DROP POLICY IF EXISTS "Authenticated users manage settings" ON settings;
DROP POLICY IF EXISTS "Admins update settings" ON settings;
CREATE POLICY "Admins update settings" ON settings FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "All authenticated read settings" ON settings;
CREATE POLICY "All authenticated read settings" ON settings FOR SELECT TO authenticated
  USING (true);

-- ─── Real-time for new tables ────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE student_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
