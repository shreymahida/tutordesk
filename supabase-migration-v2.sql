-- TutorHQ v2 Migration
-- Paste this into Supabase SQL Editor → New query → Run
-- Safe to run on an existing v1 database.

-- ─── Sessions: meeting link + recurrence + parent invite token ────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS meeting_link TEXT DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS recurrence_id UUID;

-- Allow no-show as a session status
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show'));

-- ─── Students: share token for parent portal ─────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS students_share_token_idx ON students(share_token);

-- ─── Public read for parent portal ────────────────────────────────────────────
-- Anonymous (parent) access by share_token. Parents see ONLY rows for their student.
DROP POLICY IF EXISTS "Anyone with share token can view student" ON students;
CREATE POLICY "Anyone with share token can view student"
  ON students FOR SELECT TO anon
  USING (share_token IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view sessions for shared student" ON sessions;
CREATE POLICY "Anyone can view sessions for shared student"
  ON sessions FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM students WHERE students.id = sessions.student_id));

DROP POLICY IF EXISTS "Anyone can view progress for shared student" ON progress_notes;
CREATE POLICY "Anyone can view progress for shared student"
  ON progress_notes FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM students WHERE students.id = progress_notes.student_id));

DROP POLICY IF EXISTS "Anyone can view payments for shared student" ON payments;
CREATE POLICY "Anyone can view payments for shared student"
  ON payments FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM students WHERE students.id = payments.student_id));
