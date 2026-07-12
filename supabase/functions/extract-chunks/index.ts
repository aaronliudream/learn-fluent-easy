// Edge function: extract HIGH-VALUE language chunks (语块) from a chapter's sentences,
// for Chinese learners of English. Purpose-built for the reading center — its selection
// criteria are the whole point (命门), so the prompt is strict and narrative-oriented
// (NOT the dialogue/scene-noun criteria of extract-key-phrases).
//
// Input:  { sentences: [{ seq:number, en:string, cn?:string }] }  (one chapter, ≤120)
// Output: { chunks: [{ term, src_seq, zh, note }] }
//   · term   小写、原文里逐字出现的语块(短语动词/惯用表达/固定搭配)
//   · src_seq 出处句 seq(天然例句 + 复习语境)
//   · zh     这句语境下的中文释义(简短)
//   · note   一句用法说明(怎么用/什么场景/常见搭配)
// 服务端已校验 term 逐字出现在 src_seq 对应句(照 extract-key-phrases 的校验做法);不写库。

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
    const { sentences } = (await req.json()) as { sentences: { seq: number; en: string; cn?: string }[] };
    if (!Array.isArray(sentences) || !sentences.length) return json({ chunks: [] });

    const bySeq = new Map<number, string>();
    for (const s of sentences) if (s && typeof s.en === "string") bySeq.set(Number(s.seq), s.en);

    const list = sentences
      .filter((s) => s && s.en)
      .map((s) => `[${s.seq}] ${s.en}${s.cn ? `  (中文: ${s.cn})` : ""}`)
      .join("\n");

    const systemPrompt =
      "你是资深英语教师,为中国学习者从一章英文原文里挑出【最值得学的语块(language chunks)】。\n" +
      "流利的英语是成千上万预制词块拼出来的。要挑【高频、可迁移、真正的固定搭配】——学了以后别处还会遇到、还能自己用出来。\n\n" +
      "【只挑这些】\n" +
      "· 短语动词:run away / look after / pick up / take care of\n" +
      "· 惯用/固定表达:at once / a great deal of / after all / no longer / used to\n" +
      "· 强搭配(动词+名词/介词等常一起出现):make a living / take a look / in the middle of\n\n" +
      "【绝不要】\n" +
      "· 专名组合:Emerald City / Tin Woodman / Aunt Em —— 是名字,不是语块\n" +
      "· 一次性描述性组合:gray prairie / little dog / small house —— 没迁移价值\n" +
      "· 从句/长句片段 —— 语块是短语级,不是句子\n" +
      "· 单个常用词、太基础的(the/very/good morning)\n\n" +
      "【宁缺毋滥】本章只挑 10–30 个最高价值的;凑数就是噪音。若本批不够好,少给几个没关系。";

    const userPrompt =
      `下面是本章句子(每行前 [seq] 是句子编号):\n\n${list}\n\n` +
      "通过函数返回语块。要求:term 必须小写、逐字出现在对应 [seq] 那句里(允许大小写差异);" +
      "src_seq = 该语块所在句的编号;zh = 这句语境下的简短中文释义;note = 一句用法说明。";

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GOOGLE_AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_chunks",
              description: "Return the high-value language chunks.",
              parameters: {
                type: "object",
                properties: {
                  chunks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        src_seq: { type: "number" },
                        zh: { type: "string" },
                        note: { type: "string" },
                      },
                      required: ["term", "src_seq", "zh"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["chunks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_chunks" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("[extract-chunks] AI error", aiResp.status, t);
      if (aiResp.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiResp.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_failed" }, 500);
    }

    const aiJson = await aiResp.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: { chunks: Record<string, unknown>[] } = { chunks: [] };
    try {
      parsed = typeof args === "string" ? JSON.parse(args) : args;
    } catch (e) {
      console.error("[extract-chunks] parse fail", e, args);
    }

    // 校验:term 必须多词 + 逐字出现在其 src_seq 对应句(照 extract-key-phrases)。
    const seen = new Set<string>();
    const chunks = (parsed.chunks ?? [])
      .map((c) => {
        const term = String((c as { term?: string }).term || "").trim().toLowerCase();
        const seq = Number((c as { src_seq?: number }).src_seq);
        const line = bySeq.get(seq);
        if (!term || term.length < 3 || !term.includes(" ")) return null; // 语块必多词
        if (!line || !line.toLowerCase().includes(term)) return null; // 必须真实出现
        if (seen.has(term + "|" + seq)) return null;
        seen.add(term + "|" + seq);
        return {
          term,
          src_seq: seq,
          zh: String((c as { zh?: string }).zh || "").trim(),
          note: String((c as { note?: string }).note || "").trim(),
        };
      })
      .filter(Boolean);

    return json({ chunks });
  } catch (e) {
    console.error("[extract-chunks] error", e);
    return json({ error: String(e) }, 500);
  }
});
