// Streaming AI diagnostic report for the English placement test.
//
// Input (POST JSON):
//   {
//     cefr: "B1", ability: 3.2, weighted: 67, recommendedLevel: 3,
//     bySection: { vocab: { correct, total, level }, ... },
//     weakest: ["listening"],
//     wrongQuestions: [
//        { section, level, prompt, context, options, answer, picked, explain }
//     ],
//     summary?: string  // optional notes
//   }
//
// Output: text/event-stream of plain markdown chunks (SSE-style "data: ...\n\n").
// Each chunk is one delta. The last event is "data: [DONE]\n\n".
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const errJson = (b: Record<string, unknown>, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return errJson({ error: "AI gateway not configured" }, 503);

    const payload = await req.json().catch(() => ({}));
    const cefr = String(payload?.cefr ?? "A2");
    const ability = Number(payload?.ability ?? 2);
    const weighted = Number(payload?.weighted ?? 0);
    const recLevel = Number(payload?.recommendedLevel ?? 2);
    const bySection = payload?.bySection ?? {};
    const weakest = Array.isArray(payload?.weakest) ? payload.weakest : [];
    const wrongQs = Array.isArray(payload?.wrongQuestions) ? payload.wrongQuestions : [];

    // Compact wrong-question samples to keep token cost down
    const compactWrong = wrongQs.slice(0, 16).map((q: any) => ({
      sec: q.section,
      lv: q.level,
      q: String(q.prompt ?? "").slice(0, 200),
      ctx: q.context ? String(q.context).slice(0, 200) : undefined,
      opts: Array.isArray(q.options) ? q.options.map((o: any) => String(o).slice(0, 100)) : [],
      correct: typeof q.answer === "number" ? q.answer : null,
      picked: typeof q.picked === "number" ? q.picked : null,
      explain: q.explain ? String(q.explain).slice(0, 200) : undefined,
    }));

    const sectionLines = Object.entries(bySection).map(([k, v]: [string, any]) => {
      const total = v?.total ?? 0;
      const correct = v?.correct ?? 0;
      const lv = v?.level ?? "?";
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      return `- ${k}: ${correct}/${total} (${pct}%), 估计 LEVEL ${lv}`;
    }).join("\n");

    const system = `你是一名资深 CEFR 英语水平诊断专家，针对一名中文母语的成人英语学习者。
你刚刚监考了一份自适应水平测试 (4 个模块: vocab/grammar/reading/listening)。
你的任务是基于真实数据写一份「可执行的诊断报告」，**全部用简体中文**，markdown 格式，结构如下，严格遵守章节顺序与标题：

## 整体水平判定
用 2-3 句话概括他的真实水平，强调他能做什么、还做不到什么 (基于 CEFR ${cefr} 的 can-do)。

## 各模块表现
对 vocab/grammar/reading/listening 每一项写 1-2 句具体观察。哪一项最强、哪一项是瓶颈，要点出来。

## 错题归因 (Top 3)
从他答错的题里挑 **最具代表性的 3 个考点**（不是把题列出来，而是归纳"考点"），每条形如：
- **考点名**（如：第三人称单数 -s / 现在完成时 vs 一般过去时 / 长定语从句的修饰对象 / 听力中的弱读 of / get used to + Ving / 等）
  - 现象：他在测试里具体怎么错的（一句话）
  - 原理：用一句话讲清这个考点
  - 怎么补：1 个具体的、能在 5 分钟内开始的练习动作

## 4 周提升计划
给出 4 周的周计划，每周 1 行：本周主攻什么、用什么方式、量化目标 (例：每天 15 分钟精听 + 10 个新词)。
从最薄弱的模块开始，逐步推进。

## 在本 App 内的具体行动
列 3-5 条，告诉他现在打开 App 做什么。可以引用以下功能：
- "Lessons → LEVEL ${recLevel}" (主线课程，词汇+语法+阅读+听力一体)
- "Slang" (American slang 每日学习 + 自适应练习)
- "AI Talk" (开口练习，任务卡 + 实时 recast)
- "Scenes" / "Workplace" (情景对话朗读+跟读)
每条要写出**具体单元/话题**与**为什么**，例如："去 Slang 练 10 个 break / catch 相关的口语动词，因为你在 vocab 模块里 phrasal verb 题全错。"

## 一句话激励
1 句中文，温暖、具体、可信，避免空话。

硬性规则：
- 不得出现"加油"、"相信自己"这种空话；建议必须可执行。
- 不要重复题目原文，只归纳考点。
- 不要超过 800 个汉字。`;

    const user = `## 综合数据
- CEFR: ${cefr}
- 综合能力值 (1.0-6.5): ${ability}
- 加权得分 (0-100): ${weighted}
- 推荐起步 LEVEL: ${recLevel}
- 最薄弱模块: ${weakest.join(", ") || "(无)"}

## 各模块
${sectionLines}

## 错题样本 (用于归纳考点，**不要照抄题面**)
${JSON.stringify(compactWrong, null, 0)}

请按系统消息的章节结构开始输出 Markdown。`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!aiResp.ok || !aiResp.body) {
      const t = await aiResp.text();
      console.error("ai gw err", aiResp.status, t);
      if (aiResp.status === 429) return errJson({ error: "Rate limit" }, 429);
      if (aiResp.status === 402) return errJson({ error: "Credits exhausted" }, 402);
      return errJson({ error: "AI gateway error" }, 502);
    }

    // Re-stream the upstream OpenAI-style SSE as plain text deltas.
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResp.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buf = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const obj = JSON.parse(payload);
                const delta = obj?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                  // Forward as our own SSE chunk
                  const out = `data: ${JSON.stringify({ delta })}\n\n`;
                  controller.enqueue(encoder.encode(out));
                }
              } catch {
                /* ignore malformed */
              }
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("placement-report error", e);
    return errJson({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});