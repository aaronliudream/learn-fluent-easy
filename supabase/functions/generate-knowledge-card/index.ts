// Generate a structured knowledge card from a user question using Lovable AI Gateway.
// Returns JSON suitable for inserting into public.knowledge_cards.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "card";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, language = "en" } = await req.json();
    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Question must be at least 3 chars" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const sys = `You are an English teacher. Given a learner's question, return a structured "knowledge card" using the provided tool. Be concise, friendly, accurate. Examples must be natural English.

Quiz: produce EXACTLY 10 multiple-choice questions that all test the SAME knowledge point as the learner's original question (same grammar rule, same vocabulary, same pronunciation pattern, etc.). They must NOT drift to a related-but-different topic. The 10 questions should be ordered by difficulty: questions 1-3 are easy warm-ups, 4-7 are standard, 8-10 are challenging. Each question has 4 options, one correct, plus a one-sentence "explain". Each question should feel like a natural variation of what the learner just asked.

Tags: 1-4 short lowercase tags (grammar, vocab, pronunciation, idiom, etc.). Respond in ${language === "zh" ? "Chinese for explanations but keep English examples" : "English"}.`;

    const tool = {
      type: "function",
      function: {
        name: "build_knowledge_card",
        description: "Build a structured English-learning knowledge card.",
        parameters: {
          type: "object",
          properties: {
            short_answer: { type: "string" },
            explanation: { type: "string" },
            examples: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
            common_mistakes: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 4 },
            quiz: {
              type: "array",
              minItems: 10,
              maxItems: 10,
              items: {
                type: "object",
                properties: {
                  q: { type: "string" },
                  options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                  answer: { type: "integer", minimum: 0, maximum: 3 },
                  explain: { type: "string" },
                },
                required: ["q", "options", "answer"],
                additionalProperties: false,
              },
            },
            tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
            title: { type: "string", description: "Concise normalized title for the question" },
          },
          required: ["short_answer", "explanation", "examples", "quiz", "tags", "title"],
          additionalProperties: false,
        },
      },
    } as const;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: question },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "build_knowledge_card" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited, please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments;
    if (!argsStr) throw new Error("No tool call returned");
    const card = JSON.parse(argsStr);

    const slug = `${slugify(card.title || question)}-${Math.random().toString(36).slice(2, 7)}`;

    return new Response(
      JSON.stringify({
        slug,
        question: question.trim(),
        short_answer: card.short_answer,
        explanation: card.explanation,
        examples: card.examples ?? [],
        common_mistakes: card.common_mistakes ?? [],
        quiz: card.quiz ?? [],
        tags: card.tags ?? [],
        language,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-knowledge-card error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});