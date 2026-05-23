# TutorHQ Integration Guide

All integrations are **optional** — TutorHQ works fully without them. Add them when you're ready.

## 0. AI Lesson Planner (Claude)

Powers the "AI Lesson Plan" button on every student. Generates Ontario-curriculum-aware lesson plans.

### Setup (one-time, 10 min)

1. Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com) → API Keys → Create. Add ~$5 credit (each plan costs ~$0.01-0.02).
2. Install Supabase CLI (if not already): `brew install supabase/tap/supabase`
3. Deploy + set the secret:
```bash
cd /Users/shreymahida/claudecode/tutor-app
supabase login
supabase link --project-ref zbjzquinotiepoqzuixh
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase functions deploy lesson-planner
```

That's it. The "AI Lesson Plan" button will start working. Until deployed, it shows a friendly "not configured yet" message.

---

## 1. Stripe Payment Links (parents pay online)

**No code deployment needed — Stripe Payment Links are static URLs.**

### Setup (one-time, 5 min)

1. Create a free Stripe account at [stripe.com](https://stripe.com) and verify your bank
2. From Stripe dashboard → **Payment Links** → **New** → set a product name like *"Tutoring Session"* with a placeholder price (you'll override it per invoice)
3. Or — easier — create one link per common amount (e.g. $60, $90, $120, $180)

### Using it

- When creating a payment in TutorHQ, paste the matching Stripe Payment Link URL into the **"Stripe payment link"** field
- The link will appear as a **"Pay now"** button on the parent's portal
- Stripe deposits to your bank in 2 business days

**Pro version:** for true dynamic per-invoice amounts, you'd need a backend that calls Stripe's API to create a one-off link per invoice — let me know if you want that next.

---

## 2. Email Reminders (Resend)

Sends automated *"session tomorrow"* emails to family parents 24h before scheduled sessions.

### Setup (one-time, 15 min)

#### Step A — Resend account

1. Sign up free at [resend.com](https://resend.com) (3,000 emails/month free)
2. **API Keys** → **Create API Key** → copy the `re_...` key

#### Step B — Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

#### Step C — Deploy the edge function

```bash
cd /Users/shreymahida/claudecode/tutor-app
supabase login                                  # opens browser
supabase link --project-ref zbjzquinotiepoqzuixh
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase functions deploy send-reminders
```

#### Step D — Schedule it daily (via Supabase SQL Editor)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule reminders at 9am UTC daily (adjust timezone in CRON syntax as needed)
SELECT cron.schedule(
  'send-tutor-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zbjzquinotiepoqzuixh.functions.supabase.co/send-reminders',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY')
  );
  $$
);
```

Replace `YOUR_SERVICE_ROLE_KEY` with your Supabase **service role** key (Settings → API Keys → service_role).

### How it works

Every day at 9am UTC:
1. Function queries scheduled sessions for tomorrow
2. For each session linked to a family with a parent email, sends an email
3. Marks `reminder_sent = true` so it's never sent twice

Test it manually any time:
```bash
curl -i -X POST https://zbjzquinotiepoqzuixh.functions.supabase.co/send-reminders \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Custom sender domain (optional)

By default emails come from `onboarding@resend.dev`. To use your own:
1. In Resend → **Domains** → add your domain → follow DNS instructions
2. `supabase secrets set FROM_EMAIL="TutorHQ <hello@yourdomain.com>"`
3. Re-deploy: `supabase functions deploy send-reminders`
