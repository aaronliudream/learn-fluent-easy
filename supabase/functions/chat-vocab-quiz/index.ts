const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are an English teacher for Chinese primary school students (CEFR Pre-A1 / A1).
You will receive the transcript of a chat between the child and the AI tutor "Spark".
Pick 4-6 of the MOST USEFUL English words/short phrases that actually appeared in Spark's messages
(prefer concrete nouns, action verbs, and tiny phrases like "What's your favorite", "I love").
For EACH item, build a 4-option multiple-choice question testing the Chinese meaning.
Distractors must be plausible Chinese words but clearly different. Never include the answer text in the question.
Output via the provided tool only. All meanings in Simplified Chinese. Keep stems super short.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const transcript = messages
      .map((m: any) => `${m.role === "assistant" ? "Spark" : "Child"}: ${m.content}`)
      .join("\n");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Transcript:\n${transcript}\n\nNow create the quiz.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "build_quiz",
            description: "Return MCQ items based on transcript",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      term: { type: "string", description: "English word/phrase that appeared" },
                      question_cn: { type: "string", description: "Question stem in Chinese, e.g. 'apple 是什么意思？'" },
                      options_cn: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                      answer_index: { type: "integer", minimum: 0, maximum: 3 },
                      example_en: { type: "string" },
                    },
                    required: ["term","question_cn","options_cn","answer_index","example_en"],
                    additionalProperties: false,
                  },
                  minItems: 3, maxItems: 8,
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "build_quiz" } },
      }),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: "rate" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: "ai", detail: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = tc?.function?.arguments ? JSON.parse(tc.function.arguments) : { items: [] };
    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[chat-vocab-quiz]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});