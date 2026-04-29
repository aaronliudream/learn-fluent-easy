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

    const system = `你是一位资深英语教材作者, 专为中文母语成人学习者设计课程。
根据课程标题, 生成完整的一节英语课内容: 词汇、阅读、语法、实用表达、选词填空、阅读测验、听力填空、写作任务。

【极其重要 — 主题一致性】
- 课程标题通常包含一个英文主句 (例如 "I'd like a coffee.") 和一个中文场景说明 (例如 "梅在寄宿家庭的第一个早晨")。
- 你必须先识别出这节课的【核心场景】 (咖啡店点单 / 机场求助 / 看医生 / 打电话 等) 和【核心句型】 (即标题里的那句英文)。
- 全部 8 个板块 (vocab / reading / grammar / expressions / fillBlanks / quiz / listening / output) 都必须紧紧围绕这个场景和句型展开:
  * vocab: 选取这个场景下最常用的 6-8 个词
  * reading: 写一段发生在这个场景里的小故事或对话, 主人公就是中文说明里出现的人物 (如"梅")
  * grammar: 必须包含标题里那个核心句型 (如 "I'd like ..."), 给出讲解和例句
  * expressions: 全部是这个场景里会用到的实用句, 不要出现"Can I ask a question?"这种泛课堂用语 (除非课程本身就是关于课堂)
  * fillBlanks / quiz / listening / output: 全部围绕本课词汇与场景, 例句、问题、听力短文都要发生在这个场景里
- 严禁生成与场景无关的通用学英语内容。如果标题是"我想要一杯咖啡", 那 8 个板块全都应该发生在咖啡店 / 早餐 / 点单的语境里。

其他要求:
- 所有英文必须真实自然 (美式英语)
- 难度匹配 LEVEL (Level 1=A1, Level 2=A2, Level 3=B1, 以此类推)
- 中文翻译/释义准确口语化
- fillBlanks 中 answer 必须是 options 之一; quiz 的 answer 必须是 0-3 的索引
- listening.audio 应能直接朗读 (2-4 句, 围绕本课场景)
- 【听力填空 — 极其重要】blanks 的 3 个 answer 必须是【本课 vocab 列表里的核心新词】, 每个 answer 都要满足:
  * 是 vocab 数组里出现过的单词 (大小写不敏感, 可以是其单复数 / 时态变化)
  * 必须真实出现在 listening.audio 文本中
  * 严禁挖空人名 (Tom, Mei, Sarah ...)、代词 (I, you, my ...)、be 动词 / 冠词 / 介词等功能词
  * 必须是学习者本课要掌握的实词 (名词 / 动词 / 形容词)
- fillBlanks 同理: answer 也必须来自本课 vocab, 不要挖空人名或功能词
严格按照 tool 的 JSON schema 输出, 不要输出额外文字。`;

    const user = `课程标题: ${title}
级别: ${levelName ?? "(未提供)"}
单元: ${unitTitle ?? "(未提供)"}

请先在心里确认本课的核心场景与核心句型, 然后让 8 个板块全部围绕它展开, 生成完整教学内容。`;

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