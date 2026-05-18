// Pre-generates 5 "target expressions" Alex should naturally weave into
// the upcoming 10-min voice chat. Called once at the start of a session.
// Uses Lovable AI Gateway (no API key needed).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const TOOL = {
  type: "function" as const,
  function: {
    name: "deliver_targets",
    description: "Return 5 target expressions for the upcoming chat.",
    parameters: {
      type: "object",
      properties: {
        targets: {
          type: "array",
          description: "Exactly 5 useful English expressions calibrated to the learner's level.",
          items: {
            type: "object",
            properties: {
              phrase: { type: "string", description: "The target word / collocation / phrasal verb (English)." },
              meaning_cn: { type: "string", description: "Short Chinese gloss (≤12 字)." },
              example_en: { type: "string", description: "One natural example sentence Alex might say." },
            },
            required: ["phrase", "meaning_cn", "example_en"],
          },
        },
      },
      required: ["targets"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!KEY) return json({ error: "AI gateway not configured" }, 503);
    const { lessonTitle, level } = await req.json().catch(() => ({}));

    const sys = `You are an ESL curriculum designer choosing the BEST 5 expressions for a 10-minute voice chat between an AI tutor (Alex, native Californian) and a Chinese learner.

RULES:
- Pick exactly 5 useful, *natural* spoken English expressions: idioms, collocations, phrasal verbs, or high-utility single words.
- Calibrate to the learner's CEFR level (${level || "B1"}). Avoid words they almost certainly already know (the / want / very / nice).
- Prefer items that fit the topic so Alex can use them organically.
- Avoid slang that's too regional or dated.
- Return ONLY a tool call.`;

    const user = `Topic: ${lessonTitle || "general free-form chat (weekend / hobbies / food / travel)"}\nLearner level: ${level || "B1"}\n\nPick 5 target expressions Alex will weave into the chat.`;

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "deliver_targets" } },
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("targets gateway error", r.status, t);
      return json({ error: "AI gateway error" }, 502);
    }
    const data = await r.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return json({ error: "no tool call" }, 502);
    const parsed = JSON.parse(call.function?.arguments || "{}");
    return json({ targets: parsed.targets || [] });
  } catch (e) {
    console.error("generate-talk-targets error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});