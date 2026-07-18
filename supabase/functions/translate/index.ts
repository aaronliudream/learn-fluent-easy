// Batch-translate UI strings on demand.
// Input:  { targetLanguage: "Italian", items: [{ key, text }, ...] }
// Output: { translations: { [key]: "..." } }
//
// Uses OpenAI gpt-4o-mini (cheap, fast) via the OpenAI-compatible chat API.
// Strings are short UI labels, so cost is minimal and the client caches
// results in localStorage.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Item = { key: string; text: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { targetLanguage, sourceLanguage, items } = await req.json() as {
      targetLanguage: string;
      sourceLanguage?: string;
      items: Item[];
    };

    if (!targetLanguage || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

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

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      // Return 200 with empty translations + fallback flag so the client
      // gracefully falls back to source text instead of crashing on a thrown
      // FunctionsHttpError. This keeps the UI usable when AI credits are
      // exhausted (402) or the provider is rate-limiting (429).
      const reason = resp.status === 402
        ? "credits_exhausted"
        : resp.status === 429
          ? "rate_limited"
          : "provider_error";
      const passthrough = Object.fromEntries(items.map((i) => [i.key, i.text]));
      return new Response(
        JSON.stringify({ translations: passthrough, fallback: true, reason }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, string> = {};
    parsed = safeParseJsonObject(content);
    if (!parsed || Object.keys(parsed).length === 0) {
      // Fallback: passthrough so UI keeps working
      parsed = Object.fromEntries(items.map((i) => [i.key, i.text]));
      return new Response(
        JSON.stringify({ translations: parsed, fallback: true, reason: "parse_error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

function safeParseJsonObject(raw: string): Record<string, string> {
  if (!raw) return {};
  // Strip markdown code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Direct parse
  try { const v = JSON.parse(s); return typeof v === "object" && v ? v : {}; } catch {}
  // Extract outermost {...}
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  // Remove control chars and trailing commas
  s = s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
  try { const v = JSON.parse(s); return typeof v === "object" && v ? v : {}; } catch {}
  // Last resort: pull out "key":"value" pairs
  const out: Record<string, string> = {};
  const re = /"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    try { out[JSON.parse(`"${m[1]}"`)] = JSON.parse(`"${m[2]}"`); } catch {}
  }
  return out;
}