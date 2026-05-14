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
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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

function fallbackTasks(pool: any[], yearBand: number) {
  const types = ratioToTaskTypes(yearBand);
  return pool.slice(0, 3).map((kp, i) => ({
    type: types[i] || "learn",
    kp_id: kp.id,
    kp_title: kp.level3 || kp.source_id,
    skill_area: kp.skill_area,
    est_minutes: 8 + i * 2,
    est_coins: 10 + i * 5,
    mastery_before: kp.mastery_pct ?? 0,
    mastery_after_estimated: Math.min(100, (kp.mastery_pct ?? 0) + 15),
    why_this: kp.exam_frequency === "极高"
      ? "高考极高频考点，优先突破"
      : "薄弱环节，建议今日加强",
  }));
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
    if (LOVABLE_API_KEY && filtered.length > 0) {
      try {
        const ratio = RATIO[yearBand] ?? RATIO[1];
        const ratioStr = Object.entries(ratio).map(([k, v]) => `${k}:${Math.round(v * 100)}%`).join(", ");
        const daysToGaokao = (() => {
          const { data: cal } = { data: null }; // computed below if needed
          return null;
        })();

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "你是高考英语智能学情教练。学生数据基于真实学习记录。你的任务：为这个学生生成今日的 3 张学习任务卡，目标是最大化高考提分效率。每张任务卡必须输出：type(learn/breakthrough/consolidate/review), kp_id, kp_title(<=15字), skill_area, est_minutes, est_coins(5-30), mastery_before, mastery_after_estimated, why_this(<=30字)。同时输出 weak_top3 和 weekly_focus。只输出 JSON，不要任何其他文字。",
              },
              {
                role: "user",
                content: `学生信息：年级 高${yearBand}\n任务分配比例：${ratioStr}\n\n待选 KP 池（按弱→强）：\n${
                  JSON.stringify(filtered.slice(0, 20), null, 0)
                }`,
              },
            ],
            tools: [{
              type: "function",
              function: {
                name: "emit_prescription",
                description: "Output today's prescription as structured JSON.",
                parameters: {
                  type: "object",
                  properties: {
                    tasks: { type: "array", items: { type: "object" } },
                    weak_top3: { type: "array", items: { type: "object" } },
                    weekly_focus: { type: "array", items: { type: "object" } },
                  },
                  required: ["tasks", "weak_top3", "weekly_focus"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "emit_prescription" } },
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

    const tasks = aiResult?.tasks?.length ? aiResult.tasks.slice(0, 3) : fallbackTasks(filtered, yearBand);
    const weak_top3 = aiResult?.weak_top3?.length
      ? aiResult.weak_top3.slice(0, 3)
      : filtered.slice(0, 3).map((k) => ({ kp_id: k.id, kp_title: k.level3, mastery: k.mastery_pct, skill_area: k.skill_area }));
    const weekly_focus = aiResult?.weekly_focus?.length
      ? aiResult.weekly_focus.slice(0, 3)
      : filtered.slice(3, 6).map((k) => ({ kp_id: k.id, kp_title: k.level3, skill_area: k.skill_area }));

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