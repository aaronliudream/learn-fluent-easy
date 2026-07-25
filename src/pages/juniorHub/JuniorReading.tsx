import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Lock, CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import StarRating from "@/components/StarRating";
import { loadMastery, MasteryRow, statusOf, PASS_PCT, needsReview } from "@/lib/masteryProgress";
import ModuleStageTests from "@/components/ModuleStageTests";
import { JuniorGradeFilter, juniorGradeParams, type JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";

/** 从 ?grade= 参数(可能是 1/2/3 或 7/8/9)推出筛选条 chip 的当前值。 */
function gradeKeyFromParam(grade: string | null): JuniorGradeKey {
  if (!grade) return "all";
  const db = Number(grade) >= 7 ? Number(grade) : Number(grade) + 6;
  return db === 7 ? "g7" : db === 8 ? "g8" : db === 9 ? "g9" : "all";
}

type R = {id: string;title: string;topic: string | null;word_count: number | null;difficulty: number;grade: number;};

export default function JuniorReading() {
  const [params, setParams] = useSearchParams();
  const grade = params.get("grade");
  const backTo = "/junior";
  const onGrade = (key: JuniorGradeKey) => {
    const { dbGrade } = juniorGradeParams(key);
    const next = new URLSearchParams(params);
    if (dbGrade != null) next.set("grade", String(dbGrade));
    else next.delete("grade");
    setParams(next, { replace: true });
  };
  const [items, setItems] = useState<R[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [showMastered, setShowMastered] = useState(false);

  useEffect(() => {
    const gradeMap: Record<string, number> = { "1": 7, "2": 8, "3": 9 };
    const dbGrade = grade ? gradeMap[grade] ?? Number(grade) : null;
    let q = supabase.from("junior_reading").select("id,title,topic,word_count,difficulty,grade").order("grade").order("difficulty", { ascending: true }).order("created_at", { ascending: true });
    if (dbGrade) q = q.eq("grade", dbGrade);
    q.then(({ data }) => setItems((data ?? []) as R[]));
    loadMastery("junior_reading").then(setMastery);
  }, [grade]);

  // 三组：活跃/复习/已掌握
  const { dueReview, mastered } = useMemo(() => {
    const a: R[] = [],d: R[] = [],m: R[] = [];
    for (const r of items) {
      const row = mastery[r.id];
      if (row && row.stars >= 5 && !needsReview(row)) m.push(r);else
      if (needsReview(row)) d.push(r);else
      a.push(r);
    }
    return { active: a, dueReview: d, mastered: m };
  }, [items, mastery]);

  // 解锁判定基于全部 items 的顺序：上一篇 best_pct ≥ PASS_PCT
  const unlockedSet = useMemo(() => {
    const set = new Set<string>();
    if (items[0]) set.add(items[0].id);
    for (let i = 1; i < items.length; i++) {
      const prev = mastery[items[i - 1].id];
      if (prev && prev.best_pct >= PASS_PCT) set.add(items[i].id);
    }
    return set;
  }, [items, mastery]);

  // 按难度顺序，"当前闯关"= 第一篇还没通过(best_pct < 80%)的文章；都通过则为 null
  const current = useMemo(() => {
    for (const r of items) {
      const row = mastery[r.id];
      if (!row || row.best_pct < PASS_PCT) return r;
    }
    return null;
  }, [items, mastery]);
  const totalPassed = items.filter((r) => {const row = mastery[r.id];return row && row.best_pct >= PASS_PCT;}).length;

  const renderRow = (r: R) => {
    const row = mastery[r.id];
    const st = statusOf(row);
    const unlocked = unlockedSet.has(r.id);
    const handleClick = (e: React.MouseEvent) => {
      if (!unlocked) {e.preventDefault();toast.error("请先完成上一篇并通过 80%");}
    };
    return (
      <Link key={r.id} to={`/junior/reading/${r.id}`} onClick={handleClick}
      className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 transition",
      !unlocked ? "border-border/50 bg-muted/40 opacity-60 cursor-not-allowed" :
      st === "mastered" ? "border-emerald-400/40 bg-emerald-500/5" :
      st === "review_due" ? "border-amber-400/60 bg-amber-500/5 hover:-translate-y-0.5" :
      "border-border bg-card hover:-translate-y-0.5 hover:border-emerald-300")}>
        <div className={cn("grid size-11 place-items-center rounded-xl text-white",
        st === "mastered" ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
        st === "review_due" ? "bg-gradient-to-br from-amber-500 to-orange-500" :
        !unlocked ? "bg-muted-foreground/40" :
        st === "passed" ? "bg-gradient-to-br from-sky-500 to-blue-500" :
        st === "tried" ? "bg-gradient-to-br from-rose-500 to-pink-500" :
        "bg-gradient-to-br from-emerald-400 to-teal-500")}>
          {st === "mastered" ? <CheckCircle2 className="size-5" /> :
          st === "review_due" ? <Clock className="size-5" /> :
          !unlocked ? <Lock className="size-5" /> : <FileText className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-extrabold">{r.title}</div>
            {row && <StarRating stars={row.stars} />}
          </div>
          <div className="text-[11px] text-muted-foreground">
            G{r.grade} · {r.topic ?? "general"} · {r.word_count ?? "?"} <T>词 ·</T> {r.difficulty === 0 ? <T>精读</T> : <T>泛读</T>}
            {row && <span className="ml-1 font-bold"><T>· 最佳</T> {row.best_pct}%</span>}
            {st === "review_due" && <span className="ml-1 text-amber-600 font-bold"><T>· 该复习了</T></span>}
            {st === "mastered" && <span className="ml-1 text-emerald-600 font-bold"><T>· 完美掌握 ⭐⭐⭐⭐⭐</T></span>}
            {!unlocked && <span className="ml-1 text-orange-500 font-bold"><T>· 需先完成上一篇</T></span>}
          </div>
        </div>
      </Link>);

  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回初中专区</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold"><T>📖 初中阅读训练</T></h1>
      <p className="mt-1 text-sm text-muted-foreground"><T>闯关式阅读 · ≥80% 解锁下一篇 · 100% 升一星 · 5⭐ 永久掌握</T></p>

      <JuniorGradeFilter value={gradeKeyFromParam(grade)} onChange={onGrade} className="mt-4" />

      {grade &&
      <ModuleStageTests
        segment="junior"
        grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
        module="reading"
        className="mt-4" />

      }

      {/* 复习提醒 */}
      {dueReview.length > 0 &&
      <section className="mt-5 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-amber-600" />
            <h2 className="text-sm font-extrabold text-amber-700 dark:text-amber-400"><T>⏰ 该复习了 (</T>{dueReview.length})</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3"><T>根据遗忘曲线，以下文章到了复习时间，再做一次保持记忆 →</T></p>
          <div className="grid gap-2">{dueReview.map(renderRow)}</div>
        </section>
      }

      {/* 当前闯关：按难度，一次只显示一篇 */}
      <div className="mt-5">
        {items.length === 0 && <p className="text-sm text-muted-foreground"><T>暂无文章，敬请期待</T></p>}
        {items.length > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-foreground"><T>🎯 当前闯关</T></h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">{totalPassed}/{items.length} <T>已通过</T></span>
          </div>
        )}
        {current ? (
          <>
            <div className="grid gap-2">{renderRow(current)}</div>
            <p className="mt-2 text-[11px] text-muted-foreground"><T>完成本篇并达到 ≥80%，自动解锁下一篇（按难度由易到难）。</T></p>
          </>
        ) : items.length > 0 && dueReview.length === 0 ? (
          <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/5 p-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <T>🎉 本年级的阅读都通过啦！可在下方复习或挑战其他年级。</T>
          </div>
        ) : null}
      </div>

      {/* 已掌握折叠 */}
      {mastered.length > 0 &&
      <section className="mt-6">
          <button onClick={() => setShowMastered((s) => !s)}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-500/5 px-4 py-3 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
            <span><T>✅ 已完美掌握</T> {mastered.length} <T>篇</T></span>
            <ChevronDown className={cn("size-4 transition", showMastered && "rotate-180")} />
          </button>
          {showMastered && <div className="mt-2 grid gap-2">{mastered.map(renderRow)}</div>}
        </section>
      }

      <div className="mt-6 text-[11px] text-muted-foreground leading-5">
        💡 <b><T>解锁规则</T></b><T>：≥80% 通过解锁下一篇 · 100% 升一星 · 答错立刻显示答案</T><br />
        🔁 <b><T>遗忘曲线</T></b><T>：1天 → 3天 → 7天 → 14天 → 30天，逐级提醒复习</T>
      </div>
    </main>);

}