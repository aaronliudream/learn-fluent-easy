import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import { MasteryRow, statusOf, PASS_PCT } from "@/lib/masteryProgress";
import { listReadings, type ReadingListItem, type ReadingGradeBand } from "@/lib/reading/source";
import { loadReadingMastery } from "@/lib/reading/mastery";

const BANDS: { key: ReadingGradeBand | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "primary", label: "小学" },
  { key: "junior", label: "初中" },
  { key: "senior", label: "高中" },
  { key: "general", label: "通用" },
];

const BAND_CN: Record<ReadingGradeBand, string> = {
  primary: "小学",
  junior: "初中",
  senior: "高中",
  general: "通用",
};

export default function Reading() {
  const [band, setBand] = useState<ReadingGradeBand | "all">("all");
  const [items, setItems] = useState<ReadingListItem[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});

  useEffect(() => {
    listReadings(band === "all" ? undefined : band).then(setItems);
  }, [band]);

  useEffect(() => {
    loadReadingMastery().then(setMastery);
  }, []);

  const { todo, dueReview, done } = useMemo(() => {
    const t: ReadingListItem[] = [], d: ReadingListItem[] = [], f: ReadingListItem[] = [];
    for (const r of items) {
      const row = mastery[r.id];
      if ((row?.best_pct ?? 0) >= 100) f.push(r);
      else if (statusOf(row) === "review_due") d.push(r);
      else t.push(r);
    }
    return { todo: t, dueReview: d, done: f };
  }, [items, mastery]);

  const totalPassed = items.filter((r) => {
    const row = mastery[r.id];
    return row && row.best_pct >= PASS_PCT;
  }).length;

  const renderRow = (r: ReadingListItem) => {
    const row = mastery[r.id];
    const st = statusOf(row);
    const mastered = (row?.best_pct ?? 0) >= 100;
    return (
      <Link key={r.id} to={`/reading/${r.id}`}
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
            {BAND_CN[r.grade_band]} · {r.level ?? r.topic ?? "general"} · {r.word_count ?? "?"} <T>词 · 难度</T> {r.difficulty}
            {row && <span className="ml-1 font-bold"><T>· 最佳</T> {row.best_pct}%</span>}
            {!row && <span className="ml-1"><T>· 未做</T></span>}
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
      </Link>
    );
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> <T>返回首页</T></BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold"><T>📖 阅读中心</T></h1>
      <p className="mt-1 text-sm text-muted-foreground"><T>分级读物 · 任意选篇练 · 100% 升一星 · 5⭐ 永久掌握</T></p>

      {/* 学段筛选 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {BANDS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBand(b.key)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
              band === b.key
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-card text-muted-foreground hover:border-emerald-300",
            )}
          >
            <T>{b.label}</T>
          </button>
        ))}
      </div>

      {/* 复习提醒 */}
      {dueReview.length > 0 && (
        <section className="mt-5 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-amber-600" />
            <h2 className="text-sm font-extrabold text-amber-700 dark:text-amber-400"><T>⏰ 该复习了 (</T>{dueReview.length})</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3"><T>根据遗忘曲线，以下文章到了复习时间，再做一次保持记忆 →</T></p>
          <div className="grid gap-2">{dueReview.map(renderRow)}</div>
        </section>
      )}

      {/* 全部阅读 */}
      <div className="mt-5">
        {items.length === 0 && <p className="text-sm text-muted-foreground"><T>暂无文章，敬请期待</T></p>}
        {items.length > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-foreground"><T>📚 阅读篇目</T></h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">{totalPassed}/{items.length} <T>已通过</T></span>
          </div>
        )}
        {todo.length > 0 && <div className="grid gap-2">{todo.map(renderRow)}</div>}
      </div>

      {/* 已掌握 */}
      {done.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-400"><T>✅ 已掌握</T> {done.length} <T>篇</T></h2>
          <div className="grid gap-2">{done.map(renderRow)}</div>
        </section>
      )}

      <div className="mt-6 text-[11px] text-muted-foreground leading-5">
        💡 <b><T>练习规则</T></b><T>：任意选篇练 · ≥80% 算通过 · 100% 升一星 · 答错立刻显示答案</T><br />
        🔁 <b><T>遗忘曲线</T></b><T>：1天 → 3天 → 7天 → 14天 → 30天，逐级提醒复习</T>
      </div>
    </main>
  );
}
