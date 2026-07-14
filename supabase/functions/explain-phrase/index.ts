// Edge function: explain a single English word/phrase in context for Chinese learners.
// Returns cached result from `phrase_explanations` if present; otherwise calls the
// Lovable AI Gateway, stores it, and returns it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

// Bump this when you change the AI prompt/schema so we re-generate explanations
// instead of returning stale cached versions.
const SCHEMA_VERSION = "zh-v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phrase, context, prefer } = await req.json();
    // prefer="light":图书馆精读点读用 → 先查 read-v1 轻卡、再查 zh-v2 重卡(修抢跑竞态:测试期先点生成的 zh-v2 会永久遮蔽后种的轻卡)。
    // 不传(美语课等)→ 仍 zh-v2 优先,行为 100% 不变。
    const preferLight = prefer === "light";
    if (!phrase || typeof phrase !== "string") {
      return new Response(JSON.stringify({ error: "phrase required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalize(phrase);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "empty phrase" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 重卡(zh-v2)查找器:命中 → 返回重卡结构。
    const findZhV2 = async () => {
      const { data: cached } = await admin
        .from("phrase_explanations")
        .select("explanation")
        .eq("normalized", normalized)
        .eq("target_lang", SCHEMA_VERSION)
        .maybeSingle();
      return cached?.explanation ? { explanation: cached.explanation, cached: true } : null;
    };

    // 轻卡(read-v1)查找器:把轻 schema {word,pos,ipa,gloss_cn,example} 映射成前端 Explanation 兼容结构:
    //   gloss_cn→one_line_cn(🧠 一句话)、pos+ipa→pos(卡头)、example→📝 例句。
    //   重卡专属字段(literal/scene/replies/similar/tip)缺省 → LessonBody 各段有长度守卫,优雅降级。
    const findReadV1 = async () => {
      const { data: light } = await admin
        .from("phrase_explanations")
        .select("explanation")
        .eq("normalized", normalized)
        .eq("target_lang", "read-v1")
        .maybeSingle();
      // deno-lint-ignore no-explicit-any
      const lg = light?.explanation as any;
      if (lg && lg.gloss_cn) {
        const card = {
          phrase: lg.word || phrase,
          pos: [lg.pos, lg.ipa].filter(Boolean).join("  "),
          one_line_cn: lg.gloss_cn,
          example: lg.example && lg.example.en ? lg.example : undefined,
        };
        return { explanation: card, cached: true, light: true };
      }
      return null;
    };

    // 命中顺序:preferLight(图书馆)→ 先轻后重;默认(美语课)→ 先重后轻(行为 100% 不变)。
    // 两者都是「已缓存命中即返回,都未命中才走下方 AI 生成」。
    const order = preferLight ? [findReadV1, findZhV2] : [findZhV2, findReadV1];
    for (const find of order) {
      const hit = await find();
      if (hit) {
        return new Response(JSON.stringify(hit), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) Ask Lovable AI Gateway
    const systemPrompt = `你是一位资深的、最受中国英语学习者欢迎的英文老师。你要把一个英文单词或短语讲成一节精炼的"小课",像下面这样的风格:

- 一句话总结这个短语在地道英语里到底是什么意思 (one_line_cn)
- 逐词拆解,告诉学生每个组成词的字面意思,以及在这个短语里的真正含义 (literal[]). 提醒易错点,例如 party 不是"派对"
- 描述这个短语最典型的使用场景,让学生看到画面 (scene_cn)
- 给出 2-4 个母语人士真正会说的英文回答 / 搭配回应,带中文 (replies[])
- 列出 1-3 个母语人士也常用的同义说法,带中文 (similar[])
- 给一个"小细节 / 高分点",学生看完能用上 (tip_cn)
- 配 1 个英文例句 + 中文翻译 (example)

严格按下面的 JSON 结构返回,不要 markdown 代码块,不要多余文字:
{
  "phrase": string,                              // 原短语
  "pos": string,                                 // 词性,例如 "phrase" / "verb" / "noun";没有就空字符串
  "one_line_cn": string,                         // 一句话翻译/解释
  "literal": [                                   // 逐词拆解
    { "word": string, "meaning_cn": string, "note_cn": string }   // note_cn 可以空字符串
  ],
  "scene_cn": string,                            // 典型使用场景,1-2 句,生动一点
  "replies": [                                   // 学生可以这样回答 / 这样接话
    { "en": string, "cn": string }
  ],
  "similar": [                                   // 同义/相近说法
    { "en": string, "cn": string }
  ],
  "tip_cn": string,                              // 1 句高分小细节,可空
  "example": { "en": string, "cn": string }      // 1 个完整例句
}

要求:
- 全部解释用中文,例句保持英文 + 中文翻译
- 内容要"地道、口语、面向中国学生",避免学术腔
- 如果是普通常见单词 (例如 "the" / "is"),literal 可以只有 1 个元素,replies 可以为空数组
- one_line_cn 必填,绝不能空`;

    const userPrompt = `请讲解这个英文短语/单词: "${phrase}"。${
      context ? `它出现在这句对话里: "${context}"。请结合这个上下文讲解。` : ""
    }`;

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[explain-phrase] AI error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "ai_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to salvage
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }
    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "bad_ai_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Store in cache (best-effort)
    await admin
      .from("phrase_explanations")
      .upsert(
        {
          phrase,
          normalized,
          source_lang: "en",
          target_lang: SCHEMA_VERSION,
          explanation: parsed,
        },
        { onConflict: "normalized,target_lang" },
      );

    return new Response(JSON.stringify({ explanation: parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[explain-phrase] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});