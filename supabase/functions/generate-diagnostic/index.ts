// generate-diagnostic — AI 诊断引擎（6 层省 token）
// 1. 24h 缓存（ai_diagnostics）
// 2. 模板兜底（数据极少时不调用 AI）
// 3. 智能失效（由 record-attempt 触发）
// 4. Prompt 摘要（仅传聚合后的 weak_top3 / module 弱项）
// 5. Lite 模型（默认 google/gemini-2.5-flash-lite）
// 6. DB 预聚合函数 get_diagnostic_summary（不在 AI 端做计算）

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MODEL_LITE = "gpt-4o-mini";
const CACHE_TTL_HOURS = 24;
const MIN_ATTEMPTS_FOR_AI = 50; // 不足则走模板

interface DiagSummaryRaw {
  total: number;
  master_count: number;
  master_pct: number;
  weak_count: number;
  none_count: number;
  due_count: number;
  recent_attempt_count: number;
  weak_top3: Array<{ label: string; module: string; stage: string; grade: number; wrong_count: number }>;
  none_by_module: Array<{ module: string; count: number }>;
}
interface ModuleStat { module: string; master: number; weak: number; none: number; total: number; accuracy: number }
interface DiagSummary extends DiagSummaryRaw { modules: ModuleStat[] }

function templateInsights(s: DiagSummary, lang: "zh" | "en") {
  const weakModules = s.modules
    .filter((m) => m.accuracy < 0.7 || m.weak > m.master)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);
  const strongModules = s.modules
    .filter((m) => m.accuracy >= 0.85 && m.master > 0)
    .slice(0, 1);

  const tips: string[] = [];
  if (s.recent_attempt_count < 5) {
    tips.push("先完成几个模块的练习，AI 才能给出针对性诊断 ✨");
  } else {
    if (weakModules.length) {
      for (const m of weakModules) {
        const acc = Math.round(m.accuracy * 100);
        tips.push(`📍 ${moduleCn(m.module)} 准确率 ${acc}% · 建议每天 10 分钟集中突破`);
      }
    }
    if (s.weak_top3.length) {
      const top = s.weak_top3[0];
      tips.push(`🎯 优先攻克：${top.label}（错 ${top.wrong_count} 次）`);
    }
    if (strongModules.length) {
      tips.push(`💪 强项：${moduleCn(strongModules[0].module)} · 可冲刺更难内容`);
    }
  }

  return {
    summary: `已掌握 ${s.master_pct ?? 0}% · ${s.total ?? 0} 个知识点 · 近 30 天 ${s.recent_attempt_count ?? 0} 次练习`,
    insights: tips,
    expected_gain: Math.min(15, Math.round((100 - (s.master_pct ?? 0)) * 0.15)),
    weak_modules: weakModules.map((m) => m.module),
    source: "template" as const,
  };
}

function moduleCn(m: string) {
  return ({ vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力", writing: "写作", cloze: "完形", phonics: "拼读" } as Record<string, string>)[m] || m;
}

async function callLovableAI(summary: DiagSummary): Promise<any> {
  // 极简 prompt — 只传聚合摘要，不传明细
  const prompt = `学情数据：
总掌握度 ${summary.master_pct}% · 知识点 ${summary.total} · 近 30 天练习 ${summary.recent_attempt_count} 次

各模块表现：
${summary.modules.map((m) => `- ${moduleCn(m.module)}：master ${m.master} · weak ${m.weak} · none ${m.none} · 准确率 ${Math.round(m.accuracy * 100)}%`).join("\n")}

最弱 3 个知识点：
${summary.weak_top3.map((w, i) => `${i + 1}. ${w.label}（${moduleCn(w.module)}，错 ${w.wrong_count} 次）`).join("\n")}

请用中文输出 JSON：{ "insights": ["建议1","建议2","建议3"], "expected_gain": 数字(0-20，预计本周可提升的百分点) }
建议要具体、克制、可执行，每条 ≤ 30 字。只回 JSON。`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": OPENAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_LITE,
      messages: [
        { role: "system", content: "你是英语学习诊断助手。只回紧凑 JSON。" },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`gateway_${res.status}: ${t.slice(0, 200)}`);
  }
  const j = await res.json();
  const tokens_used = j.usage?.total_tokens || 0;
  let parsed: any = {};
  try { parsed = JSON.parse(j.choices[0].message.content); } catch {}
  return { parsed, tokens_used };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = u.user.id;

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // ── Layer 1: 24h cache ─────────────────────────
    if (!force) {
      const { data: cached } = await admin
        .from("ai_diagnostics")
        .select("*")
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cached) {
        await admin.from("ai_diagnostic_logs").insert({
          user_id: userId, was_cached: true, was_template: false, tokens_used: 0,
        });
        return new Response(JSON.stringify({ ...cached, source: "cache" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Layer 6: DB 预聚合 ─────────────────────────
    const { data: summary, error: sErr } = await admin.rpc("get_diagnostic_summary", { p_user_id: userId });
    if (sErr) throw sErr;
    const raw = (summary as unknown as DiagSummaryRaw) || ({} as DiagSummaryRaw);

    // 补充 per-module 统计（轻量查询，不占 AI token）
    const { data: modRows } = await admin
      .from("mastery_by_module_overall")
      .select("module, master, weak, none, total, score_pct")
      .eq("user_id", userId);
    const modules: ModuleStat[] = (modRows || []).map((r: any) => ({
      module: r.module,
      master: Number(r.master) || 0,
      weak: Number(r.weak) || 0,
      none: Number(r.none) || 0,
      total: Number(r.total) || 0,
      accuracy: (Number(r.score_pct) || 0) / 100,
    }));
    const s: DiagSummary = {
      total: raw.total ?? 0,
      master_count: raw.master_count ?? 0,
      master_pct: raw.master_pct ?? 0,
      weak_count: raw.weak_count ?? 0,
      none_count: raw.none_count ?? 0,
      due_count: raw.due_count ?? 0,
      recent_attempt_count: raw.recent_attempt_count ?? 0,
      weak_top3: raw.weak_top3 ?? [],
      none_by_module: raw.none_by_module ?? [],
      modules,
    };

    let result: any;
    let was_template = false;
    let tokens_used = 0;

    // ── Layer 2: 模板兜底 ──────────────────────────
    if (!s || s.recent_attempt_count < MIN_ATTEMPTS_FOR_AI) {
      result = templateInsights(s, "zh");
      was_template = true;
    } else {
      // ── Layer 4 + 5: 摘要 prompt + lite 模型 ────
      try {
        const ai = await callLovableAI(s);
        tokens_used = ai.tokens_used;
        const tpl = templateInsights(s, "zh");
        result = {
          summary: tpl.summary,
          insights: Array.isArray(ai.parsed?.insights) && ai.parsed.insights.length ? ai.parsed.insights : tpl.insights,
          expected_gain: typeof ai.parsed?.expected_gain === "number" ? ai.parsed.expected_gain : tpl.expected_gain,
          weak_modules: tpl.weak_modules,
          source: "ai" as const,
        };
      } catch (err) {
        console.warn("[generate-diagnostic] AI failed, fallback to template", err);
        result = templateInsights(s, "zh");
        was_template = true;
      }
    }

    // 写入缓存
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600 * 1000).toISOString();
    const { data: saved } = await admin.from("ai_diagnostics").insert({
      user_id: userId,
      summary: result.summary,
      insights: result,
      expected_gain: result.expected_gain,
      expires_at: expiresAt,
    }).select().maybeSingle();

    await admin.from("ai_diagnostic_logs").insert({
      user_id: userId,
      was_cached: false,
      was_template,
      tokens_used,
      model_used: was_template ? "template" : MODEL_LITE,
    });

    return new Response(JSON.stringify({ ...(saved || {}), ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[generate-diagnostic] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});