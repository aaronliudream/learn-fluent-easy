import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Generates (or returns cached) today's pet diary for the authenticated user.
 * Uses today's learning telemetry (coins, attempts) to compose a warm Chinese diary
 * written from the pet's perspective.
 */
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

    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await sb.from("pet_diaries").select("*").eq("user_id", uid).eq("diary_date", today).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ diary: existing, cached: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Telemetry
    const { data: coins } = await sb.from("daily_coin_log").select("earned").eq("user_id", uid).eq("log_date", today).maybeSingle();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const { count: gkAttempts } = await sb.from("gaokao_user_attempts").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", todayStart.toISOString());
    const { count: gkCorrect } = await sb.from("gaokao_user_attempts").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("is_correct", true).gte("created_at", todayStart.toISOString());
    const { data: pet } = await sb.rpc("get_my_active_pet").then((r: any) => ({ data: Array.isArray(r.data) ? r.data[0] : r.data }));
    const nickname = pet?.nickname || "小伙伴";
    const stage = pet?.stage ?? 1;
    const level = pet?.level ?? 1;

    if (!LOVABLE_KEY) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sys = "你是一只可爱、积极、温暖的电子学习宠物。用第一人称写一段中文日记，鼓励主人继续学习英语。语言活泼简短，5-7 句。最后输出 3 个 highlights。";
    const user = `今天主人的学习数据：
- 答题总数: ${gkAttempts ?? 0}
- 答对: ${gkCorrect ?? 0}
- 获得星币: ${coins?.earned ?? 0}
- 我的等级: Lv.${level} 阶段:${stage}
我的昵称: ${nickname}

请生成今日宠物日记，并提炼 3 条亮点（短语，每条 6-10 字）。`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        tools: [{ type: "function", function: { name: "diary", parameters: { type: "object", properties: { body_cn: { type: "string" }, highlights: { type: "array", items: { type: "string" } } }, required: ["body_cn", "highlights"] } } }],
        tool_choice: { type: "function", function: { name: "diary" } },
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: t }), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { body_cn: "", highlights: [] };

    const { data: inserted } = await sb.from("pet_diaries").insert({
      user_id: uid, diary_date: today, body_cn: parsed.body_cn,
      highlights: parsed.highlights, pet_nickname: nickname, pet_emoji: "🐾",
    }).select("*").single();

    return new Response(JSON.stringify({ diary: inserted, cached: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});