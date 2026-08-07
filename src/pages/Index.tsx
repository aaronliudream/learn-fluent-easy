import { ArrowRight, LogIn, LogOut, Sparkles, Cloud, BarChart3, UserCog, Mic, Users, UserPlus } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { getStreak, loadProgress, touchActive } from "@/lib/guestProgress";
import { useI18n } from "@/i18n/I18nProvider";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import { TodayTaskCard } from "@/components/TodayTaskCard";
import ThreeTracksHero from "@/components/ThreeTracksHero";
import LandingPage from "@/components/LandingPage";
import { XPRing } from "@/components/game/XPRing";
import { useStreakStats } from "@/hooks/useStreakStats";
import OnboardingWizard from "@/components/OnboardingWizard";
import ProWaitlistButton from "@/components/ProWaitlistButton";
import BrandHubNav from "@/components/BrandHubNav";
import BrandFamilyHero from "@/components/BrandFamilyHero";
import { AMERICAN_COURSE_NAME, AMERICAN_COURSE_PATH } from "@/lib/american/brand";

const HOME_COUNTS = {
  slang: 347,
};

const Index = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const forceHub = searchParams.get("hub") === "1";
  const forceLanding = searchParams.get("landing") === "1";
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);
  // ★ 首屏请求闸(2026-08-06):本组件默认 `return <LandingPage />`(见下方 forceHub 判断),
  // streak 与 onboarding 这两份数据只有 ?hub=1 的旧学习台才用得上。国内往返 200-305ms,
  // 首页又是全站最热的入口 —— 不加这个闸,每个访客白付 2 次跨境往返换两份没人读的数据。
  const { stats } = useStreakStats(forceHub ? user?.id : undefined);
  const liveStreak = stats?.current_streak ?? streak;
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    touchActive();
    setProgress(loadProgress());
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Show 4-step onboarding for first-time logged-in users (no onboarded_at).
  useEffect(() => {
    // 同上:LandingPage 分支不渲染 OnboardingWizard,这次查询在默认首页上是纯浪费。
    if (!forceHub || !user) { setNeedsOnboarding(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const done = !!(data as { onboarded_at?: string } | null)?.onboarded_at;
      setNeedsOnboarding(!done);
    })();
    return () => { cancelled = true; };
  }, [user, forceHub]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("auth.signedOut"));
  };

  const hasProgress = progress.completedLessons.length > 0 || progress.studyMinutes > 0;

  // Homepage = LandingPage for everyone (logged-in or not).
  // Power users can still reach the old study hub via /?hub=1.
  if (!forceHub) {
    return <LandingPage />;
  }

const sections = [
    {
      to: AMERICAN_COURSE_PATH,
      icon: Sparkles,
      eyebrow: "American English",
      title: AMERICAN_COURSE_NAME,
      desc: "地道美语 · 72 课 12 单元，从零开始系统学。",
      gradient: "from-indigo-500 via-violet-500 to-purple-500",
    },
    // 成人英语/俚语入口已随板块下线移除;排行榜(/leaderboard)入口按需求隐藏(页面/路由保留)。
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      {user && needsOnboarding && (
        <OnboardingWizard userId={user.id} onClose={() => setNeedsOnboarding(false)} />
      )}
      <div className="sticky top-3 z-40 mb-4 flex items-center justify-start md:static md:justify-end">
        {/* 详细数据(/stats)入口按需求隐藏(页面/路由保留)。 */}
        <Button asChild variant="ghost" size="sm" className="mr-2 hidden md:inline-flex">
          <Link to="/account">
            <UserCog className="size-4" /> {t("nav.account")}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mr-2 hidden md:inline-flex">
          <Link to="/parent">
            <Users className="size-4" /> <T>Parents / Teachers</T>
          </Link>
        </Button>
        <LangToggleEnZh />
        {user ? (
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.display_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> {t("nav.signOut")}
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link to="/auth">
              <LogIn className="size-4" /> {t("nav.signIn")}
            </Link>
          </Button>
        )}
      </div>

      {/* Brand hero — lockup + slogan. Sets the editorial tone and gives
          first-time visitors a clear, branded landing impression. */}
      <header className="mt-2 mb-6 flex flex-col items-center text-center">
        <BrandLockup size={56} />
        <p className="mt-3 max-w-md font-serif text-base italic text-muted-foreground md:text-lg">
          Real English from real American kids, for every age in China.
        </p>
      </header>

      {/* 母品牌横向导航 */}
      <BrandHubNav />

      {/* 4 子品牌入口卡 — 母品牌主页核心模块 */}
      <BrandFamilyHero />

      {/* Optional: guest progress save nudge */}
      {!user && hasProgress && (
        <Link
          to="/auth"
          className="group mb-6 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition hover:bg-primary/10"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">
              {t("index.progress.savedLessons", { n: progress.completedLessons.length })}
              {progress.studyMinutes > 0 && ` · ${t("index.progress.minutes", { n: progress.studyMinutes })}`}
              {streak >= 2 && ` · ${t("index.progress.streak", { n: streak })}`}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{t("index.progress.cta")}</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <Cloud className="size-3.5" /> {t("index.progress.save")}
          </div>
        </Link>
      )}

      {/* Streak / XP momentum banner — surfaces the live streak so it's the
          first thing returning learners see. (Zeigarnik + SDT competence) */}
      {user && (stats?.current_streak ?? 0) > 0 && (
        <section className="mb-6 mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <XPRing value={liveStreak} target={Math.max(7, liveStreak + 1)} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <T>Current streak</T>
            </div>
            <div className="mt-0.5 text-lg font-extrabold leading-tight">
              {liveStreak > 0
                ? <T>{`You've kept going for ${liveStreak} days — keep it up!`}</T>
                : <T>Start today and light up your first day</T>}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats?.minutes_this_month != null
                ? <T>{`Studied ${stats.minutes_this_month} minutes this month · ${stats.total_quiz_correct ?? 0} correct answers`}</T>
                : <T>Five minutes a day is enough to build the habit</T>}
            </div>
          </div>
        </section>
      )}

      {/* Ask-AI knowledge card — quick entry to generate a shareable card */}
      <Link
        to="/ask"
        className="group relative mt-4 flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Sparkles className="size-6" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-base font-bold leading-tight">
            <T>提问 AI · 生成知识卡</T>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            <T>输入英语问题，10 秒生成讲解 + 例句 + 小测，可分享二维码</T>
          </div>
        </div>
        <ArrowRight className="relative size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Teacher / creator dashboard entry — only for logged-in users */}
      {user && (
        <Link
          to="/teacher/cards"
          className="group relative mt-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight">
              <T>我的卡片数据</T>
            </div>
            <div className="text-xs text-muted-foreground">
              <T>看你创建的卡片帮助了多少人 · 答得怎么样</T>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      {/* Primary: Today's Task card — single clear next action */}
      {user && <TodayTaskCard />}

      {/* Secondary: all entry points, demoted to a compact grid */}
      <div className="mb-3 mt-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
          <T>More ways to learn</T>
        </h3>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.to} className="relative">
              <Link
                to={s.to}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_hsl(250_50%_30%/0.5)]`}
              >
              <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-5" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-80">
                  {s.eyebrow}
                </div>
                <div className="mt-0.5 line-clamp-1 text-sm font-extrabold leading-tight md:text-base"><T>{s.title}</T></div>
                <div className="mt-0.5 line-clamp-1 text-[11px] opacity-85"><T>{s.desc}</T></div>
              </div>
              <ArrowRight className="relative size-4 shrink-0 opacity-80 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </section>

      {/* Trust footer for logged-in hub — links to About / Privacy / Terms / Contact */}
      <footer className="mt-12 border-t border-border pt-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link to="/about" className="hover:text-foreground"><T>关于</T></Link>
          <Link to="/privacy" className="hover:text-foreground"><T>隐私</T></Link>
          <Link to="/terms" className="hover:text-foreground"><T>条款</T></Link>
          <a href="mailto:support@bigmoonenglish.com" className="hover:text-foreground"><T>联系我们</T></a>
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Big Moon English
        </div>
      </footer>

    </main>
  );
};

export default Index;
