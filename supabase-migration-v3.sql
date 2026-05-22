-- TutorHQ v3 Migration
-- Paste into Supabase SQL Editor → New query → Run
-- Safe to run on existing v2 database.

-- ─── Families (sibling linking) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name   TEXT,
  parent_email  TEXT,
  parent_phone  TEXT,
  share_token   UUID DEFAULT gen_random_uuid(),
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage families" ON families;
CREATE POLICY "Authenticated users manage families" ON families TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone with token can view family" ON families;
CREATE POLICY "Anyone with token can view family" ON families FOR SELECT TO anon USING (share_token IS NOT NULL);

CREATE INDEX IF NOT EXISTS families_share_token_idx ON families(share_token);

ALTER TABLE students ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;

-- ─── Students: billing frequency for recurring invoicing ─────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'per-session'
  CHECK (billing_frequency IN ('per-session', 'monthly'));

-- ─── Payments: Stripe payment link ───────────────────────────────────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_link TEXT DEFAULT '';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT '';

-- ─── Sessions: reminder sent flag ────────────────────────────────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- ─── Leads (public booking page) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name  TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  student_name TEXT,
  student_grade TEXT,
  subjects     TEXT[] DEFAULT '{}',
  message      TEXT,
  status       TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage leads" ON leads;
CREATE POLICY "Authenticated users manage leads" ON leads TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
CREATE POLICY "Anyone can submit a lead" ON leads FOR INSERT TO anon WITH CHECK (true);

-- ─── Realtime for new tables ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE families;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- ─── Settings table for business config (booking page, branding, etc.) ───────
CREATE TABLE IF NOT EXISTS settings (
  id              INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name   TEXT DEFAULT 'TutorHQ',
  business_email  TEXT,
  booking_enabled BOOLEAN DEFAULT true,
  booking_blurb   TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users manage settings" ON settings;
CREATE POLICY "Authenticated users manage settings" ON settings TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
CREATE POLICY "Anyone can read settings" ON settings FOR SELECT TO anon USING (true);
