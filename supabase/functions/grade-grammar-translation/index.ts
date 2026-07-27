const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      pointTitle,
      mnemonic,
      cn,
      modelEn,
      userEn,
      gradeLabel = "初中",
    } = await req.json();

    if (!cn || !modelEn || !userEn) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `你是一位顶级中国英语老师，针对${gradeLabel}学生批改"情境翻译"题。
判分原则（非常重要）：
1) 只看本题考查的语法点是否被正确使用，**不要求与参考答案逐字一致**。
2) 词序、用词、时态细节、标点、大小写若不影响语法点，都算对。
3) 只要语法点用对、句意基本一致，就判 PASS。
4) 学生回答里有明显的语法点错误（漏 be 动词、人称单复数错配、时态错等），才判 FAIL。
严格输出 JSON：{"pass": true|false, "focus": "≤30字中文，只点出语法点是否用对", "fix": "如果错了，给出最小修正后的整句英文；若对了留空"}。
不要输出 JSON 以外的任何文字。`;

    const userPrompt = `语法点：${pointTitle ?? "（未知）"}
口诀：${mnemonic ?? ""}
中文情境：${cn}
参考英文：${modelEn}
学生答案：${userEn}`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      return new Response(JSON.stringify({ error: text }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await aiResp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { pass: false, focus: content, fix: "" }; }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});