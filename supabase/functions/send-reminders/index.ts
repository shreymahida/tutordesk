// TutorHQ — Email reminder Edge Function
// Sends "session tomorrow" emails to family parents 24h before scheduled sessions.
// Deploy with: supabase functions deploy send-reminders
// Schedule with pg_cron: SELECT cron.schedule('reminders', '0 9 * * *', $$SELECT net.http_post(url := 'https://<project>.functions.supabase.co/send-reminders', headers := jsonb_build_object('Authorization', 'Bearer <anon-or-service-key>'))$$);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'TutorHQ <onboarding@resend.dev>'

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

Deno.serve(async () => {
  try {
    // Tomorrow's date in YYYY-MM-DD
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Find scheduled sessions tomorrow that haven't had a reminder sent
    const { data: sessions, error } = await sb
      .from('sessions')
      .select('id, student_id, subject, date, time, duration, meeting_link, reminder_sent, students(name, family_id, families(parent_email, parent_name))')
      .eq('date', tomorrow)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)

    if (error) throw error
    let sent = 0
    const errors: string[] = []

    for (const s of sessions || []) {
      // @ts-ignore - nested select
      const family = s.students?.families
      const studentName = s.students?.name || 'your student'
      const parentEmail = family?.parent_email
      if (!parentEmail) continue

      const subject = `Reminder: ${studentName}'s ${s.subject} session tomorrow`
      const time = formatTime(s.time)
      const html = renderEmail({
        studentName,
        parentName: family?.parent_name || 'there',
        subjectName: s.subject,
        time,
        duration: s.duration,
        meetingLink: s.meeting_link,
      })

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_EMAIL, to: parentEmail, subject, html }),
      })

      if (!res.ok) {
        const err = await res.text()
        errors.push(`Session ${s.id}: ${err}`)
        continue
      }

      await sb.from('sessions').update({ reminder_sent: true }).eq('id', s.id)
      sent++
    }

    return new Response(JSON.stringify({ ok: true, sent, errors }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function renderEmail({ studentName, parentName, subjectName, time, duration, meetingLink }: {
  studentName: string; parentName: string; subjectName: string; time: string; duration: number; meetingLink?: string;
}): string {
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;border:1px solid #e5e7eb;padding:32px;">
    <div style="width:48px;height:48px;background:#8b5cf6;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <span style="color:white;font-size:24px;">🎓</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Session tomorrow</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi ${parentName} — quick reminder that ${studentName} has a tutoring session tomorrow.</p>
    <div style="background:#f3f4f6;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">${subjectName}</p>
      <p style="margin:0;font-size:18px;font-weight:600;color:#111827;">${time} · ${duration} min</p>
    </div>
    ${meetingLink ? `<a href="${meetingLink}" style="display:inline-block;background:#8b5cf6;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Join video session</a>` : ''}
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">Sent by TutorHQ</p>
  </div>
</body></html>`
}
