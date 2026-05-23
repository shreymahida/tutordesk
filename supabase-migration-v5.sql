-- TutorHQ v5 Migration — Ontario Intelligence Layer
-- Academic profiles, course marks, lesson plans. Paste into Supabase SQL Editor → Run.

-- ─── Students: academic profile fields ───────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS target_university TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS target_program TEXT DEFAULT '';
-- course_marks: { "MCR3U": 78, "MHF4U": 82 }
ALTER TABLE students ADD COLUMN IF NOT EXISTS course_marks JSONB DEFAULT '{}'::jsonb;

-- ─── Lesson plans (AI-generated + manual) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id    UUID REFERENCES auth.users(id),
  course_code TEXT,
  topic       TEXT,
  content     TEXT,            -- markdown lesson plan
  source      TEXT DEFAULT 'ai', -- 'ai' or 'manual'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all lesson plans" ON lesson_plans;
CREATE POLICY "Admins manage all lesson plans" ON lesson_plans TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Tutors manage own lesson plans" ON lesson_plans;
CREATE POLICY "Tutors manage own lesson plans" ON lesson_plans FOR ALL TO authenticated
  USING (
    tutor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM sessions s WHERE s.student_id = lesson_plans.student_id AND s.tutor_id = auth.uid())
  )
  WITH CHECK (tutor_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE lesson_plans;
