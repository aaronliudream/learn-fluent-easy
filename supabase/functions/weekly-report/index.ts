import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AggregatedStats {
  user_id: string
  email: string | null
  display_name: string | null
  preferred_language: string | null
  lessonsCompleted: number
  vocabLearned: number
  studyMinutes: number
  quizCorrect: number
  quizTotal: number
  streak: number
}

function fmtRange(start: Date, end: Date): string {
  const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opt)} – ${end.toLocaleDateString('en-US', opt)}`
}

async function aggregateForUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: Date,
  weekEnd: Date,
) {
  const { data: events } = await supabase
    .from('learning_events')
    .select('event_type, quiz_correct, quiz_total, study_minutes, vocab_count, lesson_key, created_at')
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lt('created_at', weekEnd.toISOString())

  const lessons = new Set<string>()
  let vocab = 0, mins = 0, qc = 0, qt = 0
  const days = new Set<string>()

  for (const e of events || []) {
    days.add(new Date(e.created_at as string).toISOString().slice(0, 10))
    if (e.event_type === 'lesson_complete' && e.lesson_key) lessons.add(e.lesson_key as string)
    if (e.event_type === 'vocab_learned') vocab += (e.vocab_count as number) || 0
    if (e.event_type === 'study_minutes') mins += (e.study_minutes as number) || 0
    if (e.event_type === 'quiz') { qc += (e.quiz_correct as number) || 0; qt += (e.quiz_total as number) || 0 }
  }

  // streak: consecutive trailing days from weekEnd
  let streak = 0
  const d = new Date(weekEnd); d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1) }

  return { lessonsCompleted: lessons.size, vocabLearned: vocab, studyMinutes: mins, quizCorrect: qc, quizTotal: qt, streak }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const url = new URL(req.url)
  const mode = url.searchParams.get('mode') || 'cron' // 'cron' or 'me'
  const debug = url.searchParams.get('debug') === '1'

  // Last 7-day window ending at today UTC midnight
  const now = new Date()
  const weekEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const weekStart = new Date(weekEnd); weekStart.setUTCDate(weekStart.getUTCDate() - 7)
  const weekRange = fmtRange(weekStart, new Date(weekEnd.getTime() - 1))

  if (mode === 'me') {
    // Single-user: requires bearer token of that user
    const auth = req.headers.get('Authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const { data: userRes } = await supabase.auth.getUser(token)
    const user = userRes?.user
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const stats = await aggregateForUser(supabase, user.id, weekStart, weekEnd)
    return new Response(JSON.stringify({ ...stats, weekRange }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Cron mode: send weekly emails
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, email, preferred_language, weekly_report_enabled, last_weekly_report_at')
    .eq('weekly_report_enabled', true)
    .not('email', 'is', null)

  if (error) {
    console.error('Failed to load profiles', error)
    return new Response(JSON.stringify({ error: 'failed_to_load_profiles' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  let queued = 0, skipped = 0

  for (const p of profiles || []) {
    if (p.last_weekly_report_at && p.last_weekly_report_at > sevenDaysAgo) { skipped++; continue }
    const stats = await aggregateForUser(supabase, p.user_id as string, weekStart, weekEnd)

    // Skip users with zero activity to keep deliverability healthy
    const hasActivity = stats.lessonsCompleted + stats.vocabLearned + stats.studyMinutes + stats.quizTotal > 0
    if (!hasActivity) { skipped++; continue }

    const accuracy = stats.quizTotal > 0 ? Math.round((stats.quizCorrect / stats.quizTotal) * 100) : 0
    const lang = (p.preferred_language as string) || 'zh'

    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'weekly-report',
          recipientEmail: p.email,
          idempotencyKey: `weekly-${p.user_id}-${weekStart.toISOString().slice(0,10)}`,
          templateData: {
            name: p.display_name || '',
            lessonsCompleted: stats.lessonsCompleted,
            vocabLearned: stats.vocabLearned,
            studyMinutes: stats.studyMinutes,
            accuracy,
            quizTotal: stats.quizTotal,
            streak: stats.streak,
            weekRange,
            lang,
          },
        },
      })
      await supabase.from('profiles').update({ last_weekly_report_at: new Date().toISOString() }).eq('user_id', p.user_id)
      queued++
    } catch (e) {
      console.error('Failed to enqueue weekly report for', p.user_id, e)
    }
  }

  const body = { queued, skipped, total: profiles?.length || 0, weekRange }
  return new Response(JSON.stringify(debug ? { ...body, sampleProfiles: profiles?.slice(0, 3) } : body), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})