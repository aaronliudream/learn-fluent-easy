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

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fallbackResponse = (error: string, message: string) =>
  jsonResponse({ translations: {}, fallback: true, error, message });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { targetLanguage, sourceLanguage, items } = await req.json() as {
      targetLanguage: string;
      sourceLanguage?: string;
      items: Item[];
    };

    if (!targetLanguage || !Array.isArray(items) || items.length === 0) {
      return jsonResponse({ error: "Invalid request" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("translate error: LOVABLE_API_KEY missing");
      return fallbackResponse("AI_UNAVAILABLE", "Translation is temporarily unavailable.");
    }

    const fromClause = sourceLanguage
      ? `from ${sourceLanguage} into ${targetLanguage}`
      : `into ${targetLanguage} (auto-detect the source language, which may be English or Chinese)`;

    const systemPrompt =
      `You are a professional UI translator. Translate the provided strings ` +
      `${fromClause}. ` +
      `Rules: ` +
      `1) Preserve any placeholders like {count}, {n}, {name} EXACTLY. ` +
      `2) Preserve emojis exactly. ` +
      `3) Keep length similar; this is for UI labels and short content. ` +
      `4) Do not add quotes or commentary. ` +
      `5) Use natural, idiomatic ${targetLanguage}. ` +
      `6) ALWAYS output in ${targetLanguage}; never translate Chinese into English unless the targetLanguage is English. ` +
      `7) If a string mixes English learning content with Chinese helper text, keep the English learning words/sentences as English and translate the Chinese helper text into ${targetLanguage}. ` +
      `8) Never return the original text unchanged unless it is only a proper noun or already fully in ${targetLanguage}. ` +
      `9) Return PLAIN TEXT only. Do NOT add any HTML or markdown tags such as <b>, </b>, <i>, <strong>, **bold**, etc. If the source contains formatting tags, drop them. ` +
      `Return ONLY a JSON object mapping each input key to its translation in ${targetLanguage}.`;

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
      if (resp.status === 402) {
        return fallbackResponse("AI_CREDITS_EXHAUSTED", "AI credits exhausted; translations are paused.");
      }
      if (resp.status === 429) {
        return fallbackResponse("AI_RATE_LIMITED", "Translation rate limit reached; retry later.");
      }
      return fallbackResponse("AI_PROVIDER_ERROR", "Translation provider error.");
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

    return jsonResponse({ translations: parsed });
  } catch (e) {
    console.error("translate error", e);
    return fallbackResponse("TRANSLATION_FAILED", e instanceof Error ? e.message : "Unknown translation error");
  }
});