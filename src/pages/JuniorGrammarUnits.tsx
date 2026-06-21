import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { loadUnitGrammar, type GUnit } from "@/lib/juniorGrammarUnits";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  gpct,
  type QMasteryRow,
} from "@/lib/juniorGrammarQuestionMastery";
import { T } from "@/i18n/T";

/** 语法页 L1:单元列表(按课本序),每单元显示完成度 + 掌握度。点进 → 该单元语法点。 */
export default function JuniorGrammarUnits() {
  const [units, setUnits] = useState<GUnit[] | null>(null);
  const [mastery, setMastery] = useState<Map<string, QMasteryRow>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const us = await loadUnitGrammar();
      if (cancelled) return;
      setUnits(us);
      const allIds = us.flatMap((u) => u.questionIds);
      const m = await loadGrammarQuestionMastery(allIds);
      if (!cancelled) setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    if (!units) return { done: 0, mastered: 0, total: 0 };
    const ids = units.flatMap((u) => u.questionIds);
    return computeGrammarProgress(ids, mastery);
  }, [units, mastery]);

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

      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">JUNIOR · GRAMMAR</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl"><T>初中语法专项</T></h1>
        <p className="mt-1 text-sm text-muted-foreground"><T>按课本单元 · 每题答对 2 次即掌握</T></p>
      </div>

      {/* 总进度 */}
      {totals.total > 0 && (
        <section className="mb-6 grid grid-cols-2 gap-3">
          <ProgressTile label="完成度" value={gpct(totals.done, totals.total)} sub={`${totals.done}/${totals.total} 题`} color="emerald" />
          <ProgressTile label="掌握度" value={gpct(totals.mastered, totals.total)} sub={`${totals.mastered}/${totals.total} 题`} color="amber" />
        </section>
      )}

      {units.length === 0 ? (
        <p className="text-sm text-muted-foreground"><T>暂无单元语法内容</T></p>
      ) : (
        <>
          <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold">
            <BookOpen className="size-4 text-primary" /> <T>单元</T>
          </h2>
          <div className="space-y-3">
            {units.map((u) => {
              const prog = computeGrammarProgress(u.questionIds, mastery);
              return (
                <Link
                  key={`${u.volume}-${u.unit}`}
                  to={`/junior/grammar/unit/${u.volume}/${u.unit}`}
                  className="block rounded-2xl border bg-card p-4 transition hover:border-primary hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">{u.label}</span>
                        <span className="text-xs text-muted-foreground">{u.points.length} 个语法点 · {u.questionIds.length} 题</span>
                      </div>
                      <div className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                        {u.points.map((p) => shortPoint(p.title)).join(" · ")}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <MiniBar label="完成" value={gpct(prog.done, prog.total)} color="emerald" />
                        <MiniBar label="掌握" value={gpct(prog.mastered, prog.total)} color="amber" />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

/** 精简考点名:去掉开头的 ①②③ 序号和括号补充,便于在卡片上一行展示。 */
function shortPoint(title: string): string {
  return title.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/\s*[(（][^)）]*[)）]\s*$/, "").trim();
}

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

function MiniBar({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" }) {
  const bar = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${bar}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
    </div>
  );
}
