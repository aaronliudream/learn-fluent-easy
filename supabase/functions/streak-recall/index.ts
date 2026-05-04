import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Streak-break recall: send a one-off "your streak is waiting" email to users
 * who:
 *   - had at least one learning event in the last 30 days
 *   - have NOT had any learning event in the last 7 days
 *   - have not yet received this recall (streak_recall_sent_at IS NULL)
 *
 * After sending, we set streak_recall_sent_at. It gets reset to NULL by the
 * activity heartbeat whenever the user comes back, so they're eligible again
 * after future streak breaks.
 *
 * Designed to run hourly via pg_cron. Idempotent.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = Date.now()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Find users who were active in the last 30d but not in the last 7d.
  // Use the per-user max(created_at) of learning_events as "last_seen".
  const { data: activeRows, error: aErr } = await supabase
    .from('learning_events')
    .select('user_id, created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(2000)
  if (aErr) {
    console.error('learning_events query failed', aErr)
    return new Response(JSON.stringify({ error: 'query_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Reduce to per-user last_seen
  const lastSeen = new Map<string, string>()
  for (const r of (activeRows ?? []) as Array<{ user_id: string; created_at: string }>) {
    if (!lastSeen.has(r.user_id)) lastSeen.set(r.user_id, r.created_at)
  }
  const candidates = [...lastSeen.entries()].filter(([, ts]) => ts < sevenDaysAgo).map(([uid]) => uid)

  let queued = 0, skipped = 0

  for (const uid of candidates) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('display_name, preferred_language, streak_recall_sent_at, email')
      .eq('user_id', uid)
      .maybeSingle()
    if (!prof) { skipped++; continue }
    if (prof.streak_recall_sent_at) { skipped++; continue }

    // Email — fall back to auth.users.email
    let email = (prof as { email?: string }).email
    if (!email) {
      const { data: u } = await supabase.auth.admin.getUserById(uid)
      email = u?.user?.email ?? undefined
    }
    if (!email) { skipped++; continue }

    // Best streak — try streak_stats; tolerate absence
    let bestStreak = 0
    const { data: stats } = await supabase
      .from('streak_stats')
      .select('best_streak, current_streak')
      .eq('user_id', uid)
      .maybeSingle()
    if (stats) bestStreak = (stats as { best_streak?: number }).best_streak ?? 0

    const lastTs = lastSeen.get(uid)!
    const daysSilent = Math.max(7, Math.floor((now - new Date(lastTs).getTime()) / 86_400_000))
    const lang = (prof.preferred_language as string) || 'en'

    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'streak-recall',
          recipientEmail: email,
          idempotencyKey: `streak-recall-${uid}-${new Date(lastTs).toISOString().slice(0, 10)}`,
          templateData: { name: prof.display_name || '', lang, daysSilent, bestStreak },
        },
      })
      await supabase
        .from('profiles')
        .update({ streak_recall_sent_at: new Date().toISOString() })
        .eq('user_id', uid)
      queued++
    } catch (e) {
      console.error('streak-recall send failed', uid, e)
    }
  }

  return new Response(JSON.stringify({ queued, skipped, scanned: candidates.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
