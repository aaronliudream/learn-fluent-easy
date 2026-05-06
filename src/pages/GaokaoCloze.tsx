import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, Clock, Target, ChevronRight, CheckCircle2, AlertCircle, BookMarked, Lock, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import StarRating from "@/components/StarRating";
import { loadMastery, MasteryRow, statusOf, PASS_PCT, needsReview } from "@/lib/masteryProgress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Passage = {
  id: string;
  passage_no: number;
  title: string;
  topic: string | null;
  topic_group: string | null;
  genre: string | null;
  difficulty: number;
  word_count: number | null;
  blank_count: number;
  recommended_minutes: number;
  source_book_label: string;
};

type SessionStat = { passage_id: string; best_pct: number; attempts: number };

const GROUP_COLOR: Record<string, string> = {
  "人与自我": "from-rose-500 to-pink-600",
  "人与社会": "from-blue-500 to-indigo-600",
  "人与自然": "from-emerald-500 to-teal-600",
};

export default function GaokaoCloze() {
  const [list, setList] = useState<Passage[]>([]);
  const [stats, setStats] = useState<Record<string, SessionStat>>({});
  const [mistakeCount, setMistakeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [showMastered, setShowMastered] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: passages } = await supabase
        .from("gaokao_cloze_passages")
        .select("id, passage_no, title, topic, topic_group, genre, difficulty, word_count, blank_count, recommended_minutes, source_book_label")
        .eq("is_published", true)
        .order("sort_order");
      setList((passages || []) as Passage[]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sess } = await supabase
          .from("gaokao_cloze_sessions")
          .select("passage_id, score_pct")
          .eq("user_id", user.id)
          .eq("status", "submitted");
        const map: Record<string, SessionStat> = {};
        (sess || []).forEach((s: any) => {
          const cur = map[s.passage_id];
          const pct = (s.score_pct || 0) * 100;
          if (!cur) map[s.passage_id] = { passage_id: s.passage_id, best_pct: pct, attempts: 1 };
          else { cur.attempts++; cur.best_pct = Math.max(cur.best_pct, pct); }
        });
        setStats(map);

        const { count } = await supabase
          .from("gaokao_user_mistakes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("module", "cloze")
          .eq("is_resolved", false);
        setMistakeCount(count || 0);
      }
      setLoading(false);
    })();
    loadMastery("gaokao_cloze").then(setMastery);
  }, []);

  const { active, dueReview, mastered } = useMemo(() => {
    const a: Passage[] = [], d: Passage[] = [], m: Passage[] = [];
    for (const p of list) {
      const row = mastery[p.id];
      if (row && row.stars >= 5 && !needsReview(row)) m.push(p);
      else if (needsReview(row)) d.push(p);
      else a.push(p);
    }
    return { active: a, dueReview: d, mastered: m };
  }, [list, mastery]);

  const unlockedSet = useMemo(() => {
    const set = new Set<string>();
    if (list[0]) set.add(list[0].id);
    for (let i = 1; i < list.length; i++) {
      const prev = mastery[list[i - 1].id];
      if (prev && prev.best_pct >= PASS_PCT) set.add(list[i].id);
    }
    return set;
  }, [list, mastery]);

  const renderItem = (p: Passage) => {
    const st = stats[p.id];
    const row = mastery[p.id];
    const masteryStatus = statusOf(row);
    const grad = GROUP_COLOR[p.topic_group || ""] || "from-slate-500 to-slate-600";
    const unlocked = unlockedSet.has(p.id);
    const handleClick = (e: React.MouseEvent) => {
      if (!unlocked) { e.preventDefault(); toast.error("请先完成上一篇并通过 80%"); }
    };
    return (
      <Link
        key={p.id}
        to={`/gaokao/cloze/${p.id}`}
        onClick={handleClick}
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition",
          unlocked ? "border-border hover:-translate-y-0.5 hover:shadow-md" : "border-border/50 bg-muted/40 opacity-60 cursor-not-allowed"
        )}
      >
        <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${grad}`} />
        <div className="flex items-start justify-between gap-3 pl-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">P{p.passage_no.toString().padStart(2, "0")}</span>
              {p.topic_group && <span>{p.topic_group}</span>}
              {p.genre && <><span>·</span><span>{p.genre}</span></>}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{p.title}</h3>
              {row && <StarRating stars={row.stars} />}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Target className="size-3.5" />{p.blank_count} 空</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{p.recommended_minutes} 分钟</span>
              <span className="inline-flex items-center gap-1"><BookOpenCheck className="size-3.5" />{p.word_count || "—"} 词</span>
              {masteryStatus === "review_due" && <span className="text-amber-600 font-bold">· 该复习了</span>}
              {masteryStatus === "mastered" && <span className="text-emerald-600 font-bold">· 完美掌握</span>}
              {!unlocked && <span className="text-orange-500 font-bold">· 需先完成上一篇</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!unlocked ? (
              <Lock className="size-4 text-muted-foreground" />
            ) : st ? (
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                st.best_pct >= 80 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : st.best_pct >= 60 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}>
                {st.best_pct >= 80 ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
                {Math.round(st.best_pct)}%
              </div>
            ) : (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">未做</span>
            )}
            <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/gaokao" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </BackLink>
      <PageHeader back="/gaokao" title="完形填空" subtitle="高一基础册 · 16 篇话题精讲（已上线 6 篇，更多陆续添加）" hideReviewBanner />

      <Link
        to="/gaokao/mistakes"
        className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-gradient-to-br from-amber-500/10 to-orange-500/10 px-4 py-3 transition hover:from-amber-500/15 hover:to-orange-500/15"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <BookMarked className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">我的错题本</div>
            <div className="text-xs text-muted-foreground">{mistakeCount > 0 ? `${mistakeCount} 道完形错题待复习` : "全部已掌握 ✨"}</div>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      {loading ? (
        <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
        ))}</div>
      ) : (
        <>
          {dueReview.length > 0 && (
            <section className="mb-4 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
              <div className="mb-2 flex items-center gap-2"><Clock className="size-4 text-amber-600" /><h2 className="text-sm font-extrabold text-amber-700 dark:text-amber-400">⏰ 该复习了 ({dueReview.length})</h2></div>
              <div className="grid gap-2">{dueReview.map(renderItem)}</div>
            </section>
          )}
          <div className="grid gap-3">{active.map(renderItem)}</div>
          {mastered.length > 0 && (
            <section className="mt-6">
              <button onClick={() => setShowMastered(s => !s)} className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-500/5 px-4 py-3 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                <span>✅ 已完美掌握 {mastered.length} 篇</span>
                <ChevronDown className={cn("size-4 transition", showMastered && "rotate-180")} />
              </button>
              {showMastered && <div className="mt-2 grid gap-2">{mastered.map(renderItem)}</div>}
            </section>
          )}
          <div className="mt-6 text-[11px] text-muted-foreground leading-5">
            💡 <b>解锁规则</b>：≥80% 通过解锁下一篇 · 100% 升一星 · 5⭐ 完美掌握<br/>
            🔁 <b>遗忘曲线</b>：1天 → 3天 → 7天 → 14天 → 30天 → 90天
          </div>
        </>
      )}
    </main>
  );
}
