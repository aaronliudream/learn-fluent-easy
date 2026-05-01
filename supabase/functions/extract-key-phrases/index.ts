// Edge function: given a dialogue's English lines, return the key
// expressions worth quizzing — the kind of phrases a human teacher would
// highlight in yellow as "this is what you should remember from this lesson."
// Cached per-dialogue in `dialogue_key_phrases`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

/** Stable fingerprint of the dialogue so cache invalidates on edits. */
async function hashContent(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dialogueKey, lines } = await req.json();
    if (
      !dialogueKey ||
      typeof dialogueKey !== "string" ||
      !Array.isArray(lines) ||
      lines.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "dialogueKey and lines required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const cleanLines: { en: string; cn: string }[] = lines
      .map((l: any) => ({
        en: typeof l?.en === "string" ? l.en : "",
        cn: typeof l?.cn === "string" ? l.cn : "",
      }))
      .filter((l) => l.en);

    const fingerprint = await hashContent(
      cleanLines.map((l) => l.en.trim().toLowerCase()).join("\n"),
    );

    const { data: cached } = await admin
      .from("dialogue_key_phrases")
      .select("phrases")
      .eq("dialogue_key", dialogueKey)
      .eq("content_hash", fingerprint)
      .maybeSingle();

    if (cached?.phrases) {
      return new Response(
        JSON.stringify({ phrases: cached.phrases, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dialogueText = cleanLines
      .map((l, i) => `${i + 1}. EN: ${l.en}\n   CN: ${l.cn}`)
      .join("\n");

    const systemPrompt = `你是一位地道的英文口语老师,正在为中国学习者挑选一段对话里"最值得记住的表达"。

请从对话里挑出 8 到 14 个 KEY EXPRESSIONS — 也就是老师会用黄色荧光笔标出来的那些短语:
- 地道的口语表达 / 习语 / 固定搭配 (例: "got a kick to it", "tone it down", "a side of", "do family style", "made fresh", "put that order in")
- 场景里有用的名词词组 (例: "kung pao chicken", "jasmine tea", "soft drinks", "appetizers")
- 自然的应答短语 (例: "Sure thing!", "You bet")
- 学习者可能不会主动想到、但听到一定要懂的搭配

不要选:
- 单个常用词 (the, a, get, have, like)
- 太基础的短语 (thank you, hello, yes, no, please)
- 过于明显、不需要练习的内容

严格按下面的 JSON 返回,不要 markdown,不要多余文字:
{
  "expressions": [
    {
      "en": string,           // 表达本身,小写,完全保留对话里出现的形态 (含介词/冠词)
      "line_index": number,   // 它在对话里第几行 (1-based,与输入编号一致)
      "cn": string,           // 简短中文释义,5-15字
      "why": string           // 1 句中文,为什么值得记 (口语化、地道感、易混)
    }
  ]
}

要求:
- en 必须真的在对应那一行里逐字出现 (允许大小写差异)
- 顺序按对话出现顺序
- 同一个表达不要重复
- 至少 8 个,如果对话足够丰富给到 14 个`;

    const userPrompt = `对话内容:\n${dialogueText}`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      },
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[extract-key-phrases] AI error", aiResp.status, errText);
      const status =
        aiResp.status === 429 ? 429 : aiResp.status === 402 ? 402 : 500;
      return new Response(
        JSON.stringify({
          error:
            status === 429
              ? "rate_limited"
              : status === 402
                ? "credits_exhausted"
                : "ai_failed",
        }),
        {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
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
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.expressions)
    ) {
      return new Response(JSON.stringify({ error: "bad_ai_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate: each expression must literally appear in its referenced line.
    const validated = parsed.expressions
      .map((e: any) => {
        const idx = Number(e?.line_index) - 1;
        if (!Number.isInteger(idx) || idx < 0 || idx >= cleanLines.length) {
          return null;
        }
        const en = String(e?.en || "").trim().toLowerCase();
        if (!en || en.length < 2) return null;
        const lineLower = cleanLines[idx].en.toLowerCase();
        if (!lineLower.includes(en)) return null;
        return {
          en,
          line_index: idx,
          cn: String(e?.cn || ""),
          why: String(e?.why || ""),
        };
      })
      .filter(Boolean);

    const phrases = { expressions: validated };

    await admin.from("dialogue_key_phrases").upsert(
      {
        dialogue_key: dialogueKey,
        content_hash: fingerprint,
        phrases,
      },
      { onConflict: "dialogue_key,content_hash" },
    );

    return new Response(
      JSON.stringify({ phrases, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[extract-key-phrases] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});