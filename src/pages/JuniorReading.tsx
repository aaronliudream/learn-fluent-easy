import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import { loadMastery, MasteryRow, statusOf, PASS_PCT } from "@/lib/masteryProgress";
import ModuleStageTests from "@/components/ModuleStageTests";
import { JuniorGradeFilter, juniorGradeParams, type JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";
import { dbPublisherFor, readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";

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
  const pub = readJuniorPublisherParam(params);
  const dbPub = dbPublisherFor(pub); // 出版社过滤:人教='junior'(结果等价),外研社='junior_fltrp'
  const backTo = withJuniorPublisher("/junior", pub); // 返回专区保留出版社
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
    let q = supabase.from("junior_reading").select("id,title,topic,word_count,difficulty,grade").eq("publisher", dbPub).order("grade").order("difficulty", { ascending: true }).order("created_at", { ascending: true });
    if (dbGrade) q = q.eq("grade", dbGrade);
    q.then(({ data }) => {
      // 排序：年级 → 册别(上册先, 下册后) → 难度 → 词数。
      // 册别从标题判断：含"七下/八下/九下"为下册(排后)；其余(含"七上"和无前缀基础篇)为上册(排前)。
      const vol = (t: string) => (/[七八九]下/.test(t) ? 1 : 0);
      const rows = ((data ?? []) as R[]).slice().sort((a, b) =>
        (a.grade - b.grade) ||
        (vol(a.title) - vol(b.title)) ||
        (a.difficulty - b.difficulty) ||
        ((a.word_count ?? 9999) - (b.word_count ?? 9999))
      );
      setItems(rows);
    });
    loadMastery("junior_reading").then(setMastery);
  }, [grade, dbPub]);

  // 分组(决定上下顺序):待办(未做+没全对) 置顶 / 待复习 / 已掌握(一次全对100%) 沉底。
  // ⚠️ 阅读掌握标准 = best_pct>=100(一次全对即掌握),不用 star 阈值(语法/听力另有判定,别套用)。
  const { todo, dueReview, done } = useMemo(() => {
    const t: R[] = [],d: R[] = [],f: R[] = [];
    for (const r of items) {
      const row = mastery[r.id];
      if ((row?.best_pct ?? 0) >= 100) f.push(r);         // 一次全对100% → 已掌握沉底
      else if (statusOf(row) === "review_due") d.push(r);  // 待复习 → 顶部
      else t.push(r);                                      // 未做 / 做了没全对 → 待办置顶(继续刷满分)
    }
    return { todo: t, dueReview: d, done: f };
  }, [items, mastery]);

  const totalPassed = items.filter((r) => {const row = mastery[r.id];return row && row.best_pct >= PASS_PCT;}).length;

  const renderRow = (r: R) => {
    const row = mastery[r.id];
    const st = statusOf(row);
    const mastered = (row?.best_pct ?? 0) >= 100; // 阅读掌握=一次全对100%(不看 star)
    return (
      <Link key={r.id} to={withJuniorPublisher(`/junior/reading/${r.id}`, pub)}
      className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 transition",
      mastered ? "border-emerald-400/40 bg-emerald-500/5 hover:-translate-y-0.5" :
      st === "review_due" ? "border-amber-400/60 bg-amber-500/5 hover:-translate-y-0.5" :
      "border-border bg-card hover:-translate-y-0.5 hover:border-emerald-300")}>
        <div className={cn("grid size-11 place-items-center rounded-xl text-white",
        !row ? "bg-muted-foreground/30" :
        mastered ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
        st === "review_due" ? "bg-gradient-to-br from-amber-500 to-orange-500" :
        st === "passed" ? "bg-gradient-to-br from-sky-500 to-blue-500" :
        st === "tried" ? "bg-gradient-to-br from-rose-500 to-pink-500" :
        "bg-gradient-to-br from-emerald-400 to-teal-500")}>
          {mastered ? <CheckCircle2 className="size-5" /> :
          st === "review_due" ? <Clock className="size-5" /> : <FileText className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-extrabold">{r.title}</div>
            {row && <StarRating stars={row.stars} />}
          </div>
          <div className="text-[11px] text-muted-foreground">
            G{r.grade} · {r.topic ?? "general"} · {r.word_count ?? "?"} <T>词 · 难度</T> {r.difficulty}
            {row && <span className="ml-1 font-bold"><T>· 最佳</T> {row.best_pct}%</span>}
            {!row && <span className="ml-1"><T>· 未做</T></span>}
            {!mastered && st === "review_due" && <span className="ml-1 text-amber-600 font-bold"><T>· 该复习了</T></span>}
            {mastered && <span className="ml-1 text-emerald-600 font-bold"><T>· 已掌握 💯</T></span>}
          </div>
          {row && !mastered && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn("h-full rounded-full transition-all",
                st === "review_due" ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                "bg-gradient-to-r from-sky-400 to-emerald-400")}
                style={{ width: `${Math.max(6, row.best_pct)}%` }} />
            </div>
          )}
        </div>
      </Link>);

  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回初中专区</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold"><T>📖 初中阅读训练</T></h1>
      <p className="mt-1 text-sm text-muted-foreground"><T>本年级阅读总览 · 任意选篇练 · 100% 升一星 · 5⭐ 永久掌握</T></p>

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

      {/* 本年级全部阅读：任意点开做，不锁 */}
      <div className="mt-5">
        {items.length === 0 && <p className="text-sm text-muted-foreground"><T>暂无文章，敬请期待</T></p>}
        {items.length > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-foreground"><T>📚 本年级阅读</T></h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">{totalPassed}/{items.length} <T>已通过</T></span>
          </div>
        )}
        {todo.length > 0 && <div className="grid gap-2">{todo.map(renderRow)}</div>}
        {items.length > 0 && todo.length === 0 && dueReview.length === 0 && (
          <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/5 p-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <T>🎉 待办阅读都做完啦！已掌握的在下方，可复习或挑战其他年级。</T>
          </div>
        )}
      </div>

      {/* 已掌握(一次全对100%)折叠 → 沉到列表最底部;没全对(含80-99%)仍留上半区刷满分 */}
      {done.length > 0 &&
      <section className="mt-6">
          <button onClick={() => setShowMastered((s) => !s)}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-500/5 px-4 py-3 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
            <span><T>✅ 已掌握</T> {done.length} <T>篇</T></span>
            <ChevronDown className={cn("size-4 transition", showMastered && "rotate-180")} />
          </button>
          {showMastered && <div className="mt-2 grid gap-2">{done.map(renderRow)}</div>}
        </section>
      }

      <div className="mt-6 text-[11px] text-muted-foreground leading-5">
        💡 <b><T>练习规则</T></b><T>：任意选篇练 · ≥80% 算通过 · 100% 升一星 · 答错立刻显示答案</T><br />
        🔁 <b><T>遗忘曲线</T></b><T>：1天 → 3天 → 7天 → 14天 → 30天，逐级提醒复习</T>
      </div>
    </main>);

}
