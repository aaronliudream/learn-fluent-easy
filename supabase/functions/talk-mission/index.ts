// Generates a "mission card" for an upcoming AI voice chat:
//   - a clear conversational goal (in Chinese so learners get it instantly)
//   - 3 must-use English phrases tuned to the chosen topic + CEFR level
//   - a "success" condition the learner is aiming for
//
// This makes every chat task-based instead of free-floating, which (per SLA
// research on Task-Based Language Teaching) dramatically improves retention.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: Record<string, unknown>, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 503);

    const { topicLabel, topicPrompt, level, levelName } = await req.json().catch(() => ({}));
    const topic = (topicPrompt || topicLabel || "general free chat").toString();
    const lvl = (level || "B1").toString().toUpperCase();

    const system = `You design micro tasks for a Chinese learner of American English about to start a 10-minute voice chat with an AI tutor named Alex.

Output a SINGLE mission card. It must:
- Have a concrete, fun, real-life goal the learner can actually accomplish through conversation (not "talk about X"). Examples: "和 Alex 约好周末一起去 hiking 的时间和地点"; "说服 Alex 周末去尝试你最爱的中餐厅".
- List EXACTLY 3 English target phrases the learner is expected to actually USE during the chat. Each must:
  * be natural spoken American English, not textbook
  * be appropriate for CEFR ${lvl}
  * fit naturally into THIS topic
  * be something the learner is unlikely to already know but would love to be able to use
- Provide a 1-sentence Chinese success criterion ("完成条件") so the learner knows when they "won".

Return ONLY a tool call. No prose.`;

    const user = `话题: ${topic}\n难度: ${lvl}${levelName ? ` (${levelName})` : ""}\n\n生成今日对话任务卡.`;

    const body = {
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [{
        type: "function",
        function: {
          name: "deliver_mission",
          description: "Return one mission card.",
          parameters: {
            type: "object",
            properties: {
              goal_cn: { type: "string", description: "1 句中文，明确告诉学生这次对话要完成什么。" },
              must_use: {
                type: "array",
                description: "Exactly 3 target English phrases.",
                items: {
                  type: "object",
                  properties: {
                    phrase: { type: "string", description: "Target English phrase, lowercase, natural spoken form." },
                    meaning_cn: { type: "string", description: "中文意思, ≤10 字." },
                    example_en: { type: "string", description: "1 句英文例句展示用法." },
                  },
                  required: ["phrase", "meaning_cn", "example_en"],
                },
              },
              success_criteria_cn: { type: "string", description: "1 句中文完成条件, 比如「定下具体时间和地点」." },
            },
            required: ["goal_cn", "must_use", "success_criteria_cn"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "deliver_mission" } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("ai gw err", r.status, t);
      if (r.status === 429) return json({ error: "Rate limit" }, 429);
      if (r.status === 402) return json({ error: "Credits exhausted" }, 402);
      return json({ error: "AI gateway error" }, 502);
    }
    const data = await r.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return json({ error: "AI returned no tool call" }, 502);
    let parsed: any;
    try { parsed = JSON.parse(call.function?.arguments || "{}"); }
    catch { return json({ error: "Invalid JSON" }, 502); }
    return json({ mission: parsed });
  } catch (e) {
    console.error("talk-mission error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});