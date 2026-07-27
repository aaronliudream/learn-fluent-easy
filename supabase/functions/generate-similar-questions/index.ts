// Generate 5 similar practice questions based on an original mistake.
// Uses Google Gemini (OpenAI-compatible endpoint). Returns { questions: [{ question, options?, correct_answer, explanation }] }.
//
// 稳健性(修部分题报 "Failed to send a request to the Edge Function"):
//   该报错是 supabase-js 的 FunctionsFetchError = 函数无响应 = **超时/中途被杀**(不是 4xx/5xx,
//   那会带响应)。根因:gemini-2.5-flash 是 thinking 模型,对复杂语法点生成偶发耗时过长 → 超时。
//   对策:① 每次请求 AbortController 45s 超时护栏(超时→清晰 JSON 错误,不再 opaque FetchError);
//         ② 两级重试:首试 flash(保质量),失败/超时则用 flash-lite(低延迟兜救);
//         ③ console.log 全程埋点(入参题干/尝试轮次/模型/gemini状态/耗时/内容长度)→ 日志定位。
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ATTEMPTS = [
  { model: "gpt-4o-mini", timeoutMs: 45_000 }, // 首试:质量优先
  { model: "gpt-4o-mini", timeoutMs: 30_000 }, // 兜救:低延迟(thinking 更少)
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const { module, source_label, question, correct_answer, explanation, snapshot } = await req.json();
    const qLog = String(question ?? "").slice(0, 80);
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("[similar] missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ error: "missing OPENAI_API_KEY" }), {
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

    let lastErr = "";
    for (let i = 0; i < ATTEMPTS.length; i++) {
      const { model, timeoutMs } = ATTEMPTS[i];
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const ta = Date.now();
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userMsg },
            ],
            response_format: { type: "json_object" },
            max_tokens: 2048,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);

        if (!r.ok) {
          const txt = await r.text();
          lastErr = `ai gateway ${r.status}: ${txt.slice(0, 200)}`;
          console.error(`[similar] attempt ${i + 1}/${ATTEMPTS.length} model=${model} q="${qLog}" HTTP ${r.status} in ${Date.now() - ta}ms :: ${txt.slice(0, 160)}`);
          // 429/402(限流/额度)重试也无益 → 直接透传给前端。
          if (r.status === 429 || r.status === 402) {
            return new Response(JSON.stringify({ error: lastErr }), {
              status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          continue; // 其它 5xx → 下一个模型兜救
        }

        const data = await r.json();
        const content = data?.choices?.[0]?.message?.content || "{}";
        let parsed: { questions?: unknown } = {};
        try { parsed = JSON.parse(content); } catch { parsed = { questions: [] }; }
        const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : [];
        console.log(`[similar] OK attempt ${i + 1} model=${model} q="${qLog}" -> ${questions.length} 题 in ${Date.now() - ta}ms (total ${Date.now() - t0}ms)`);
        if (questions.length === 0) {
          lastErr = "AI 返回空题(可能被安全策略拦截或格式异常)";
          continue; // 空返回 → 换模型再试一次
        }
        return new Response(JSON.stringify({ questions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        clearTimeout(timer);
        const aborted = e instanceof DOMException && e.name === "AbortError";
        lastErr = aborted ? `模型 ${model} 生成超时(>${timeoutMs / 1000}s)` : String((e as Error)?.message || e);
        console.error(`[similar] attempt ${i + 1}/${ATTEMPTS.length} model=${model} q="${qLog}" ${aborted ? "TIMEOUT" : "ERROR"} in ${Date.now() - ta}ms :: ${lastErr}`);
        // 继续下一个模型兜救
      }
    }

    // 全部尝试失败 → 明确 500(带原因),前端可展示、日志已记录,不再是 opaque FetchError。
    console.error(`[similar] ALL attempts failed q="${qLog}" total ${Date.now() - t0}ms :: ${lastErr}`);
    return new Response(JSON.stringify({ error: `AI 出题失败:${lastErr}。请重试。` }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[similar] fatal", e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
