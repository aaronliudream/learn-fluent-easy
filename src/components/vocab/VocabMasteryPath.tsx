import { T } from "@/i18n/T";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, Lock, Sparkles, ArrowRight, Crown, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
  type QuizKind,
} from "@/lib/masteryScore";
import { MASTERY_STEP_KINDS } from "@/lib/vocabMastery";
import { useActiveCohort } from "@/hooks/useActiveCohort";
import { fetchCohortProgress } from "@/lib/cohortProgress";
import CohortIntakeModal from "./CohortIntakeModal";
import EssayCeremonyModal from "./EssayCeremonyModal";

/** 高考 3500 词 / 每批 10 词 = 350 批。常量化便于以后调整。 */
const TOTAL_BATCHES = 350;

/**
 * 「彻底掌握 5 步走」面板 (cohort-aware)。
 *
 * 当用户有 active cohort 时:
 *   - 5 步只在 cohort 的词上推进 (默认 10 词,分母小,反馈快)
 *   - 进度条数据源 = gaokao_cohort_events (隔离外部 Bento/Quest 写入污染)
 *   - 每步 done 阈值 = ceil(cohort.size * 0.8)
 *   - step ⑤ master = cohort 词中已被 FSRS 复习并答对 ≥1 次的词数 (不再硬编码 21 天)
 *
 * 无 cohort 时显示 CTA 弹出 CohortIntakeModal。
 */

export type Stage = "junior" | "gaokao";

const STEPS = [
  { key: "browse",  label: "认词", emoji: "📖", desc: "看一遍 + 听发音",          kinds: MASTERY_STEP_KINDS.browse,  family: "intro" as const },
  { key: "form",    label: "形",   emoji: "🔊", desc: "听辨 + 拼写",              kinds: MASTERY_STEP_KINDS.form,    family: "form" as const },
  { key: "meaning", label: "义",   emoji: "🎯", desc: "中英互选 · 同义辨析",      kinds: MASTERY_STEP_KINDS.meaning, family: "meaning" as const },
  { key: "use",     label: "用",   emoji: "✍️", desc: "完形 · 词性",              kinds: MASTERY_STEP_KINDS.use,     family: "use" as const },
  { key: "master",  label: "大师", emoji: "👑", desc: "FSRS 复习达标",            kinds: MASTERY_STEP_KINDS.master,  family: "retention" as const },
];

const RECOMMEND_MODE: Record<string, { mode: string; label: string }> = {
  browse:  { mode: "",        label: "去看清单" },
  form:    { mode: "cohort_dict", label: "去单词听写" },
  meaning: { mode: "cohort_meaning", label: "去中英互选" },
  use:     { mode: "cohort_cloze",   label: "去完形填空" },
  master:  { mode: "srs",     label: "去今日复习" },
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
  vocabIds: string[];
  onPickMode: (mode: string) => void;
  onBrowse?: () => void;
}) {
  const { active: cohort, dormant, activeLoading, resume } = useActiveCohort();
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);

  const cohortMode = !!cohort;
  const effectiveIds = cohortMode ? cohort!.cohort_word_ids : vocabIds;
  const effectiveTotal = cohortMode ? cohort!.cohort_word_ids.length : totalWords;
  const doneThreshold = (size: number) => Math.max(1, Math.ceil(size * 0.8));

  const [rows, setRows] = useState<Row[]>([]);
  const [signedIn, setSignedIn] = useState(true);
  const [cohortByWord, setCohortByWord] = useState<Map<string, Set<string>>>(new Map());
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
      if (effectiveIds.length === 0) return;
      const { data } = await supabase
        .from("gaokao_user_mastery")
        .select("mastery_matrix, reached_master_at, item_id")
        .eq("user_id", u.user.id)
        .eq("item_type", "vocab")
        .in("item_id", effectiveIds.slice(0, 1000));
      setRows((data ?? []) as any);
    })();
  }, [effectiveIds.join(",")]);

  useEffect(() => {
    if (!cohort) {
      setCohortByWord(new Map());
      return;
    }
    (async () => {
      const p = await fetchCohortProgress(cohort.id);
      setCohortByWord(p.byWord);
    })();
  }, [cohort?.id]);

  const kindWordCount: Record<QuizKind, number> = {
    en2cn: 0, cn2en: 0, listen: 0, cloze: 0, en2en: 0, en2word: 0, spell: 0, syn: 0, pos: 0,
  };
  let masteredCount = 0;
  let learnedCount = 0;
  let fsrsReviewedCount = 0;

  if (cohortMode) {
    cohortByWord.forEach((kinds) => {
      let any = false;
      (Object.keys(kindWordCount) as QuizKind[]).forEach((k) => {
        if (kinds.has(k)) {
          kindWordCount[k] += 1;
          any = true;
        }
      });
      if (any) learnedCount += 1;
      if (kinds.has("fsrs_review")) fsrsReviewedCount += 1;
    });
    rows.forEach((r) => {
      const m = (r.mastery_matrix ?? {}) as MasteryMatrix;
      const score = computeMasteryScore(m);
      if (levelFromScore(score, !!r.reached_master_at) === 4) masteredCount += 1;
    });
  } else {
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
  }

  function stepProgress(idx: number): { pct: number; done: boolean } {
    const step = STEPS[idx];
    if (step.key === "browse") return { pct: browsed ? 1 : 0, done: browsed };
    const total = effectiveTotal;
    if (total === 0) return { pct: 0, done: false };

    if (step.key === "master") {
      const num = cohortMode ? fsrsReviewedCount : masteredCount;
      const need = doneThreshold(total);
      const pct = Math.min(1, num / total);
      return { pct, done: num >= need };
    }
    if (step.kinds.length === 0) return { pct: 0, done: false };

    let wordsCovered = 0;
    if (cohortMode) {
      cohortByWord.forEach((kinds) => {
        if (step.kinds.some((k) => kinds.has(k))) wordsCovered += 1;
      });
    } else {
      rows.forEach((r) => {
        const m = (r.mastery_matrix ?? {}) as MasteryMatrix;
      if (step.kinds.some((k) => ((m as Record<string, number | undefined>)[k] ?? 0) > 0)) wordsCovered += 1;
      });
    }
    const need = doneThreshold(total);
    const pct = Math.min(1, wordsCovered / total);
    return { pct, done: wordsCovered >= need };
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

  // Empty state: signed in, no active cohort.
  if (signedIn && !activeLoading && !cohort) {
    return (
      <>
        <section className="mb-5 rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-5 text-center shadow-sm dark:from-amber-950/30 dark:via-rose-950/20 dark:to-pink-950/20 dark:border-amber-700/40">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
            MASTERY PATH
          </div>
          <h2 className="mt-1 text-xl font-extrabold bg-gradient-to-r from-amber-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
            <T>⭐ 彻底掌握 5 步走</T>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            <T>每批 10 个词，从「认识」到「大师」走完 5 步 ≈ 15 分钟。一天一批，350 批后你就拿下了高考 3500 词。</T>
          </p>
          <button
            type="button"
            onClick={() => setIntakeOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
          >
            <Rocket className="size-4" /> <T>开始今天这一批 (10 词)</T>
          </button>
          {dormant.length > 0 && (
            <DormantChips
              dormant={dormant}
              onResume={(id) => resume.mutate(id)}
              busy={resume.isPending}
            />
          )}
        </section>
        {intakeOpen && (
          <CohortIntakeModal
            vocabIds={vocabIds}
            stage={stage}
            onClose={() => setIntakeOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section className="mb-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-4 shadow-sm md:p-5 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-pink-950/20 dark:border-amber-700/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
              {cohortMode ? <>第 {cohort!.sequence_no} / {TOTAL_BATCHES} 批 · MASTERY PATH</> : "MASTERY PATH"}
            </div>
            <h2 className="text-lg font-extrabold md:text-xl bg-gradient-to-r from-amber-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
              <T>⭐ 彻底掌握 5 步走</T>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {cohortMode ? (
                <><T>本批</T> {effectiveTotal} <T>词 · 形 → 义 → 用 → FSRS 复习达 80% 即毕业</T></>
              ) : (
                <T>按 形 → 义 → 用 三维评分 · 21 天后再对一次才升 👑 大师</T>
              )}
            </p>
          </div>
          <div className="rounded-full bg-background/80 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-400 shadow-sm">
            <T>进度</T> {doneCount} / 5 · 👑 {masteredCount}/{effectiveTotal}
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
                  <div className="mt-1 text-sm font-extrabold text-foreground"><T>{s.label}</T></div>
                  <div className="text-[10px] text-muted-foreground"><T>{s.desc}</T></div>
                  {effectiveTotal > 0 && s.key !== "browse" && (
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
                      <T>{rec.label}</T> <ArrowRight className="size-3" />
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
              <Sparkles className="size-5" /> <T>恭喜！本批毕业 ⭐ 进入 FSRS 长期记忆</T>
            </div>
            {cohortMode && (
              <button
                type="button"
                onClick={() => setCeremonyOpen(true)}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700"
              >
                <Rocket className="size-3.5" /> <T>开始毕业仪式</T>
              </button>
            )}
          </div>
        )}
        {!signedIn && (
          <div className="mt-3 text-center text-[11px] text-muted-foreground">
            <T>登录后才能记录每一步的进度哦 ✨</T>
          </div>
        )}
        {signedIn && learnedCount > 0 && !allDone && (
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Crown className="size-3 text-fuchsia-500" /> <T>大师</T> {masteredCount}
            </span>
            <span>·</span>
            <span><T>学过</T> {learnedCount}/{effectiveTotal}</span>
            <span>·</span>
            <span><T>未学</T> {Math.max(0, effectiveTotal - learnedCount)}</span>
          </div>
        )}
        {cohortMode && dormant.length > 0 && (
          <DormantChips
            dormant={dormant}
            onResume={(id) => resume.mutate(id)}
            busy={resume.isPending}
            compact
          />
        )}
      </section>
      {intakeOpen && (
        <CohortIntakeModal
          vocabIds={vocabIds}
          onClose={() => setIntakeOpen(false)}
        />
      )}
      {ceremonyOpen && cohort && (
        <EssayCeremonyModal
          cohortId={cohort.id}
          sequenceNo={cohort.sequence_no}
          cohortWordIds={cohort.cohort_word_ids}
          onClose={() => setCeremonyOpen(false)}
          onStartNext={() => {
            setCeremonyOpen(false);
            setIntakeOpen(true);
          }}
        />
      )}
    </>
  );
}

/* ---------- Dormant batches resume strip ---------- */

function DormantChips({
  dormant,
  onResume,
  busy,
  compact = false,
}: {
  dormant: Array<{ id: string; sequence_no: number; cohort_word_ids: string[]; last_active_at: string }>;
  onResume: (id: string) => void;
  busy: boolean;
  compact?: boolean;
}) {
  const visible = dormant.slice(0, 3);
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-amber-300/70 bg-background/60 p-3 dark:border-amber-700/40",
        compact ? "mt-3" : "mt-4 text-left",
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <T>未完成的批次</T> · {dormant.length}
      </div>
      <ul className="mt-2 space-y-1.5">
        {visible.map((c) => {
          const days = Math.max(
            0,
            Math.floor((Date.now() - new Date(c.last_active_at).getTime()) / 86400000),
          );
          return (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-card px-2.5 py-1.5"
            >
              <div className="min-w-0 text-[11px]">
                <span className="font-extrabold text-foreground">第 {c.sequence_no} 批</span>
                <span className="ml-1.5 text-muted-foreground">
                  {c.cohort_word_ids.length} 词 · {days} 天前
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onResume(c.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm transition",
                  busy
                    ? "bg-muted text-muted-foreground"
                    : "bg-amber-600 hover:bg-amber-700",
                )}
              >
                <T>继续</T>
              </button>
            </li>
          );
        })}
      </ul>
      {dormant.length > visible.length && (
        <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
          <T>还有</T> {dormant.length - visible.length} <T>批…</T>
        </div>
      )}
    </div>
  );
}
