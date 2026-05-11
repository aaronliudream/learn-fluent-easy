import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Crown, Medal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  rank: number;
  alias: string;
  best_score: number;
  total_plays: number;
  is_me: boolean;
};

type MyStats = {
  best_score: number;
  avg_score: number;
  total_plays: number;
  week_rank: number;
};

/**
 * Generic leaderboard for vocab mini-games.
 * Reads from get_game_leaderboard + get_my_game_stats RPCs.
 */
export default function GameLeaderboard({
  gameType,
  title,
  accent = "fuchsia"




}: {gameType: "word_rush" | "word_bento" | "word_quest" | "word_duel";title: string;accent?: "fuchsia" | "amber" | "emerald" | "indigo";}) {
  const [scope, setScope] = useState<"week" | "all">("week");
  const [rows, setRows] = useState<Row[]>([]);
  const [my, setMy] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      const [a, b] = await Promise.all([
      supabase.rpc("get_game_leaderboard", { _game_type: gameType, _scope: scope }),
      supabase.rpc("get_my_game_stats", { _game_type: gameType })]
      );
      if (cancel) return;
      setRows((a.data ?? []) as Row[]);
      setMy((b.data?.[0] ?? null) as MyStats | null);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [gameType, scope]);

  const accentClasses = {
    fuchsia: "from-fuchsia-500/15 to-purple-500/5 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400",
    amber: "from-amber-500/15 to-orange-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400",
    emerald: "from-emerald-500/15 to-teal-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    indigo: "from-indigo-500/15 to-sky-500/5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
  }[accent];

  return (
    <div className={cn("rounded-3xl border-2 bg-gradient-to-br p-5 shadow-tile", accentClasses)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-5" />
          <h3 className="text-base font-extrabold">{title} <T>排行榜</T></h3>
        </div>
        <div className="inline-flex rounded-full border bg-card p-0.5 text-xs font-bold">
          <button
            onClick={() => setScope("week")}
            className={cn(
              "rounded-full px-3 py-1 transition",
              scope === "week" ? "bg-foreground text-background" : "text-muted-foreground"
            )}>
            <T>本周</T>
          
          </button>
          <button
            onClick={() => setScope("all")}
            className={cn(
              "rounded-full px-3 py-1 transition",
              scope === "all" ? "bg-foreground text-background" : "text-muted-foreground"
            )}>
            <T>历史</T>
          
          </button>
        </div>
      </div>

      {/* My stats card */}
      {my && my.total_plays > 0 &&
      <div className="mb-3 rounded-2xl border bg-card/80 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground"><T>我的战绩</T></div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-extrabold">{my.best_score}</div>
              <div className="text-[10px] text-muted-foreground"><T>最高</T></div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{my.avg_score}</div>
              <div className="text-[10px] text-muted-foreground"><T>均分</T></div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{my.total_plays}</div>
              <div className="text-[10px] text-muted-foreground"><T>局数</T></div>
            </div>
            <div>
              <div className="text-lg font-extrabold">
                {my.week_rank > 0 ? `#${my.week_rank}` : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground"><T>周排名</T></div>
            </div>
          </div>
        </div>
      }

      {/* List */}
      {loading ?
      <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
        </div> :
      rows.length === 0 ?
      <div className="py-6 text-center text-sm text-muted-foreground">
          {scope === "week" ? "本周还没有人上榜，快去抢首位！" : "暂无榜单数据"}
        </div> :

      <ol className="space-y-1.5">
          {rows.slice(0, 20).map((r) =>
        <li
          key={r.rank + r.alias}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
            r.is_me ? "bg-primary/10 ring-2 ring-primary/40" : "bg-card/60"
          )}>
          
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-extrabold tabular-nums">
                {r.rank === 1 ? <Crown className="size-4 text-amber-500" /> :
            r.rank === 2 ? <Medal className="size-4 text-slate-400" /> :
            r.rank === 3 ? <Medal className="size-4 text-amber-700" /> :
            r.rank}
              </span>
              <span className="flex-1 truncate font-bold">
                {r.alias} {r.is_me && <span className="text-xs text-primary"><T>(我)</T></span>}
              </span>
              <span className="text-xs text-muted-foreground">{r.total_plays} <T>局</T></span>
              <span className="font-extrabold tabular-nums">{r.best_score}</span>
            </li>
        )}
        </ol>
      }
    </div>);

}