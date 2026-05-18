import { createClient } from "npm:@supabase/supabase-js@2.49.4";

/**
 * pet-chat — short, safe conversations with the learner's companion pet.
 *
 * Guardrails (3 global risks):
 *  1) AI cost: check_and_consume_ai_quota('pet_chat') — daily call/token cap
 *  2) Child data: never echoes user PII; redacts phone/address/school in inputs
 *  3) AI safety: hard system rules + post-filter via ai_blocked_keywords
 *
 * Memory: last 10 turns from pet_chat_messages are sent for continuity.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PII_RE = /(住址|地址|address|phone|手机|电话|家在|学校叫|身份证|home location|\b\d{11}\b)/gi;
function redactPII(text: string): { safe: string; redacted: boolean } {
  if (!text) return { safe: text, redacted: false };
  const safe = text.replace(PII_RE, "[隐私已隐藏]");
  return { safe, redacted: safe !== text };
}

async function postFilter(sb: any, uid: string, text: string): Promise<{ safe: string; matched: string[] }> {
  if (!text) return { safe: text, matched: [] };
  const { data: kws } = await sb.from("ai_blocked_keywords").select("keyword");
  const matched: string[] = [];
  let safe = text;
  for (const row of (kws || [])) {
    const kw = String(row.keyword || "");
    if (!kw) continue;
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    if (re.test(safe)) { matched.push(kw); safe = safe.replace(re, "***"); }
  }
  if (matched.length > 0) {
    await sb.from("ai_safety_log").insert({
      user_id: uid, feature: "pet_chat", matched_keywords: matched, action_taken: "redacted",
    });
  }
  return { safe, matched };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "auth required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: u } = await sb.auth.getUser(token);
    const uid = u?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: "auth invalid" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const rawMessage = (body?.message ?? "").toString().slice(0, 500);
    if (!rawMessage.trim()) return new Response(JSON.stringify({ error: "empty message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Risk 2: redact user-side PII before storing or sending to LLM
    const { safe: cleanUser, redacted } = redactPII(rawMessage);

    // Risk 1: quota check
    const sbUser = createClient(SUPABASE_URL, SERVICE_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: quota } = await sbUser.rpc("check_and_consume_ai_quota", { _feature: "pet_chat", _estimated_tokens: 800 });
    const quotaRow = Array.isArray(quota) ? quota[0] : quota;
    if (quotaRow && quotaRow.allowed === false) {
      return new Response(JSON.stringify({
        error: "daily quota exceeded",
        message: "今日和宠物的对话次数已用完，明天再来吧 🌙",
        remaining_calls: quotaRow.remaining_calls,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Persona + recent memory
    const { data: pet } = await sb.rpc("get_my_active_pet").then((r: any) => ({ data: Array.isArray(r.data) ? r.data[0] : r.data }));
    const nickname = pet?.nickname || "小伙伴";
    const speciesId = pet?.species_id;
    let persona = "";
    if (speciesId) {
      const { data: traits } = await sb.from("pet_personality_traits")
        .select("ai_persona_prompt").eq("species_id", speciesId).maybeSingle();
      persona = traits?.ai_persona_prompt || "";
    }
    const { data: history } = await sb.from("pet_chat_messages")
      .select("role,content").eq("user_id", uid).order("created_at", { ascending: false }).limit(10);
    const past = (history || []).reverse().map((m: any) => ({ role: m.role, content: m.content }));

    if (!GOOGLE_AI_API_KEY) return new Response(JSON.stringify({ error: "GOOGLE_AI_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const safetyRules = `
SAFETY RULES (must follow strictly):
- You are a learning companion for kids/teens. Be warm, encouraging, age-appropriate.
- Reply in 1-3 short sentences (≤ 60 Chinese chars), then optionally one tiny English example.
- NEVER mention politics, religion, war, violence, sex, self-harm, drugs, alcohol, real people, or any country/leader.
- NEVER ask for or repeat real name, phone, address, school, or location.
- If the user seems sad or in distress, gently suggest talking to a trusted adult.
- Stay in character as ${nickname}.`;
    const sys = `${persona || "你是一只温暖、积极、可爱的电子学习宠物。"}\n${safetyRules}`;

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GOOGLE_AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          ...past,
          { role: "user", content: cleanUser },
        ],
      }),
    });
    if (!r.ok) {
      if (r.status === 429) return new Response(JSON.stringify({ error: "AI rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await r.text();
      return new Response(JSON.stringify({ error: t }), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const reply = (j?.choices?.[0]?.message?.content ?? "").toString();

    // Risk 3: post-filter
    const { safe: cleanReply, matched } = await postFilter(sb, uid, reply);

    // Persist (user + assistant)
    await sb.from("pet_chat_messages").insert([
      { user_id: uid, pet_id: pet?.id ?? null, role: "user", content: cleanUser, redacted },
      { user_id: uid, pet_id: pet?.id ?? null, role: "assistant", content: cleanReply, redacted: matched.length > 0 },
    ]);

    return new Response(JSON.stringify({
      reply: cleanReply,
      pet_nickname: nickname,
      remaining_calls: quotaRow?.remaining_calls,
      redacted_user_pii: redacted,
      filtered_keywords_count: matched.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});