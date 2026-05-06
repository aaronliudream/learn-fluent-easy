import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, ArrowRight, Clock } from "lucide-react";
import { computeMasteryScore, type MasteryMatrix } from "@/lib/masteryScore";
import { cn } from "@/lib/utils";

/**
 * 21 天保留测试入口
 *
 * 用户经常停在 🌟 精通 (level 3) 上不去 👑 大师 (level 4)，
 * 因为 level 4 需要：score ≥ 0.85 + 至少 21 天前已学 + 这次再答对。
 * 这张卡片把"符合保留测试条件的候选词数"暴露出来，并提供一键挑战入口。
 */
export default function RetentionChallengeCard({
  vocabIds,
  onStart,
}: {
  vocabIds: string[];
  onStart: () => void;
}) {
  const [candidates, setCandidates] = useState<number | null>(null);
  const [mastered, setMastered] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user || vocabIds.length === 0) {
        setCandidates(0);
        return;
      }
      const { data } = await supabase
        .from("gaokao_user_mastery")
        .select("mastery_matrix, reached_master_at, last_seen_at")
        .eq("user_id", u.user.id)
        .eq("item_type", "vocab")
        .in("item_id", vocabIds.slice(0, 1000));
      const cutoff = Date.now() - 21 * 24 * 3600 * 1000;
      let cand = 0;
      let m = 0;
      (data ?? []).forEach((r: any) => {
        if (r.reached_master_at) {
          m += 1;
          return;
        }
        const score = computeMasteryScore((r.mastery_matrix ?? {}) as MasteryMatrix);
        if (score >= 0.85 && r.last_seen_at && new Date(r.last_seen_at).getTime() <= cutoff) {
          cand += 1;
        }
      });
      setCandidates(cand);
      setMastered(m);
    })();
  }, [vocabIds.join(",")]);

  if (candidates === null) return null;
  const has = candidates > 0;

  return (
    <div
      className={cn(
        "mb-5 rounded-3xl border-2 p-4 md:p-5 shadow-sm",
        has
          ? "border-fuchsia-400 bg-gradient-to-br from-fuchsia-50 via-rose-50 to-amber-50 dark:from-fuchsia-950/30 dark:via-rose-950/20 dark:to-amber-950/20 dark:border-fuchsia-700/40"
          : "border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-700 dark:text-fuchsia-400">
            👑 RETENTION CHECK · 21 天保留测试
          </div>
          <h3 className="mt-1 text-base font-extrabold md:text-lg text-foreground">
            {has ? "你有词可以冲 👑 大师了！" : "21 天后才能冲 👑 大师"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {has
              ? `共 ${candidates} 词已达精通且超过 21 天 · 这次再答对就升 👑`
              : "🌱 → 🌿 → 🌳 → 🌟 → 👑（需要 21 天后再次答对，证明真的记住了）"}
          </p>
        </div>
        <div className="rounded-full bg-background/80 px-3 py-1 text-xs font-extrabold text-fuchsia-700 dark:text-fuchsia-400 shadow-sm inline-flex items-center gap-1">
          <Crown className="size-3.5" /> 已 👑 {mastered}
        </div>
      </div>

      {has ? (
        <button
          onClick={onStart}
          className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 px-4 py-3 text-sm font-extrabold text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4" /> 开始 21 天保留测试 · {candidates} 词
          </span>
          <ArrowRight className="size-4" />
        </button>
      ) : (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
          <Clock className="size-3.5" /> 继续学习，21 天后回来挑战 👑
        </div>
      )}
    </div>
  );
}