import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import BackLink from "@/components/BackLink";
import { BADGES } from "@/data/badges";
import { fetchEarnedBadges, type EarnedBadge } from "@/lib/badges";

export default function PrimaryBadges() {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "我的徽章 | FluentPath";
    (async () => {
      const rows = await fetchEarnedBadges();
      setEarned(rows);
      setLoading(false);
    })();
  }, []);

  const earnedMap = new Map(earned.map((e) => [e.badge_id, e.earned_at]));
  const totalEarned = earned.length;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink
        to="/lesson?grade=2"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回 G2 课程
      </BackLink>

      <div className="mb-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-tile dark:border-amber-700 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
        <h1 className="text-xl font-extrabold">🏅 我的徽章</h1>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
          {loading ? "加载中…" : `已收集 ${totalEarned} / ${BADGES.length} 个徽章`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((b) => {
          const got = earnedMap.has(b.id);
          const date = earnedMap.get(b.id);
          return (
            <div
              key={b.id}
              className={`flex flex-col items-center rounded-2xl border-2 p-4 text-center shadow-tile transition ${
                got
                  ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-600 dark:from-amber-950/40 dark:to-orange-950/40"
                  : "border-dashed border-muted bg-muted/30 opacity-70"
              }`}
            >
              <div className={`text-5xl ${got ? "" : "grayscale"}`}>
                {got ? b.emoji : "🔒"}
              </div>
              <div className="mt-2 text-sm font-extrabold">{b.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{b.desc}</div>
              {got && date && (
                <div className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {new Date(date).toLocaleDateString("zh-CN")}
                </div>
              )}
              {!got && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="size-3" /> 未解锁
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/lesson?grade=2"
          className="inline-block rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-6 py-3 text-base font-extrabold text-white shadow-tile"
        >
          继续探险 →
        </Link>
      </div>
    </main>
  );
}