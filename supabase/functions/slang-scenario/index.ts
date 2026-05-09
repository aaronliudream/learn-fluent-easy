// Generates a "real-life scenario" prompt for an L3 slang drill.
// Given a target slang phrase (the right answer) and 3 distractor phrases,
// returns a 1-2 sentence Chinese scenario where the target phrase fits
// best — forcing the learner to map a real situation to the right slang.
//
// This is the "see a Chinese situation -> recall the English slang" muscle
// that makes phrases stick. We use Lovable AI Gemini Flash for speed and
// near-zero cost; results are cached on the client by phrase id so each
// scenario is generated at most once per phrase.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  phrase: string;
  meaningCn: string;
  meaningEn: string;
  exampleEn: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phrase, meaningCn, meaningEn, exampleEn } = (await req.json()) as ReqBody;
    if (!phrase || !meaningCn) {
      return new Response(JSON.stringify({ error: "Missing phrase / meaning" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You write tiny, vivid life scenarios in Simplified Chinese for an English-learning quiz. Each scenario is a single situation where one specific American slang phrase is the perfect thing to say — natural, casual, the way young Americans actually talk.`;

    const userMsg = `Slang phrase: "${phrase}"
Meaning (CN): ${meaningCn}
Meaning (EN): ${meaningEn}
Example: "${exampleEn}"

Write ONE Chinese scenario (1-2 short sentences, max 60 Chinese characters) describing a real-life moment where a young American would naturally say "${phrase}". The scenario must:
- Be in Simplified Chinese.
- NOT contain the English phrase or its direct Chinese translation (so the learner has to recall it).
- End with a soft cue like "你会怎么说？" or "这时美国朋友最可能说哪句？".
- Feel natural, not textbook.

Return ONLY the scenario text, no quotes, no explanations.`;

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
          { role: "user", content: userMsg },
        ],
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
      // Always return 200 so the client SDK does not throw; signal
      // fallback via the body so the UI can degrade gracefully.
      return new Response(
        JSON.stringify({ error: code, fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const scenario = (data?.choices?.[0]?.message?.content ?? "").trim();
    if (!scenario) {
      return new Response(JSON.stringify({ error: "No scenario returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ scenario }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("slang-scenario error", e);
    return new Response(
      JSON.stringify({ error: "SERVICE_FAILED", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});