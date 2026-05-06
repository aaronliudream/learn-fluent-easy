import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, Lock, Sparkles, ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
  type QuizKind,
} from "@/lib/masteryScore";

/**
 * 初中 / 高考通用「彻底掌握 5 步走」面板。
 *
 * 用户经常不知道一个词「掌握到什么程度才算掌握」。
 * 这里把后端的 8 题型 + 3 维度评分体系，可视化成 5 个递进步骤：
 *   ① 认词 (browse / flashcard) — 看一遍 + 听发音
 *   ② 形 (Form)    — 听辨 listen + 拼写 spell
 *   ③ 义 (Meaning) — 选义 en2cn + 中→英 cn2en + 英义 en2en/en2word + 同义 syn
 *   ④ 用 (Use)     — 完形 cloze + 词性 pos
 *   ⑤ 👑 大师      — 21 天后再答对 = 真正记住
 *
 * 每一步「通过」的标准：该步覆盖到的题型里，至少有一个题型答对达 KIND_CAP（4 次）。
 * 我们以本批词汇里的最高完成比例衡量进度，避免要求所有词都满分才算过。
 */

export type Stage = "junior" | "gaokao";

const STEPS = [
  {
    key: "browse",
    label: "认词",
    emoji: "📖",
    desc: "看一遍 + 听发音",
    kinds: [] as QuizKind[],
    family: "intro" as const,
  },
  {
    key: "form",
    label: "形",
    emoji: "🔊",
    desc: "听辨 + 拼写",
    kinds: ["listen", "spell"] as QuizKind[],
    family: "form" as const,
  },
  {
    key: "meaning",
    label: "义",
    emoji: "🎯",
    desc: "中英互选 · 同义辨析",
    kinds: ["en2cn", "cn2en", "en2en", "en2word", "syn"] as QuizKind[],
    family: "meaning" as const,
  },
  {
    key: "use",
    label: "用",
    emoji: "✍️",
    desc: "完形 · 词性",
    kinds: ["cloze", "pos"] as QuizKind[],
    family: "use" as const,
  },
  {
    key: "master",
    label: "大师",
    emoji: "👑",
    desc: "21 天后再答对",
    kinds: [] as QuizKind[],
    family: "retention" as const,
  },
];

const RECOMMEND_MODE: Record<string, { mode: string; label: string }> = {
  browse: { mode: "", label: "去看清单" },
  form: { mode: "dict", label: "去听写挑战" },
  meaning: { mode: "classic", label: "去智能选义" },
  use: { mode: "quest", label: "去单词任务" },
  master: { mode: "srs", label: "去今日复习" },
};

type Row = {
  mastery_matrix: MasteryMatrix | null;
  reached_master_at: string | null;
};

export default function VocabMasteryPath({
  stage,
  totalWords,
  vocabIds,
  onPickMode,
  onBrowse,
}: {
  stage: Stage;
  totalWords: number;
  /** 当前年级/批次的所有 vocab id，用来过滤 mastery 行 */
  vocabIds: string[];
  onPickMode: (mode: string) => void;
  onBrowse?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [signedIn, setSignedIn] = useState(true);
  const [browsed, setBrowsed] = useState(
    () => localStorage.getItem(`vocab:browsed:${stage}`) === "1",
  );

  useEffect(() => {
    setBrowsed(localStorage.getItem(`vocab:browsed:${stage}`) === "1");
  }, [stage]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        setSignedIn(false);
        return;
      }
      if (vocabIds.length === 0) return;
      // 高考 + 初中都用同一张表 gaokao_user_mastery
      const { data } = await supabase
        .from("gaokao_user_mastery")
        .select("mastery_matrix, reached_master_at, item_id")
        .eq("user_id", u.user.id)
        .eq("item_type", "vocab")
        .in("item_id", vocabIds.slice(0, 1000)); // RPC 上限保护
      setRows((data ?? []) as any);
    })();
  }, [vocabIds.join(",")]);

  // 聚合：每个题型有多少词已答对至少 1/2/4 次
  const kindWordCount: Record<QuizKind, number> = {
    en2cn: 0, cn2en: 0, listen: 0, cloze: 0, en2en: 0, en2word: 0, spell: 0, syn: 0, pos: 0,
  };
  let masteredCount = 0;
  let learnedCount = 0;
  rows.forEach((r) => {
    const m = (r.mastery_matrix ?? {}) as MasteryMatrix;
    let any = false;
    (Object.keys(kindWordCount) as QuizKind[]).forEach((k) => {
      if ((m[k] ?? 0) > 0) {
        kindWordCount[k] += 1;
        any = true;
      }
    });
    if (any) learnedCount += 1;
    const score = computeMasteryScore(m);
    if (levelFromScore(score, !!r.reached_master_at) === 4) masteredCount += 1;
  });

  // 每步进度 = 该步覆盖的所有题型，平均「至少答对一次」的词数比例
  function stepProgress(idx: number): { pct: number; done: boolean } {
    const step = STEPS[idx];
    if (step.key === "browse") return { pct: browsed ? 1 : 0, done: browsed };
    if (step.key === "master") {
      const pct = totalWords > 0 ? masteredCount / totalWords : 0;
      // 只要有 1 个词进入 👑 就视作开始；要 ≥30% 才算这一步「过了」
      return { pct, done: pct >= 0.3 };
    }
    if (step.kinds.length === 0 || totalWords === 0) return { pct: 0, done: false };
    let sum = 0;
    step.kinds.forEach((k) => (sum += kindWordCount[k] / totalWords));
    const pct = Math.min(1, sum / step.kinds.length);
    return { pct, done: pct >= 0.6 };
  }

  const statuses: ("done" | "current" | "locked")[] = STEPS.map(() => "locked");
  let firstUndone = -1;
  STEPS.forEach((_, i) => {
    if (stepProgress(i).done) statuses[i] = "done";
    else if (firstUndone === -1) {
      firstUndone = i;
      statuses[i] = "current";
    }
  });
  const allDone = firstUndone === -1;
  const doneCount = statuses.filter((s) => s === "done").length;

  return (
    <section className="mb-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-4 shadow-sm md:p-5 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-pink-950/20 dark:border-amber-700/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
            MASTERY PATH
          </div>
          <h2 className="text-lg font-extrabold md:text-xl bg-gradient-to-r from-amber-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
            ⭐ 彻底掌握 5 步走
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            按 形 → 义 → 用 三维评分 · 21 天后再对一次才升 👑 大师
          </p>
        </div>
        <div className="rounded-full bg-background/80 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-400 shadow-sm">
          进度 {doneCount} / 5 · 👑 {masteredCount}/{totalWords}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 transition-all"
          style={{ width: `${(doneCount / 5) * 100}%` }}
        />
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {STEPS.map((s, i) => {
          const st = statuses[i];
          const { pct } = stepProgress(i);
          const rec = RECOMMEND_MODE[s.key];
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => {
                  if (s.key === "browse") {
                    localStorage.setItem(`vocab:browsed:${stage}`, "1");
                    setBrowsed(true);
                    onBrowse?.();
                    return;
                  }
                  if (rec.mode) onPickMode(rec.mode);
                }}
                className={cn(
                  "relative block h-full w-full rounded-2xl border-2 p-3 text-center transition",
                  st === "done" && "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600",
                  st === "current" && "border-rose-500 bg-background shadow-md ring-2 ring-rose-200 dark:ring-rose-900 hover:-translate-y-0.5",
                  st === "locked" && "border-dashed border-border bg-background/60 opacity-70 hover:opacity-100",
                )}
                aria-label={`第 ${i + 1} 步 ${s.label}`}
              >
                <div className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-background text-[10px] font-extrabold text-muted-foreground shadow-sm">
                  {st === "done" ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : st === "locked" ? (
                    <Lock className="size-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="text-2xl">{s.emoji}</div>
                <div className="mt-1 text-sm font-extrabold text-foreground">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                {totalWords > 0 && s.key !== "browse" && (
                  <div
                    className={cn(
                      "mt-1 text-[10px] font-bold",
                      st === "done" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400",
                    )}
                  >
                    {Math.round(pct * 100)}%
                  </div>
                )}
                {st === "current" && (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {rec.label} <ArrowRight className="size-3" />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {allDone && signedIn && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600 p-3 text-center">
          <div className="inline-flex items-center gap-2 text-base font-extrabold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-5" /> 恭喜！你已彻底掌握当前批次词汇 ⭐
          </div>
          <div className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
            进入 [今日复习] 巩固即可保持 👑，不会遗忘。
          </div>
        </div>
      )}
      {!signedIn && (
        <div className="mt-3 text-center text-[11px] text-muted-foreground">
          登录后才能记录每一步的进度哦 ✨
        </div>
      )}
      {signedIn && learnedCount > 0 && !allDone && (
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Crown className="size-3 text-fuchsia-500" /> 大师 {masteredCount}
          </span>
          <span>·</span>
          <span>学过 {learnedCount}</span>
          <span>·</span>
          <span>未学 {Math.max(0, totalWords - learnedCount)}</span>
        </div>
      )}
    </section>
  );
}