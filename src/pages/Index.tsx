import { ArrowRight, GraduationCap, LogIn, LogOut, Sparkles, Cloud, BarChart3, Award, Zap, UserCog, Lock, Clapperboard, Briefcase, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { getStreak, loadProgress, touchActive } from "@/lib/guestProgress";
import { IDIOMS } from "@/data/idioms";
import { SCENE_DIALOGUES } from "@/data/scenes";
import { WORK_CATEGORIES } from "@/data/workplace";
import { useI18n } from "@/i18n/I18nProvider";
import { T } from "@/i18n/T";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { SupportButton } from "@/components/SupportButton";
import { TargetLanguagePicker } from "@/components/TargetLanguagePicker";
import { TARGET_LANGUAGES, useTargetLanguage } from "@/hooks/useTargetLanguage";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

/**
 * Small flag-like badge that renders the 2-letter language code in a pill.
 * Avoids relying on emoji flags which don't render on many systems
 * (notably Windows shows "us" / "cn" letters instead of a flag).
 */
const LANG_BADGE_STYLES: Record<string, string> = {
  en: "bg-gradient-to-br from-blue-600 to-red-600 text-white",
  zh: "bg-gradient-to-br from-red-600 to-yellow-400 text-white",
};
const LangBadge = ({ code }: { code: string }) => (
  <span
    className={`inline-grid h-7 w-9 place-items-center rounded-md text-[11px] font-black uppercase tracking-tight shadow-sm ring-1 ring-black/10 ${
      LANG_BADGE_STYLES[code] ?? "bg-secondary text-foreground"
    }`}
  >
    {code === "en" ? "EN" : code === "zh" ? "中" : code.toUpperCase()}
  </span>
);

const Index = () => {
  const { t } = useI18n();
  const { language: targetLang, setLanguage: setTargetLang } = useTargetLanguage();
  const currentTarget = TARGET_LANGUAGES.find((l) => l.value === targetLang) ?? TARGET_LANGUAGES[0];
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);
  const [slangCount, setSlangCount] = useState<number>(IDIOMS.length);
  const [lastPlacement, setLastPlacement] = useState<{ cefr: string; recommended_level: number; created_at: string } | null>(null);

  useEffect(() => {
    touchActive();
    setProgress(loadProgress());
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLastPlacement(null); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("placement_results")
        .select("cefr,recommended_level,created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setLastPlacement(data as any);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("daily_slang")
        .select("phrase");
      if (cancelled || error || !data) return;
      const staticPhrases = new Set(IDIOMS.map((i) => i.phrase.toLowerCase()));
      const extra = new Set<string>();
      for (const row of data) {
        const p = (row.phrase || "").toLowerCase();
        if (p && !staticPhrases.has(p)) extra.add(p);
      }
      setSlangCount(IDIOMS.length + extra.size);
    })();
    return () => { cancelled = true; };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("auth.signedOut"));
  };

  const hasProgress = progress.completedLessons.length > 0 || progress.studyMinutes > 0;

  const sections = [
    {
      to: "/talk",
      icon: Mic,
      eyebrow: t("index.section.aitalk.eyebrow"),
      title: t("index.section.aitalk.title"),
      desc: t("index.section.aitalk.desc"),
      gradient: "from-amber-500 via-orange-500 to-rose-500",
    },
    {
      to: `/levels`,
      icon: GraduationCap,
      eyebrow: t("index.section.path.eyebrow"),
      title: t("index.section.path.title"),
      desc: t("index.section.path.desc", { count: LEVELS.length }),
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
    },
    {
      to: "/placement",
      icon: Award,
      eyebrow: t("index.section.placement.eyebrow"),
      title: t("index.section.placement.title"),
      desc: lastPlacement
        ? `${t("index.section.placement.lastResult", { cefr: lastPlacement.cefr, level: lastPlacement.recommended_level })}`
        : t("index.section.placement.desc"),
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    {
      to: "/slang",
      icon: Zap,
      eyebrow: t("index.section.slang.eyebrow"),
      title: t("index.section.slang.title"),
      desc: t("index.section.slang.desc", { count: slangCount }),
      gradient: "from-fuchsia-500 via-rose-500 to-orange-500",
    },
    {
      to: "/scenes",
      icon: Clapperboard,
      eyebrow: t("index.section.scenes.eyebrow"),
      title: t("index.section.scenes.title"),
      desc: t("index.section.scenes.desc", { count: SCENE_DIALOGUES.length }),
      gradient: "from-indigo-500 via-violet-500 to-sky-500",
    },
    {
      to: "/workplace",
      icon: Briefcase,
      eyebrow: t("index.section.workplace.eyebrow"),
      title: t("index.section.workplace.title"),
      desc: t("index.section.workplace.desc", { count: WORK_CATEGORIES.length }),
      gradient: "from-slate-800 via-slate-700 to-amber-600",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <TargetLanguagePicker />
        <LanguageSwitcher />
        <Button asChild variant="ghost" size="sm" className="mr-2">
          <Link to="/stats">
            <BarChart3 className="size-4" /> {t("nav.myStats")}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mr-2">
          <Link to="/account">
            <UserCog className="size-4" /> {t("nav.account")}
          </Link>
        </Button>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.display_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> {t("nav.signOut")}
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">
              <LogIn className="size-4" /> {t("nav.signIn")}
            </Link>
          </Button>
        )}
      </div>

      <PageHeader title={t("index.title")} subtitle={t("index.subtitle")} />

      {/* "I want to learn" picker — premium card on the homepage */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-tile md:p-6">
        <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm md:size-14">
            <GraduationCap className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
              <T>I want to learn</T>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xl font-extrabold leading-tight md:text-2xl">
              <LangBadge code={currentTarget.value} />
              <span>{currentTarget.native}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-md transition hover:scale-[1.03] hover:shadow-lg">
              <T>Change</T> <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {TARGET_LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => { if (l.value !== targetLang) void setTargetLang(l.value); }}
                  className={`gap-3 py-2.5 ${l.value === targetLang ? "font-semibold" : ""}`}
                >
                  <LangBadge code={l.value} />
                  <span className="flex-1">{l.native}</span>
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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

      <div className="mb-3 mt-2" />

      <section className="grid gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className={`group relative flex items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-tile transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_hsl(250_50%_30%/0.5)]`}
            >
              <span className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-white/15 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-16 right-24 size-28 rounded-full bg-white/10 blur-xl" />
              <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                  {s.eyebrow}
                </div>
                <div className="mt-0.5 text-lg font-extrabold leading-tight md:text-xl">{s.title}</div>
                <div className="mt-1 line-clamp-2 text-xs opacity-90 md:text-sm">{s.desc}</div>
              </div>
              <div className="relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-transform group-hover:translate-x-1 sm:inline-flex">
                {t("index.section.cta")} <ArrowRight className="size-3.5" />
              </div>
              <ArrowRight className="relative size-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-1 sm:hidden" />
            </Link>
          );
        })}
      </section>

      {/* Locked-level hint (for transparency about coming-soon levels) */}
      {LEVELS.some((lv) => lv.locked) && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3" /> {t("index.levels.locked")}
        </p>
      )}

      <SupportButton variant="footer" />
    </main>
  );
};

export default Index;
