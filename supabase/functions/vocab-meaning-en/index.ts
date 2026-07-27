import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ results: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const limited = ids.slice(0, 30);
    const { data: rows, error } = await supabase
      .from("gaokao_vocab")
      .select("id, word, pos, meaning_cn, meaning_en")
      .in("id", limited);
    if (error) throw error;

    const results: Record<string, string> = {};
    const toGenerate: typeof rows = [];
    for (const r of rows ?? []) {
      if (r.meaning_en && r.meaning_en.trim().length > 0) {
        results[r.id] = r.meaning_en;
      } else {
        toGenerate.push(r);
      }
    }

    if (toGenerate.length === 0) {
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a single batch prompt for efficiency
    const list = toGenerate
      .map(
        (r, i) =>
          `${i + 1}. ${r.word}${r.pos ? ` (${r.pos})` : ""} — Chinese: ${r.meaning_cn}`,
      )
      .join("\n");

    const prompt = `For each English word below, write ONE concise English definition (max 12 words, plain dictionary style, no examples, no Chinese). Use the Chinese hint to disambiguate the intended sense. Respond as JSON via the function call.\n\n${list}`;

    const aiResp = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a concise English-English dictionary writer for Chinese high-school learners.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_definitions",
                description: "Return one English definition per word.",
                parameters: {
                  type: "object",
                  properties: {
                    definitions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number" },
                          word: { type: "string" },
                          definition: { type: "string" },
                        },
                        required: ["index", "word", "definition"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["definitions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "save_definitions" },
          },
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429 || aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            results,
            error:
              aiResp.status === 429
                ? "Rate limit, please try again later."
                : "Lovable AI credits exhausted.",
          }),
          {
            status: aiResp.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await aiResp.text();
      console.error("ai gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ results, error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const args =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: { definitions: { index: number; definition: string }[] } = {
      definitions: [],
    };
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch (e) {
      console.error("parse args fail", e, args);
    }

    const updates: { id: string; meaning_en: string }[] = [];
    for (const def of parsed.definitions ?? []) {
      const target = toGenerate[def.index - 1];
      if (!target) continue;
      const clean = String(def.definition || "").trim();
      if (!clean) continue;
      results[target.id] = clean;
      updates.push({ id: target.id, meaning_en: clean });
    }

    // Persist cache (one-by-one update to keep it simple & safe)
    await Promise.all(
      updates.map((u) =>
        supabase
          .from("gaokao_vocab")
          .update({ meaning_en: u.meaning_en })
          .eq("id", u.id),
      ),
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vocab-meaning-en error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});