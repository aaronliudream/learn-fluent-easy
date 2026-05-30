// 《英语闯关》强化训练题目生成 (Phase 2 PR #72a)
//
// 输入: 用户错题聚合后的弱项标签 (vocab_domain / grammar_point) +
//       最近错题小样本 + 想要的题数.
// 输出: 5 道 FCQuestion 数组, 已过 server-side schema 校验.
//
// AI: Gemini gemini-2.5-flash via Google OpenAI-兼容 endpoint
//     (与 generate-similar-questions / generate-question-for-kp 同一模式).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const MODEL = "gemini-2.5-flash";

// ---------- Rate limit (宽松, 20/min per user/IP) ----------
const RATE_LIMIT_PER_MIN = 20;
const recentCalls = new Map<string, number[]>(); // key -> timestamps (ms)
function rateLimitOk(key: string): boolean {
  const now = Date.now();
  const ts = (recentCalls.get(key) || []).filter((t) => now - t < 60_000);
  if (ts.length >= RATE_LIMIT_PER_MIN) {
    recentCalls.set(key, ts);
    return false;
  }
  ts.push(now);
  recentCalls.set(key, ts);
  return true;
}

// ---------- Types (本函数自包含, 与前端 FCQuestion 对齐) ----------
// AI 强化只出"纯文本/听力类"题型(都不需要图片,AI 能完整生成)。
// 看图题 (picture_match_word/sentence) 已移除:AI 给不了图 → 畸形题根源。
type FCType =
  | "listen_and_choose_word"
  | "listen_and_choose_answer"
  | "listen_and_judge_picture"
  | "odd_one_out";

interface GeneratedQuestion {
  id: string;
  type: FCType;
  unitId: string;
  difficulty: "easy" | "medium" | "hard";
  vocab_domain: string[];
  grammar_point: string[];
  prompt: string;
  options: string[];
  answer: number;
  emoji?: string;
  audio?: string;
  source: "ai_generated";
  source_ref: string;
}

// ---------- Server-side schema validator ----------
function validateQuestion(q: any, idx: number): { ok: true; q: GeneratedQuestion } | { ok: false; reason: string } {
  if (!q || typeof q !== "object") return { ok: false, reason: `[${idx}] not object` };
  const allowedTypes: FCType[] = [
    "listen_and_choose_word",
    "listen_and_choose_answer",
    "listen_and_judge_picture",
    "odd_one_out",
  ];
  if (!allowedTypes.includes(q.type)) return { ok: false, reason: `[${idx}] bad type "${q.type}"` };
  if (typeof q.id !== "string" || !q.id) return { ok: false, reason: `[${idx}] missing id` };
  if (typeof q.unitId !== "string" || !q.unitId) return { ok: false, reason: `[${idx}] missing unitId` };
  if (!["easy", "medium", "hard"].includes(q.difficulty)) return { ok: false, reason: `[${idx}] bad difficulty` };
  if (!Array.isArray(q.vocab_domain) || q.vocab_domain.length === 0)
    return { ok: false, reason: `[${idx}] empty vocab_domain` };
  if (!Array.isArray(q.grammar_point) || q.grammar_point.length === 0)
    return { ok: false, reason: `[${idx}] empty grammar_point` };
  if (typeof q.prompt !== "string" || !q.prompt) return { ok: false, reason: `[${idx}] missing prompt` };
  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4)
    return { ok: false, reason: `[${idx}] bad options length` };
  if (!q.options.every((o: any) => typeof o === "string" && o.length > 0))
    return { ok: false, reason: `[${idx}] non-string option` };
  if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length)
    return { ok: false, reason: `[${idx}] answer out of range` };

  // type-specific required fields
  if (q.type === "listen_and_judge_picture") {
    if (typeof q.emoji !== "string" || !q.emoji) return { ok: false, reason: `[${idx}] missing emoji` };
  }
  if (["listen_and_choose_word", "listen_and_choose_answer", "listen_and_judge_picture"].includes(q.type)) {
    if (typeof q.audio !== "string" || !q.audio) return { ok: false, reason: `[${idx}] missing audio` };
  }
  // 听句选答:audio 必须是完整问句,options 至少 3 个完整答语句子
  if (q.type === "listen_and_choose_answer") {
    const a = String(q.audio || "").trim();
    if (!a) return { ok: false, reason: `[${idx}] listen_and_choose_answer missing audio` };
    if (q.options.length < 3) return { ok: false, reason: `[${idx}] listen_and_choose_answer needs >=3 options` };
    // 硬禁 yes/no 一般疑问句:AI 反复在这类题配错/错判答案(如 "Are these your socks?")。
    // 只放行 wh- 特殊疑问句。被拦的题会从结果里剔除。
    const yesNoStart = /^(are|is|am|do|does|did|can|could|will|would|have|has|was|were|shall|should|may|might)\b/i;
    if (yesNoStart.test(a)) {
      return { ok: false, reason: `[${idx}] listen_and_choose_answer 是 yes/no 疑问句(硬禁): "${a}"` };
    }
  }
  // T/F 类必须正好 2 个固定 options
  if (q.type === "listen_and_judge_picture") {
    const expected = JSON.stringify(["T (相符)", "F (不相符)"]);
    if (JSON.stringify(q.options) !== expected) {
      // 容错: 强行规整成期望的 2 选项 (保留 answer 0/1)
      q.options = ["T (相符)", "F (不相符)"];
    }
    if (q.answer !== 0 && q.answer !== 1) return { ok: false, reason: `[${idx}] T/F answer must be 0 or 1` };
  }

  // 强制字段补齐
  q.source = "ai_generated";
  q.source_ref = q.source_ref || "AI 强化训练生成";
  return { ok: true, q: q as GeneratedQuestion };
}

// ---------- Post-process: 答案位置打散 (再保险一层, 即使 prompt 失效也均衡) ----------
function shuffleAnswerPositions(questions: GeneratedQuestion[]): void {
  for (const q of questions) {
    if (q.type === "listen_and_judge_picture") continue; // T/F 固定不重排
    if (q.options.length < 2) continue;
    const correctText = q.options[q.answer];
    // Fisher-Yates
    const a = [...q.options];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    q.options = a;
    q.answer = a.indexOf(correctText);
  }
}

// ---------- Seed examples (few-shot, embedded in source) ----------
const SEED_FEW_SHOT = [
  {
    type: "listen_and_choose_answer",
    unitId: "g4v1_u3",
    difficulty: "easy",
    vocab_domain: ["jobs"],
    grammar_point: ["wh_question_answer"],
    prompt: "听一听,选出正确的回答。",
    // 听句选答只用 wh- 特殊疑问句;严格禁止 yes/no 一般疑问句(schema 也会硬拦)
    audio: "What's his job?",
    options: ["He is a farmer.", "It's a book.", "Yes, I am."],
    answer: 0,
  },
  {
    type: "listen_and_choose_answer",
    unitId: "g4v2_u5",
    difficulty: "medium",
    vocab_domain: ["clothes", "possessive"],
    grammar_point: ["whose_question"],
    prompt: "听一听,选出正确的回答。",
    audio: "Whose coat is this?",
    options: ["It's hers.", "Yes, it is.", "It's blue."],
    answer: 0,
  },
  {
    type: "listen_and_choose_word",
    unitId: "g4v2_u3",
    difficulty: "easy",
    vocab_domain: ["weather"],
    grammar_point: ["listening_discrimination"],
    prompt: "听音频,选择你听到的单词。",
    audio: "sunny",
    options: ["funny", "snowy", "sunny"],
    answer: 2,
  },
  {
    type: "listen_and_judge_picture",
    unitId: "g4v2_u3",
    difficulty: "easy",
    vocab_domain: ["weather"],
    grammar_point: ["it_is_weather", "listening_judge"],
    prompt: "看图,听音频,判断是否相符。",
    emoji: "☀️",
    audio: "It is a rainy day.",
    options: ["T (相符)", "F (不相符)"],
    answer: 1,
  },
  {
    type: "odd_one_out",
    unitId: "g4v2_u4",
    difficulty: "easy",
    vocab_domain: ["farm_animals", "vegetables"],
    grammar_point: ["categorization"],
    prompt: "选出与其他两个不属于同一类的单词。",
    options: ["cat", "cow", "carrot"],
    answer: 2,
  },
];

// ---------- 四年级词汇白名单 (人教版上下册 168 词, 来自 src/data/primaryHub/grade4.json) ----------
const GRADE4_WORDS = [
  "animal", "art room", "aunt", "baby brother", "bathroom", "be careful", "bed", "bedroom",
  "beef", "blackboard", "bowl", "breakfast", "candy", "carrot", "cheap", "chicken",
  "Chinese book", "chopsticks", "class", "classroom", "clean", "clothes", "cloudy", "coat",
  "cold", "come on", "computer", "computer room", "cook", "cool", "cousin", "cow", "cute",
  "degree", "dinner", "doctor", "dollar", "door", "dress", "driver", "eat", "eighty",
  "English book", "English class", "expensive", "fan", "farm", "farmer", "first floor",
  "floor", "fork", "forty", "fridge", "friendly", "garden", "get up", "glasses", "glove",
  "go home", "go to bed", "go to school", "goat", "green beans", "hair", "hat", "help",
  "hen", "her", "his", "homework", "horse", "hot", "how about", "how much", "hurry up",
  "jacket", "just", "just a minute", "key", "kid", "kitchen", "knife", "library", "light",
  "living room", "lost", "lunch", "maths book", "mine", "more", "music class", "music room",
  "near", "New York", "next to", "nice", "noodles", "notebook", "now", "nurse", "o'clock",
  "of course", "outside", "over", "pack", "pants", "parents", "PE class", "phone", "picture",
  "playground", "potato", "pretty", "quiet", "rainy", "really", "ruler", "sale", "scarf",
  "schoolbag", "second floor", "sheep", "shirt", "shoe", "shorts", "sister", "size", "skirt",
  "snowy", "so much", "sock", "sofa", "soup", "spoon", "storybook", "strong", "study",
  "sunglasses", "sunny", "sweater", "table", "teacher's desk", "teachers' office", "these",
  "thirty", "those", "tiger", "tomato", "too", "toy", "try on", "TV", "umbrella", "uncle",
  "us", "vegetable", "wait", "wall", "warm", "water", "way", "weather", "whose", "window",
  "windy", "wow", "yours", "yum",
];

// ---------- System prompt ----------
const SYSTEM_PROMPT = `你是人教版小学四年级(上下册)英语强化训练命题专家。基于学生错题考点,生成 5 道针对性强化练习题。

【输出格式】
严格只输出 JSON, 不要 markdown 代码块。结构:
{"questions": [<5 个 question 对象>]}

每个 question 对象必填字段:
- id (string, 形如 "fc_ai_<random>")
- type (string, 严格 4 选 1, 都不需要图片):
  · "listen_and_choose_word"  (听音辨词, 需 audio=单词 + 3 个文本单词 options)
  · "listen_and_choose_answer"(听句选答, 需 audio=完整问句/句子 + 3 个完整答语句子 options, 只有一个能正确回答 audio)
  · "listen_and_judge_picture"(听句判图, 需 emoji + audio + options 固定 ["T (相符)","F (不相符)"])
  · "odd_one_out"             (找不同类, 需 3 个文本单词 options)
- unitId (string): "g4v1_u1"~"g4v1_u6" 或 "g4v2_u1"~"g4v2_u6"
- difficulty: "easy" | "medium" | "hard"
- vocab_domain (string[], 非空, 用蛇形小写)
- grammar_point (string[], 非空, 用蛇形小写)
- prompt (string, 中文题干指令)
- options (string[], 长度 2-4)
- answer (number, 0-based index 指向正确选项)
- emoji (string, 仅 listen_and_judge_picture 题; 单一清晰 emoji)
- audio (string, 所有 listen_* 题必填; 要朗读的英文文本/句子)

【硬约束】
1. 题考点必须对准用户错题的 vocab_domain / grammar_point 标签
2. 难度梯度: 5 道里 2 易 2 中 1 难, 不要全堆最难
3. **answer 位置必须随机打散**, 5 道里不能 3 道及以上 answer 同位置
4. 干扰项必须是孩子真会选错的: 形近词 / 同类词 / 音近词, 不送分
5. 考点限定人教版四年级下册范围 (school_places, time, weather, farm_animals,
   vegetables, clothing, numbers, food 等)
6. 文化适切: 不假设中国小孩家里有专职司机/厨师/农夫等
7. emoji 题用单个清晰 emoji (一个 codepoint), 不要拼接
8. 听力题 audio 字段就是要朗读的英文 (可以是单词或完整句子)
9. T/F 题 (listen_and_judge_picture) 的 options 严格用
   ["T (相符)", "F (不相符)"], 别改文案; answer ∈ {0, 1}

【词汇范围 — 白名单, 只能用下列四年级词汇, 不得出现表外单词】
(尤其禁止 pilot、bookcase、nurse 之外的职业词、desk、chair 等表外词)
${GRADE4_WORDS.join(", ")}

【禁止题型 / 内容 — 违反则该题作废】
- 禁止"外貌/身材对比"题(tall / short / strong / thin 等),这类无法用图或 emoji 准确表达。
- 禁止任何需要"看图"才能作答的题(本训练不提供图片)。
- 题型只能在 listen_and_choose_word / listen_and_choose_answer / listen_and_judge_picture / odd_one_out 中选。
- listen_and_choose_answer 的 audio 必须是完整问句或句子, options 必须是完整答语句子,
  且三个选项里只有一个在语义/语法上能正确回答 audio。
- 所有英文单词必须来自上面的白名单。

【listen_and_choose_answer 专项规则 — 违反则该题作废】
- **严格禁止** audio 为 yes/no 一般疑问句(不得以 Are/Is/Am/Do/Does/Did/Can/Could/
  Will/Would/Have/Has/Was/Were/Shall/Should/May/Might 开头)。这类应答 AI 反复配错,已硬性拦截。
- audio **必须**是 wh- 特殊疑问句,以下列之一开头: What / Where / Whose / Which / Who /
  When / How / What colour / What time / How much / How many / How old。
  例: What's his job? / Where is the cat? / Whose coat is this? / What colour is it? /
  How much is it? / What time is it?
- 答语必须完整、自然、语法正确的英语口语。
- 三个 options 有且仅有一个能正确回答 audio; 另两个是语义或语法上明显不对的干扰项(但仍通顺)。
- 正确答案与问句严格逻辑对应: 问 job 答职业、问 where 答地点、问 whose 答物主、
  问 colour 答颜色、问 how much 答价格、问 what time 答时间。
- 自检: 生成每道题后自问"这个 audio 用这个 answer 回答, 中国小学老师会判对吗?"
  不确定就换一道。

【few-shot 样例】(参考风格 + schema, 不要照抄)
${JSON.stringify(SEED_FEW_SHOT, null, 2)}`;

// ---------- HTTP handler ----------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      grade = 4,
      weak_vocab_domains = [],
      weak_grammar_points = [],
      recent_mistakes_sample = [],
      count = 5,
    } = body || {};

    // ---- rate limit ----
    // identify by user (auth token) or IP fallback
    let rateKey = "anon";
    try {
      const auth = req.headers.get("Authorization") || "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (token && SERVICE_KEY) {
        const sb = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data: { user } } = await sb.auth.getUser(token);
        if (user?.id) rateKey = `u:${user.id}`;
      }
    } catch {/* fallthrough to IP */}
    if (rateKey === "anon") {
      rateKey = `ip:${req.headers.get("x-forwarded-for") || "unknown"}`;
    }
    if (!rateLimitOk(rateKey)) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "出题太频繁啦, 歇 1 分钟再来试试。",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!GOOGLE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: "missing GOOGLE_AI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- build user prompt ----
    const sample = (recent_mistakes_sample as any[])
      .slice(0, 3)
      .map((m, i) => `[${i + 1}] type=${m.questionType} stem="${m.stem}" 正确答案="${m.correctText}"`)
      .join("\n");
    const userPrompt = `【学生错题考点分析】
- 高频弱项 vocab_domain: ${JSON.stringify(weak_vocab_domains)}
- 高频弱项 grammar_point: ${JSON.stringify(weak_grammar_points)}
- 最近错题样本 (${(recent_mistakes_sample as any[]).length} 条):
${sample || "(无具体样本, 仅按标签出题)"}

请生成 ${count} 道针对上述弱项的强化练习题。
难度梯度: ${count >= 5 ? "2 易 + 2 中 + 1 难" : "尽量混合"}。
注意 answer 位置必须均匀打散!`;

    // ---- call Gemini via OpenAI-compat endpoint ----
    const aiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(
        JSON.stringify({
          error: "ai_failed",
          message: `AI 出题失败 (${aiRes.status})`,
          detail: txt.slice(0, 300),
        }),
        {
          status: aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content || "";

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: "ai_bad_json", message: "AI 返回内容不是合法 JSON", raw: content.slice(0, 200) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rawQs: any[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const valid: GeneratedQuestion[] = [];
    const warnings: string[] = [];
    rawQs.forEach((q, i) => {
      const r = validateQuestion(q, i);
      if (r.ok) valid.push(r.q);
      else warnings.push(r.reason);
    });

    if (valid.length === 0) {
      return new Response(
        JSON.stringify({
          error: "no_valid_questions",
          message: "这次 AI 出的题都不达标, 换个时机再试。",
          warnings,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 再保险一层: post-process 答案位置打散
    shuffleAnswerPositions(valid);

    // Give each question a unique-ish id
    valid.forEach((q, i) => {
      q.id = q.id || `fc_ai_${Date.now()}_${i}`;
    });

    return new Response(
      JSON.stringify({
        questions: valid,
        generated_count: valid.length,
        warnings,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "internal",
        message: String((err as Error)?.message || err).slice(0, 300),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
