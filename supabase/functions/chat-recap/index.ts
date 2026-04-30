// Takes the full transcript of a finished AI voice chat and returns:
//   1. A bilingual breakdown of every user turn (English + Chinese + tips)
//   2. 10 multiple-choice quiz questions targeting high-school+ level
//      vocabulary / phrases that actually appeared in the conversation
//
// Uses GPT-5 via Lovable AI Gateway (no extra API key needed).
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 503);

    const { transcript, lessonTitle } = await req.json();
    if (!Array.isArray(transcript) || transcript.length === 0) {
      return json({ error: "transcript is required" }, 400);
    }

    const cleaned: Turn[] = transcript
      .filter((t: Turn) => t && typeof t.text === "string" && t.text.trim())
      .map((t: Turn) => ({ role: t.role === "user" ? "user" : "assistant", text: t.text.trim() }))
      .slice(-60); // last ~60 turns is plenty

    const transcriptText = cleaned
      .map((t, i) => `${i + 1}. ${t.role === "user" ? "Learner" : "Alex (AI)"}: ${t.text}`)
      .join("\n");

    const systemPrompt = `You are an expert English-as-a-second-language coach for Chinese-speaking learners. You analyze a transcript of a real-time voice chat between an AI tutor (Alex) and a learner, then produce two artifacts:

1) A bilingual review of EVERY learner turn: original English, faithful Chinese translation, and 1-2 sentences of *specific* coaching (grammar fixes, more natural alternatives, pronunciation/word-choice tips). If a learner turn is perfect, say so briefly. Don't pad.

2) TEN (10) multiple-choice quiz questions that test useful vocabulary, idioms, or phrasal verbs that ACTUALLY APPEARED in the conversation, at Chinese senior-high-school level or above (think: B1-C1 / CET-4 to CET-6 / TOEFL). You MUST return exactly 10 questions — if the conversation is short, draw from any non-trivial words or phrases that appeared (including from Alex's lines). Each question must:
   - Quote the source sentence (English) where the word/phrase appeared
   - Ask about the meaning IN CHINESE
   - Have 4 plausible Chinese options where only one is correct
   - Include a one-sentence Chinese explanation

Return ONLY a tool call. Never write prose.`;

    const userMsg = `Lesson context: ${lessonTitle || "(general free chat)"}

TRANSCRIPT:
${transcriptText}`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      tools: [{
        type: "function",
        function: {
          name: "deliver_recap",
          description: "Return the bilingual review and quiz.",
          parameters: {
            type: "object",
            properties: {
              summary_cn: {
                type: "string",
                description: "2-3 句中文总评：学生整体表现、最大亮点、最值得改进的一点。"
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
                    better_en: { type: "string", description: "更地道的英文表达 (如果原句已经很好,留空字符串)。" }
                  },
                  required: ["en", "cn", "tip_cn", "better_en"]
                }
              },
              quiz: {
                type: "array",
                description: "Exactly 5 multiple-choice questions.",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string", description: "考查的单词或短语 (英文)." },
                    source_sentence: { type: "string", description: "对话中包含该词的原句 (英文)." },
                    question_cn: { type: "string", description: "中文题干, 通常问'XX 在这里是什么意思?'" },
                    options_cn: {
                      type: "array",
                      items: { type: "string" },
                      description: "4 个中文选项."
                    },
                    answer_index: { type: "integer", description: "正确答案下标 (0-3)." },
                    explanation_cn: { type: "string", description: "1 句中文解析." }
                  },
                  required: ["word", "source_sentence", "question_cn", "options_cn", "answer_index", "explanation_cn"]
                }
              }
            },
            required: ["summary_cn", "turns", "quiz"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "deliver_recap" } },
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(call.function?.arguments || "{}");
    } catch {
      return json({ error: "AI returned invalid JSON" }, 502);
    }

    return json({ recap: parsed });
  } catch (e) {
    console.error("chat-recap error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
