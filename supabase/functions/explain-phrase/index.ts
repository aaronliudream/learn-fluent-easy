// Edge function: explain a single English word/phrase in context for Chinese learners.
// Returns cached result from `phrase_explanations` if present; otherwise calls the
// Lovable AI Gateway, stores it, and returns it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phrase, context } = await req.json();
    if (!phrase || typeof phrase !== "string") {
      return new Response(JSON.stringify({ error: "phrase required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalize(phrase);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "empty phrase" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Cache lookup
    const { data: cached } = await admin
      .from("phrase_explanations")
      .select("explanation")
      .eq("normalized", normalized)
      .eq("target_lang", "zh")
      .maybeSingle();

    if (cached?.explanation) {
      return new Response(JSON.stringify({ explanation: cached.explanation, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Ask Lovable AI Gateway
    const systemPrompt = `你是一名为中国英语学习者讲解英文单词与短语的老师。回复 JSON,字段如下:
{
  "phrase": string,            // 原短语 (清理过的小写形式)
  "pos": string,               // 词性,例如 "noun", "phrase", "verb"; 没有就空字符串
  "meaning_cn": string,        // 简明中文释义,1-2 句
  "usage_cn": string,          // 用法解释/搭配/语气提示,1-2 句
  "examples": [                // 1-2 个英文例句
    { "en": string, "cn": string }
  ],
  "synonyms": string[]         // 0-3 个常见近义词或同类表达,可为空
}
只回 JSON,不要 markdown 包裹,不要解释。`;

    const userPrompt = `请讲解短语: "${phrase}"。${context ? `它出现在这句话: "${context}"` : ""}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[explain-phrase] AI error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "ai_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to salvage
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }
    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "bad_ai_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Store in cache (best-effort)
    await admin
      .from("phrase_explanations")
      .upsert(
        {
          phrase,
          normalized,
          source_lang: "en",
          target_lang: "zh",
          explanation: parsed,
        },
        { onConflict: "normalized,target_lang" },
      );

    return new Response(JSON.stringify({ explanation: parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[explain-phrase] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});