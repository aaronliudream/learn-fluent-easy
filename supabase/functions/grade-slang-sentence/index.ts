// Grades a learner's attempt at using an American slang phrase in a real
// sentence. Returns: 1) is the slang used correctly + naturally, 2) a 1-5
// star rating, 3) one short Chinese tip, 4) an improved native version.
//
// Used by the L4 (guided sentence) and L5 (free composition) drills in the
// Slang module — what flips a phrase from "I recognize it" to "I can use it".

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  phrase: string;        // e.g. "spill the tea"
  meaningCn: string;     // e.g. "爆料八卦"
  meaningEn: string;     // e.g. "To share gossip..."
  exampleEn: string;     // canonical example for context
  scenarioCn?: string;   // optional: the scenario the learner was answering
  userText: string;      // what the learner wrote
  targetLanguage?: string; // feedback language, defaults to Chinese
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as ReqBody;
    const { phrase, meaningCn, meaningEn, exampleEn, scenarioCn, userText, targetLanguage } = body;
    if (!phrase || !userText || !userText.trim()) {
      return new Response(JSON.stringify({ error: "Missing phrase or userText" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GOOGLE_AI_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feedbackLang = targetLanguage || "Chinese";

    const system = `You are a warm, encouraging American English coach. Your job is to judge whether a learner used a specific piece of US slang correctly and naturally in their own sentence. Reply ONLY via the provided tool. Feedback language: ${feedbackLang}. Keep all English example text in English.`;

    const userMsg = `Slang phrase: "${phrase}"
Meaning (CN): ${meaningCn}
Meaning (EN): ${meaningEn}
Canonical example: "${exampleEn}"
${scenarioCn ? `\nScenario the learner was responding to (CN): ${scenarioCn}` : ""}

Learner's sentence:
"""
${userText}
"""

Judge on three things:
1. Did they actually use the phrase "${phrase}" (or a clearly recognizable form of it)? -> usedPhrase (boolean)
2. Is the slang used CORRECTLY in meaning and grammar? -> correct (boolean)
3. Does it sound NATURAL the way a young Californian would say it? -> 1-5 stars (naturalness)

Then provide:
- One short, friendly tip in ${feedbackLang} explaining what was good or what to fix (tip).
- A polished native-sounding version of the same idea in English that uses the slang well (improved).
- A confidence label: "great" (correct + natural ≥4), "ok" (correct but stiff/3), or "needs_work" (incorrect or didn't use the phrase).`;

    const tool = {
      type: "function",
      function: {
        name: "grade_slang_sentence",
        description: "Structured grade for a learner's slang sentence attempt",
        parameters: {
          type: "object",
          properties: {
            usedPhrase: { type: "boolean" },
            correct: { type: "boolean" },
            naturalness: { type: "number", minimum: 1, maximum: 5 },
            tip: { type: "string" },
            improved: { type: "string" },
            verdict: { type: "string", enum: ["great", "ok", "needs_work"] },
          },
          required: ["usedPhrase", "correct", "naturalness", "tip", "improved", "verdict"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "grade_slang_sentence" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      const code = resp.status === 429
        ? "RATE_LIMIT"
        : resp.status === 402
          ? "PAYMENT_REQUIRED"
          : "SERVICE_UNAVAILABLE";
      return new Response(
        JSON.stringify({ error: code, fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      console.error("No tool_call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No grading returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const grade = JSON.parse(call.function.arguments);
    return new Response(JSON.stringify({ grade }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-slang-sentence error", e);
    return new Response(
      JSON.stringify({ error: "SERVICE_FAILED", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});