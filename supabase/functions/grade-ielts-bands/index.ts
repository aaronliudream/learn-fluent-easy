// Fast-path: returns ONLY the 4 band scores + overall + 1-line summary.
// Designed for sub-5s latency so the user sees their score immediately while
// the heavier `grade-ielts-speaking` runs in parallel for full analysis.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are a certified IELTS Speaking examiner. Score the candidate using HALF-BANDS only (4.0, 4.5 ... 9.0). Pronunciation: if transcript is text-only with no audio cues, set band to 0 and comment "N/A (text-only transcript)". Be strict and concise. Output ONE tool call.`;

const TOOL = {
  type: "function",
  function: {
    name: "submit_bands",
    description: "Return overall band + 4 dimension bands with ONE-sentence comments only.",
    parameters: {
      type: "object",
      properties: {
        overall_band: { type: "number" },
        scores: {
          type: "object",
          properties: {
            fluency_coherence: { type: "object", properties: { band: { type: "number" }, comment: { type: "string" } }, required: ["band", "comment"] },
            lexical_resource:  { type: "object", properties: { band: { type: "number" }, comment: { type: "string" } }, required: ["band", "comment"] },
            grammar:           { type: "object", properties: { band: { type: "number" }, comment: { type: "string" } }, required: ["band", "comment"] },
            pronunciation:     { type: "object", properties: { band: { type: "number" }, comment: { type: "string" } }, required: ["band", "comment"] },
          },
          required: ["fluency_coherence", "lexical_resource", "grammar", "pronunciation"],
        },
        summary_zh: { type: "string", description: "1 句中文总评（不超过 40 字）" },
      },
      required: ["overall_band", "scores", "summary_zh"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Missing Authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { transcript, targetBand = 6.5 } = await req.json();
    if (!Array.isArray(transcript) || transcript.length < 2) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const text = transcript.map((m: any) => `[Part ${m.part || "?"}] ${m.role === "user" ? "Candidate" : "Examiner"}: ${m.text}`).join("\n");
    const userPrompt = `Target band: ${targetBand}\n\n=== Transcript ===\n${text}\n\n=== Task ===\nReturn ONE call to submit_bands. Bands + 1-sentence comments only.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "submit_bands" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "AI rate limit." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const txt = await aiResp.text();
      console.error("bands AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return tool call");
    const bands = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ bands }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("grade-ielts-bands error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});