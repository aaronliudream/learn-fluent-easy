import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { loadUnitGrammar, type GUnit } from "@/lib/juniorGrammarUnits";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  gpct,
  type QMasteryRow,
} from "@/lib/juniorGrammarQuestionMastery";
import { T } from "@/i18n/T";

/** 语法页 L2:某单元内的语法点列表,每点显示完成度 + 掌握度。点进 → 该点测试。 */
export default function JuniorGrammarUnitDetail() {
  const { volume, unit } = useParams<{ volume: string; unit: string }>();
  const [units, setUnits] = useState<GUnit[] | null>(null);
  const [mastery, setMastery] = useState<Map<string, QMasteryRow>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const us = await loadUnitGrammar();
      if (cancelled) return;
      setUnits(us);
      const u = us.find((x) => x.volume === volume && x.unit === unit);
      const m = await loadGrammarQuestionMastery(u?.questionIds ?? []);
      if (!cancelled) setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [volume, unit]);

  const u = useMemo(() => units?.find((x) => x.volume === volume && x.unit === unit) ?? null, [units, volume, unit]);
  const unitProg = useMemo(() => (u ? computeGrammarProgress(u.questionIds, mastery) : null), [u, mastery]);

  if (units === null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  if (!u) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <BackLink to="/junior/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回单元列表</T>
        </BackLink>
        <p className="text-sm text-muted-foreground"><T>未找到该单元</T></p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回单元列表</T>
      </BackLink>

      <div className="mb-5">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">{u.label}</span>
        <h1 className="mt-2 text-2xl font-extrabold"><T>本单元语法</T></h1>
        {unitProg && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <BarTile label="单元完成度" value={gpct(unitProg.done, unitProg.total)} sub={`${unitProg.done}/${unitProg.total} 题`} color="emerald" />
            <BarTile label="单元掌握度" value={gpct(unitProg.mastered, unitProg.total)} sub={`${unitProg.mastered}/${unitProg.total} 题`} color="amber" />
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {u.points.map((p) => {
          const prog = computeGrammarProgress(p.questionIds, mastery);
          return (
            <Link
              key={p.id}
              to={`/junior/grammar/point/${p.id}`}
              className="block rounded-xl border bg-card p-3.5 transition hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold leading-snug">{p.title}</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <MiniBar label="完成" value={gpct(prog.done, prog.total)} sub={`${prog.done}/${prog.total}`} color="emerald" />
                    <MiniBar label="掌握" value={gpct(prog.mastered, prog.total)} sub={`${prog.mastered}/${prog.total}`} color="amber" />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function BarTile({ label, value, sub, color }: { label: string; value: number; sub: string; color: "emerald" | "amber" }) {
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

function MiniBar({ label, value, sub, color }: { label: string; value: number; sub: string; color: "emerald" | "amber" }) {
  const bar = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
        <span>{label} {sub}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${bar}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
    </div>
  );
}
