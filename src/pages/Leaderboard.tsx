import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, ChevronLeft, Sparkles, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/T";

type Row = {
  rank: number;
  alias: string;
  weekly_xp: number;
  active_days: number;
  is_me: boolean;
};
type MyRank = {
  weekly_xp: number;
  active_days: number;
  rank: number;
  total_players: number;
};

const medal = (n: number) =>
  n === 1 ? "text-gold" : n === 2 ? "text-silver" : n === 3 ? "text-bronze" : "text-muted-foreground";

const Leaderboard = () => {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [me, setMe] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, s) => setUser(s?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: lb }, { data: mine }] = await Promise.all([
        supabase.rpc("get_weekly_leaderboard"),
        supabase.rpc("get_my_weekly_rank"),
      ]);
      if (cancelled) return;
      setRows((lb as Row[]) ?? []);
      const m = mine ? (Array.isArray(mine) ? mine[0] : mine) : null;
      setMe((m ?? null) as MyRank | null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/"><ChevronLeft className="size-4" /> {t("返回")}</Link>
      </Button>

      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-accent-foreground shadow-tile">
          <Trophy className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            {t("本周全球榜")}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Globe2 className="size-3.5" /> {t("匿名 · 周一刷新 · XP = 答对题数")}
          </p>
        </div>
      </header>

      {/* Personal stat card */}
      {user && (
        <div className="card-paper mb-5 rounded-2xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {t("我的本周战绩")}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <Stat label={t("XP")} value={me?.weekly_xp ?? 0} />
            <Stat label={t("活跃天数")} value={me?.active_days ?? 0} />
            <Stat
              label={t("排名")}
              value={me?.rank ? `#${me.rank}` : "—"}
              hint={me?.total_players ? `/ ${me.total_players}` : undefined}
            />
          </div>
        </div>
      )}

      {!user && (
        <Link
          to="/auth"
          className="card-paper mb-5 flex items-center gap-3 rounded-2xl p-4 transition hover:shadow-md"
        >
          <Sparkles className="size-5 text-accent" />
          <div className="flex-1 text-sm">
            <div className="font-bold">{t("登录后参与排行")}</div>
            <div className="text-xs text-muted-foreground">{t("匿名展示，可随时关闭")}</div>
          </div>
          <span className="text-sm font-semibold text-primary">{t("登录")} →</span>
        </Link>
      )}

      {/* Top 50 list */}
      <div className="card-paper rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("加载中…")}</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("本周还没有人上榜，做一道题成为第一名！")}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li
                key={r.rank}
                className={`flex items-center gap-3 px-4 py-3 ${
                  r.is_me ? "bg-accent/10" : ""
                }`}
              >
                <div className={`grid size-8 shrink-0 place-items-center rounded-full ${r.rank <= 3 ? "bg-gradient-to-br from-accent/20 to-accent/5" : ""}`}>
                  {r.rank <= 3 ? (
                    <Crown className={`size-5 ${medal(r.rank)}`} />
                  ) : (
                    <span className="num text-xs font-bold text-muted-foreground">{r.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {r.alias} {r.is_me && <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground" style={{color:"hsl(var(--accent))"}}>{t("你")}</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t("活跃")} {r.active_days} {t("天")}
                  </div>
                </div>
                <div className="num text-right">
                  <div className="text-base font-extrabold text-foreground">{r.weekly_xp}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">XP</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        {t("可在「我的 → 账号」中修改昵称或退出排行")}
      </p>
    </main>
  );
};

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2">
      <div className="num text-xl font-extrabold leading-none text-foreground">
        {value}
        {hint && <span className="text-xs font-semibold text-muted-foreground ml-0.5">{hint}</span>}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

export default Leaderboard;