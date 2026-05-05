import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
};

const SEED_TOKEN = "sk_seed_8f3a92c1d4e57b6a";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM = `You are an expert English-as-a-Foreign-Language curriculum designer for Chinese students (CEFR A2-B2).
You produce JSON learning content for ONE grammar point following Cambridge English Empower's Notice-Pattern-Use methodology, LingQ-style real corpus, and Monoxer-style adaptive drills.
Output MUST be valid JSON matching the schema. All English must be NATURAL, MODERN, and used by real native speakers (no textbook stiffness). Chinese explanations must be concise and clear.`;

const TOOL = {
  type: "function",
  function: {
    name: "emit_corpus",
    description: "Emit the AI learning corpus for one grammar point.",
    parameters: {
      type: "object",
      properties: {
        notice_pairs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scene: { type: "string" },
              correct: { type: "string" },
              wrong: { type: "string" },
              why_zh: { type: "string" },
            },
            required: ["scene", "correct", "wrong", "why_zh"],
            additionalProperties: false,
          },
        },
        pattern: {
          type: "object",
          properties: {
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: { text: { type: "string" }, highlight: { type: "string" } },
                required: ["text", "highlight"],
                additionalProperties: false,
              },
            },
            rule_oneliner_zh: { type: "string" },
            mnemonic_zh: { type: "string", description: "<= 8 Chinese chars" },
          },
          required: ["examples", "rule_oneliner_zh", "mnemonic_zh"],
          additionalProperties: false,
        },
        corpus_snippets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              style: { type: "string", enum: ["lyric", "tweet", "dialogue", "news", "novel"] },
              text: { type: "string" },
              target: { type: "string" },
            },
            required: ["style", "text", "target"],
            additionalProperties: false,
          },
        },
        drill_pool: {
          type: "array",
          description: "EXACTLY 12 items: 3 mcq, 3 fill, 3 spot_error, 3 reorder. 4 easy, 4 medium, 4 hard.",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["mcq", "fill", "spot_error", "reorder"] },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              prompt: { type: "string" },
              answer: { type: "string", description: "spot_error: ONLY the wrong word. fill: ONLY the blank fill." },
              options: { type: "array", items: { type: "string" } },
              explain_zh: { type: "string" },
            },
            required: ["type", "difficulty", "prompt", "answer", "explain_zh"],
            additionalProperties: false,
          },
        },
        chinglish_trap: {
          type: "object",
          properties: {
            wrong: { type: "string" },
            right: { type: "string" },
            why_zh: { type: "string" },
          },
          required: ["wrong", "right", "why_zh"],
          additionalProperties: false,
        },
      },
      required: ["notice_pairs", "pattern", "corpus_snippets", "drill_pool", "chinglish_trap"],
      additionalProperties: false,
    },
  },
};

async function generate(point: any) {
  const userPrompt = `Grammar point: **${point.title}**
${point.explanation ? `Reference notes:\n${point.explanation}\n` : ""}
${point.typical_example ? `Typical example: ${point.typical_example}\n` : ""}
${point.common_mistake ? `Common mistake: ${point.common_mistake}\n` : ""}
Generate the full learning corpus JSON now.`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "emit_corpus" } },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  const call = j.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("no tool call");
  return JSON.parse(call.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.headers.get("x-seed-token") !== SEED_TOKEN) {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }
  const url = new URL(req.url);
  const table = url.searchParams.get("table") === "junior" ? "junior_grammar_points" : "gaokao_grammar_points";
  const isJunior = table === "junior_grammar_points";
  const batch = Math.min(parseInt(url.searchParams.get("batch") || "20"), 50);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const cols = isJunior ? "id, title, summary" : "id, title, explanation, typical_example, common_mistake";
  const { data: rows, error } = await supabase
    .from(table)
    .select(cols)
    .is("ai_corpus", null)
    .order("sort_order", { ascending: true })
    .limit(batch);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const results: any[] = [];
  for (const row of rows || []) {
    const r: any = row;
    const point = isJunior
      ? { title: r.title, explanation: r.summary }
      : { title: r.title, explanation: r.explanation, typical_example: r.typical_example, common_mistake: r.common_mistake };
    try {
      const corpus = await generate(point);
      const { error: upErr } = await supabase.from(table).update({ ai_corpus: corpus }).eq("id", r.id);
      if (upErr) throw upErr;
      results.push({ id: r.id, title: r.title, ok: true });
    } catch (e: any) {
      results.push({ id: r.id, title: r.title, ok: false, err: String(e?.message ?? e) });
    }
  }

  const { count: remaining } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .is("ai_corpus", null);

  return new Response(
    JSON.stringify({ table, processed: results.length, ok: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length, remaining, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});