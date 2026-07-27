import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  reference: string; // the original sentence
  attempt: string; // what the user typed
}

/* Lightweight token diff used as a fast fallback if AI fails. */
function quickDiff(ref: string, att: string) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  const r = norm(ref);
  const a = norm(att);
  let correct = 0;
  const max = Math.max(r.length, a.length);
  for (let i = 0; i < Math.min(r.length, a.length); i++) {
    if (r[i] === a[i]) correct++;
  }
  const score = max === 0 ? 0 : Math.round((correct / max) * 100);
  return { score, refTokens: r, attTokens: a };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, attempt }: ReqBody = await req.json();
    if (!reference?.trim() || !attempt?.trim()) {
      return new Response(
        JSON.stringify({ error: "reference 和 attempt 都不能为空" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const fallback = quickDiff(reference, attempt);

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          score: fallback.score,
          comment: "未配置 AI，使用本地评分",
          mistakes: [],
          corrected: reference,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system =
      "你是一位耐心的英语听写老师。学生听到一句英文后写出他听到的内容。请对比参考答案和学生作答，给出 0-100 的相似度分数（标点和大小写差异忽略不计，主要看单词正确性和顺序），并指出明显错误（拼写错、漏词、多词、词形错误）。注意：如果学生作答与参考意思一致但用了同义词或重新组织，也可酌情给高分（70-85）。严格只返回 JSON Schema 结果，不要其它说明。";

    const userMsg = `参考句子：\n"${reference}"\n\n学生听写：\n"${attempt}"\n\n请评分并指出错误。`;

    const tool = {
      type: "function",
      function: {
        name: "dictation_feedback",
        description: "Score and diff a dictation attempt vs the reference sentence.",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number", description: "0-100 similarity score" },
            comment: { type: "string", description: "一句话总评（中文）" },
            mistakes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  expected: { type: "string", description: "正确单词或片段" },
                  got: { type: "string", description: "学生写错的内容；漏词时为空" },
                  hint: { type: "string", description: "中文简短说明" },
                },
                required: ["expected", "got", "hint"],
                additionalProperties: false,
              },
            },
            corrected: { type: "string", description: "修正后的英文句子" },
          },
          required: ["score", "comment", "mistakes", "corrected"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          tools: [tool],
          tool_choice: {
            type: "function",
            function: { name: "dictation_feedback" },
          },
        }),
      },
    );

    if (!resp.ok) {
      const errText = await resp.text();
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 额度已用完，请补充后再试" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // Fall back to local score on other AI errors.
      console.error("AI gateway error", errText);
      return new Response(
        JSON.stringify({
          score: fallback.score,
          comment: "AI 暂时不可用，已使用本地评分",
          mistakes: [],
          corrected: reference,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    let parsed: unknown = null;
    if (args) {
      try {
        parsed = typeof args === "string" ? JSON.parse(args) : args;
      } catch (_e) {
        parsed = null;
      }
    }
    if (!parsed) {
      return new Response(
        JSON.stringify({
          score: fallback.score,
          comment: "AI 返回格式异常，已使用本地评分",
          mistakes: [],
          corrected: reference,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});