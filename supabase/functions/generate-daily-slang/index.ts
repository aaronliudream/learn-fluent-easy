import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    // Skip if today already populated
    const { count } = await admin
      .from("daily_slang")
      .select("id", { count: "exact", head: true })
      .eq("fetch_date", today);
    if ((count ?? 0) >= 20) {
      return new Response(JSON.stringify({ ok: true, skipped: true, count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch existing phrases (last 60 days) to avoid duplicates
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
    const { data: recent } = await admin
      .from("daily_slang")
      .select("phrase")
      .gte("fetch_date", sixtyDaysAgo);
    const existing = new Set((recent ?? []).map((r: any) => r.phrase.toLowerCase()));

    const systemPrompt = `You are an American pop-culture linguist. Output 20 currently trending US slang terms heard this week on TikTok, Twitter/X, Reddit, US radio, podcasts, late-night TV, and major newspapers. Mix Gen-Z internet slang, hip-hop slang, sports slang, news/political slang, and meme phrases. AVOID outdated terms (>2 years old) and AVOID anything in the EXCLUDE list.`;

    const userPrompt = `EXCLUDE these phrases (already in our database):\n${[...existing].slice(0, 200).join(", ") || "(none)"}\n\nReturn exactly 20 fresh trending US slang items.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_slang",
              description: "Return 20 trending US slang items",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    minItems: 20,
                    maxItems: 20,
                    items: {
                      type: "object",
                      properties: {
                        phrase: { type: "string", description: "The slang phrase in English, lowercase unless proper noun" },
                        meaning_cn: { type: "string", description: "Concise Chinese meaning, under 15 chars" },
                        meaning_en: { type: "string", description: "Concise English definition" },
                        example: { type: "string", description: "Natural English example sentence using the phrase" },
                        example_cn: { type: "string", description: "Chinese translation of the example" },
                        source_hint: { type: "string", description: "Where it's commonly heard, e.g. 'TikTok', 'Hip-hop', 'NBA Twitter'" },
                      },
                      required: ["phrase", "meaning_cn", "meaning_en", "example", "example_cn", "source_hint"],
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
        tool_choice: { type: "function", function: { name: "submit_slang" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error", status: aiResp.status }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) throw new Error("No tool call returned");
    const parsed = JSON.parse(args);
    const items = parsed.items as Array<any>;

    // Filter dupes vs existing db
    const fresh = items.filter((it) => !existing.has(String(it.phrase).toLowerCase()));

    const rows = fresh.map((it) => ({
      phrase: it.phrase,
      meaning_cn: it.meaning_cn,
      meaning_en: it.meaning_en,
      example: it.example,
      example_cn: it.example_cn,
      source_hint: it.source_hint ?? null,
      fetch_date: today,
    }));

    if (rows.length > 0) {
      const { error } = await admin.from("daily_slang").upsert(rows, {
        onConflict: "fetch_date,phrase",
        ignoreDuplicates: true,
      });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, inserted: rows.length, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-daily-slang error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});