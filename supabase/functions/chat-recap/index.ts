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
          description: "如果用户传入了 target expressions, 这里只返回 Alex 在 TRANSCRIPT 里 *逐字* 用到的目标表达 + Alex 当时的那句原话 (verbatim)。如果某个目标 Alex 根本没说出口, 绝对不要列出来——宁可返回空数组。判断标准: phrase (或其明显屈折形式) 必须出现在某一句 Alex 的话里。学生说的不算。",
          items: {
            type: "object",
            properties: {
              phrase: { type: "string", description: "目标表达 (与传入的 phrase 完全一致)." },
              sentence: { type: "string", description: "Alex 用到该表达的那句原话 (必须 verbatim 来自 TRANSCRIPT 中 Alex 的某一行)." },
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
   - \`options_cn\`: 4 Chinese options, only one correct. CRITICAL: the 4 options MUST be CLEARLY DIFFERENT in meaning — never near-synonyms, never overlapping shades of the same idea. A learner who knows the correct meaning must be able to pick the answer with zero ambiguity. Bad example (forbidden): ["突然","忽然","猛地","骤然"]. Good example: ["突然发生","逐渐增加","小心避免","公开承认"]. Distractors should be plausible (same part of speech, fits the sentence grammatically) but semantically distinct from the correct answer and from each other.
   - \`explanation_cn\`: 1-sentence Chinese explanation

Return ONLY a tool call. Never write prose.`;
  }
  return `You are an expert English-as-a-second-language coach for Chinese-speaking learners. You analyze a transcript of a real-time voice chat between an AI tutor (Alex) and a learner, then produce two artifacts:

1) A bilingual review of EVERY learner turn: original English, faithful Chinese translation, and 1-2 sentences of *specific* coaching. If a learner turn is perfect, say so briefly. Don't pad.

2) TEN (10) multiple-choice quiz questions testing useful vocabulary that actually appeared, B1-C1 / CET-4 to CET-6 / TOEFL level. Quote source sentence, ask in Chinese, 4 Chinese options, 1 correct, 1-sentence Chinese explanation. The 4 Chinese options MUST be clearly different in meaning — never near-synonyms or overlapping shades of the same idea. Distractors should be plausible but unambiguously wrong.

Return ONLY a tool call. Never write prose.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) return json({ error: "AI gateway not configured" }, 503);

    const { transcript, lessonTitle, part: partFromBody, targets, avoidWords } = await req.json();
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
      ? `\n\nTARGET EXPRESSIONS Alex was *supposed* to weave in. For each one, check the TRANSCRIPT above and ONLY return it in targets_used if Alex (not the learner) literally said the phrase (or an obvious inflection like plural / past-tense). If Alex never said it, OMIT it. Do NOT invent or paraphrase. It is perfectly fine — and expected — to return an empty targets_used array.\n${targets.map((t: any, i: number) => `${i + 1}. "${t.phrase}"`).join("\n")}`
      : "";

    const avoidBlock = part !== "review" && Array.isArray(avoidWords) && avoidWords.length
      ? `\n\nAVOID LIST — these words/phrases were already quizzed in the learner's recent past sessions. DO NOT pick any of them again, even if Alex used them this time. Find DIFFERENT vocabulary instead. If the only useful words remaining are not in this list, prefer rare/lower-frequency over the avoid list:\n${avoidWords.slice(0, 80).map((w: string, i: number) => `${i + 1}. ${w}`).join("\n")}`
      : "";

    const tool = part === "review" ? REVIEW_TOOL : part === "quiz" ? QUIZ_TOOL : COMBINED_TOOL;
    const toolName = tool.function.name;

    const body = {
      // Flash-lite is much faster than 2.5-flash and plenty good enough for
      // a vocabulary quiz / line-by-line translation. Falls back gracefully
      // since the same gateway endpoint serves both.
      model: part === "quiz" ? "gemini-2.5-flash" : "gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: buildSystemPrompt(part) },
        {
          role: "user",
          content: `Lesson context: ${lessonTitle || "(general free chat)"}\n\nTRANSCRIPT:\n${transcriptText}${targetsBlock}${avoidBlock}`,
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: toolName } },
    };

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
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

    // Hard server-side guard: drop any targets_used entry whose phrase doesn't
    // actually appear in one of Alex's transcript lines. The model sometimes
    // hallucinates "Alex used X" when Alex didn't — this guarantees the
    // "Alex 今天悄悄教了你" panel never lists phrases that weren't spoken.
    if (parsed && Array.isArray(parsed.targets_used)) {
      const alexCorpus = cleaned
        .filter((t) => t.role === "assistant")
        .map((t) => t.text.toLowerCase())
        .join("\n");
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'\s-]/g, " ").replace(/\s+/g, " ").trim();
      const corpusNorm = norm(alexCorpus);
      parsed.targets_used = parsed.targets_used.filter((u: any) => {
        if (!u || typeof u.phrase !== "string") return false;
        const p = norm(u.phrase);
        if (!p) return false;
        if (corpusNorm.includes(p)) return true;
        // also accept if all word-stems (≥4 chars) appear nearby
        const tokens = p.split(" ").filter((w) => w.length >= 4);
        if (tokens.length && tokens.every((w) => corpusNorm.includes(w.slice(0, Math.max(4, w.length - 2))))) return true;
        return false;
      });
    }

    return json({ recap: parsed, part });
  } catch (e) {
    console.error("chat-recap error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});