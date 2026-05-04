import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Send a one-off "we miss you" recall email to users who:
 *  - signed up 24-72h ago
 *  - have ZERO learning_events rows
 *  - have not received the recall email yet (recall_email_sent_at IS NULL)
 *  Designed to run hourly via pg_cron. Idempotent — recall_email_sent_at gates re-sends.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = Date.now()
  const upper = new Date(now - 24 * 60 * 60 * 1000).toISOString() // signed up >=24h ago
  const lower = new Date(now - 72 * 60 * 60 * 1000).toISOString() // and <=72h ago

  // List recently-created auth users in the window (admin API)
  const { data: usersList, error: usersErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (usersErr) {
    console.error('listUsers failed', usersErr)
    return new Response(JSON.stringify({ error: 'list_users_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const candidates = (usersList?.users ?? []).filter(u => {
    if (!u.created_at || !u.email) return false
    return u.created_at <= upper && u.created_at >= lower
  })

  let queued = 0, skipped = 0

  for (const u of candidates) {
    // Already received recall? skip
    const { data: prof } = await supabase
      .from('profiles')
      .select('display_name, preferred_language, recall_email_sent_at, email')
      .eq('user_id', u.id)
      .maybeSingle()
    if (prof?.recall_email_sent_at) { skipped++; continue }

    // Has any learning activity? skip
    const { count } = await supabase
      .from('learning_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', u.id)
    if ((count ?? 0) > 0) { skipped++; continue }

    const lang = (prof?.preferred_language as string) || 'zh'
    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'recall-24h',
          recipientEmail: u.email,
          idempotencyKey: `recall-24h-${u.id}`,
          templateData: { name: prof?.display_name || '', lang },
        },
      })
      await supabase.from('profiles').update({ recall_email_sent_at: new Date().toISOString() }).eq('user_id', u.id)
      queued++
    } catch (e) {
      console.error('recall send failed', u.id, e)
    }
  }

  return new Response(JSON.stringify({ queued, skipped, scanned: candidates.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})