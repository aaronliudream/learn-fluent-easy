import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  title: string;
  levelName?: string;
  unitTitle?: string;
}

const lessonSchema = {
  type: "object",
  properties: {
    vocab: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          pron: { type: "string", description: "IPA in /…/" },
          meaning: { type: "string", description: "中文释义, 含词性" },
          example: { type: "string" },
          example_cn: { type: "string" },
        },
        required: ["word", "pron", "meaning", "example", "example_cn"],
        additionalProperties: false,
      },
    },
    reading: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          cn: { type: "string" },
        },
        required: ["en", "cn"],
        additionalProperties: false,
      },
    },
    grammar: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          explain: { type: "string", description: "中文讲解" },
          examples: {
            type: "array",
            minItems: 2,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                en: { type: "string" },
                cn: { type: "string" },
              },
              required: ["en", "cn"],
              additionalProperties: false,
            },
          },
        },
        required: ["title", "explain", "examples"],
        additionalProperties: false,
      },
    },
    expressions: {
      type: "array",
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          cn: { type: "string" },
          scene: { type: "string", description: "中文场景标签, 4-6 字" },
        },
        required: ["en", "cn", "scene"],
        additionalProperties: false,
      },
    },
    fillBlanks: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          sentence: { type: "string", description: "Use ___ for the blank" },
          cn: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          answer: { type: "string", description: "Must be one of options" },
        },
        required: ["sentence", "cn", "options", "answer"],
        additionalProperties: false,
      },
    },
    quiz: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          q: { type: "string", description: "English question about the reading" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          answer: { type: "number", description: "0-based index of correct option" },
        },
        required: ["q", "options", "answer"],
        additionalProperties: false,
      },
    },
    listening: {
      type: "object",
      properties: {
        audio: { type: "string", description: "Short paragraph (2-4 sentences) to read aloud" },
        blanks: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              before: { type: "string" },
              answer: { type: "string", description: "Single word from the audio" },
              after: { type: "string" },
            },
            required: ["before", "answer", "after"],
            additionalProperties: false,
          },
        },
      },
      required: ["audio", "blanks"],
      additionalProperties: false,
    },
    output: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "English writing task" },
        cn: { type: "string", description: "中文说明" },
        sample: { type: "string", description: "范文 3-5 句, 自然口语" },
      },
      required: ["prompt", "cn", "sample"],
      additionalProperties: false,
    },
  },
  required: ["vocab", "reading", "grammar", "expressions", "fillBlanks", "quiz", "listening", "output"],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, levelName, unitTitle }: ReqBody = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Missing title" }), {
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

    const system = `你是一位资深英语教材作者, 专为中文母语成人学习者设计课程。\n根据课程标题, 生成完整的一节英语课内容: 词汇、阅读、语法、实用表达、选词填空、阅读测验、听力填空、写作任务。\n要求:\n- 所有英文必须真实自然 (美式英语)\n- 词汇、阅读、表达、测验之间要紧密围绕课程主题, 互相呼应\n- 难度匹配 LEVEL (Level 1=A1, Level 2=A2, Level 3=B1, 以此类推)\n- 中文翻译/释义准确口语化\n- fillBlanks 中 answer 必须是 options 之一; quiz 的 answer 必须是 0-3 的索引\n- listening.audio 应能直接朗读, blanks 的 answer 是单个英文单词且必须出现在 audio 中\n严格按照 tool 的 JSON schema 输出, 不要输出额外文字。`;

    const user = `课程标题: ${title}\n级别: ${levelName ?? "(未提供)"}\n单元: ${unitTitle ?? "(未提供)"}\n\n请生成这节课的完整教学内容。`;

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
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_lesson",
              description: "Emit the full structured lesson content",
              parameters: lessonSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_lesson" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
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
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
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
    console.error("generate-lesson error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});