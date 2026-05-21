// Generate 3 targeted practice questions for a specific knowledge point.
// Difficulty escalates with round (1→2→3). Round 2/3 use the user's prior wrong distractors.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing GOOGLE_AI_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const {
      knowledge_point_label,
      knowledge_point_strategy,
      knowledge_point_pitfall,
      source_question,
      user_wrong_option,
      user_explanation_attempt,
      round = 1,
      previous_wrong = [],
      exam_level = "gaokao",
      section = "",
    } = await req.json();

    const r0 = Math.max(1, Math.min(3, Number(round) || 1));
    const difficultyHint = r0 === 1 ? "中等" : r0 === 2 ? "中等偏难" : "较难（陷阱密度高）";
    const isJunior = exam_level === "junior_suzhou";

    const sectionHints: Record<string, string> = {
      grammar: "单项填空：一个含空格的英文句子 + 四选项 A/B/C/D（passage 可留空或给整句语境）",
      cloze: "完形填空：80~120 词短文节选 + 单句题干 + A/B/C/D",
      reading: "阅读理解：80~120 词英文段落 + 单选 A/B/C/D",
      restore: "信息还原：对话上下文节选 + 选最佳答句 A/B/C/D",
    };
    const sectionHint = sectionHints[String(section)] || (isJunior
      ? "苏州中考英语单选题 A/B/C/D"
      : "阅读理解单选 A/B/C/D");

    const sys = isJunior
      ? `你是一位苏州市中考英语命题专家。任务：围绕"同一个考点"，生成 3 道全新的针对性练习题，帮助初三学生彻底掌握。
严格遵守：
- 3 题题型一致、考查同一知识点，难度对标苏州中考（${difficultyHint}）。
- 题型要求：${sectionHint}
- 必须避免与"已用错项"语义重复。
- 每题给出 correct (A/B/C/D)、中文解析 explanation（≤80字）、陷阱 trap（一句话）。
- 语言地道，符合中国初中英语水平。
严格只输出 JSON：{"items":[{"passage":"...","stem":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","trap":"..."}]}`
      : `你是一位顶级高考英语命题专家。任务：围绕"同一个考点"，生成 3 道全新的英语阅读理解小题（含 80~120 词的英文小段落 + 单选 4 项 ABCD），帮助学生彻底掌握。
严格遵守：
- 3 题题型一致、考查同一知识点。
- 难度：${difficultyHint}。
- 必须避免与"已用错项"语义重复。
- 每题给出 correct_answer (A/B/C/D)，以及一句话中文解析（≤80字），并指出该题"陷阱"。
- 段落要自然地道，主题多样化（科普/人物/教育/环保都可）。
严格只输出 JSON：{"items":[{"passage":"...","stem":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","trap":"..."}]}`;

    const userMsg = `【考点】
${knowledge_point_label || "未提供"}
策略：${knowledge_point_strategy || "—"}
常见陷阱：${knowledge_point_pitfall || "—"}

【学生原错题】
${(source_question || "").slice(0, 800)}
学生选了：${user_wrong_option || "—"}
学生自述：${(user_explanation_attempt || "").slice(0, 300) || "（无）"}

【已用过的错项语义，不要重复】
${(previous_wrong || []).slice(0, 12).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n") || "（首轮）"}

【轮次】第 ${r0} 轮（共最多 3 轮）
请生成 3 道针对性练习。`;

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
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
    try { parsed = JSON.parse(content); } catch { parsed = { items: [] }; }
    const items = Array.isArray(parsed.items) ? parsed.items.slice(0, 3) : [];
    return new Response(JSON.stringify({ items, round: r0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});