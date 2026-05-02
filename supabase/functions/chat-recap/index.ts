// Takes the full transcript of a finished AI voice chat and returns either:
//   * `part: "review"` (default fast path) — bilingual breakdown of every
//     user turn (English + Chinese + tips). Returns in ~3-6s.
//   * `part: "quiz"` — 10 multiple-choice quiz questions targeting
//     high-school+ level vocabulary that actually appeared in the chat.
//     Returns in ~10-20s.
//   * `part: "all"` (legacy) — both at once.
//
// Splitting lets the client fetch both in parallel and start showing the
// review immediately while the quiz finishes in the background.
//
// Uses Gemini via Lovable AI Gateway (no extra API key needed).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Turn = { role: "user" | "assistant"; text: string };
type Part = "review" | "quiz" | "all";

const REVIEW_TOOL = {
  type: "function" as const,
  function: {
    name: "deliver_review",
    description: "Return the bilingual review.",
    parameters: {
      type: "object",
      properties: {
        summary_cn: {
          type: "string",
          description: "2-3 句中文总评：学生整体表现、最大亮点、最值得改进的一点。",
        },
        turns: {
          type: "array",
          description: "每一条 LEARNER 话语的双语回顾。跳过 Alex 的话。",
          items: {
            type: "object",
            properties: {
              en: { type: "string", description: "Learner's original English (verbatim)." },
              cn: { type: "string", description: "中文翻译。" },
              tip_cn: { type: "string", description: "1-2 句中文讲解：哪里可以更地道，正确写法是什么。如果完美就写「表达自然，无需修改」。" },
              better_en: { type: "string", description: "更地道的英文表达 (如果原句已经很好,留空字符串)。" },
            },
            required: ["en", "cn", "tip_cn", "better_en"],
          },
        },
        targets_used: {
          type: "array",
          description: "如果用户传入了 target expressions, 这里返回 Alex 实际在对话中用到的目标表达 + Alex 当时的原句。没用到的不要列。",
          items: {
            type: "object",
            properties: {
              phrase: { type: "string", description: "目标表达 (与传入的 phrase 完全一致)." },
              sentence: { type: "string", description: "Alex 用到该表达的那句原话 (verbatim from transcript)." },
            },
            required: ["phrase", "sentence"],
          },
        },
      },
      required: ["summary_cn", "turns"],
    },
  },
};

const QUIZ_TOOL = {
  type: "function" as const,
  function: {
    name: "deliver_quiz",
    description: "Return the 10-question vocabulary quiz.",
    parameters: {
      type: "object",
      properties: {
        quiz: {
          type: "array",
          description: "Exactly 10 multiple-choice questions.",
          items: {
            type: "object",
            properties: {
              word: { type: "string", description: "考查的单词或短语 (英文)." },
              source_sentence: { type: "string", description: "对话中包含该词的原句 (英文)." },
              question_cn: { type: "string", description: "中文题干, 通常问'XX 在这里是什么意思?'" },
              options_cn: {
                type: "array",
                items: { type: "string" },
                description: "4 个中文选项.",
              },
              answer_index: { type: "integer", description: "正确答案下标 (0-3)." },
              explanation_cn: { type: "string", description: "1 句中文解析." },
            },
            required: ["word", "source_sentence", "question_cn", "options_cn", "answer_index", "explanation_cn"],
          },
        },
      },
      required: ["quiz"],
    },
  },
};

const COMBINED_TOOL = {
  type: "function" as const,
  function: {
    name: "deliver_recap",
    description: "Return the bilingual review and quiz.",
    parameters: {
      type: "object",
      properties: {
        summary_cn: REVIEW_TOOL.function.parameters.properties.summary_cn,
        turns: REVIEW_TOOL.function.parameters.properties.turns,
        quiz: QUIZ_TOOL.function.parameters.properties.quiz,
      },
      required: ["summary_cn", "turns", "quiz"],
    },
  },
};

function buildSystemPrompt(part: Part): string {
  if (part === "review") {
    return `You are an expert English-as-a-second-language coach for Chinese-speaking learners. You analyze a transcript of a real-time voice chat between an AI tutor (Alex) and a learner.

Produce a bilingual review of EVERY learner turn: original English, faithful Chinese translation, and 1-2 sentences of *specific* coaching (grammar fixes, more natural alternatives, pronunciation/word-choice tips). If a learner turn is perfect, say so briefly. Don't pad. Also include a 2-3 sentence Chinese 总评.

Return ONLY a tool call. Never write prose.`;
  }
  if (part === "quiz") {
    return `You are an expert English-as-a-second-language coach for Chinese-speaking learners. You analyze a transcript of a real-time voice chat between an AI tutor (Alex) and a learner.

Produce TEN (10) multiple-choice quiz questions. CRITICAL TARGETING RULES — these override anything else:
   - DO NOT test words the LEARNER produced. The learner already knows those.
   - ONLY test useful vocabulary, idioms, collocations, or phrasal verbs from:
     (a) ALEX's lines (the AI tutor), or
     (b) more idiomatic alternatives Alex would suggest to fix the learner's mistakes (i.e. the "better_en" rewrites of the learner's awkward sentences).
   - Target Chinese senior-high-school level or above (B1-C1 / CET-4 to CET-6 / TOEFL).
   - You MUST return exactly 10 questions. If Alex's lines are short, generate sensible "more idiomatic rewrites" of the learner's lines and test the new vocabulary in those rewrites.

Each question must:
   - \`word\`: the word / phrase being tested (must come from Alex or from a rewrite, NOT verbatim from the learner)
   - \`source_sentence\`: the English sentence containing the word. Either an actual Alex line, OR a more idiomatic rewrite of a learner line (mark naturally — just the sentence).
   - \`question_cn\`: ask the meaning IN CHINESE
   - \`options_cn\`: 4 plausible Chinese options, only one correct
   - \`explanation_cn\`: 1-sentence Chinese explanation

Return ONLY a tool call. Never write prose.`;
  }
  return `You are an expert English-as-a-second-language coach for Chinese-speaking learners. You analyze a transcript of a real-time voice chat between an AI tutor (Alex) and a learner, then produce two artifacts:

1) A bilingual review of EVERY learner turn: original English, faithful Chinese translation, and 1-2 sentences of *specific* coaching. If a learner turn is perfect, say so briefly. Don't pad.

2) TEN (10) multiple-choice quiz questions testing useful vocabulary that actually appeared, B1-C1 / CET-4 to CET-6 / TOEFL level. Quote source sentence, ask in Chinese, 4 Chinese options, 1 correct, 1-sentence Chinese explanation.

Return ONLY a tool call. Never write prose.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 503);

    const { transcript, lessonTitle, part: partFromBody, targets } = await req.json();
    const part: Part =
      partFromBody === "review" || partFromBody === "quiz" ? partFromBody : "all";

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return json({ error: "transcript is required" }, 400);
    }

    const cleaned: Turn[] = transcript
      .filter((t: Turn) => t && typeof t.text === "string" && t.text.trim())
      .map((t: Turn) => ({ role: t.role === "user" ? "user" : "assistant", text: t.text.trim() }))
      .slice(-60);

    const transcriptText = cleaned
      .map((t, i) => `${i + 1}. ${t.role === "user" ? "Learner" : "Alex (AI)"}: ${t.text}`)
      .join("\n");

    const targetsBlock = Array.isArray(targets) && targets.length
      ? `\n\nTARGET EXPRESSIONS that Alex was secretly trying to teach (check which ones he actually used in the transcript above and return them via targets_used):\n${targets.map((t: any, i: number) => `${i + 1}. "${t.phrase}"`).join("\n")}`
      : "";

    const tool = part === "review" ? REVIEW_TOOL : part === "quiz" ? QUIZ_TOOL : COMBINED_TOOL;
    const toolName = tool.function.name;

    const body = {
      // Flash-lite is much faster than 2.5-flash and plenty good enough for
      // a vocabulary quiz / line-by-line translation. Falls back gracefully
      // since the same gateway endpoint serves both.
      model: part === "quiz" ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: buildSystemPrompt(part) },
        {
          role: "user",
          content: `Lesson context: ${lessonTitle || "(general free chat)"}\n\nTRANSCRIPT:\n${transcriptText}${targetsBlock}`,
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: toolName } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("ai gateway error", r.status, t);
      if (r.status === 429) return json({ error: "Rate limit. Please retry shortly." }, 429);
      if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "AI gateway error" }, 502);
    }

    const data = await r.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return json({ error: "AI returned no tool call", raw: data }, 502);

    let parsed: any;
    try {
      parsed = JSON.parse(call.function?.arguments || "{}");
    } catch {
      return json({ error: "AI returned invalid JSON" }, 502);
    }

    return json({ recap: parsed, part });
  } catch (e) {
    console.error("chat-recap error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});