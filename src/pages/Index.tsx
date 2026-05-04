import { ArrowRight, LogIn, LogOut, Sparkles, Cloud, BarChart3, Award, Zap, UserCog, Mic, Users, Trophy, UserPlus } from "lucide-react";
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
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { T } from "@/i18n/T";
import { TodayTaskCard } from "@/components/TodayTaskCard";
import CompanionHero from "@/components/pet/CompanionHero";
import ThreeTracksHero from "@/components/ThreeTracksHero";
import LandingPage from "@/components/LandingPage";
import { XPRing } from "@/components/game/XPRing";
import { useStreakStats } from "@/hooks/useStreakStats";
import OnboardingWizard from "@/components/OnboardingWizard";
import ProWaitlistButton from "@/components/ProWaitlistButton";

const HOME_COUNTS = {
  slang: 347,
};

const Index = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const forceHub = searchParams.get("hub") === "1";
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);
  const { stats } = useStreakStats(user?.id);
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
    if (!user) { setNeedsOnboarding(false); return; }
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
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("auth.signedOut"));
  };

  const hasProgress = progress.completedLessons.length > 0 || progress.studyMinutes > 0;

  // Cold/global traffic: show a real Landing page (hero + value prop + social
  // proof + CTA). Logged-in users skip straight to the study hub. Returning
  // guests with saved progress also keep their hub so they don't lose context.
  if (!user && !hasProgress && !forceHub) {
    return <LandingPage />;
  }

  const sections = [
    {
      to: "/talk",
      icon: Mic,
      eyebrow: t("index.section.aitalk.eyebrow"),
      title: t("index.section.aitalk.title"),
      desc: t("index.section.aitalk.desc"),
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      proFeature: "ai-talk-unlimited",
    },
    {
      to: "/slang",
      icon: Zap,
      eyebrow: t("index.section.slang.eyebrow"),
      title: t("index.section.slang.title"),
      desc: t("index.section.slang.desc", { count: HOME_COUNTS.slang }),
      gradient: "from-teal-500 via-cyan-500 to-sky-500",
    },
    {
      to: "/leaderboard",
      icon: Trophy,
      eyebrow: "Community",
      title: "本周排行榜",
      desc: "和全球学员一起冲榜，每周清零",
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
    },
    {
      to: "/friends",
      icon: UserPlus,
      eyebrow: "Social",
      title: "加好友 · 互相鼓励",
      desc: "看看朋友的连胜，一起坚持下去",
      gradient: "from-pink-500 via-rose-500 to-red-500",
    },
  ];

  const placementSection = {
    to: "/placement",
    icon: Award,
    eyebrow: t("index.section.placement.eyebrow"),
    title: t("index.section.placement.title"),
    desc: t("index.section.placement.desc"),
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      {user && needsOnboarding && (
        <OnboardingWizard userId={user.id} onClose={() => setNeedsOnboarding(false)} />
      )}
      <div className="sticky top-3 z-40 mb-4 flex justify-start md:static md:justify-end">
        <LanguageSwitcher />
        <Button asChild variant="ghost" size="sm" className="mr-2 hidden md:inline-flex">
          <Link to="/stats">
            <BarChart3 className="size-4" /> {t("nav.myStats")}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mr-2 hidden md:inline-flex">
          <Link to="/account">
            <UserCog className="size-4" /> {t("nav.account")}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mr-2 hidden md:inline-flex">
          <Link to="/parent">
            <Users className="size-4" /> <T>家长 / 老师</T>
          </Link>
        </Button>
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
          {t("brand.slogan")}
        </p>
      </header>

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

      {/* Emotional anchor: learning companion as hero */}
      <CompanionHero />

      {/* Streak / XP momentum banner — surfaces the live streak so it's the
          first thing returning learners see. (Zeigarnik + SDT competence) */}
      {user && (stats?.current_streak ?? 0) > 0 && (
        <section className="mb-6 mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <XPRing value={liveStreak} target={Math.max(7, liveStreak + 1)} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <T>当前连胜</T>
            </div>
            <div className="mt-0.5 text-lg font-extrabold leading-tight">
              {liveStreak > 0
                ? <T>{`已经坚持 ${liveStreak} 天，继续保持！`}</T>
                : <T>今天开练，点亮你的第一天</T>}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats?.minutes_this_month != null
                ? <T>{`本月已学 ${stats.minutes_this_month} 分钟 · 答对 ${stats.total_quiz_correct ?? 0} 题`}</T>
                : <T>每天 5 分钟，足够养成习惯</T>}
            </div>
          </div>
          <Link
            to="/stats"
            className="hidden shrink-0 items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 md:inline-flex"
          >
            <T>查看进度</T> <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      {/* New-learner welcome ribbon — replaces the depressing "0 streak / 0 minutes"
          state for users who haven't done anything yet. (ARCS - Confidence) */}
      {user && (stats?.current_streak ?? 0) === 0 && (
        <section className="mb-6 mt-4 overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm dark:border-amber-500/30 dark:from-amber-950/40 dark:to-orange-950/40">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
              <Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                <T>欢迎加入</T>
              </div>
              <div className="mt-0.5 text-lg font-extrabold leading-tight">
                <T>完成第一节课，点亮你的第一颗 ⭐</T>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                <T>5 分钟即可建立第一天连胜，从此每晚都进步一点点。</T>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Unlogged visitors: free CEFR diagnosis hero — cold-start lever */}
      {!user && (
        <Link
          to="/placement"
          className="group relative mb-6 mt-2 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 px-6 py-6 text-center text-white shadow-tile transition-all hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/15 blur-3xl" />
          <div className="relative grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Award className="size-6" />
          </div>
          <h2 className="relative text-xl font-extrabold leading-tight md:text-2xl">
            <T>测一测你的英语等级</T>
          </h2>
          <div className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-indigo-700 transition group-hover:bg-white/95">
            <T>免费 · 3 分钟</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      {/* Three-track entry — primary path selection (Exam / Career / Beginner) */}
      <ThreeTracksHero />

      {/* Primary: Today's Task card — single clear next action */}
      <TodayTaskCard />

      {/* Secondary: all entry points, demoted to a compact grid */}
      <div className="mb-3 mt-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
          <T>更多学习方式</T>
        </h3>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.to} className="relative">
              {s.proFeature && (
                <div className="absolute right-2 top-2 z-10">
                  <ProWaitlistButton feature={s.proFeature} source="home-card" />
                </div>
              )}
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

      {/* Full-width placement test tile at the bottom — only for logged-in users
          (unlogged users already see it as the hero above) */}
      {user && (
      <Link
        to={placementSection.to}
        className={`group relative mt-3 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${placementSection.gradient} px-6 py-7 text-center text-white shadow-tile transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_hsl(160_50%_30%/0.5)]`}
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
        <span className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <placementSection.icon className="size-6" />
        </div>
        <div className="relative text-lg font-extrabold leading-tight tracking-wide md:text-xl">
          {placementSection.title}
        </div>
        <div className="relative max-w-md text-xs opacity-90 md:text-sm">
          {placementSection.desc}
        </div>
        <div className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition group-hover:bg-white/30">
          {t("index.section.placement.cta")} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
      )}

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
