const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      question,
      userAnswer,
      correctAnswer,
      pointTitle,
      gradeLabel = "初中",
      explanation,
    } = await req.json();

    if (!question || !correctAnswer) {
      return new Response(JSON.stringify({ error: "Missing question or correctAnswer" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `你是一位顶级中国英语老师，针对${gradeLabel}学生讲解错题。语言风格：用学生听得懂的中文 + 必要的英文例子，绝不堆砌术语。严格按以下格式输出 Markdown，不要多余话：

### ❌ 你哪里错了
（≤2 句，用学生熟悉的事物类比，点出错误的根本原因）

### ✅ 为什么 "${correctAnswer}" 是对的
（指出本题考的语法触发点，给 1 个最简单的判定方法）

### 🧠 一句口诀帮你记
（≤15 字，押韵或对仗，便于秒杀同类题）`;

    const userPrompt = `语法点：${pointTitle ?? "（未知）"}
题目：${question}
学生选/填：${userAnswer ?? "（未作答）"}
正确答案：${correctAnswer}
${explanation ? `参考解析：${explanation}` : ""}`;

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      return new Response(JSON.stringify({ error: text }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});