// Edge function: classify-mistake-cause
// Classifies a wrong-answer attempt into knowledge_gap | speed | strategy | careless

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface Body {
  attempt_id?: string;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  time_spent_seconds: number;
  avg_time_for_question?: number;
  kp_id?: string;
  kp_title?: string;
  skill_area?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.question_text || !body?.correct_answer) {
      return json({ error: "question_text and correct_answer required" }, 400);
    }

    const avg = body.avg_time_for_question ?? 30;
    const isFast = body.time_spent_seconds < avg * 0.5;

    let result: { error_type: string; confidence: number; evidence: string } = {
      error_type: isFast ? "careless" : "knowledge_gap",
      confidence: 0.5,
      evidence: isFast ? "用时明显偏快，疑似粗心" : "默认归为知识缺口",
    };

    if (OPENAI_API_KEY) {
      try {
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
                content: `你是错因分析专家。判断学生错题归类。四类：knowledge_gap（真不会）、speed（知道但太慢）、strategy（思路偏差）、careless（粗心）。只输出 JSON。`,
              },
              {
                role: "user",
                content: `题目：${body.question_text}\n正确答案：${body.correct_answer}\n学生答案：${body.user_answer}\n用时：${body.time_spent_seconds}秒（平均${avg}秒）\n考点：${body.kp_title ?? "未知"}`,
              },
            ],
            tools: [{
              type: "function",
              function: {
                name: "classify_error",
                parameters: {
                  type: "object",
                  properties: {
                    error_type: { type: "string", enum: ["knowledge_gap", "speed", "strategy", "careless"] },
                    confidence: { type: "number" },
                    evidence: { type: "string" },
                  },
                  required: ["error_type", "confidence", "evidence"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "classify_error" } },
          }),
        });
        if (aiRes.ok) {
          const j = await aiRes.json();
          const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (args) result = typeof args === "string" ? JSON.parse(args) : args;
        }
      } catch (e) {
        console.warn("AI fallback:", e);
      }
    }

    const { data: saved } = await supabase
      .from("user_error_analysis")
      .insert({
        user_id: user.id,
        attempt_id: body.attempt_id ?? null,
        error_type: result.error_type,
        confidence: result.confidence,
        evidence: result.evidence,
        kp_id: body.kp_id ?? null,
        skill_area: body.skill_area ?? null,
      })
      .select()
      .single();

    return json({ ...result, id: saved?.id });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}