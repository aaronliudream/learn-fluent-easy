// Batch-translate UI strings on demand.
// Input:  { targetLanguage: "Italian", items: [{ key, text }, ...] }
// Output: { translations: { [key]: "..." } }
//
// Uses Lovable AI Gemini Flash (cheap, fast). Strings are short UI labels,
// so this is well within free-tier credits and the client caches results in
// localStorage.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Item = { key: string; text: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { targetLanguage, items } = await req.json() as {
      targetLanguage: string;
      items: Item[];
    };

    if (!targetLanguage || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt =
      `You are a professional UI translator. Translate the provided UI strings ` +
      `from English into ${targetLanguage}. ` +
      `Rules: ` +
      `1) Preserve any placeholders like {count}, {n}, {name} EXACTLY. ` +
      `2) Preserve emojis exactly. ` +
      `3) Keep length similar; this is for buttons and labels. ` +
      `4) Do not add quotes or commentary. ` +
      `5) Use natural, idiomatic ${targetLanguage}. ` +
      `Return ONLY a JSON object mapping each input key to its translation.`;

    const userPayload = JSON.stringify(
      Object.fromEntries(items.map((i) => [i.key, i.text])),
    );

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPayload },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 500;
      const msg = resp.status === 429
        ? "Rate limit reached, please retry shortly."
        : resp.status === 402
          ? "AI credits exhausted; please top up Lovable AI credits."
          : "Translation provider error";
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to salvage a JSON object from the content
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    return new Response(JSON.stringify({ translations: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});