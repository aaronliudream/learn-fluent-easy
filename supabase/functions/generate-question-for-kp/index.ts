// Real-time AI question generator for a specific knowledge point.
// Reads cache first; calls Lovable AI Gateway when cache is short; persists results.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const MODEL = "gpt-4o-mini";

// In-memory rate limit: same KP per process, 5 minutes
const recentGen = new Map<string, number>();

interface RequestBody {
  kp_id: string;
  year_band?: number;
  count?: number;
  regenerate?: boolean;
  exclude_themes?: string[];     // 已用过的情境主题
  exclude_keywords?: string[];   // 已用过的关键测试点
}

const SCENARIO_POOL = [
  "校园新闻", "旅行见闻", "工作场景", "体育报道",
  "文化习俗", "时事新闻", "日常对话", "家庭生活",
  "社团活动", "环保话题", "科技产品", "美食探店",
];

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

async function callAI(
  kp: any,
  yearBand: number | null,
  excludeThemes: string[],
  excludeKeywords: string[],
  variantHint: string,
) {
  const sys = `你是高考英语命题专家。基于一个具体知识点，出一道符合高考水平的真实题目。

【强制要求】
1. 题目必须考查这个 KP 的核心能力，但要变换具体测试点。
   例如 KP 是"单复数同形名词"，每次要换不同的词（species/sheep/fish/deer/means/headquarters/series/aircraft/Chinese/Japanese 等），不要总用 example 字段里给的那个词。
2. 题目情境必须真实生动且每次不同：校园新闻 / 旅行见闻 / 工作场景 / 体育报道 / 文化习俗 / 时事话题 / 日常对话 / 家庭生活 / 社团活动 / 环保话题 / 科技产品 / 美食探店。
3. 严格按 pitfall 制造干扰项。
4. 解析必须用中文，100-200 字，先讲对的选项为什么对（含语法/词义点），再依次讲 2-3 个干扰项错在哪。引用英文单词或术语时用英文引号包裹（如 "species"、"a lot of"）。
5. 难度匹配 year_band（高一基础、高二中等、高三接近真题）。

【避免重复】
- 当用户传入 exclude_keywords 时，新题的"正确答案对应的核心词"必须不在该列表里。
- 当用户传入 exclude_themes 时，情境主题与列表里的不同。
- stem 表达方式与已有题目不同。

严格只输出 JSON，不要 markdown 代码块。`;

  const excludeKwLine = excludeKeywords.length
    ? `【禁止再用这些核心词】：${excludeKeywords.map((k) => `"${k}"`).join("、")}（必须换别的词来考同一个 KP）`
    : "【尚无已用核心词】，请自由挑选一个该 KP 下的常考词。";

  const excludeThemeLine = excludeThemes.length
    ? `【禁止再用这些情境】：${excludeThemes.join("、")}`
    : "【尚无已用情境】";

  const user = `知识点：${kp.level3}
所属：${kp.skill_area} / ${kp.category_name || ""}
难度：${kp.difficulty || 3}
高考频率：${kp.exam_frequency || "—"}
year_band：${yearBand || kp.year_band || 2}
学这个考点要会的能力（仅作参考，不要照抄例子）：${kp.example || "—"}
解题策略：${kp.strategy || "—"}
易错点：${kp.pitfall || "—"}

${excludeKwLine}
${excludeThemeLine}
本次建议情境方向：${variantHint}

请生成一道全新主题、考不同具体词/点的题目。

输出 JSON：
{"stem":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A|B|C|D","explanation":"中文解析 100-200 字","context_scenario":"≤15字情境","tested_keyword":"本题考的核心词或短语"}`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      temperature: 0.95,
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
    const body = (await req.json()) as RequestBody;
    const { kp_id, year_band, count = 1, regenerate = false } = body;
    const excludeThemesIn = Array.isArray(body.exclude_themes) ? body.exclude_themes : [];
    const excludeKeywordsIn = Array.isArray(body.exclude_keywords) ? body.exclude_keywords : [];

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

    // Auto-augment exclude lists from DB so we never repeat what already exists for this KP.
    const { data: priorRows } = await sb
      .from("ai_generated_questions")
      .select("context_scenario, stem, correct_answer, option_a, option_b, option_c, option_d")
      .eq("kp_id", kp_id)
      .order("created_at", { ascending: false })
      .limit(8);

    const themeSet = new Set<string>(excludeThemesIn.filter(Boolean));
    const kwSet = new Set<string>(excludeKeywordsIn.filter(Boolean).map((s) => s.toLowerCase()));
    for (const row of priorRows || []) {
      if (row.context_scenario) themeSet.add(row.context_scenario);
      const correctOpt = row[`option_${(row.correct_answer || "a").toLowerCase()}` as keyof typeof row] as string | undefined;
      if (correctOpt) kwSet.add(String(correctOpt).trim().toLowerCase());
    }
    const excludeThemes = Array.from(themeSet).slice(0, 12);
    const excludeKeywords = Array.from(kwSet).slice(0, 20);

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

    // Sequential generation so each new prompt sees the previously generated keywords too.
    const generated: any[] = [];
    const liveExcludeThemes = [...excludeThemes];
    const liveExcludeKeywords = [...excludeKeywords];

    for (let i = 0; i < N; i++) {
      const variantHint = SCENARIO_POOL[(Date.now() + i) % SCENARIO_POOL.length];
      let q: any;
      try {
        q = await callAI(kp, year_band || null, liveExcludeThemes, liveExcludeKeywords, variantHint);
      } catch (e) {
        console.error("AI gen failed:", e);
        q = fallbackQuestion(kp);
      }

      const correctLetter = (q.correct_answer || "A").toUpperCase().slice(0, 1);
      const correctOpt = q[`option_${correctLetter.toLowerCase()}`];
      const testedKw = (q.tested_keyword || correctOpt || "").toString().trim();
      if (testedKw) liveExcludeKeywords.push(testedKw.toLowerCase());
      if (q.context_scenario) liveExcludeThemes.push(q.context_scenario);

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
        correct_answer: correctLetter,
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
