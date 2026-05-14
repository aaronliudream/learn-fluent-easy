// Real-time AI question generator for a specific knowledge point.
// Reads cache first; calls Lovable AI Gateway when cache is short; persists results.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

// In-memory rate limit: same KP per process, 5 minutes
const recentGen = new Map<string, number>();

function fallbackQuestion(kp: any) {
  return {
    stem: `(示例) 关于「${kp.level3}」: Which option best matches the rule?`,
    option_a: "Option A",
    option_b: "Option B",
    option_c: "Option C",
    option_d: "Option D",
    correct_answer: "A",
    explanation: `参考策略：${kp.strategy || "—"}；常见陷阱：${kp.pitfall || "—"}`,
    context_scenario: "通用场景",
  };
}

async function callAI(kp: any, yearBand: number | null) {
  const sys = `你是高考英语命题专家。基于一个具体知识点，出一道符合高考水平的真实题目。
要求：
- 题目必须考查这个 KP 的核心能力，不能跑题
- 严格按照 pitfall 字段制造 1-2 个有迷惑性的干扰项
- 题目情境要真实生动，可以涉及生活、学习、社会话题
- 解析必须说清"为什么这个选项对 + 为什么其他选项错"
- 难度匹配 year_band（高一基础、高二中等、高三接近真题）
严格只输出 JSON。`;

  const user = `知识点：${kp.level3}
所属：${kp.skill_area} / ${kp.category_name || ""}
难度：${kp.difficulty || 3}
高考频率：${kp.exam_frequency || "—"}
year_band：${yearBand || kp.year_band || 2}
学这个考点要会的：${kp.example || "—"}
解题策略：${kp.strategy || "—"}
易错点：${kp.pitfall || "—"}

请输出 JSON：
{"stem":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A|B|C|D","explanation":"...","context_scenario":"≤15字情境"}`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { kp_id, year_band, count = 1, regenerate = false } = await req.json();
    if (!kp_id) {
      return new Response(JSON.stringify({ error: "kp_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const N = Math.max(1, Math.min(5, Number(count) || 1));
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: kp, error: kpErr } = await sb
      .from("v_gaokao_all_knowledge_points")
      .select("*")
      .eq("id", kp_id)
      .maybeSingle();
    if (kpErr || !kp) {
      return new Response(JSON.stringify({ error: "kp not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!regenerate) {
      const { data: cached } = await sb
        .from("ai_generated_questions")
        .select("*")
        .eq("kp_id", kp_id)
        .lt("used_count", 3)
        .order("used_count", { ascending: true })
        .limit(N);
      if (cached && cached.length >= N) {
        await sb.from("ai_generated_questions")
          .update({ used_count: (cached[0].used_count || 0) + 1 })
          .in("id", cached.map((c: any) => c.id));
        return new Response(JSON.stringify({ questions: cached, source: "cache" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Rate limit
    const key = `${kp_id}`;
    const last = recentGen.get(key) || 0;
    if (Date.now() - last < 5 * 60 * 1000 && !regenerate) {
      const { data: anyCached } = await sb
        .from("ai_generated_questions").select("*").eq("kp_id", kp_id).limit(N);
      if (anyCached && anyCached.length) {
        return new Response(JSON.stringify({ questions: anyCached, source: "rate_limited_cache" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    recentGen.set(key, Date.now());

    const generated: any[] = [];
    const promises = Array.from({ length: N }).map(async () => {
      try {
        return await callAI(kp, year_band);
      } catch (e) {
        console.error("AI gen failed:", e);
        return fallbackQuestion(kp);
      }
    });
    const results = await Promise.all(promises);

    for (const q of results) {
      const row = {
        kp_id,
        skill_area: kp.skill_area,
        year_band: year_band || kp.year_band,
        difficulty: kp.difficulty,
        question_type: "single",
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: (q.correct_answer || "A").toUpperCase().slice(0, 1),
        explanation: q.explanation || "",
        context_scenario: q.context_scenario || null,
        ai_model: MODEL,
      };
      const { data: inserted } = await sb
        .from("ai_generated_questions").insert(row).select().single();
      generated.push(inserted || row);
    }

    return new Response(JSON.stringify({ questions: generated, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});