// Edge function: generate-daily-prescription
// Generates today's 3 task cards + weak top3 + weekly_focus for a Gaokao student.
// Caches per (user, date). Pass force_regenerate=true to bypass.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const RATIO: Record<number, Record<string, number>> = {
  1: { learn: 0.5, breakthrough: 0.3, review: 0.2 },
  2: { learn: 0.3, breakthrough: 0.5, consolidate: 0.2 },
  3: { learn: 0.1, breakthrough: 0.4, review: 0.3, consolidate: 0.2 },
};

function ratioToTaskTypes(yearBand: number): string[] {
  // Returns 3 task types based on year band ratio
  if (yearBand === 1) return ["learn", "learn", "breakthrough"];
  if (yearBand === 2) return ["breakthrough", "breakthrough", "learn"];
  return ["breakthrough", "review", "consolidate"];
}

function generateLocalFallback(candidatePool: any[], yearBand: number) {
  const ratios: Record<number, string[]> = {
    1: ["learn", "learn", "breakthrough"],
    2: ["learn", "breakthrough", "breakthrough"],
    3: ["breakthrough", "breakthrough", "review"],
  };
  const taskTypes = ratios[yearBand] || ratios[2];
  const freqWeight: Record<string, number> = { "极高": 4, "高": 3, "中": 2, "低": 1 };
  const sortedKps = [...candidatePool].sort((a, b) => {
    const aScore = (100 - (a.mastery_pct ?? 0)) * (freqWeight[a.exam_frequency] || 2);
    const bScore = (100 - (b.mastery_pct ?? 0)) * (freqWeight[b.exam_frequency] || 2);
    return bScore - aScore;
  });

  const tasks = taskTypes.map((type, i) => {
    const kp = sortedKps[i] || sortedKps[0];
    return {
      type,
      kp_id: kp.id,
      kp_title: kp.level3 || kp.source_id || "高考考点",
      skill_area: kp.skill_area || "grammar",
      est_minutes: type === "learn" ? 15 : type === "review" ? 5 : 10,
      est_coins: type === "learn" ? 20 : type === "review" ? 5 : 10,
      mastery_before: kp.mastery_pct ?? 0,
      mastery_after_estimated: Math.min(100, (kp.mastery_pct ?? 0) + 15),
      why_this:
        type === "learn" ? "本年级核心考点，先打底"
        : type === "review" ? "到了遗忘节点，5 分钟巩固"
        : "上次答错过的弱点，今天攻克",
    };
  });

  const weak_top3 = sortedKps.slice(0, 3).map((kp) => ({
    kp_id: kp.id,
    kp_title: kp.level3 || kp.source_id || "考点",
    skill_area: kp.skill_area || "grammar",
    mastery: kp.mastery_pct ?? 0,
    exam_frequency: kp.exam_frequency || "中",
  }));

  const weekly_focus = sortedKps.slice(0, 3).map((kp, i) => ({
    kp_id: kp.id,
    kp_title: kp.level3 || kp.source_id || "考点",
    skill_area: kp.skill_area || "grammar",
    week_label: i === 0 ? "今日" : i === 1 ? "本周" : "下周",
  }));

  return { tasks, weak_top3, weekly_focus };
}

function validateAiResult(ai: any, poolIds: Set<string>): boolean {
  if (!ai || !Array.isArray(ai.tasks) || ai.tasks.length !== 3) return false;
  for (const t of ai.tasks) {
    if (!t || typeof t !== "object") return false;
    if (!t.kp_id || !t.kp_title || !t.type) return false;
    if (!poolIds.has(t.kp_id)) return false;
  }
  if (!Array.isArray(ai.weak_top3) || ai.weak_top3.length < 1) return false;
  if (!Array.isArray(ai.weekly_focus) || ai.weekly_focus.length < 1) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "unauthorized" }, 401);
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const force = !!body.force_regenerate;

    const today = new Date().toISOString().slice(0, 10);
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Cache check
    if (!force) {
      const { data: cached } = await admin
        .from("daily_prescriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("prescription_date", today)
        .maybeSingle();
      if (cached) return json(cached);
    }

    // 2) Year band
    const { data: profile } = await admin
      .from("profiles")
      .select("current_year_band, recommended_grade, display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const yearBand = profile?.current_year_band ?? profile?.recommended_grade ?? 1;

    // 3) Mastery overview
    const { data: masteryRows } = await admin
      .from("gaokao_user_mastery")
      .select("item_id, mastery_level, last_seen_at")
      .eq("user_id", user.id);

    const masteryMap = new Map<string, { pct: number; lastSeen: string | null }>();
    (masteryRows ?? []).forEach((r: any) => {
      masteryMap.set(r.item_id, {
        pct: (r.mastery_level ?? 0) * 20,
        lastSeen: r.last_seen_at,
      });
    });

    // 4) KP pool for this year band
    const { data: kpPoolRaw } = await admin
      .from("v_gaokao_all_knowledge_points")
      .select("id, source_id, level3, skill_area, exam_frequency, year_band, difficulty")
      .or(`year_band.eq.${yearBand},year_band.is.null`)
      .limit(150);

    const kpPool = (kpPoolRaw ?? []).map((kp: any) => {
      const m = masteryMap.get(kp.id);
      return { ...kp, mastery_pct: m?.pct ?? 0, last_seen: m?.lastSeen ?? null };
    });

    // 5) Recent KPs (last 7 days) to avoid repeats
    const { data: recentRx } = await admin
      .from("daily_prescriptions")
      .select("tasks")
      .eq("user_id", user.id)
      .gte("prescription_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
    const recentKpIds = new Set<string>();
    (recentRx ?? []).forEach((r: any) => {
      (r.tasks ?? []).forEach((t: any) => t.kp_id && recentKpIds.add(t.kp_id));
    });

    // Filter pool: prioritize 极高 freq, exclude recent, sort by mastery asc
    const filtered = kpPool
      .filter((kp) => !recentKpIds.has(kp.id))
      .sort((a, b) => {
        const fa = a.exam_frequency === "极高" ? 0 : a.exam_frequency === "高" ? 1 : 2;
        const fb = b.exam_frequency === "极高" ? 0 : b.exam_frequency === "高" ? 1 : 2;
        if (fa !== fb) return fa - fb;
        return (a.mastery_pct ?? 0) - (b.mastery_pct ?? 0);
      })
      .slice(0, 30);

    // 6) New user with no mastery → return guidance
    if (masteryRows && masteryRows.length === 0 && filtered.length === 0) {
      const empty = {
        user_id: user.id,
        year_band: yearBand,
        prescription_date: today,
        tasks: [],
        weak_top3: [],
        weekly_focus: [],
        guidance: "完成入门快测后这里会显示你的画像 →",
      };
      return json(empty);
    }

    // 7) Try AI; fallback if anything fails
    let aiResult: any = null;
    if (OPENAI_API_KEY && filtered.length > 0) {
      try {
        const ratio = RATIO[yearBand] ?? RATIO[1];
        const ratioStr = Object.entries(ratio).map(([k, v]) => `${k}:${Math.round(v * 100)}%`).join(", ");
        const daysToGaokao = (() => {
          const { data: cal } = { data: null }; // computed below if needed
          return null;
        })();

        const tools = [{
          type: "function",
          function: {
            name: "submit_prescription",
            description: "为学生生成今日 3 张任务卡 + 弱点 TOP3 + 本周重点",
            parameters: {
              type: "object",
              required: ["tasks", "weak_top3", "weekly_focus"],
              properties: {
                tasks: {
                  type: "array",
                  description: "3 张今日任务卡，按学习顺序排列",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    required: ["type", "kp_id", "kp_title", "skill_area", "est_minutes", "est_coins", "mastery_before", "mastery_after_estimated", "why_this"],
                    properties: {
                      type: { type: "string", enum: ["learn", "breakthrough", "consolidate", "review"], description: "任务类型：learn=学习新点 / breakthrough=突破弱点 / consolidate=巩固 / review=艾宾浩斯复习" },
                      kp_id: { type: "string", description: "从候选 KP 池里选一个，必须是 UUID 格式" },
                      kp_title: { type: "string", description: "知识点的简洁标题，最多 15 个中文字" },
                      skill_area: { type: "string", enum: ["listening", "reading", "grammar", "vocab", "writing", "cloze"], description: "考试领域" },
                      est_minutes: { type: "integer", minimum: 3, maximum: 30, description: "预估完成时长（分钟）" },
                      est_coins: { type: "integer", minimum: 5, maximum: 30, description: "预估金币奖励" },
                      mastery_before: { type: "integer", minimum: 0, maximum: 100, description: "当前掌握度百分比" },
                      mastery_after_estimated: { type: "integer", minimum: 0, maximum: 100, description: "预估完成后掌握度" },
                      why_this: { type: "string", description: "用学生第二人称视角，30 字以内说人话解释为何今天选这个；不要 to improve your score 这种废话。" },
                    },
                  },
                },
                weak_top3: {
                  type: "array",
                  description: "3 个最弱知识点，按 mastery 升序",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    required: ["kp_id", "kp_title", "skill_area", "mastery", "exam_frequency"],
                    properties: {
                      kp_id: { type: "string" },
                      kp_title: { type: "string", description: "15 字内" },
                      skill_area: { type: "string", enum: ["listening", "reading", "grammar", "vocab", "writing", "cloze"] },
                      mastery: { type: "integer", minimum: 0, maximum: 100 },
                      exam_frequency: { type: "string", enum: ["极高", "高", "中", "低"] },
                    },
                  },
                },
                weekly_focus: {
                  type: "array",
                  description: "本周重点学的 3 个 KP",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    required: ["kp_id", "kp_title", "skill_area", "week_label"],
                    properties: {
                      kp_id: { type: "string" },
                      kp_title: { type: "string", description: "15 字内" },
                      skill_area: { type: "string", enum: ["listening", "reading", "grammar", "vocab", "writing", "cloze"] },
                      week_label: { type: "string", enum: ["今日", "本周", "下周"] },
                    },
                  },
                },
              },
            },
          },
        }];

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
                  "你是高考英语智能学情教练。基于学生真实学情数据，为其生成今日 3 张学习任务卡 + 弱点 TOP3 + 本周重点，目标是最大化高考提分效率。kp_id 必须从候选 KP 池里选取，不能编造。所有字段都必须填写。",
              },
              {
                role: "user",
                content: `学生信息：年级 高${yearBand}\n任务分配比例：${ratioStr}\n\n待选 KP 池（按弱→强）：\n${
                  JSON.stringify(filtered.slice(0, 20), null, 0)
                }`,
              },
            ],
            tools,
            tool_choice: { type: "function", function: { name: "submit_prescription" } },
          }),
        });
        if (aiRes.ok) {
          const j = await aiRes.json();
          const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (args) aiResult = typeof args === "string" ? JSON.parse(args) : args;
        } else {
          console.warn("AI gateway non-OK:", aiRes.status);
        }
      } catch (e) {
        console.warn("AI fallback:", e);
      }
    }

    const poolIds = new Set<string>(filtered.map((k) => k.id));
    const useAi = validateAiResult(aiResult, poolIds);
    if (!useAi && aiResult) console.warn("AI result failed validation, using local fallback");
    const fallback = generateLocalFallback(filtered, yearBand);
    const tasks = useAi ? aiResult.tasks.slice(0, 3) : fallback.tasks;
    const weak_top3 = useAi ? aiResult.weak_top3.slice(0, 3) : fallback.weak_top3;
    const weekly_focus = useAi ? aiResult.weekly_focus.slice(0, 3) : fallback.weekly_focus;

    // 8) Upsert
    const payload = {
      user_id: user.id,
      year_band: yearBand,
      prescription_date: today,
      tasks,
      weak_top3,
      weekly_focus,
      generated_at: new Date().toISOString(),
    };
    const { data: saved, error: saveErr } = await admin
      .from("daily_prescriptions")
      .upsert(payload, { onConflict: "user_id,prescription_date" })
      .select()
      .single();
    if (saveErr) console.error(saveErr);

    return json(saved ?? payload);
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