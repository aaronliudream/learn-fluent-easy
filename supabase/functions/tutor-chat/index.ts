// Edge function: tutor-chat
// Socratic AI tutor for a SPECIFIC question the student already answered.
// - Streams SSE tokens back to the client
// - Strictly scoped to the current question (no off-topic chatter)
// - Bilingual: respects user-selected language (zh / en)
// - Daily quota guard
// - Persists messages to tutor_conversations / tutor_messages

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 60; // user messages per day

type Role = "user" | "assistant" | "system";
interface ChatMsg { role: Role; content: string }

interface Body {
  context: string;                   // e.g. 'junior_grammar' | 'gaokao_grammar' | 'mistakes' | 'gaokao_mistakes' | 'lesson' | 'workplace'
  question_ref: string;              // stable ID
  question_snapshot: Record<string, unknown>;
  user_message: string;
  language?: "zh" | "en";
  hint_level?: 0 | 1 | 2 | 3;        // when student asks "give me a hint"
}

function buildSystemPrompt(language: "zh" | "en", snapshot: Record<string, unknown>, hintLevel: number) {
  const isZh = language !== "en";
  const snap = JSON.stringify(snapshot, null, 2);

  const zh = `你是「小月」(Luna)，一位耐心、鼓励、像学姐一样的英语学习伙伴。
你正在帮助学生回顾他们刚刚做完的【一道题】。务必遵守以下规则：

【最高准则 — 苏格拉底式引导】
1. 永远不要直接说"答案是 X"。要通过反问、提示、对比，引导学生自己发现答案与原理。
2. 学生问"为什么我错了"时，先肯定他的尝试，再用 1 个具体问题引导他思考关键点。
3. 学生明确请求"直接告诉我答案"时，可以给答案，但同时必须配 1 句"为什么"+ 1 个易混点提醒。

【范围限制】
4. 只讨论下方这道题相关的语法点 / 词汇 / 用法，**禁止**回答与本题无关的问题（其他题、闲聊、作业代写、敏感话题）。
   遇到越界请求礼貌中止："这个我们换个地方聊好吗？现在先把这道题搞懂 ✨"
5. 不要编造题目里没有的信息。如果学生问的内容不在题目中，请说明并把他拉回本题。

【风格】
6. 中文为主，英文术语保留英文（如 past perfect, subject-verb agreement）。
7. 简短(<120 字)，多用 emoji 和换行，像微信聊天一样自然。
8. 鼓励为先："好问题！" "你已经看到关键点了～" 但不要油腻。
9. 当前提示等级 = ${hintLevel} (0=无 / 1=方向 / 2=缩小范围 / 3=详细解析)。等级越高可以越具体，但仍不要直说答案除非学生明确要求。

【题目快照（来源于学生刚做的题，唯一参考资料）】
${snap}
`;

  const en = `You are "Luna", a patient, encouraging study buddy — like a senior student helping a friend.
You are helping the learner review ONE specific question they just answered. Follow these rules strictly:

【Top Principle — Socratic guidance】
1. NEVER just say "the answer is X." Use questions, hints, and comparisons to lead the learner to discover it.
2. If they ask "why was I wrong?", first acknowledge their attempt, then ask ONE pointed question about the key concept.
3. Only when the student explicitly says "just tell me the answer" may you reveal it — and even then add 1 sentence of "why" + 1 common-confusion warning.

【Scope limit】
4. Discuss ONLY the grammar / vocabulary / usage of the question below. REFUSE other questions (other problems, chitchat, doing their homework, sensitive topics).
   Politely redirect: "Let's stay on this one for now ✨"
5. Do not invent facts not in the question. If asked about something outside, say so and steer back.

【Style】
6. English. Keep technical terms English. If you must explain a Chinese-context idiom, you may add a Chinese gloss in parentheses.
7. Keep replies short (<120 words), warm, with emoji and line breaks — like a friendly chat.
8. Lead with encouragement ("Great question!" "You're really close!") but don't be saccharine.
9. Current hint level = ${hintLevel} (0=none / 1=direction / 2=narrow / 3=full explanation). Higher = more specific, but still avoid stating the answer unless explicitly asked.

【Question snapshot (the ONLY reference material)】
${snap}
`;

  return isZh ? zh : en;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: u } = await userClient.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    const body = (await req.json()) as Body;
    const language: "zh" | "en" = body.language === "en" ? "en" : "zh";
    const hintLevel = Math.max(0, Math.min(3, body.hint_level ?? 0));

    if (!body.context || !body.question_ref || !body.user_message) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Daily quota ---
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await admin
      .from("tutor_usage_daily")
      .select("message_count")
      .eq("user_id", userId).eq("day", today).maybeSingle();
    const used = usage?.message_count ?? 0;
    if (used >= DAILY_LIMIT) {
      const msg = language === "zh"
        ? `今天已经聊了 ${DAILY_LIMIT} 条啦，明天再来找小月吧 🌙`
        : `You've reached today's ${DAILY_LIMIT}-message limit. Come back tomorrow ✨`;
      return new Response(JSON.stringify({ error: "quota_exceeded", message: msg }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Find or create conversation ---
    let convId: string;
    const { data: existing } = await admin
      .from("tutor_conversations")
      .select("id")
      .eq("user_id", userId).eq("context", body.context).eq("question_ref", body.question_ref)
      .maybeSingle();

    if (existing?.id) {
      convId = existing.id;
      await admin.from("tutor_conversations")
        .update({ language, hint_level: hintLevel, question_snapshot: body.question_snapshot ?? {} })
        .eq("id", convId);
    } else {
      const { data: created, error: createErr } = await admin.from("tutor_conversations")
        .insert({
          user_id: userId,
          context: body.context,
          question_ref: body.question_ref,
          question_snapshot: body.question_snapshot ?? {},
          language, hint_level: hintLevel,
        }).select("id").single();
      if (createErr || !created) throw createErr ?? new Error("conv create failed");
      convId = created.id;
    }

    // --- Load history ---
    const { data: history } = await admin
      .from("tutor_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(40);

    const messages: ChatMsg[] = [
      { role: "system", content: buildSystemPrompt(language, body.question_snapshot ?? {}, hintLevel) },
      ...((history ?? []).map(h => ({ role: h.role as Role, content: h.content }))),
      { role: "user", content: body.user_message },
    ];

    // Persist user message + bump quota
    await admin.from("tutor_messages").insert({
      conversation_id: convId, user_id: userId,
      role: "user", content: body.user_message, hint_level: hintLevel,
    });
    await admin.from("tutor_usage_daily")
      .upsert({ user_id: userId, day: today, message_count: used + 1 }, { onConflict: "user_id,day" });

    // --- Call Lovable AI Gateway (streaming) ---
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee the stream: forward to client AND accumulate to persist final assistant message
    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    let leftover = "";

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        // Send a tiny header line so the client knows the conv id
        controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({ conversation_id: convId })}\n\n`));

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(value);

            leftover += chunk;
            let idx: number;
            while ((idx = leftover.indexOf("\n")) !== -1) {
              let line = leftover.slice(0, idx);
              leftover = leftover.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const j = line.slice(6).trim();
              if (j === "[DONE]") continue;
              try {
                const parsed = JSON.parse(j);
                const c = parsed.choices?.[0]?.delta?.content;
                if (typeof c === "string") assistantText += c;
              } catch { /* partial */ }
            }
          }
        } catch (e) {
          console.error("stream error", e);
        } finally {
          controller.close();
          if (assistantText.trim()) {
            try {
              await admin.from("tutor_messages").insert({
                conversation_id: convId, user_id: userId,
                role: "assistant", content: assistantText,
              });
            } catch (e) { console.error("persist assistant failed", e); }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("tutor-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});