import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Stage = "junior" | "gaokao";

export type ModuleKey =
  | "vocab"
  | "reading"
  | "listening"
  | "writing"
  | "grammar"
  | "cloze";

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
  junior: { vocab: 2043, reading: 91, listening: 209, writing: 143, grammar: 56, cloze: 0 },
  gaokao: { vocab: 4141, reading: 65, listening: 0, writing: 0, grammar: 298, cloze: 16 },
};

const MODULE_META: Record<ModuleKey, { label: string; emoji: string }> = {
  vocab:    { label: "词汇",   emoji: "📚" },
  reading:  { label: "阅读",   emoji: "📖" },
  listening:{ label: "听力",   emoji: "🎧" },
  writing:  { label: "写作",   emoji: "✍️" },
  grammar:  { label: "语法",   emoji: "🧩" },
  cloze:    { label: "完形",   emoji: "🧠" },
};

function routeFor(stage: Stage, key: ModuleKey): string {
  const base = stage === "junior" ? "/junior" : "/gaokao";
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

export function useMasteryOverview(stage: Stage): StageOverview {
  const [state, setState] = useState<StageOverview>(() => {
    const keys: ModuleKey[] = stage === "junior"
      ? ["vocab", "reading", "listening", "writing", "grammar"]
      : ["vocab", "reading", "cloze", "grammar"];
    const modules = keys.map((k) => emptyStat(stage, k));
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
      }
      grammar.percent = grammar.total ? Math.round((grammar.mastered / grammar.total) * 100) : 0;

      // === Compose ===
      const order: ModuleKey[] = stage === "junior"
        ? ["vocab", "reading", "listening", "writing", "grammar"]
        : ["vocab", "reading", "cloze", "grammar"];
      const modules = order.map((k) => {
        if (k === "vocab") return vocab;
        if (k === "grammar") return grammar;
        if (mpStats[k]) return mpStats[k];
        if (extras[k]) return extras[k]!;
        return emptyStat(stage, k);
      });
      const total = modules.reduce((a, m) => a + m.total, 0);
      const mastered = modules.reduce((a, m) => a + m.mastered, 0);
      const learned = modules.reduce((a, m) => a + m.learned, 0);
      const due = modules.reduce((a, m) => a + m.due, 0);
      const untouched = Math.max(0, total - mastered - learned);
      const percent = total ? Math.round((mastered / total) * 100) : 0;
      void nowIso;

      if (!cancelled) setState({ stage, loading: false, signedIn: true, modules, total, mastered, learned, untouched, due, percent });
    })();
    return () => { cancelled = true; };
  }, [stage]);

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
  const dueModule = ov.modules.find((m) => m.due > 0);
  if (dueModule) {
    return {
      module: dueModule.key,
      kind: "due",
      to: dueModule.to,
      title: `${dueModule.emoji} ${dueModule.label} · 待复习 ${dueModule.due}`,
      subtitle: "今日到期，先稳固已学的",
    };
  }
  const inProgress = ov.modules.find((m) => m.learned > 0 && m.percent < 100);
  if (inProgress) {
    return {
      module: inProgress.key,
      kind: "resume",
      to: inProgress.to,
      title: `${inProgress.emoji} 继续 ${inProgress.label}`,
      subtitle: `已掌握 ${inProgress.mastered} · 继续推进`,
    };
  }
  const next = ov.modules.find((m) => m.total > 0) ?? ov.modules[0];
  return {
    module: next.key,
    kind: "new",
    to: next.to,
    title: `${next.emoji} 开始 ${next.label}`,
    subtitle: "从第 1 项开始",
  };
}