// Edge function: batch child-friendly ENGLISH gloss generator for the reading center.
// Input:  { items: [{ word: string, context?: string }] }   (≤30 per call)
// Output: { results: [{ index, word, gloss_en }] }
//
// 为「英语母语者复习模式」造英英释义(儿童向)。与 define-words 平行、互不影响:
//   · define-words 产 gloss_cn(中文学习者);本函数只产 gloss_en(英语母语者)。
//   · 纯生成器,不碰 DB;prewarm-glosses-en.mjs 把结果 jsonb-merge 进 read-v1 卡(只加 gloss_en)。
// 儿童向铁律:用比目标词更简单/更常见的词来解释,不出现目标词本身,不词典腔,不举例,尽量短。
// 带出处句消歧(和中文释义同一个铁律:这本书里的词就是这本书里的意思)。

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items } = (await req.json()) as { items: { word: string; context?: string }[] };
    if (!Array.isArray(items) || items.length === 0) return json({ results: [] });

    const limited = items.slice(0, 30);
    const list = limited
      .map(
        (w, i) =>
          `${i + 1}. "${w.word}"${w.context ? `  (as used in: "${String(w.context).slice(0, 200)}")` : ""}`,
      )
      .join("\n");

    const systemPrompt =
      "You write a picture-dictionary for young bilingual children (ages 7-11) who are native English speakers. " +
      "For each word OR phrase, write ONE very simple English definition. Rules: " +
      "(1) use only words that are easier and more common than the target word/phrase; " +
      "(2) never use the target word/phrase (or its obvious forms) inside the definition; " +
      "(3) be concrete and plain, no dictionary jargon, no part-of-speech labels, no examples; " +
      "(4) keep it short, about 4-12 words; " +
      "(5) if a sentence is given, define ONLY the meaning it has in that sentence; " +
      "(6) FORMAT: every definition must be ONE complete sentence — start with a capital letter and end with a period — " +
      "for phrases too. E.g. \"in the middle of\" -> \"In the center part of something.\"; " +
      "\"at once\" -> \"Immediately, without waiting.\"; \"look after\" -> \"To take care of someone or something.\"";

    const userPrompt =
      `Write a child-friendly English definition for each item, returned via the function call:\n\n${list}`;

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_en_glosses",
                description: "Return one child-friendly English definition per item.",
                parameters: {
                  type: "object",
                  properties: {
                    glosses: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "number" },
                          word: { type: "string" },
                          gloss_en: { type: "string" },
                        },
                        required: ["index", "word", "gloss_en"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["glosses"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_en_glosses" } },
        }),
      },
    );

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("[library-gloss-en] AI error", aiResp.status, t);
      if (aiResp.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiResp.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_failed" }, 500);
    }

    const aiJson = await aiResp.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: { glosses: Record<string, unknown>[] } = { glosses: [] };
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch (e) {
      console.error("[library-gloss-en] parse fail", e, args);
    }

    const results = (parsed.glosses ?? []).map((g) => {
      const idx = Number((g as { index?: number }).index) || 0;
      const src = limited[idx - 1];
      return {
        index: idx,
        word: String((g as { word?: string }).word || src?.word || "").trim(),
        gloss_en: String((g as { gloss_en?: string }).gloss_en || "").trim(),
      };
    });

    return json({ results });
  } catch (e) {
    console.error("[library-gloss-en] error", e);
    return json({ error: String(e) }, 500);
  }
});
