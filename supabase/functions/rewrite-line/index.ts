// Edge function: given an English sentence, return 3 alternative ways to say
// the same thing in different registers, plus a short Chinese explanation of
// the difference. Cached in `line_rewrites`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const SCHEMA_VERSION = "zh-v1";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sentence, sceneHint } = await req.json();
    if (!sentence || typeof sentence !== "string") {
      return new Response(JSON.stringify({ error: "sentence required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const normalized = normalize(sentence);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: cached } = await admin
      .from("line_rewrites")
      .select("rewrites")
      .eq("normalized", normalized)
      .eq("target_lang", SCHEMA_VERSION)
      .maybeSingle();

    if (cached?.rewrites) {
      return new Response(JSON.stringify({ rewrites: cached.rewrites, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `你是一位地道的英文口语老师。给定一句英文,返回 3 个等价但风格不同的说法,帮助中国学习者掌握不同语域下的表达方式。

严格按下面的 JSON 返回,不要 markdown,不要多余文字:
{
  "original": string,                   // 原句 (清理后的)
  "alternatives": [
    {
      "style": string,                  // 简短风格标签,例如 "更正式" / "更地道口语" / "更礼貌" / "更随意" / "母语年轻人"
      "en": string,                     // 替换说法,完整句子
      "cn": string,                     // 中文翻译
      "diff_cn": string,                // 1-2 句中文,讲解和原句的差异/适用场景
      "tone": "formal" | "casual" | "polite" | "native" | "neutral"
    }
  ]
}

要求:
- 必须给出恰好 3 个 alternatives,风格各不相同
- en 必须是真正母语人士说的话,自然、口语、不死板
- diff_cn 直接对比原句和替换的差异,例如 "原句更教科书,这个更像美国人会说"
- 整体读起来像一节地道口语课,不要学术腔`;

    const userPrompt = `请改写这句话: "${sentence}"。${sceneHint ? `场景: ${sceneHint}` : ""}`;

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
      console.error("[rewrite-line] AI error", aiResp.status, errText);
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
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.alternatives)) {
      return new Response(JSON.stringify({ error: "bad_ai_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin
      .from("line_rewrites")
      .upsert(
        {
          original: sentence,
          normalized,
          target_lang: SCHEMA_VERSION,
          rewrites: parsed,
        },
        { onConflict: "normalized,target_lang" },
      );

    return new Response(JSON.stringify({ rewrites: parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[rewrite-line] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});