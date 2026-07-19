import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { dbPublisherFor, readJuniorPublisherParam } from "@/lib/juniorHub/publisher";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadUnitGrammar, type GUnit } from "@/lib/juniorGrammarUnits";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  gpct,
  type QMasteryRow,
} from "@/lib/juniorGrammarQuestionMastery";
import { T } from "@/i18n/T";

/** 卷代码 → tab 显示用学期名(仅改显示,不动底层 volume code)。 */
const VOLUME_LABELS: Record<string, string> = {
  "7A": "初一上学期",
  "7B": "初一下学期",
  "8A": "初二上学期",
  "8B": "初二下学期",
  "9": "初三全学期",
  "g9": "初三全学期",
};
const volLabel = (v: string) => VOLUME_LABELS[v] ?? v;

/** 语法页 L1:学期 Tab + 紧凑网格单元卡(配色编号),每卡显示完成度/掌握度。点进 → 单元语法点。 */
export default function JuniorGrammarUnits() {
  const [params] = useSearchParams();
  const dbPub = dbPublisherFor(readJuniorPublisherParam(params)); // 出版社过滤:人教='junior'(结果等价),外研社='junior_fltrp'
  const [units, setUnits] = useState<GUnit[] | null>(null);
  const [mastery, setMastery] = useState<Map<string, QMasteryRow>>(new Map());
  const [vol, setVol] = useState<string>("7A");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const us = await loadUnitGrammar(dbPub);
      if (cancelled) return;
      setUnits(us);
      const m = await loadGrammarQuestionMastery(us.flatMap((u) => u.questionIds));
      if (!cancelled) setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [dbPub]);

  const volumes = useMemo(() => [...new Set((units ?? []).map((u) => u.volume))], [units]);
  useEffect(() => {
    if (volumes.length && !volumes.includes(vol)) setVol(volumes[0]);
  }, [volumes, vol]);

  const totals = useMemo(() => {
    if (!units) return { done: 0, mastered: 0, total: 0 };
    return computeGrammarProgress(units.flatMap((u) => u.questionIds), mastery);
  }, [units, mastery]);

  const shown = useMemo(() => (units ?? []).filter((u) => u.volume === vol), [units, vol]);

  if (units === null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回初中专区</T>
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">JUNIOR · GRAMMAR</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl"><T>初中语法专项</T></h1>
        <p className="mt-1 text-sm text-muted-foreground"><T>按课本单元 · 每题答对 2 次即掌握</T></p>
      </div>

      {/* 顶部总览(全部单元) */}
      {totals.total > 0 && (
        <section className="mb-5 grid grid-cols-2 gap-3">
          <ProgressTile label="完成度" value={gpct(totals.done, totals.total)} sub={`${totals.done}/${totals.total} 题`} color="emerald" />
          <ProgressTile label="掌握度" value={gpct(totals.mastered, totals.total)} sub={`${totals.mastered}/${totals.total} 题`} color="amber" />
        </section>
      )}

      {/* 7A / 7B Tab */}
      {volumes.length > 1 && (
        <div className="mb-4 inline-flex rounded-xl border bg-card p-1 text-sm">
          {volumes.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVol(v)}
              aria-pressed={vol === v}
              className={cn(
                "rounded-lg px-5 py-1.5 font-bold transition",
                vol === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {volLabel(v)}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground"><T>本册暂无单元语法内容</T></p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {shown.map((u, i) => {
            const prog = computeGrammarProgress(u.questionIds, mastery);
            const c = PALETTE[i % PALETTE.length];
            return (
              <Link
                key={`${u.volume}-${u.unit}`}
                to={`/junior/grammar/unit/${u.volume}/${u.unit}`}
                className={cn("flex flex-col rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md", c.border, c.bg)}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold text-white shadow-sm", c.badge)}>
                    {u.unit}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{u.points.length}点·{u.questionIds.length}题</span>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
                </div>

                <div className="mt-2 line-clamp-2 min-h-[2.4em] text-xs font-semibold leading-snug text-foreground">
                  {u.points.map((p) => shortPoint(p.title)).join(" · ")}
                </div>

                <div className="mt-2.5 space-y-1.5">
                  <StatBar label="完成" value={gpct(prog.done, prog.total)} color="emerald" />
                  <StatBar label="掌握" value={gpct(prog.mastered, prog.total)} color="amber" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

/** 精简考点名:去掉开头 ①②③ 序号和括号补充,便于卡片展示。 */
function shortPoint(title: string): string {
  return title.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/\s*[(（][^)）]*[)）]\s*$/, "").trim();
}

/** 单元卡配色(沿用初中专区 playful 调色,循环取色)。 */
const PALETTE = [
  { badge: "bg-pink-500", border: "border-pink-200 dark:border-pink-900/50", bg: "bg-pink-50/60 dark:bg-pink-950/20" },
  { badge: "bg-cyan-500", border: "border-cyan-200 dark:border-cyan-900/50", bg: "bg-cyan-50/60 dark:bg-cyan-950/20" },
  { badge: "bg-amber-500", border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50/60 dark:bg-amber-950/20" },
  { badge: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-900/50", bg: "bg-emerald-50/60 dark:bg-emerald-950/20" },
  { badge: "bg-violet-500", border: "border-violet-200 dark:border-violet-900/50", bg: "bg-violet-50/60 dark:bg-violet-950/20" },
  { badge: "bg-sky-500", border: "border-sky-200 dark:border-sky-900/50", bg: "bg-sky-50/60 dark:bg-sky-950/20" },
];

function ProgressTile({ label, value, sub, color }: { label: string; value: number; sub: string; color: "emerald" | "amber" }) {
  const bar = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{value}<span className="text-sm font-normal text-muted-foreground">%</span></div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${bar}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" }) {
  const bar = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 shrink-0 text-[10px] font-bold text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${bar}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] font-bold tabular-nums">{value}%</span>
    </div>
  );
}
