// Edge function: explain-mistake
// Deep AI explanation for a vocabulary word the user just got wrong.
// Returns: etymology (词根), mnemonic (口诀), differentiation (辨析 vs 易混词), tips, examples.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  word: string;
  meaning_cn: string;
  pos?: string | null;
  example_en?: string | null;
  example_cn?: string | null;
  user_answer?: string | null;
  question_kind?: string | null; // "spell" | "en2cn" | "cn2en" | ...
  similar_words?: string[];      // optional: words user has confused this with
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.word || !body?.meaning_cn) {
      return new Response(
        JSON.stringify({ error: "word and meaning_cn are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `单词：${body.word}
释义：${body.meaning_cn}
${body.pos ? `词性：${body.pos}\n` : ""}${body.example_en ? `例句：${body.example_en}\n` : ""}${body.example_cn ? `例句翻译：${body.example_cn}\n` : ""}${body.user_answer ? `学生的错误答案：${body.user_answer}\n` : ""}${body.question_kind ? `题型：${body.question_kind}\n` : ""}${body.similar_words?.length ? `易混淆参考词：${body.similar_words.join(", ")}\n` : ""}
请基于以上信息生成中文深度讲解，帮助高考学生彻底记住这个词。`;

    const systemPrompt =
      `你是一位顶尖的高考英语词汇教学专家，擅长用词根词缀、形象口诀和辨析对比帮学生彻底记住单词。` +
      `务必使用中文输出（专业术语保留英文）。讲解要简洁、生动、可记忆，不要套话。` +
      `若是抽象单词，请提供具体生活场景化的记忆方法。`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deep_explain",
              description: "Return a structured deep explanation for a vocabulary word.",
              parameters: {
                type: "object",
                properties: {
                  etymology: {
                    type: "string",
                    description:
                      "词根 / 词缀 / 词源解释。例如 'tele- 远 + vision 看 → 电视'。如果该词没有明显词根，给出形近词或字面拆分提示。1-2 句话。",
                  },
                  mnemonic: {
                    type: "string",
                    description:
                      "形象记忆口诀 / 谐音 / 故事联想。要好玩易记。例如 'ambulance 谐音「俺不能死」→ 救护车'。1-2 句话。",
                  },
                  differentiation: {
                    type: "array",
                    description:
                      "和易混词、近义词、形近词的辨析。最多 3 条。",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string", description: "易混词本身" },
                        diff: { type: "string", description: "区别要点（中文，1 句）" },
                      },
                      required: ["word", "diff"],
                    },
                  },
                  collocations: {
                    type: "array",
                    description: "高考常考搭配 / 短语，最多 4 个。每项是英文搭配（可加简短中文）。",
                    items: { type: "string" },
                  },
                  example: {
                    type: "object",
                    description: "一个高考风格的英文例句 + 中文翻译，要简短有画面感。",
                    properties: {
                      en: { type: "string" },
                      cn: { type: "string" },
                    },
                    required: ["en", "cn"],
                  },
                  tip: {
                    type: "string",
                    description: "针对学生这次错误的一句话提醒。例如 '注意 -ence 不是 -ance'。",
                  },
                },
                required: ["etymology", "mnemonic", "differentiation", "example", "tip"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deep_explain" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "AI 请求过于频繁，请稍后再试。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足，请联系管理员充值。" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI 调用失败" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call args:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "AI 未返回结构化结果" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(argsStr);
    } catch (e) {
      console.error("parse error:", e, argsStr);
      return new Response(JSON.stringify({ error: "AI 结果解析失败" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ explanation: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explain-mistake error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
