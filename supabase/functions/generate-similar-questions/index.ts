// Generate 5 similar practice questions based on an original mistake.
// Uses Lovable AI Gateway. Returns JSON { questions: [{ question, options?, correct_answer, explanation }] }
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { module, source_label, question, correct_answer, explanation, snapshot } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = `你是一位资深英语命题老师。根据用户的"原错题"，生成 5 道考查同一知识点 / 同一类型 / 同等难度的"相似题"，用于巩固训练。
严格输出 JSON：{"questions":[{"question":"题干（含选项请用 (A)/(B)/(C)/(D) 内嵌）","options":["A. ...","B. ...","C. ...","D. ..."],"correct_answer":"B. ...","explanation":"中文一句话解析"}]}
- 若原题不是选择题，options 可省略，correct_answer 给出标准答案。
- 每题独立、不要重复原题。中文题面+英文选项最自然。`;

    const userMsg = `【原错题】
模块：${module || "未知"}
来源：${source_label || "—"}
题目：${question}
正确答案：${correct_answer || "—"}
解析：${explanation || "—"}
附加：${JSON.stringify(snapshot || {}).slice(0, 1200)}

请生成 5 道同考点相似题。`;

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
      return new Response(JSON.stringify({ error: `ai gateway ${r.status}: ${txt.slice(0, 200)}` }), {
        status: r.status === 429 || r.status === 402 ? r.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { questions: [] }; }
    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : [];
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});