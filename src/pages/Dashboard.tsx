import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useMasteryOverview, pickContinue, type Stage } from "@/hooks/useMasteryOverview";
import { MasteryRing } from "@/components/mastery/MasteryRing";
import { MasteryBadge, MASTERY_LEGEND } from "@/components/mastery/MasteryBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShareButton } from "@/components/share/ShareButton";

function TodayReviewCard() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setCount(0); return; }
      const nowIso = new Date().toISOString();
      const { count: n } = await supabase
        .from("user_mistakes")
        .select("id", { head: true, count: "exact" })
        .eq("is_resolved", false)
        .lte("next_review_at", nowIso);
      if (!cancelled) setCount(n ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  if (count === null) return null;
  if (count === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <div className="text-2xl">🎉</div>
        <div className="text-sm font-semibold">今天没有要复习的错题，干得好！</div>
      </div>
    );
  }
  const mins = Math.max(1, Math.round(count * 0.5));
  return (
    <Link
      to="/review/today"
      className="group mt-4 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-tile transition-all hover:-translate-y-0.5"
    >
      <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Clock className="size-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85">⏰ 今日复习</div>
        <div className="mt-1 text-lg font-extrabold leading-tight">今日待复习 {count} 道 · 预计 {mins} 分钟</div>
        <div className="mt-0.5 text-xs opacity-90">按记忆曲线推送，刷掉就不再忘</div>
      </div>
      <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-rose-600 shadow group-hover:scale-105 transition">开始 →</div>
    </Link>
  );
}

function StageView({ stage }: { stage: Stage }) {
  const ov = useMasteryOverview(stage);
  const pick = pickContinue(stage, ov);

  if (!ov.signedIn) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Sparkles className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">登录后即可查看你的掌握度</p>
        <Link to="/auth" className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          立即登录 <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top overview */}
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-5 md:flex-row md:gap-6">
        <MasteryRing percent={ov.percent} size={140} thickness={14} label={stage === "junior" ? "初中总掌握" : "高中总掌握"} />
        <div className="flex-1 grid w-full grid-cols-2 gap-3 md:grid-cols-4">
          <Stat n={ov.mastered} label="🌳 已掌握" tone="text-emerald-600 dark:text-emerald-400" />
          <Stat n={ov.learned}  label="🌿 学过未掌握" tone="text-blue-600 dark:text-blue-400" />
          <Stat n={ov.untouched} label="🌱 未学" tone="text-muted-foreground" />
          <Stat n={ov.due}      label="⏰ 待复习" tone="text-orange-600 dark:text-orange-400" />
        </div>
        <ShareButton
          variant="pill"
          label="📤 分享我的进度"
          item={{
            type: "score",
            module: stage === "junior" ? "初中英语" : "高考英语",
            score: ov.percent,
            url: typeof window !== "undefined" ? window.location.origin : "https://bigmoonenglish.com",
          }}
        />
      </section>

      {/* Continue card */}
      {!ov.loading && (
        <Link
          to={pick.to}
          className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-tile transition-all hover:-translate-y-0.5 ${
            pick.kind === "due" ? "from-orange-500 to-rose-500" : pick.kind === "resume" ? "from-indigo-500 to-violet-500" : "from-emerald-500 to-teal-500"
          }`}
        >
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-2xl">▶</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85">
              📍 从这里继续
            </div>
            <div className="mt-1 text-lg font-extrabold leading-tight">{pick.title}</div>
            <div className="mt-0.5 text-xs opacity-90">{pick.subtitle}</div>
          </div>
          <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      {/* Grammar mastery panorama entry */}
      <Link
        to="/dashboard/grammar"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white">📊</div>
        <div className="flex-1">
          <div className="text-base font-extrabold">语法掌握全景图</div>
          <div className="text-xs text-muted-foreground">按考点查看每一项虚拟语气、时态、从句的强弱</div>
        </div>
        <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Module grid */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">各模块进度</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ov.modules.map((m) => (
            <Link
              key={m.key}
              to={m.to}
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-base font-bold">{m.label}</span>
                </div>
                <span className="text-xl font-extrabold tabular-nums text-primary">{m.percent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all" style={{ width: `${m.percent}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>🌳 {m.mastered}</span>
                <span>🌿 {m.learned}</span>
                <span>🌱 {Math.max(0, m.total - m.mastered - m.learned)}</span>
                {m.due > 0 && <span className="font-bold text-orange-600 dark:text-orange-400">⏰ {m.due}</span>}
                <span className="ml-auto">/ {m.total}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Legend */}
      <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">图例</h4>
        <div className="flex flex-wrap gap-2">
          {MASTERY_LEGEND.map((l) => (
            <div key={l.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MasteryBadge status={l.status} />
              <span>{l.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <div className={`text-xl font-extrabold tabular-nums ${tone}`}>{n.toLocaleString()}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stage, setStage] = useState<Stage>("gaokao");
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="📊 学习中心" subtitle="一目了然知道掌握了什么、下一步学什么" back="/" />
      <TodayReviewCard />
      <Tabs value={stage} onValueChange={(v) => setStage(v as Stage)} className="mt-4">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="junior">初中</TabsTrigger>
          <TabsTrigger value="gaokao">高中</TabsTrigger>
        </TabsList>
        <TabsContent value="junior" className="mt-5"><StageView stage="junior" /></TabsContent>
        <TabsContent value="gaokao" className="mt-5"><StageView stage="gaokao" /></TabsContent>
      </Tabs>
    </main>
  );
}