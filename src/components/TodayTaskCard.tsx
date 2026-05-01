import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Sparkles, GraduationCap, ArrowRight, Flame, CheckCircle2, Zap, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countDueReviews } from "@/lib/srs";
import { LEVELS } from "@/data/course";
import { loadProgress, getStreak } from "@/lib/guestProgress";
import { IDIOMS } from "@/data/idioms";
import { T, useT } from "@/i18n/T";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

type Task = {
  key: "review" | "lesson" | "slang";
  icon: typeof Brain;
  label: string;
  detail: string;
  to: string;
  cta: string;
  done: boolean;
  tone: string; // tailwind classes for the icon chip
};

/**
 * Find the next un-completed lesson for the signed-in / guest learner.
 * Walks LEVELS in order and returns the first lesson whose key isn't in
 * `completedLessons`. Falls back to the very first lesson.
 */
function nextLessonInfo(completed: string[]): { to: string; title: string } {
  const done = new Set(completed);
  for (const lv of LEVELS) {
    if (lv.locked) continue;
    for (const u of lv.units) {
      for (const l of u.lessons) {
        const key = `${lv.id}-${u.id}-${l.id}`;
        if (!done.has(key)) {
          return {
            to: `/level/${lv.id}/unit/${u.id}/lesson/${l.id}`,
            title: l.title,
          };
        }
      }
    }
  }
  return { to: "/levels", title: "继续你的学习路径" }; // translated via t() at render time
}

export const TodayTaskCard = () => {
  const [dueReviews, setDueReviews] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("todayTaskCollapsed");
    // Default to collapsed unless user explicitly expanded ("0").
    return v !== "0";
  });
  const t = useT();
  const progress = useMemo(() => loadProgress(), []);
  const streak = getStreak(progress);
  const todayKey = new Date().toISOString().slice(0, 10);
  const studiedToday = progress.daysActive.includes(todayKey);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setSignedIn(!!session?.user);
      if (session?.user) {
        countDueReviews().then((c) => !cancelled && setDueReviews(c));
      } else {
        setDueReviews(0);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const next = nextLessonInfo(progress.completedLessons);

  // Pick today's slang deterministically from the static catalog so the
  // suggestion is stable across reloads on the same day.
  const todaySlang = useMemo(() => {
    if (!IDIOMS.length) return null;
    const seed = Number(todayKey.replace(/-/g, "")) || 0;
    return IDIOMS[seed % IDIOMS.length];
  }, [todayKey]);

  const tasks: Task[] = [
    {
      key: "review",
      icon: Brain,
      label: signedIn
        ? t("复习 {n} 个表达").replace("{n}", String(dueReviews ?? "…"))
        : t("登录解锁智能复习"),
      detail: signedIn
        ? (dueReviews && dueReviews > 0
            ? t("AI 已为你挑选今日到期的关键词")
            : t("今天暂无到期复习,再学一课就会有 ✨"))
        : t("登录后,做过的题会按记忆曲线自动安排复习"),
      to: signedIn ? "/review" : "/auth",
      cta: signedIn && dueReviews && dueReviews > 0 ? t("去复习") : t("查看"),
      done: signedIn && dueReviews === 0,
      tone: "from-violet-500 to-fuchsia-500",
    },
    {
      key: "lesson",
      icon: GraduationCap,
      label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
      detail: t(next.title),
      to: next.to,
      cta: t("继续"),
      done: false,
      tone: "from-blue-500 to-indigo-500",
    },
    {
      key: "slang",
      icon: Zap,
      label: t("今日一句俚语"),
      detail: todaySlang
        ? `“${todaySlang.phrase}” · ${t(todaySlang.meaning_cn)}`
        : t("看看今天的流行表达"),
      to: "/slang",
      cta: t("去看"),
      done: false,
      tone: "from-amber-500 to-rose-500",
    },
  ];

  const totalActionable = tasks.filter((t) => !t.done).length;

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("todayTaskCollapsed", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  return (
    <section
      aria-label={t("今日任务")}
      className="relative mb-6 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-tile md:p-6"
    >
      {/* Decorative glow */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="today-task-list"
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" /> <T>今日任务</T>
          </div>
          <h2 className="mt-1 text-xl font-extrabold leading-tight md:text-2xl">
            {studiedToday ? <T>今天已经开练了 👏</T> : <T>今天先做这 3 件小事</T>}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {collapsed
              ? <T>点击展开今日任务</T>
              : (totalActionable > 0
                ? <T>保持节奏,只需 5–10 分钟</T>
                : <T>全部完成 · 任意点开探索更多</T>)}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <Flame className="size-3.5" /> <span className="num">{streak}</span> <T>天</T>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t("展开") : t("收起")}
            aria-expanded={!collapsed}
            aria-controls="today-task-list"
            className="group/toggle inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/30 transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <span>{collapsed ? <T>展开</T> : <T>收起</T>}</span>
            <ChevronDown className={`size-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      <Collapsible open={!collapsed}>
        <CollapsibleContent
          id="today-task-list"
          className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
        <ul className="relative mt-4 space-y-2">
        {tasks.map((t, i) => {
          const Icon = t.icon;
          return (
            <li
              key={t.key}
              className="animate-fade-in opacity-0"
              style={{
                animationDelay: `${i * 70}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Link
                to={t.to}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 transition hover:border-primary/40 hover:bg-secondary/60"
              >
                <div className={`relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.tone} text-white shadow-md`}>
                  <Icon className="size-5" />
                  {t.done && (
                    <CheckCircle2 className="absolute -right-1 -top-1 size-4 rounded-full bg-background text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-tight">{t.label}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{t.detail}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  {t.cta} <ArrowRight className="size-3" />
                </div>
              </Link>
            </li>
          );
        })}
        </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
