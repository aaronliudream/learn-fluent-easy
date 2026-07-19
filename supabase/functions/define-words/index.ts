// Edge function: batch light-gloss generator for the reading center (精读轻词义).
// Input:  { words: [{ word: string, context?: string }] }  (≤30 per call)
// Output: { results: [{ index, word, pos, ipa, gloss_cn, example_en, example_cn }] }
//
// Deliberately LIGHT (词性 + 音标 + 一句话中文释义 + 例句) — NOT the heavy 8-section
// lesson card that `explain-phrase` produces. Used by the offline pre-generation
// script (scripts/library/prewarm-definitions.mjs), which writes results into
// `phrase_explanations` (target_lang='read-v1') via SQL. This function does NOT
// touch the DB itself — it is a pure generator, mirroring vocab-meaning-en's batch shape.

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
    const { words } = (await req.json()) as { words: { word: string; context?: string }[] };
    if (!Array.isArray(words) || words.length === 0) return json({ results: [] });

    const limited = words.slice(0, 30);
    const list = limited
      .map(
        (w, i) =>
          `${i + 1}. "${w.word}"${w.context ? `  (出现在句子: "${String(w.context).slice(0, 200)}")` : ""}`,
      )
      .join("\n");

    const systemPrompt =
      "你是面向中国英语学习者的简明词典。对每个英文单词,只给最精炼的信息:词性、IPA 音标、一句话中文释义、一个简单例句。" +
      "释义要口语、准确、面向精读的中小学生,不要长篇讲解、不要多义罗列。若给了出处句,按该句里的意思消歧,只解释那个意思。";

    const userPrompt =
      `请为下面每个英文单词生成轻词义,通过函数调用返回:\n\n${list}\n\n` +
      "字段要求:pos 用简写(n. / v. / adj. / adv. / prep. / conj. / pron. / art. / num. 等);" +
      "ipa 用带斜杠的国际音标(美音,如 /ˈkɪtʃən/);gloss_cn 一句话中文释义(尽量 ≤12 字);" +
      "example_en 一个简单英文例句,example_cn 其中文翻译。";

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
                name: "save_glosses",
                description: "Return one light gloss per word.",
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
                          pos: { type: "string" },
                          ipa: { type: "string" },
                          gloss_cn: { type: "string" },
                          example_en: { type: "string" },
                          example_cn: { type: "string" },
                        },
                        required: ["index", "word", "gloss_cn"],
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
          tool_choice: { type: "function", function: { name: "save_glosses" } },
        }),
      },
    );

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("[define-words] AI error", aiResp.status, t);
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
      console.error("[define-words] parse fail", e, args);
    }

    // IPA 硬闸:真音标必含至少一个 IPA 专用符号(ɪ ː ə ɛ æ ʌ θ ð ʃ ʒ ŋ ɔ ɑ ɜ ʊ ɡ ɹ …)。
    // 纯 ASCII 拼写(/bim/、/er/、/SKIN/)不含 → 判为伪音标,丢弃(留空好过显错音标),记 warnings 供上游人工补。
    const IPA_GLYPH = /[ɪːəɛæʌθðʃʒŋɔɑɜʊɡɹˈˌɒʧʤɐ]/u; // 只认非ASCII真音标符;双元音 eɪ/aʊ 由其中的 ɪ/ʊ 覆盖
    const ipaWarnings: string[] = [];
    const results = (parsed.glosses ?? []).map((g) => {
      const idx = Number((g as { index?: number }).index) || 0;
      const src = limited[idx - 1];
      const word = String((g as { word?: string }).word || src?.word || "").trim();
      let ipa = String((g as { ipa?: string }).ipa || "").trim();
      if (ipa && !IPA_GLYPH.test(ipa)) { ipaWarnings.push(`${word}: ${ipa}`); ipa = ""; } // 伪音标 → 丢弃
      return {
        index: idx,
        word,
        pos: String((g as { pos?: string }).pos || "").trim(),
        ipa,
        gloss_cn: String((g as { gloss_cn?: string }).gloss_cn || "").trim(),
        example_en: String((g as { example_en?: string }).example_en || "").trim(),
        example_cn: String((g as { example_cn?: string }).example_cn || "").trim(),
      };
    });
    if (ipaWarnings.length) console.warn(`[define-words] 丢弃 ${ipaWarnings.length} 个伪音标:`, ipaWarnings.join(" · "));

    return json({ results, ipaWarnings });
  } catch (e) {
    console.error("[define-words] error", e);
    return json({ error: String(e) }, 500);
  }
});
