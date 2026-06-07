import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GrammarRevengeRunner, type RevengeItem } from "@/components/grammar/GrammarRevengeRunner";
import { fireEmojiConfetti } from "@/lib/feedback";
import { awardForCorrect } from "@/lib/coins";
import {
  JUNIOR_ERROR_REASON_LABELS,
  loadJuniorGrammarMasteryAll,
  loadDueRevengeItems,
  removeFromWrongQ,
  type JuniorGrammarErrorReason,
} from "@/lib/juniorGrammarFsrs";
import {
  dominantErrorReason,
  rankWeakPoints,
} from "@/lib/juniorGrammarRevenge";
import { juniorGrammarPlayPath } from "@/lib/juniorGrammarNav";
import { loadPointsWithKp } from "@/lib/juniorKnowledgePoint";
import { cn } from "@/lib/utils";

type Pt = {
  id: string;
  title: string;
  content_depth: number | null;
  grade: number | null;
};

export default function JuniorGrammarRevenge() {
  const [params, setParams] = useSearchParams();
  const reasonFilter = (params.get("reason") || "") as JuniorGrammarErrorReason | "";
  const pointFilter = params.get("point") || "";

  const [pts, setPts] = useState<Pt[]>([]);
  const [mastery, setMastery] = useState<Awaited<ReturnType<typeof loadJuniorGrammarMasteryAll>>>([]);
  const [kpPoints, setKpPoints] = useState<Set<string>>(new Set()); // 已拆知识点的考点 id
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, m, kpset] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,title,content_depth,grade")
          .order("sort_order"),
        loadJuniorGrammarMasteryAll(),
        loadPointsWithKp(),
      ]);
      setPts((p.data ?? []) as Pt[]);
      setMastery(m);
      setKpPoints(kpset);
      setLoading(false);
    })();
  }, []);

  const masteryMap = useMemo(() => {
    const map: Record<string, (typeof mastery)[0]> = {};
    for (const r of mastery) map[r.item_id] = r;
    return map;
  }, [mastery]);

  const dominantByPoint = useMemo(() => {
    const d: Record<string, JuniorGrammarErrorReason | null> = {};
    for (const p of pts) {
      d[p.id] = dominantErrorReason(masteryMap[p.id]?.mastery_matrix?.errors);
    }
    return d;
  }, [pts, masteryMap]);

  const [revengeItems, setRevengeItems] = useState<RevengeItem[]>([]);
  useEffect(() => {
    (async () => {
      const items = await loadDueRevengeItems({ pointId: pointFilter || undefined });
      // 错因筛选沿用 point 级 dominant error(与原逻辑一致)
      const filtered = reasonFilter
        ? items.filter((it) => dominantByPoint[it.pointId] === reasonFilter)
        : items;
      setRevengeItems(filtered);
    })();
  }, [pointFilter, reasonFilter, dominantByPoint]);

  const weakPoints = useMemo(() => rankWeakPoints(pts, masteryMap).slice(0, 8), [pts, masteryMap]);

  const setReason = (reason: JuniorGrammarErrorReason | "") => {
    const next = new URLSearchParams(params);
    if (reason) next.set("reason", reason);
    else next.delete("reason");
    setParams(next);
    setDone(false);
    setScore(null);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <p className="text-sm text-muted-foreground"><T>加载中…</T></p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回语法冒险</T>
      </BackLink>

      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600">REVENGE RUSH</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold"><T>错题复仇冲刺</T></h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <T>汇总各关错题 · 按错因专攻 · 改对清空弱点</T>
        </p>
      </div>

      {!done &&
      <>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReason("")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold border transition",
              !reasonFilter ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted",
            )}>
            <T>全部错因</T>
          </button>
          {(Object.keys(JUNIOR_ERROR_REASON_LABELS) as JuniorGrammarErrorReason[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setReason(k)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold border transition",
                reasonFilter === k ? "bg-rose-600 text-white border-rose-600" : "bg-card hover:bg-muted",
              )}>
              {JUNIOR_ERROR_REASON_LABELS[k]}
            </button>
          ))}
        </div>

        {weakPoints.length > 0 &&
        <section className="mb-6 rounded-2xl border bg-card p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"><T>薄弱考点</T></div>
          <ul className="space-y-1.5">
            {weakPoints.map((w) => (
              <li key={w.point.id} className="flex items-center gap-2">
                <Link
                  to={
                    w.mistakeCount > 0
                      ? `/junior/grammar/revenge?point=${w.point.id}`
                      : juniorGrammarPlayPath(w.point.id, w.point, { hasKp: kpPoints.has(w.point.id) })
                  }
                  className="flex flex-1 min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60">
                  <span className="truncate font-medium">{w.point.title}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {w.mistakeCount > 0 && <span className="text-rose-600 font-bold">{w.mistakeCount} <T>题待复仇</T></span>}
                    {w.mistakeCount === 0 && w.isDue && <T>待复习</T>}
                    {w.mistakeCount === 0 && !w.isDue &&
                    <span>{w.wrongCount} <T>次错</T></span>
                    }
                  </span>
                </Link>
                {w.mistakeCount > 0 &&
                <Link
                  to={`/junior/grammar/revenge?point=${w.point.id}`}
                  className="shrink-0 rounded-lg bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-600">
                  <T>只刷这关</T>
                </Link>
                }
              </li>
            ))}
          </ul>
        </section>
        }

        <GrammarRevengeRunner
          items={revengeItems}
          onCorrect={(item) => {
            awardForCorrect(1, "junior_grammar_revenge").catch(() => {});
            if (item?.pointId && item?.questionId)
              removeFromWrongQ(item.pointId, item.questionId).catch(() => {});
          }}
          onDone={(correct, total) => {
            setScore({ correct, total });
            setDone(true);
            if (total > 0 && correct === total) {
              fireEmojiConfetti({ emojis: ["⚔️", "🏆"] });
            }
          }}
          emptyHint={
            reasonFilter
              ? `「${JUNIOR_ERROR_REASON_LABELS[reasonFilter]}」暂无缓存错题，先去相关考点闯一关吧`
              : undefined
          }
        />
      </>
      }

      {done && score &&
      <section className="rounded-2xl border bg-gradient-to-br from-rose-500/10 to-amber-500/10 p-8 text-center space-y-4">
        <div className="text-5xl">{score.correct === score.total ? "🏆" : "💪"}</div>
        <h2 className="text-xl font-extrabold">
          {score.correct === score.total ? <T>复仇全胜！</T> : <T>复仇完成</T>}
        </h2>
        <p className="text-sm text-muted-foreground">
          <T>改对</T> {score.correct}/{score.total}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setDone(false); setScore(null); }}
            className="rounded-full border px-4 py-2 text-sm font-bold hover:bg-muted">
            <T>再刷一遍</T>
          </button>
          <BackLink to="/junior/grammar" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground inline-flex items-center gap-1">
            <T>返回语法冒险</T> <ChevronRight className="size-3.5" />
          </BackLink>
        </div>
      </section>
      }
    </main>
  );
}
