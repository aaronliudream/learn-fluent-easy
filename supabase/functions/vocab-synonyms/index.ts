import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * For each requested vocab id, return:
 *   {
 *     correct: string,        // a true English synonym of the target
 *     distractors: string[]   // 3 plausible-but-WRONG English words (NOT synonyms)
 *   }
 * Cached in gaokao_vocab.synonyms (jsonb).
 */
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

    const limited = ids.slice(0, 20);
    const { data: rows, error } = await supabase
      .from("gaokao_vocab")
      .select("id, word, pos, meaning_cn, meaning_en, synonyms")
      .in("id", limited);
    if (error) throw error;

    type Pack = { correct: string; distractors: string[] };
    const results: Record<string, Pack> = {};
    const toGenerate: NonNullable<typeof rows> = [];
    for (const r of rows ?? []) {
      const cached = r.synonyms as Pack | null;
      if (
        cached &&
        typeof cached.correct === "string" &&
        Array.isArray(cached.distractors) &&
        cached.distractors.length >= 3
      ) {
        results[r.id] = {
          correct: cached.correct,
          distractors: cached.distractors.slice(0, 3),
        };
      } else {
        toGenerate.push(r);
      }
    }

    if (toGenerate.length === 0) {
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const list = toGenerate
      .map(
        (r, i) =>
          `${i + 1}. ${r.word}${r.pos ? ` (${r.pos})` : ""} — Chinese: ${r.meaning_cn}${
            r.meaning_en ? ` — EN: ${r.meaning_en}` : ""
          }`,
      )
      .join("\n");

    const prompt = `For each English word, give:
- ONE clear English SYNONYM (single word, common, same part of speech, same general meaning).
- THREE common English DISTRACTOR words that are NOT synonyms of the target but are easy to confuse with it (e.g. similar topic, similar spelling, opposite meaning, or commonly mistaken). Distractors must be different from the target word and different from the correct synonym.

All words must be lowercase single words (no phrases). Avoid extremely rare words.

${list}`;

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
                "You generate synonym-distinction quiz items for Chinese high-school English learners.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_synonyms",
                description:
                  "Return one synonym + three non-synonym distractors per word.",
                parameters: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number" },
                          word: { type: "string" },
                          correct: { type: "string" },
                          distractors: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 3,
                            maxItems: 3,
                          },
                        },
                        required: ["index", "word", "correct", "distractors"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["items"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "save_synonyms" },
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
    let parsed: {
      items: { index: number; correct: string; distractors: string[] }[];
    } = { items: [] };
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch (e) {
      console.error("parse args fail", e, args);
    }

    const updates: { id: string; pack: Pack }[] = [];
    for (const it of parsed.items ?? []) {
      const target = toGenerate[it.index - 1];
      if (!target) continue;
      const correct = String(it.correct || "").trim().toLowerCase();
      const distractors = (it.distractors || [])
        .map((d) => String(d || "").trim().toLowerCase())
        .filter(
          (d) =>
            d &&
            d !== target.word.toLowerCase() &&
            d !== correct &&
            /^[a-z][a-z\-]*$/.test(d),
        );
      // de-dup
      const uniq = Array.from(new Set(distractors)).slice(0, 3);
      if (!correct || uniq.length < 3) continue;
      const pack: Pack = { correct, distractors: uniq };
      results[target.id] = pack;
      updates.push({ id: target.id, pack });
    }

    await Promise.all(
      updates.map((u) =>
        supabase
          .from("gaokao_vocab")
          .update({ synonyms: u.pack })
          .eq("id", u.id),
      ),
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vocab-synonyms error", e);
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