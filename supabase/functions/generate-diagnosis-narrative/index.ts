// Edge function: generate-diagnosis-narrative
// Reads the JSON output of get_deep_diagnosis and asks an AI model to compose
// 3 narrative blocks (opening, 3 specific situations, 7-day plan).
// Falls back to deterministic templates when AI is unavailable.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fallbackNarrative(stats: any) {
  const total = stats?.portrait_30d?.total_attempts ?? 0;
  const correct = stats?.portrait_30d?.correct_rate ?? 0;
  const days = stats?.days_to_gaokao ?? 100;
  return {
    has_ai_narrative: false,
    opening_narration: {
      headline: "你正在稳定积累",
      subtitle: `最近 30 天答题 ${total} 道，综合正确率 ${correct}%`,
    },
    specific_situations: [
      {
        title: "知识漏洞需系统补",
        detail: "AI 已识别若干薄弱知识点，建议从掌握度最低的 3 个开始集中突破。",
        confidence: 70,
        actionable_hint: "进入弱点 KP 列表逐个攻克",
      },
      {
        title: "限时训练能提速",
        detail: "部分题型用时偏长，限时模式能帮你建立题感。",
        confidence: 65,
        actionable_hint: "每天 1 套限时小测",
      },
      {
        title: "错题复盘价值最大",
        detail: "重做错题比刷新题提分更快，建议每周固定时段复盘。",
        confidence: 75,
        actionable_hint: "去错题本重做",
      },
    ],
    seven_day_plan: [
      {
        day_range: "Day 1-2",
        task_title: "弱点 KP 集中补",
        detail: "从 mastery 最低的 3 个知识点入手，每个 15 分钟。",
        est_minutes_per_day: 30,
        est_points_gain: "+1.5 分",
      },
      {
        day_range: "Day 3-5",
        task_title: "限时综合训练",
        detail: `距高考 ${days} 天，每天 1 套限时综合训练巩固。`,
        est_minutes_per_day: 25,
        est_points_gain: "+1.0 分",
      },
      {
        day_range: "Day 6-7",
        task_title: "错题二刷复盘",
        detail: "把本周错题全部重做一次，巩固薄弱点。",
        est_minutes_per_day: 20,
        est_points_gain: "+0.8 分",
      },
    ],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { stats } = (await req.json()) as { stats: any };
    if (!stats) return json({ error: "stats required" }, 400);

    if (!stats.has_enough_data || !OPENAI_API_KEY) {
      return json(fallbackNarrative(stats));
    }

    const userPrompt = `学生数据（最近 30 天）：
- 总答题：${stats.portrait_30d?.total_attempts ?? 0}
- 综合正确率：${stats.portrait_30d?.correct_rate ?? 0}%
- 错因分布：${JSON.stringify(stats.error_breakdown ?? {})}
- 弱点 TOP6：${JSON.stringify(stats.weak_kps ?? [])}
- 时间维度：${JSON.stringify(stats.time_analysis ?? [])}
- 距高考：${stats.days_to_gaokao ?? "未知"} 天

请基于以上真实数据生成深度诊断叙事。每个判断都要给出数据依据。`;

    const tool = {
      type: "function",
      function: {
        name: "submit_diagnosis_narrative",
        description: "Submit a complete diagnosis narrative.",
        parameters: {
          type: "object",
          properties: {
            opening_narration: {
              type: "object",
              properties: {
                headline: { type: "string", description: "≤15 字洞察标题" },
                subtitle: { type: "string", description: "≤30 字支撑细节" },
              },
              required: ["headline", "subtitle"],
              additionalProperties: false,
            },
            specific_situations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "≤20 字现象描述（必须含数字）" },
                  detail: { type: "string", description: "≤80 字解释" },
                  confidence: { type: "integer", minimum: 0, maximum: 100 },
                  actionable_hint: { type: "string", description: "≤30 字解决方向" },
                },
                required: ["title", "detail", "confidence", "actionable_hint"],
                additionalProperties: false,
              },
            },
            seven_day_plan: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  day_range: { type: "string", description: "如 Day 1-2" },
                  task_title: { type: "string", description: "≤15 字任务名" },
                  detail: { type: "string", description: "≤50 字方法说明" },
                  est_minutes_per_day: { type: "integer" },
                  est_points_gain: { type: "string", description: "如 +1.5 分" },
                },
                required: ["day_range", "task_title", "detail", "est_minutes_per_day", "est_points_gain"],
                additionalProperties: false,
              },
            },
          },
          required: ["opening_narration", "specific_situations", "seven_day_plan"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "你是高考英语 AI 学情分析师。基于学生的真实学习数据生成深度诊断叙事。原则：(1) 全部基于数据说话，不凭空捏造；(2) 语气：教练 + 观察者 + 共情，不评判；(3) 文案要让学生有'被理解'的感觉而非被审判；(4) 每个判断要给出数据依据。",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_diagnosis_narrative" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      if (aiRes.status === 429 || aiRes.status === 402) {
        return json({ ...fallbackNarrative(stats), ai_error: aiRes.status }, 200);
      }
      return json(fallbackNarrative(stats));
    }

    const aiData = await aiRes.json();
    const call = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    const argStr = call?.function?.arguments;
    if (!argStr) {
      console.error("No tool call in AI response", JSON.stringify(aiData).slice(0, 500));
      return json(fallbackNarrative(stats));
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argStr);
    } catch (e) {
      console.error("Failed to parse tool args:", e);
      return json(fallbackNarrative(stats));
    }

    return json({ has_ai_narrative: true, ...parsed });
  } catch (e) {
    console.error("generate-diagnosis-narrative failed:", e);
    return json({ error: String(e) }, 500);
  }
});