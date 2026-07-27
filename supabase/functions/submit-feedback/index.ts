import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Local hard-blocklist (Chinese + English). Matches whole or partial.
 *  Only obvious cases — AI handles the nuanced filtering. */
const HARD_BLOCKLIST = [
  // English: explicit sexual / violent / drug / slurs
  'porn','pornhub','xxx','sex video','nude','naked','rape','child porn','cp ',
  'cocaine','heroin','meth ','methamphetamine','crack ','weed sale','buy drugs',
  'kill you','kill u','murder you','suicide method','how to suicide',
  'fuck you','f u c k','nigger','faggot','retard',
  // Chinese: explicit sexual / violent / drug / political red lines
  '色情','黄片','成人片','卖淫','嫖娼','操你妈','操你','傻逼','婊子','贱人',
  '杀你','杀人','自杀方法','怎么自杀',
  '冰毒','海洛因','大麻交易','卖大麻','吸毒',
  '法轮功','六四','89学运','藏独','疆独','台独',
]

function hardCheck(text: string): { ok: boolean; matched?: string } {
  const lower = text.toLowerCase()
  for (const w of HARD_BLOCKLIST) {
    if (lower.includes(w)) return { ok: false, matched: w }
  }
  return { ok: true }
}

/** Count meaningful tokens: each CJK char = 1 token, each English/number word = 1 token. */
function countTokens(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? []).length
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length
  return cjk + words
}

/** Heuristic quality check — reject obvious gibberish / copy-paste / spam.
 *  Returns ok:false with a reason when the message looks invalid. */
function qualityCheck(raw: string): { ok: boolean; reason?: string } {
  const text = raw.trim()
  if (!text) return { ok: false, reason: '内容不能为空' }

  // 1) Minimum meaningful length: ≥10 tokens (CJK chars + English words)
  const tokens = countTokens(text)
  if (tokens < 10) {
    return { ok: false, reason: '反馈太短啦，请至少写 10 个字（或 10 个英文单词）描述清楚 🙏' }
  }

  // 2) Reject if too few unique characters (e.g. "aaaaaaaaaa", "哈哈哈哈哈哈哈哈哈哈")
  const stripped = text.replace(/\s+/g, '')
  const unique = new Set(stripped.toLowerCase()).size
  if (stripped.length >= 10 && unique < Math.max(4, Math.floor(stripped.length * 0.2))) {
    return { ok: false, reason: '内容看起来是重复字符，请认真描述你的反馈' }
  }

  // 3) Reject long runs of the same character (e.g. "aaaaaaa", "！！！！！！")
  if (/(.)\1{6,}/.test(stripped)) {
    return { ok: false, reason: '请不要重复相同字符，认真描述你的反馈' }
  }

  // 4) Reject the same word repeated (e.g. "test test test test test test test test test test")
  const words = text.toLowerCase().match(/[a-z\u4e00-\u9fff]+/g) ?? []
  if (words.length >= 6) {
    const uniq = new Set(words).size
    if (uniq <= Math.max(2, Math.floor(words.length * 0.25))) {
      return { ok: false, reason: '内容看起来是重复粘贴，请认真描述你的反馈' }
    }
  }

  // 5) Pure-Latin gibberish detection: long letter run with no vowels / no spaces
  //    Skip when there are CJK chars (Chinese has no vowels concept).
  const hasCJK = /[\u4e00-\u9fff]/.test(text)
  if (!hasCJK) {
    const letters = text.replace(/[^a-zA-Z]/g, '')
    if (letters.length >= 15) {
      const vowels = (letters.match(/[aeiouAEIOU]/g) ?? []).length
      const ratio = vowels / letters.length
      if (ratio < 0.15 || ratio > 0.75) {
        return { ok: false, reason: '内容看起来不是正常文字，请用完整句子描述你的反馈' }
      }
      // No spaces at all in a long string → likely keyboard mash
      if (letters.length >= 30 && !/\s/.test(text)) {
        return { ok: false, reason: '请用完整的句子描述你的反馈（用空格分词）' }
      }
    }
  }

  return { ok: true }
}

async function aiModerate(message: string): Promise<{ is_relevant: boolean; is_safe: boolean; reason: string } | null> {
  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) return null
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content:
              'You are a content moderator for "Big Moon English", an English-learning website. ' +
              'Decide whether a feedback message is (a) relevant to English learning OR the website itself, ' +
              'and (b) safe (no porn, violence, drugs, illegal content, harassment, hate speech, or political extremism). ' +
              'Negative but legitimate feedback (e.g. "this site is terrible", "buggy", "too expensive") is RELEVANT and SAFE — do not block it. ' +
              'Off-topic chat (cooking, dating, crypto, sports) is NOT relevant. ' +
              'Always respond by calling the moderate function.',
          },
          { role: 'user', content: message },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'moderate',
            description: 'Return moderation verdict.',
            parameters: {
              type: 'object',
              properties: {
                is_relevant: { type: 'boolean', description: 'true if related to English learning or this website' },
                is_safe:     { type: 'boolean', description: 'true if no harmful/illegal content' },
                reason:      { type: 'string',  description: 'short reason in English, <120 chars' },
              },
              required: ['is_relevant','is_safe','reason'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'moderate' } },
      }),
    })
    if (!r.ok) {
      console.error('ai moderation http', r.status, await r.text())
      return null
    }
    const j = await r.json()
    const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
    if (!args) return null
    return JSON.parse(args)
  } catch (e) {
    console.error('ai moderation error', e)
    return null
  }
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const body = await req.json()
    const category = String(body?.category ?? '').trim()
    const message  = String(body?.message  ?? '').trim()
    const email    = body?.email ? String(body.email).trim() : null
    const rating   = body?.rating ? Number(body.rating) : null
    const pageUrl  = body?.page_url ? String(body.page_url).slice(0, 500) : null

    // Validation
    if (!['bug','suggestion','praise','other'].includes(category))
      return Response.json({ error: '请选择反馈类别' }, { status: 400, headers: corsHeaders })
    if (message.length > 1000)
      return Response.json({ error: '反馈内容请控制在 1000 字以内' }, { status: 400, headers: corsHeaders })

    // Quality check: minimum tokens + gibberish/spam detection
    const quality = qualityCheck(message)
    if (!quality.ok) {
      return Response.json({ error: quality.reason }, { status: 400, headers: corsHeaders })
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Response.json({ error: '邮箱格式不正确' }, { status: 400, headers: corsHeaders })
    if (rating != null && (!Number.isFinite(rating) || rating < 1 || rating > 5))
      return Response.json({ error: '评分必须在 1–5 之间' }, { status: 400, headers: corsHeaders })

    // Hard blocklist
    const hard = hardCheck(message)
    if (!hard.ok) {
      return Response.json(
        { error: '反馈包含不当词汇，请修改后重试。', blocked: true },
        { status: 400, headers: corsHeaders },
      )
    }

    // AI moderation (best-effort — if it fails, fall back to allow with warning logged)
    const verdict = await aiModerate(message)
    if (verdict && (!verdict.is_relevant || !verdict.is_safe)) {
      // Log the blocked attempt for admin review
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
      const ipHash = await sha256(ip + '|big-moon')
      await supabase.from('feedback').insert({
        category, rating, message, email, page_url: pageUrl,
        user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
        status: 'blocked', moderation_result: verdict, ip_hash: ipHash,
      })
      const msg = !verdict.is_relevant
        ? '请只提交与英语学习或本网站相关的反馈 🙏'
        : '反馈包含不当内容，请修改后重试。'
      return Response.json({ error: msg, blocked: true }, { status: 400, headers: corsHeaders })
    }

    // Identify user (optional)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    let userId: string | null = null
    const auth = req.headers.get('Authorization')
    if (auth?.startsWith('Bearer ')) {
      const { data } = await supabase.auth.getUser(auth.slice(7))
      userId = data?.user?.id ?? null
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const ipHash = await sha256(ip + '|big-moon')

    // Rate limiting:
    //   - logged-in user: max 10 per day per account
    //   - anonymous / guest: max 3 per 5 minutes per IP
    if (userId) {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const { count } = await supabase.from('feedback')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', since)
      if ((count ?? 0) >= 10) {
        return Response.json(
          { error: '今日反馈次数已达上限（10 条），请明天再来 🙏' },
          { status: 429, headers: corsHeaders },
        )
      }
    } else {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabase.from('feedback')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since)
      if ((count ?? 0) >= 3) {
        return Response.json(
          { error: '提交过于频繁，请 5 分钟后再试' },
          { status: 429, headers: corsHeaders },
        )
      }
    }

    // Insert
    const { data: row, error: insErr } = await supabase.from('feedback').insert({
      user_id: userId, category, rating, message, email, page_url: pageUrl,
      user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      status: 'new',
      moderation_result: verdict ?? { is_relevant: true, is_safe: true, reason: 'ai-skipped' },
      ip_hash: ipHash,
    }).select('id').single()

    if (insErr) {
      console.error('insert feedback failed', insErr)
      return Response.json({ error: '提交失败，请稍后重试' }, { status: 500, headers: corsHeaders })
    }

    // Notify admin via app email (to support@bigmoonenglish.com)
    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'feedback-admin-notification',
          recipientEmail: 'support@bigmoonenglish.com',
          idempotencyKey: `feedback-admin-${row!.id}`,
          templateData: { category, rating: rating ?? 0, message, email: email ?? '', page_url: pageUrl ?? '', user_id: userId ?? '' },
        },
      })
    } catch (e) { console.error('admin notify failed', e) }

    // Send acknowledgement to user (if they gave email)
    if (email) {
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'feedback-user-ack',
            recipientEmail: email,
            idempotencyKey: `feedback-ack-${row!.id}`,
            templateData: { category },
          },
        })
      } catch (e) { console.error('user ack failed', e) }
    }

    return Response.json({ ok: true, id: row!.id }, { headers: corsHeaders })
  } catch (e) {
    console.error('submit-feedback error', e)
    return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders })
  }
})