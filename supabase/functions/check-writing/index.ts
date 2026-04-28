import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  prompt: string;
  promptCn?: string;
  sample?: string;
  text: string;
  lessonTitle?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, promptCn, sample, text, lessonTitle }: ReqBody = await req.json();
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "Empty text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `你是一位耐心、专业的英语老师，擅长帮助中文母语的英语学习者。\n请用中文给出反馈，语气友好鼓励。严格按照下面的 JSON Schema 输出结果，不要输出额外文字。`;

    const userMsg = `本课主题: ${lessonTitle ?? "(未提供)"}\n写作题目 (英文): ${prompt}\n写作题目 (中文): ${promptCn ?? ""}\n参考范文: ${sample ?? "(无)"}\n\n学生提交的英文写作:\n"""\n${text}\n"""\n\n请完成以下任务:\n1. 给出 0-100 的总体评分 (score)\n2. 用一句话给出整体评价 (overall, 中文)\n3. 列出具体错误 (mistakes), 每条包含: original (原句/原短语), corrected (修改后), explanation (中文讲解为什么错以及语法点)\n4. 给出 2-3 条改进建议 (suggestions, 中文)\n5. 给出一份润色后的完整版本 (improved, 英文)\n如果学生写得没有明显错误, mistakes 可以是空数组。`;

    const tool = {
      type: "function",
      function: {
        name: "writing_feedback",
        description: "Structured writing feedback for an English learner",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number" },
            overall: { type: "string" },
            mistakes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  corrected: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["original", "corrected", "explanation"],
                additionalProperties: false,
              },
            },
            suggestions: { type: "array", items: { type: "string" } },
            improved: { type: "string" },
          },
          required: ["score", "overall", "mistakes", "suggestions", "improved"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "writing_feedback" } },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用完，请补充后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "AI 返回格式异常" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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