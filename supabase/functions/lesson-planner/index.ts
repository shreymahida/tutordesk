// TutorHQ — AI Lesson Planner Edge Function
// Generates an Ontario-curriculum-aware lesson plan using Claude.
// Deploy: supabase functions deploy lesson-planner
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const MODEL = 'claude-sonnet-4-6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { courseCode, courseTitle, topic, units, painPoints, studentName, examInDays, currentMark, notes } = await req.json()

    const system = `You are an expert Ontario high school tutor and curriculum specialist. You know the Ontario Ministry of Education curriculum intimately — course codes, unit structures, EQAO/OSSLT assessments, and the prerequisite chains that lead to university admission (MCR3U → MHF4U → MCV4U, etc.).

You write lesson plans that are:
- Specific to the EXACT Ontario course and its real curriculum units
- Sequenced from concept review → guided practice → independent practice → application
- Realistic for a 1-hour tutoring session unless told otherwise
- Honest about what to prioritize when exam time is short
- Practical: reference free Ontario resources (Jensen Math for math, PhET for physics, the Organic Chemistry Tutor for chem) where they genuinely help

Output clean markdown. Be concrete with actual problem types and concepts, not generic advice.`

    const examLine = examInDays ? `The student has an exam/test in ${examInDays} days — prioritize accordingly.` : 'No imminent exam — focus on durable understanding.'
    const markLine = currentMark ? `Their current mark in this course is ${currentMark}%.` : ''

    const userPrompt = `Create a focused tutoring lesson plan.

Course: ${courseCode} — ${courseTitle}
Curriculum units: ${(units || []).join(', ')}
Known struggle points for this course: ${(painPoints || []).join(', ')}
Today's focus topic: ${topic || 'tutor will choose based on greatest need'}
Student: ${studentName || 'the student'}. ${markLine}
${examLine}
${notes ? `Tutor notes: ${notes}` : ''}

Produce:
1. **Session goal** (1 sentence)
2. **Warm-up / diagnostic** (2-3 quick questions to find gaps)
3. **Core teaching** (the concept, common misconceptions, worked example)
4. **Guided practice** (3-4 problems, easy → hard)
5. **Independent practice / homework** (with a specific free resource link if relevant)
6. **Exit check** (1-2 questions to confirm understanding)

Keep it tight and usable in a real session.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ ok: false, error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const data = await res.json()
    const content = data.content?.[0]?.text || 'No content generated.'

    return new Response(JSON.stringify({ ok: true, content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
