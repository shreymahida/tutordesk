-- TutorDesk Supabase Schema
-- Run this entire file in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ─── Profiles (extends Supabase auth) ────────────────────────────────────────
CREATE TABLE profiles (
  id      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name    TEXT,
  email   TEXT,
  role    TEXT DEFAULT 'tutor' CHECK (role IN ('admin', 'tutor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view profiles"   ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"            ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile"           ON profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create profile on signup. First user becomes admin, everyone else is tutor.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'tutor' END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── Students ─────────────────────────────────────────────────────────────────
CREATE TABLE students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT DEFAULT '',
  phone      TEXT DEFAULT '',
  grade      TEXT DEFAULT '9th',
  subjects   TEXT[] DEFAULT '{}',
  rate       DECIMAL(10,2) DEFAULT 0,
  status     TEXT DEFAULT 'active',
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage students" ON students TO authenticated USING (true) WITH CHECK (true);


-- ─── Sessions ─────────────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id   UUID REFERENCES auth.users(id),
  subject    TEXT NOT NULL,
  date       DATE NOT NULL,
  time       TIME,
  duration   INTEGER DEFAULT 60,
  status     TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage sessions" ON sessions TO authenticated USING (true) WITH CHECK (true);


-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES sessions(id) ON DELETE SET NULL,
  amount      DECIMAL(10,2) NOT NULL,
  date        DATE NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  method      TEXT DEFAULT '',
  invoice_num TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage payments" ON payments TO authenticated USING (true) WITH CHECK (true);


-- ─── Progress Notes ───────────────────────────────────────────────────────────
CREATE TABLE progress_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id   UUID REFERENCES auth.users(id),
  date       DATE NOT NULL,
  subject    TEXT,
  content    TEXT NOT NULL,
  rating     INTEGER DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE progress_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage progress notes" ON progress_notes TO authenticated USING (true) WITH CHECK (true);


-- ─── Real-time ────────────────────────────────────────────────────────────────
-- Enable real-time so all tutors see live updates
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE progress_notes;
