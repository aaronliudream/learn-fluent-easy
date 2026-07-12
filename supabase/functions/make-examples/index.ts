// Edge function: for each (English term + Chinese meaning), write ONE brand-new,
// different-scene, child-friendly example sentence that illustrates THAT meaning —
// so learners see the word used in a fresh context (transfer), not the storybook sentence.
//
// Input:  { items: [{ term: string, meaning: string }] }  (≤30)
// Output: { results: [{ index, term, en, cn }] }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: Record<string, unknown>, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { items } = (await req.json()) as { items: { term: string; meaning: string }[] };
    if (!Array.isArray(items) || !items.length) return json({ results: [] });
    const limited = items.slice(0, 30);
    const list = limited.map((it, i) => `${i + 1}. "${it.term}" —— 意思:${it.meaning}`).join("\n");

    const systemPrompt =
      "你是儿童英语例句老师。给每个【英文词/语块 + 中文意思】,造一个【全新的、不同场景的】简单英文例句,展示这个意思怎么用到别处。\n" +
      "要求:\n" +
      "· 场景贴近孩子日常(学校/家里/公园/食物/玩具/朋友/宠物),【不要】奇幻/女巫/龙卷风/稻草人等故事设定;\n" +
      "· 一句话,简单、好懂、好朗读(6-9岁);\n" +
      "· 必须清楚体现给定的【中文意思】——多义词严格按这个意思造,别跑到别的义项;\n" +
      "· 【不要】抄或改写任何故事原句,要造全新的句子;\n" +
      "· 配简短自然的中文翻译。";
    const userPrompt = `为下面每个造新例句,通过函数返回:\n\n${list}`;

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GOOGLE_AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_examples",
            description: "Return one fresh example per term.",
            parameters: {
              type: "object",
              properties: {
                examples: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" }, term: { type: "string" },
                      en: { type: "string" }, cn: { type: "string" },
                    },
                    required: ["index", "en", "cn"], additionalProperties: false,
                  },
                },
              },
              required: ["examples"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "save_examples" } },
      }),
    });
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("[make-examples] AI error", aiResp.status, t);
      if (aiResp.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiResp.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_failed" }, 500);
    }
    const aiJson = await aiResp.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: { examples: Record<string, unknown>[] } = { examples: [] };
    try { parsed = typeof args === "string" ? JSON.parse(args) : args; } catch (e) { console.error("[make-examples] parse", e); }
    const results = (parsed.examples ?? []).map((g) => {
      const idx = Number((g as { index?: number }).index) || 0;
      return {
        index: idx, term: limited[idx - 1]?.term || "",
        en: String((g as { en?: string }).en || "").trim(),
        cn: String((g as { cn?: string }).cn || "").trim(),
      };
    });
    return json({ results });
  } catch (e) {
    console.error("[make-examples] error", e);
    return json({ error: String(e) }, 500);
  }
});
