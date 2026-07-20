import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isPrimaryWordDue } from "@/lib/primaryMasteryStats";
import { primaryHubPath, readPrimaryGradeFromStorage } from "@/lib/primaryGrade";

export type Stage = "primary" | "junior" | "gaokao";

export type ModuleKey =
  | "vocab"
  | "reading"
  | "listening"
  | "writing"
  | "grammar"
  | "cloze"
  | "lesson";

export type ModuleStat = {
  key: ModuleKey;
  label: string;
  emoji: string;
  to: string;
  total: number;
  mastered: number; // 掌握 / 精通
  learned: number;  // 接触过但未掌握
  due: number;      // 待复习
  percent: number;  // mastered/total
  comingSoon?: boolean;
};

export type StageOverview = {
  stage: Stage;
  loading: boolean;
  signedIn: boolean;
  modules: ModuleStat[];
  total: number;
  mastered: number;
  learned: number;
  untouched: number;
  due: number;
  percent: number; // 0..100
};

/** Module totals (seed corpus size). Keep in sync with DB seed counts. */
const TOTALS: Record<Stage, Record<ModuleKey, number>> = {
  primary: { vocab: 846, reading: 60, listening: 0, writing: 0, grammar: 0, cloze: 0, lesson: 35 },
  junior:  { vocab: 2016, reading: 91, listening: 209, writing: 143, grammar: 56, cloze: 0, lesson: 0 },
  gaokao:  { vocab: 2000, reading: 21, listening: 20, writing: 14, grammar: 21, cloze: 21, lesson: 0 },
};

const MODULE_META: Record<ModuleKey, { label: string; emoji: string }> = {
  vocab:    { label: "词汇",   emoji: "📚" },
  reading:  { label: "阅读",   emoji: "📖" },
  listening:{ label: "听力",   emoji: "🎧" },
  writing:  { label: "写作",   emoji: "✍️" },
  grammar:  { label: "语法",   emoji: "🧩" },
  cloze:    { label: "完形",   emoji: "🧠" },
  lesson:   { label: "课程",   emoji: "🎒" },
};

function routeFor(stage: Stage, key: ModuleKey): string {
  const base = stage === "primary" ? "/primary" : stage === "junior" ? "/junior" : "/gaokao";
  if (stage === "primary") {
    return primaryHubPath(readPrimaryGradeFromStorage());
  }
  return `${base}/${key}`;
}

function emptyStat(stage: Stage, key: ModuleKey): ModuleStat {
  return {
    key,
    ...MODULE_META[key],
    to: routeFor(stage, key),
    total: TOTALS[stage][key],
    mastered: 0,
    learned: 0,
    due: 0,
    percent: 0,
  };
}

/** Full canonical module order shown on Dashboard for every stage. */
const FULL_ORDER: ModuleKey[] = ["vocab", "listening", "reading", "writing", "grammar", "cloze", "lesson"];

/** Modules that have an actual route + content for each stage. */
const AVAILABLE: Record<Stage, Set<ModuleKey>> = {
  primary: new Set<ModuleKey>(["vocab", "reading", "lesson"]),
  junior:  new Set<ModuleKey>(["vocab", "reading", "listening", "writing", "grammar"]),
  gaokao:  new Set<ModuleKey>(["vocab", "reading", "cloze", "grammar", "listening", "writing"]),
};

function comingSoonStat(stage: Stage, key: ModuleKey): ModuleStat {
  return {
    key,
    ...MODULE_META[key],
    to: "#",
    total: 0,
    mastered: 0,
    learned: 0,
    due: 0,
    percent: 0,
    comingSoon: true,
  };
}

/** Pad the computed module list with coming-soon placeholders so every stage
 *  shows the full 7-module grid. Keeps display order stable. */
function padFullOrder(stage: Stage, computed: ModuleStat[]): ModuleStat[] {
  const byKey = new Map(computed.map((m) => [m.key, m]));
  return FULL_ORDER.map((k) => {
    const existing = byKey.get(k);
    if (existing) return existing;
    if (AVAILABLE[stage].has(k)) return emptyStat(stage, k);
    return comingSoonStat(stage, k);
  });
}

// juniorPublisher:初中环按内容出版社过滤(DB 值 'junior'=人教 / 'junior_fltrp'=外研社);
// 缺省 → RPC 用默认 'junior'(pep 零回归)。仅 junior stage 生效,gaokao/primary 不受影响。
export function useMasteryOverview(stage: Stage, juniorPublisher?: string): StageOverview {
  const [state, setState] = useState<StageOverview>(() => {
    const modules = padFullOrder(stage, []);
    const total = modules.reduce((a, m) => a + m.total, 0);
    return { stage, loading: true, signedIn: false, modules, total, mastered: 0, learned: 0, untouched: total, due: 0, percent: 0 };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, signedIn: false }));
        return;
      }
      const nowIso = new Date().toISOString();

      // === PRIMARY stage: vocab + reading + lesson ===
      if (stage === "primary") {
        const vocabP = emptyStat("primary", "vocab");
        const { data: pwm } = await supabase
          .from("primary_word_mastery")
          .select("mastery_level,due_at")
          .eq("user_id", user.id);
        for (const r of pwm ?? []) {
          const lvl = (r as any).mastery_level ?? 0;
          if (lvl >= 3) vocabP.mastered += 1;
          else if (lvl >= 1) vocabP.learned += 1;
          if (isPrimaryWordDue(r as any)) vocabP.due += 1;
        }
        vocabP.percent = vocabP.total ? Math.round((vocabP.mastered / vocabP.total) * 100) : 0;

        const readP = emptyStat("primary", "reading");
        const { data: prp } = await supabase
          .from("primary_reading_progress")
          .select("stars,score,completed_at")
          .eq("user_id", user.id);
        for (const r of prp ?? []) {
          const stars = (r as any).stars ?? 0;
          if (stars >= 3 || ((r as any).score ?? 0) >= 80) readP.mastered += 1;
          else readP.learned += 1;
        }
        readP.percent = readP.total ? Math.round((readP.mastered / readP.total) * 100) : 0;

        const lessonP = emptyStat("primary", "lesson");
        const { data: plp } = await supabase
          .from("primary_lesson_progress")
          .select("stars,steps_done,total_steps,completed_at")
          .eq("user_id", user.id);
        for (const r of plp ?? []) {
          const stars = (r as any).stars ?? 0;
          const done = (r as any).steps_done ?? 0;
          const tot = (r as any).total_steps ?? 5;
          if (stars >= 3 || (r as any).completed_at) lessonP.mastered += 1;
          else if (done > 0) lessonP.learned += 1;
        }
        lessonP.percent = lessonP.total ? Math.round((lessonP.mastered / lessonP.total) * 100) : 0;

        const modulesP = [vocabP, readP, lessonP];
        const fullP = padFullOrder("primary", modulesP);
        const totalP = modulesP.reduce((a, m) => a + m.total, 0);
        const masteredP = modulesP.reduce((a, m) => a + m.mastered, 0);
        const learnedP = modulesP.reduce((a, m) => a + m.learned, 0);
        const dueP = modulesP.reduce((a, m) => a + m.due, 0);
        const untouchedP = Math.max(0, totalP - masteredP - learnedP);
        const pctP = totalP ? Math.round((masteredP / totalP) * 100) : 0;
        if (!cancelled) setState({ stage, loading: false, signedIn: true, modules: fullP, total: totalP, mastered: masteredP, learned: learnedP, untouched: untouchedP, due: dueP, percent: pctP });
        return;
      }

      // === JUNIOR: 单 RPC 返回 publisher='junior' 过滤的 分子+分母(D1;根治环 >100%)。===
      // RPC 未部署/出错 → 落到下方旧内联逻辑(部署安全:Aaron 跑 SQL 前行为不变)。
      if (stage === "junior") {
        // pep(='junior')不传参:兼容旧 0 参 RPC(D1c SQL 跑之前也不回归);仅外研社传 _publisher。
        const rpcArgs = juniorPublisher && juniorPublisher !== "junior" ? { _publisher: juniorPublisher } : {};
        const { data: rpcRows, error: rpcErr } = await (supabase.rpc as any)("junior_mastery_overview", rpcArgs);
        const rows = (rpcRows ?? []) as { module: string; mastered: number; learned: number; due: number; total: number }[];
        if (!rpcErr && rows.length) {
          const byMod = Object.fromEntries(rows.map((r) => [r.module, r]));
          const mk = (key: ModuleKey): ModuleStat => {
            const r = byMod[key];
            const total = r?.total ?? TOTALS.junior[key]; // RPC 真实分母;缺则回退硬编码
            const mastered = r?.mastered ?? 0, learned = r?.learned ?? 0, due = r?.due ?? 0;
            return { key, ...MODULE_META[key], to: routeFor("junior", key), total, mastered, learned, due, percent: total ? Math.round((mastered / total) * 100) : 0 };
          };
          const computed = (["vocab", "reading", "listening", "writing", "grammar"] as ModuleKey[]).map(mk);
          const modules = padFullOrder("junior", computed);
          const total = computed.reduce((a, m) => a + m.total, 0);
          const mastered = computed.reduce((a, m) => a + m.mastered, 0);
          const learned = computed.reduce((a, m) => a + m.learned, 0);
          const due = computed.reduce((a, m) => a + m.due, 0);
          const untouched = Math.max(0, total - mastered - learned);
          const percent = total ? Math.round((mastered / total) * 100) : 0;
          if (!cancelled) setState({ stage, loading: false, signedIn: true, modules, total, mastered, learned, untouched, due, percent });
          return;
        }
        // else: 落到下方旧逻辑(fallback)
      }

      // === Vocab ===
      const vocabKeys = stage === "junior" ? ["junior_word_mastery"] : ["gaokao_user_mastery"];
      const vocab = emptyStat(stage, "vocab");
      if (stage === "junior") {
        const { data } = await supabase
          .from("junior_word_mastery")
          .select("mastery_level,due_at")
          .eq("user_id", user.id);
        for (const r of data ?? []) {
          const lvl = (r as any).mastery_level ?? 0;
          if (lvl >= 3) vocab.mastered += 1;
          else if (lvl >= 1) vocab.learned += 1;
          if ((r as any).due_at && new Date((r as any).due_at).getTime() <= Date.now()) vocab.due += 1;
        }
      } else {
        const { data } = await supabase
          .from("gaokao_user_mastery")
          .select("mastery_level,next_review_at,item_type")
          .eq("user_id", user.id)
          .eq("item_type", "vocab");
        for (const r of data ?? []) {
          const lvl = (r as any).mastery_level ?? 0;
          if (lvl >= 3) vocab.mastered += 1;
          else if (lvl >= 1) vocab.learned += 1;
          if ((r as any).next_review_at && new Date((r as any).next_review_at).getTime() <= Date.now()) vocab.due += 1;
        }
      }
      vocab.percent = vocab.total ? Math.round((vocab.mastered / vocab.total) * 100) : 0;
      void vocabKeys;

      // === mastery_progress modules (reading / cloze) ===
      const mpModules: { key: ModuleKey; module: string }[] = stage === "junior"
        ? [{ key: "reading", module: "junior_reading" }]
        : [{ key: "reading", module: "gaokao_reading" }, { key: "cloze", module: "gaokao_cloze" }];
      const { data: mpData } = await supabase
        .from("mastery_progress")
        .select("module,stars,best_pct,next_review_at")
        .eq("user_id", user.id)
        .in("module", mpModules.map((m) => m.module));
      const mpStats: Record<ModuleKey, ModuleStat> = {} as any;
      for (const m of mpModules) mpStats[m.key] = emptyStat(stage, m.key);
      const moduleToKey = Object.fromEntries(mpModules.map((m) => [m.module, m.key]));
      for (const r of mpData ?? []) {
        const k = moduleToKey[(r as any).module] as ModuleKey | undefined;
        if (!k) continue;
        const stars = (r as any).stars ?? 0;
        const best = (r as any).best_pct ?? 0;
        if (stars >= 5) mpStats[k].mastered += 1;
        else if (best >= 80) mpStats[k].mastered += 1;
        else mpStats[k].learned += 1;
        if ((r as any).next_review_at && new Date((r as any).next_review_at).getTime() <= Date.now() && stars < 5) {
          mpStats[k].due += 1;
        }
      }
      for (const k in mpStats) {
        const s = mpStats[k as ModuleKey];
        s.percent = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
      }

      // === Listening / Writing (junior only): use distinct attempts ===
      const extras: Partial<Record<ModuleKey, ModuleStat>> = {};
      if (stage === "junior") {
        const listen = emptyStat(stage, "listening");
        const { data: la } = await supabase
          .from("junior_listening_attempts")
          .select("exercise_id,is_correct")
          .eq("user_id", user.id);
        const exMap = new Map<string, { ok: number; tot: number }>();
        for (const r of la ?? []) {
          const id = (r as any).exercise_id as string;
          const cur = exMap.get(id) ?? { ok: 0, tot: 0 };
          cur.tot += 1; if ((r as any).is_correct) cur.ok += 1;
          exMap.set(id, cur);
        }
        for (const v of exMap.values()) {
          if (v.tot >= 1 && v.ok / v.tot >= 0.8) listen.mastered += 1;
          else listen.learned += 1;
        }
        listen.percent = listen.total ? Math.round((listen.mastered / listen.total) * 100) : 0;
        extras.listening = listen;

        const write = emptyStat(stage, "writing");
        const { data: wa } = await supabase
          .from("junior_writing_attempts")
          .select("prompt_id,overall_score")
          .eq("user_id", user.id);
        const seenP = new Map<string, number>();
        for (const r of wa ?? []) {
          const id = (r as any).prompt_id as string;
          const sc = (r as any).overall_score ?? 0;
          seenP.set(id, Math.max(seenP.get(id) ?? 0, sc));
        }
        for (const v of seenP.values()) {
          if (v >= 80) write.mastered += 1;
          else write.learned += 1;
        }
        write.percent = write.total ? Math.round((write.mastered / write.total) * 100) : 0;
        extras.writing = write;
      }

      // === Grammar: count distinct points practised ===
      const grammar = emptyStat(stage, "grammar");
      if (stage === "gaokao") {
        const { data: gm } = await supabase
          .from("gaokao_user_mastery")
          .select("mastery_level,next_review_at,item_type")
          .eq("user_id", user.id)
          .eq("item_type", "grammar_point");
        for (const r of gm ?? []) {
          const lvl = (r as any).mastery_level ?? 0;
          if (lvl >= 3) grammar.mastered += 1;
          else if (lvl >= 1) grammar.learned += 1;
          if ((r as any).next_review_at && new Date((r as any).next_review_at).getTime() <= Date.now()) grammar.due += 1;
        }
      } else if (stage === "junior") {
        // junior 语法板块口径 = 按题(junior_user_mastery item_type='grammar_question',累计答对2次=掌握),
        // 与语法专项页/单元页/第4关一致;不再用旧 grammar_point 点级 FSRS,保证全站语法数字同源。
        const { data: jm } = await supabase
          .from("junior_user_mastery")
          .select("correct_count,wrong_count")
          .eq("user_id", user.id)
          .eq("item_type", "grammar_question");
        for (const r of jm ?? []) {
          const c = Number((r as any).correct_count ?? 0);
          const w = Number((r as any).wrong_count ?? 0);
          if (c >= 2) grammar.mastered += 1;
          else if (c + w > 0) grammar.learned += 1;
        }
        // 动态总题数 = 新体系语法题(挂在 unit 非空语法点上的题)
        const { data: gpts } = await supabase.from("junior_grammar_points").select("id").not("unit", "is", null);
        const pids = ((gpts ?? []) as { id: string }[]).map((p) => p.id);
        let gtotal = 0;
        for (let i = 0; i < pids.length; i += 100) {
          const slice = pids.slice(i, i + 100);
          const { count } = await supabase
            .from("junior_grammar_questions")
            .select("*", { count: "exact", head: true })
            .in("point_id", slice);
          gtotal += count ?? 0;
        }
        grammar.total = gtotal;
      }
      grammar.percent = grammar.total ? Math.round((grammar.mastered / grammar.total) * 100) : 0;

      // === Compose ===
      const order: ModuleKey[] = stage === "junior"
        ? ["vocab", "reading", "listening", "writing", "grammar"]
        : ["vocab", "reading", "cloze", "grammar", "listening", "writing"];
      const computed = order.map((k) => {
        if (k === "vocab") return vocab;
        if (k === "grammar") return grammar;
        if (mpStats[k]) return mpStats[k];
        if (extras[k]) return extras[k]!;
        return emptyStat(stage, k);
      });
      const modules = padFullOrder(stage, computed);
      const total = computed.reduce((a, m) => a + m.total, 0);
      const mastered = computed.reduce((a, m) => a + m.mastered, 0);
      const learned = computed.reduce((a, m) => a + m.learned, 0);
      const due = computed.reduce((a, m) => a + m.due, 0);
      const untouched = Math.max(0, total - mastered - learned);
      const percent = total ? Math.round((mastered / total) * 100) : 0;
      void nowIso;

      if (!cancelled) setState({ stage, loading: false, signedIn: true, modules, total, mastered, learned, untouched, due, percent });
    })();
    return () => { cancelled = true; };
  }, [stage, juniorPublisher]);

  return state;
}

/** Resolve the next "continue" item across all stages: due > resume > new. */
export type ContinuePick = {
  module: ModuleKey;
  kind: "due" | "resume" | "new";
  to: string;
  title: string;
  subtitle: string;
};

export function pickContinue(stage: Stage, ov: StageOverview): ContinuePick {
  const live = ov.modules.filter((m) => !m.comingSoon);
  const dueModule = [...live].sort((a, b) => b.due - a.due).find((m) => m.due > 0);
  if (dueModule) {
    return {
      module: dueModule.key,
      kind: "due",
      to: dueModule.to,
      title: `${dueModule.emoji} ${dueModule.label} · 待复习 ${dueModule.due}`,
      subtitle: "今日到期，先稳固已学的",
    };
  }
  const inProgress = live.find((m) => m.learned > 0 && m.percent < 100);
  if (inProgress) {
    return {
      module: inProgress.key,
      kind: "resume",
      to: inProgress.to,
      title: `${inProgress.emoji} 继续 ${inProgress.label}`,
      subtitle: `已掌握 ${inProgress.mastered} · 继续推进`,
    };
  }
  const next = live.find((m) => m.total > 0) ?? live[0] ?? ov.modules[0];
  return {
    module: next.key,
    kind: "new",
    to: next.to,
    title: `${next.emoji} 开始 ${next.label}`,
    subtitle: "从第 1 项开始",
  };
}
