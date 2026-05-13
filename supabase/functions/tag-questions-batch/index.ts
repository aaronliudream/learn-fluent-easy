// One-shot AI tagging: assign exam_year / exam_source / knowledge_point to questions.
// Admin-triggered (call manually). Module: 'gaokao_reading_article' (default).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type KP = { id: string; level3: string; category_name: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const sbUrl = Deno.env.get("SUPABASE_URL")!;
    const sbSrv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(sbUrl, sbSrv);
    const body = await req.json().catch(() => ({}));
    const module = (body?.module as string) || "gaokao_reading_article";
    const limit = Math.max(1, Math.min(50, Number(body?.limit) || 20));

    // Load knowledge points pool (truncated to keep prompt small)
    const { data: kpRows } = await sb
      .from("gaokao_reading_knowledge_points")
      .select("id, level3, category_name")
      .limit(200);
    const kps: KP[] = (kpRows || []) as KP[];
    const kpList = kps
      .map((k) => `- ${k.id} | ${k.category_name} · ${k.level3}`)
      .join("\n");

    // Pull untagged questions
    let questions: any[] = [];
    if (module === "gaokao_reading_article") {
      const { data } = await sb
        .from("gaokao_reading_article_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, general_explanation, question_type, question_type_cn, article_id, gaokao_reading_articles!inner(title, year, source)")
        .limit(500);
      const all = (data || []) as any[];
      const { data: tagged } = await sb
        .from("question_exam_tags")
        .select("question_id")
        .eq("module", module);
      const taggedSet = new Set((tagged || []).map((r: any) => r.question_id));
      questions = all.filter((q) => !taggedSet.has(q.id)).slice(0, limit);
    } else {
      return new Response(JSON.stringify({ error: `unsupported module: ${module}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (questions.length === 0) {
      return new Response(JSON.stringify({ message: "nothing to tag", tagged: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = `你是高考英语命题专家。你会拿到一道阅读题，需要：
1) 推断它最可能源自哪一年的什么试卷（如 2023 全国甲卷 / 新高考Ⅰ卷；不确定就给最可能的猜测，并把 confidence 调低）。如题目明显是改编/原创，exam_source 写"AI 仿真题"，exam_year 留空。
2) 从给定的知识点列表中选出最贴切的一个 id。如果列表里没有非常贴切的，返回 knowledge_point_id 为 null，并在 knowledge_point_label 里给一个简短中文标签（如"主旨大意 · 段落中心句定位"）。
严格只输出 JSON：{"results":[{"question_id":"...","exam_year":2023|null,"exam_source":"...","knowledge_point_id":"uuid|null","knowledge_point_label":"...","confidence":0.0-1.0}]}`;

    const userMsg = `【可选知识点（id | 类目·三级标签）】
${kpList}

【待标注题目（共 ${questions.length} 道）】
${questions.map((q) => {
      const art = q.gaokao_reading_articles || {};
      return `---
question_id: ${q.id}
所属文章: ${art.title || ""} (${art.year || "?"} ${art.source || ""})
题型: ${q.question_type_cn || q.question_type}
题干: ${q.stem}
A. ${q.option_a}
B. ${q.option_b}
C. ${q.option_c}
D. ${q.option_d}
正确答案: ${q.correct_answer}
解析: ${(q.general_explanation || "").slice(0, 300)}`;
    }).join("\n")}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: `ai gateway ${r.status}: ${txt.slice(0, 300)}` }), {
        status: r.status === 429 || r.status === 402 ? r.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { results: [] }; }
    const results: any[] = Array.isArray(parsed.results) ? parsed.results : [];

    let okCount = 0;
    for (const r0 of results) {
      if (!r0?.question_id) continue;
      const q = questions.find((x) => x.id === r0.question_id);
      const fallbackYear = q?.gaokao_reading_articles?.year || null;
      const fallbackSrc = q?.gaokao_reading_articles?.source || null;
      const upsert = {
        module,
        question_id: r0.question_id,
        exam_year: r0.exam_year ?? fallbackYear,
        exam_source: r0.exam_source || fallbackSrc || "AI 仿真题",
        knowledge_point_id: r0.knowledge_point_id || null,
        knowledge_point_label: r0.knowledge_point_label || null,
        confidence: typeof r0.confidence === "number" ? r0.confidence : 0.7,
        raw: r0,
      };
      const { error } = await sb.from("question_exam_tags").upsert(upsert, { onConflict: "module,question_id" });
      if (!error) okCount++;
    }

    return new Response(JSON.stringify({ tagged: okCount, requested: questions.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});