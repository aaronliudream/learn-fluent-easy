import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AttemptPayload {
  stage: "primary" | "junior" | "senior";
  grade: number;
  module: "vocab" | "grammar" | "reading" | "writing" | "listening" | "cloze" | "phonics";
  item_type: string;
  item_id: string;
  item_label?: string;
  is_correct: boolean;
  user_answer?: string;
  correct_answer?: string;
  context?: Record<string, unknown>;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData } = await supa.auth.getUser();
  const user = userData?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: AttemptPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // basic validation
  const validStages = ["primary", "junior", "senior"];
  const validModules = ["vocab", "grammar", "reading", "writing", "listening", "cloze", "phonics"];
  if (
    !payload?.stage || !validStages.includes(payload.stage) ||
    !payload?.module || !validModules.includes(payload.module) ||
    !payload?.item_type || !payload?.item_id ||
    typeof payload?.is_correct !== "boolean" ||
    typeof payload?.grade !== "number"
  ) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  payload.grade = clamp(Math.round(payload.grade), 1, 12);

  // current state
  const { data: existing } = await supa
    .from("unified_mastery_manual")
    .select("*")
    .eq("user_id", user.id)
    .eq("stage", payload.stage)
    .eq("grade", payload.grade)
    .eq("module", payload.module)
    .eq("item_type", payload.item_type)
    .eq("item_id", payload.item_id)
    .maybeSingle();

  const newAttemptCount = (existing?.attempt_count ?? 0) + 1;
  const newCorrectCount = (existing?.correct_count ?? 0) + (payload.is_correct ? 1 : 0);
  const newWrongCount = (existing?.wrong_count ?? 0) + (payload.is_correct ? 0 : 1);

  let newState: "master" | "fluent" | "weak" | "none";
  let newEase = existing?.ease ?? 2.5;
  let newInterval = existing?.interval_days ?? 0;
  const accuracy = newCorrectCount / newAttemptCount;

  if (payload.is_correct) {
    if (newAttemptCount >= 5 && accuracy >= 0.9) {
      newState = "master";
      newInterval = clamp(newInterval * newEase, 21, 365);
    } else if (newAttemptCount >= 3 && accuracy >= 0.7) {
      newState = "fluent";
      newInterval = clamp(newInterval * newEase, 7, 21);
    } else {
      newState = "weak";
      newInterval = Math.max(newInterval * 1.3, 1);
    }
    newEase = Math.min(newEase + 0.1, 3.0);
  } else {
    newState = "weak";
    newEase = Math.max(newEase - 0.2, 1.3);
    newInterval = 1;
  }

  const dueAt = new Date(Date.now() + newInterval * 86400000).toISOString();
  const oldState = existing?.state ?? "none";

  const { error: upsertErr } = await supa
    .from("unified_mastery_manual")
    .upsert({
      user_id: user.id,
      stage: payload.stage,
      grade: payload.grade,
      module: payload.module,
      item_type: payload.item_type,
      item_id: payload.item_id,
      item_label: payload.item_label || null,
      state: newState,
      ease: newEase,
      interval_days: newInterval,
      due_at: dueAt,
      last_review_at: new Date().toISOString(),
      attempt_count: newAttemptCount,
      correct_count: newCorrectCount,
      wrong_count: newWrongCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,stage,grade,module,item_type,item_id" });

  if (upsertErr) {
    console.error("[record-attempt] upsert error", upsertErr);
    return new Response(JSON.stringify({ error: upsertErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // mistakes book: 做错入册(再次做错则重新激活);做对自动移除。
  // ④ 铁律:小学错题不进统一错题本(stage==='primary' 整段跳过)+ 下列"裸模块"不进
  //   (vocab/grammar/writing/phonics —— 这些经 edge 只写薄行、无 snapshot,污染错题本、虚高老师端
  //   "薄弱"数;正牌完整错题走 senior_grammar/gaokao_grammar/senior_cloze/hub_* 等,不受影响)。
  //   掌握度 unified_mastery 上面已照写、不受此跳过影响。
  const SKIP_BARE_MODULES = ["vocab", "grammar", "writing", "phonics"];
  const skipMistake = payload.stage === "primary" || SKIP_BARE_MODULES.includes(payload.module);
  if (!skipMistake) {
    const mistakeKey = `${payload.stage}_${payload.module}_${payload.item_id}`;
    if (!payload.is_correct) {
      const ctx = (payload.context ?? {}) as Record<string, unknown>;
      // upsert(非 insert):同题再次做错时刷新复习时间并重新置为未解决,避免唯一键冲突静默失败
      await supa.from("user_mistakes").upsert({
        user_id: user.id,
        module: payload.module,
        source_key: mistakeKey,
        source_label: payload.item_label ?? null,
        question: (ctx.question as string) ?? "",
        user_answer: payload.user_answer ?? null,
        correct_answer: payload.correct_answer ?? null,
        explanation: (ctx.explanation as string) ?? null,
        is_resolved: false,
        correct_streak: 0,        // 做错 → 连对清零
        last_correct_date: null,
        last_wrong_at: new Date().toISOString(),
        next_review_at: dueAt,
      }, { onConflict: "user_id,module,source_key" });
    } else {
      // 做对 → 跨3天连对累计(唯一移出途径)。supa 带用户 JWT → RPC 的 auth.uid() 有效。
      await supa.rpc("bump_mistake_correct", {
        _module: payload.module,
        _source_key: mistakeKey,
      });
    }
  }

  // smart cache invalidation for ai_diagnostics
  const shouldRegenerate = (newState === "master" && oldState !== "master") ||
    newAttemptCount % 30 === 0;
  if (shouldRegenerate) {
    await supa.from("ai_diagnostics").delete().eq("user_id", user.id);
  }

  return new Response(
    JSON.stringify({
      success: true,
      new_state: newState,
      old_state: oldState,
      interval_days: newInterval,
      due_at: dueAt,
      accuracy,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});