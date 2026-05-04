import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, Sparkles, GraduationCap, ArrowRight, Flame, CheckCircle2, Zap,
  ChevronDown, Target, BookOpen, MessageCircle, Headphones, Briefcase, Library,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadProgress, getStreak } from "@/lib/guestProgress";
import { T, useT } from "@/i18n/T";

const FIRST_LESSON = {
  to: "/level/1/unit/1/lesson/1",
  title: "Hello, I'm Mei. · 第一课：你好，我叫梅（梅刚到加州）",
};

const TODAY_SLANG = [
  { phrase: "read the room", meaning_cn: "察言观色；读懂气氛" },
  { phrase: "spill the tea", meaning_cn: "爆料八卦；分享内幕消息" },
  { phrase: "no cap", meaning_cn: "不骗你；说真的" },
  { phrase: "vibe check", meaning_cn: "看看气氛怎么样" },
  { phrase: "send it", meaning_cn: "冲了；放手去做" },
  { phrase: "that tracks", meaning_cn: "说得通；和我了解的一致" },
  { phrase: "touch grass", meaning_cn: "出去走走；别上网了" },
];

type Task = {
  key: string;
  icon: typeof Brain;
  label: string;
  detail: string;
  to: string;
  cta: string;
  done: boolean;
  tone: string; // tailwind classes for the icon chip
};

type Reco = {
  due_expressions: number; due_vocab: number; due_grammar: number;
  due_slang: number; due_mistakes: number; total_due: number;
  weakest_module: string | null; weakest_count: number;
  top_area: string | null; top_area_count: number;
  active_today: boolean; current_streak: number;
};

function nextLessonInfo(completed: string[]): { to: string; title: string } {
  if (completed.length > 0) return { to: "/levels", title: "继续你的学习路径" };
  return FIRST_LESSON;
}

/** Map weakest mistake module → CTA target */
function weaknessTask(t: ReturnType<typeof useT>, mod: string, count: number): Task | null {
  const map: Record<string, { to: string; label: string; icon: typeof Brain; tone: string }> = {
    grammar: { to: "/gaokao/mistakes?module=grammar", label: t("攻克语法薄弱点"), icon: Target, tone: "from-rose-500 to-orange-500" },
    cloze:   { to: "/gaokao/mistakes?module=cloze",   label: t("回顾完形填空错题"), icon: Target, tone: "from-rose-500 to-orange-500" },
    reading: { to: "/gaokao/mistakes?module=reading", label: t("回顾阅读错题"),     icon: Target, tone: "from-rose-500 to-orange-500" },
    vocab:   { to: "/gaokao/mistakes?module=vocab",   label: t("回顾词汇错题"),     icon: Target, tone: "from-rose-500 to-orange-500" },
  };
  const m = map[mod];
  if (!m) return null;
  return {
    key: `weak-${mod}`, icon: m.icon, tone: m.tone,
    label: m.label,
    detail: t("最近 14 天还有 {n} 道未解决,趁热打铁").replace("{n}", String(count)),
    to: m.to, cta: t("攻克"), done: false,
  };
}

/** Map "most-used area" → next-step CTA in that same area */
function preferenceTask(t: ReturnType<typeof useT>, area: string): Task | null {
  const map: Record<string, { to: string; label: string; detail: string; icon: typeof Brain; tone: string }> = {
    ai_talk:        { to: "/talk",            label: t("再来一段 AI 对话"),     detail: t("延续你最近的口语节奏"),           icon: MessageCircle, tone: "from-emerald-500 to-teal-500" },
    slang:          { to: "/slang",           label: t("继续学俚语"),           detail: t("你最近常逛俚语,今天再加 3 句"),    icon: Zap,           tone: "from-amber-500 to-rose-500" },
    scenes:         { to: "/scenes",          label: t("继续场景对话"),         detail: t("挑一个场景,5 分钟练完"),           icon: Headphones,    tone: "from-sky-500 to-indigo-500" },
    workplace:      { to: "/workplace",       label: t("继续职场英语"),         detail: t("挑一个职场场景练手"),               icon: Briefcase,     tone: "from-indigo-500 to-violet-500" },
    gaokao_vocab:   { to: "/gaokao/vocab",    label: t("继续高考词汇"),         detail: t("背完今天的单词"),                   icon: BookOpen,      tone: "from-blue-500 to-cyan-500" },
    gaokao_grammar: { to: "/gaokao/grammar",  label: t("继续高考语法"),         detail: t("再练一组语法题"),                   icon: Library,       tone: "from-violet-500 to-fuchsia-500" },
    gaokao_reading: { to: "/gaokao/reading",  label: t("继续高考阅读"),         detail: t("挑一篇文章读一读"),                 icon: BookOpen,      tone: "from-cyan-500 to-blue-500" },
    gaokao_cloze:   { to: "/gaokao/cloze",    label: t("继续完形填空"),         detail: t("练一篇完形,15 分钟搞定"),           icon: Library,       tone: "from-fuchsia-500 to-pink-500" },
    review:         { to: "/review",          label: t("继续刷题复习"),         detail: t("保持你最近的复习节奏"),             icon: Brain,         tone: "from-violet-500 to-fuchsia-500" },
    lesson:         { to: "/levels",          label: t("继续课程学习"),         detail: t("接着上次的学习路径"),               icon: GraduationCap, tone: "from-blue-500 to-indigo-500" },
  };
  const m = map[area];
  if (!m) return null;
  return { key: `pref-${area}`, icon: m.icon, tone: m.tone, label: m.label, detail: m.detail, to: m.to, cta: t("继续"), done: false };
}

export const TodayTaskCard = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [reco, setReco] = useState<Reco | null>(null);
  // Default EXPANDED on page load — uncompleted tasks must be visible
  // (Zeigarnik effect). Users can collapse manually for a cleaner home
  // page; we don't persist the state across reloads.
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const t = useT();
  const progress = useMemo(() => loadProgress(), []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const guestStudiedToday = progress.daysActive.includes(todayKey);
  const studiedToday = reco?.active_today ?? guestStudiedToday;
  const streak = reco?.current_streak ?? getStreak(progress);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setSignedIn(!!session?.user);
    });
    return () => { cancelled = true; };
  }, []);

  const next = nextLessonInfo(progress.completedLessons);

  // Pick today's slang deterministically from the static catalog so the
  // suggestion is stable across reloads on the same day.
  const todaySlang = useMemo(() => {
    const seed = Number(todayKey.replace(/-/g, "")) || 0;
    return TODAY_SLANG[seed % TODAY_SLANG.length];
  }, [todayKey]);

  // ----- Build personalized task list -----
  const tasks: Task[] = useMemo(() => {
    // Guest fallback (no science possible without an account)
    if (!signedIn) {
      return [
        {
          key: "guest-review", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
          label: t("登录解锁智能复习"),
          detail: t("登录后,做过的题会按记忆曲线自动安排复习"),
          to: "/auth", cta: t("登录"), done: false,
        },
        {
          key: "guest-lesson", icon: GraduationCap, tone: "from-blue-500 to-indigo-500",
          label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
          detail: t(next.title), to: next.to, cta: t("继续"), done: false,
        },
        {
          key: "guest-slang", icon: Zap, tone: "from-amber-500 to-rose-500",
          label: t("今日一句俚语"),
          detail: todaySlang ? `“${todaySlang.phrase}” · ${t(todaySlang.meaning_cn)}` : t("看看今天的流行表达"),
          to: "/slang", cta: t("去看"), done: false,
        },
      ];
    }

    // Keep homepage instant on distant networks: use local, stable suggestions
    // instead of waiting for a remote recommendation call.
    if (!reco) {
      return [
        {
          key: "local-review", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
          label: t("先复习 5 分钟"), detail: t("巩固最近学过的单词和句子"),
          to: "/review", cta: t("去复习"), done: false,
        },
        {
          key: "local-lesson", icon: GraduationCap, tone: "from-blue-500 to-indigo-500",
          label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
          detail: t(next.title), to: next.to, cta: t("继续"), done: false,
        },
        {
          key: "local-slang", icon: Zap, tone: "from-amber-500 to-rose-500",
          label: t("今日一句俚语"),
          detail: todaySlang ? `“${todaySlang.phrase}” · ${t(todaySlang.meaning_cn)}` : t("看看今天的流行表达"),
          to: "/slang", cta: t("去看"), done: false,
        },
      ];
    }

    const out: Task[] = [];

    // 1) Due reviews (highest priority — memory curve)
    if (reco.total_due > 0) {
      const parts: string[] = [];
      if (reco.due_expressions) parts.push(t("{n} 个表达").replace("{n}", String(reco.due_expressions)));
      if (reco.due_vocab)       parts.push(t("{n} 个单词").replace("{n}", String(reco.due_vocab)));
      if (reco.due_grammar)     parts.push(t("{n} 个语法").replace("{n}", String(reco.due_grammar)));
      if (reco.due_slang)       parts.push(t("{n} 句俚语").replace("{n}", String(reco.due_slang)));
      if (reco.due_mistakes)    parts.push(t("{n} 道错题").replace("{n}", String(reco.due_mistakes)));
      out.push({
        key: "due", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
        label: t("到期复习 {n} 项").replace("{n}", String(reco.total_due)),
        detail: parts.slice(0, 3).join(" · ") || t("AI 已为你挑选今日到期的关键内容"),
        to: "/review", cta: t("去复习"), done: false,
      });
    } else {
      out.push({
        key: "due-empty", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
        label: t("今天暂无到期复习"), detail: t("再学一课就会有 ✨"),
        to: "/review", cta: t("查看"), done: true,
      });
    }

    // 2) Weakness — only if real and not duplicated by due-mistakes priority
    if (reco.weakest_module && reco.weakest_count >= 2) {
      const w = weaknessTask(t, reco.weakest_module, reco.weakest_count);
      if (w) out.push(w);
    }

    // 3) Preference — keep the user in their groove (skip if same area as item 2)
    if (reco.top_area && reco.top_area_count > 0) {
      const p = preferenceTask(t, reco.top_area);
      if (p && !out.some(x => x.to === p.to)) out.push(p);
    }

    // 4) Pad to 3: continue lesson if not already there
    if (out.length < 3 && !out.some(x => x.to.startsWith("/level"))) {
      out.push({
        key: "lesson", icon: GraduationCap, tone: "from-blue-500 to-indigo-500",
        label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
        detail: t(next.title), to: next.to, cta: t("继续"), done: false,
      });
    }

    // 5) Last resort: today's slang
    if (out.length < 3) {
      out.push({
        key: "slang", icon: Zap, tone: "from-amber-500 to-rose-500",
        label: t("今日一句俚语"),
        detail: todaySlang ? `“${todaySlang.phrase}” · ${t(todaySlang.meaning_cn)}` : t("看看今天的流行表达"),
        to: "/slang", cta: t("去看"), done: false,
      });
    }

    return out.slice(0, 3);
  }, [signedIn, reco, progress.completedLessons, next.title, next.to, todaySlang, t]);

  const totalActionable = tasks.filter((t) => !t.done).length;

  const toggle = () => {
    setCollapsed((prev) => !prev);
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

      {/* Pure CSS grid expand/collapse — avoids Radix mount-timing issues that
          previously left this region empty after expanding. */}
      <div
        id="today-task-list"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          collapsed ? "grid-rows-[0fr] opacity-0" : "mt-4 grid-rows-[1fr] opacity-100"
        }`}
        aria-hidden={collapsed}
      >
        <div className="min-h-0 overflow-hidden">
        <ul className="relative space-y-2">
        {tasks.map((t, i) => {
          const Icon = t.icon;
          return (
            <li
              key={t.key}
              className="animate-in fade-in slide-in-from-top-1 duration-300"
              style={{
                animationDelay: `${i * 70}ms`,
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
        </div>
      </div>
    </section>
  );
};
