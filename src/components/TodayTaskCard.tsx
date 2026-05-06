import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, Sparkles, GraduationCap, ArrowRight, Flame, CheckCircle2, Zap,
  ChevronDown, Target, BookOpen, MessageCircle, Headphones, Briefcase, Library,
  Trophy, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadProgress, getStreak } from "@/lib/guestProgress";
import { T, useT } from "@/i18n/T";
import { toast } from "sonner";

const FIRST_LESSON = {
  to: "/level/1/unit/1/lesson/1",
  title: "Hello, I'm Mei. · 第一课:你好,我叫梅",
};

const TODAY_SLANG = [
  { phrase: "read the room", meaning_cn: "察言观色;读懂气氛" },
  { phrase: "spill the tea", meaning_cn: "爆料八卦;分享内幕消息" },
  { phrase: "no cap", meaning_cn: "不骗你;说真的" },
  { phrase: "vibe check", meaning_cn: "看看气氛怎么样" },
  { phrase: "send it", meaning_cn: "冲了;放手去做" },
  { phrase: "that tracks", meaning_cn: "说得通;和我了解的一致" },
  { phrase: "touch grass", meaning_cn: "出去走走;别上网了" },
];

type Task = {
  key: string;
  icon: typeof Brain;
  label: string;
  detail: string;
  to: string;
  cta: string;
  done: boolean;
  tone: string;
  xp: number;
  coins: number;
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

export const TodayTaskCard = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [reco, setReco] = useState<Reco | null>(null);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [celebrated, setCelebrated] = useState<boolean>(false);
  const t = useT();
  const progress = useMemo(() => loadProgress(), []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const guestStudiedToday = progress.daysActive.includes(todayKey);
  const studiedToday = reco?.active_today ?? guestStudiedToday;
  const streak = reco?.current_streak ?? getStreak(progress);

  // Auth + initial data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      const isIn = !!session?.user;
      setSignedIn(isIn);
      if (!isIn) return;

      const [recoRes, doneRes] = await Promise.all([
        supabase.rpc("get_today_recommendations"),
        supabase.rpc("get_today_task_state"),
      ]);
      if (cancelled) return;
      if (recoRes.data && Array.isArray(recoRes.data) && recoRes.data[0]) {
        setReco(recoRes.data[0] as Reco);
      }
      if (doneRes.data && Array.isArray(doneRes.data)) {
        setDoneKeys(new Set((doneRes.data as Array<{ task_key: string }>).map((r) => r.task_key)));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const next = nextLessonInfo(progress.completedLessons);

  const todaySlang = useMemo(() => {
    const seed = Number(todayKey.replace(/-/g, "")) || 0;
    return TODAY_SLANG[seed % TODAY_SLANG.length];
  }, [todayKey]);

  // Build personalized tasks (3 actionable items, science-driven)
  const rawTasks: Task[] = useMemo(() => {
    if (!signedIn) {
      return [
        {
          key: "guest-review", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
          label: t("登录解锁智能复习"),
          detail: t("登录后,做过的题会按记忆曲线自动安排复习"),
          to: "/auth", cta: t("登录"), done: false, xp: 0, coins: 0,
        },
        {
          key: "guest-lesson", icon: GraduationCap, tone: "from-blue-500 to-indigo-500",
          label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
          detail: t(next.title), to: next.to, cta: t("继续"), done: false, xp: 0, coins: 0,
        },
        {
          key: "guest-slang", icon: Zap, tone: "from-amber-500 to-rose-500",
          label: t("今日一句俚语"),
          detail: todaySlang ? `"${todaySlang.phrase}" · ${t(todaySlang.meaning_cn)}` : t("看看今天的流行表达"),
          to: "/slang", cta: t("去看"), done: false, xp: 0, coins: 0,
        },
      ];
    }

    const out: Task[] = [];

    // 1) Due reviews — highest priority (memory curve)
    if (reco && reco.total_due > 0) {
      const parts: string[] = [];
      if (reco.due_expressions) parts.push(t("{n} 个表达").replace("{n}", String(reco.due_expressions)));
      if (reco.due_vocab)       parts.push(t("{n} 个单词").replace("{n}", String(reco.due_vocab)));
      if (reco.due_grammar)     parts.push(t("{n} 个语法").replace("{n}", String(reco.due_grammar)));
      if (reco.due_slang)       parts.push(t("{n} 句俚语").replace("{n}", String(reco.due_slang)));
      if (reco.due_mistakes)    parts.push(t("{n} 道错题").replace("{n}", String(reco.due_mistakes)));
      out.push({
        key: "review-due", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
        label: t("到期复习 {n} 项").replace("{n}", String(reco.total_due)),
        detail: parts.slice(0, 3).join(" · "),
        to: "/review", cta: t("去复习"), done: false, xp: 15, coins: 5,
      });
    } else {
      out.push({
        key: "review-warmup", icon: Brain, tone: "from-violet-500 to-fuchsia-500",
        label: t("热身 5 分钟"), detail: t("做几道题,激活今天的状态"),
        to: "/review", cta: t("开始"), done: false, xp: 10, coins: 3,
      });
    }

    // 2) Weakness OR continue lesson
    if (reco?.weakest_module && reco.weakest_count >= 2) {
      const weakMap: Record<string, { to: string; label: string }> = {
        grammar: { to: "/gaokao/mistakes?module=grammar", label: t("攻克语法薄弱点") },
        cloze:   { to: "/gaokao/mistakes?module=cloze",   label: t("回顾完形填空错题") },
        reading: { to: "/gaokao/mistakes?module=reading", label: t("回顾阅读错题") },
        vocab:   { to: "/gaokao/mistakes?module=vocab",   label: t("回顾词汇错题") },
      };
      const w = weakMap[reco.weakest_module];
      if (w) {
        out.push({
          key: `weak-${reco.weakest_module}`, icon: Target, tone: "from-rose-500 to-orange-500",
          label: w.label,
          detail: t("最近 14 天还有 {n} 道未解决,趁热打铁").replace("{n}", String(reco.weakest_count)),
          to: w.to, cta: t("攻克"), done: false, xp: 20, coins: 8,
        });
      }
    }
    if (out.length < 2) {
      out.push({
        key: "lesson-next", icon: GraduationCap, tone: "from-blue-500 to-indigo-500",
        label: progress.completedLessons.length > 0 ? t("继续下一课") : t("开始第一课"),
        detail: t(next.title), to: next.to, cta: t("继续"), done: false, xp: 15, coins: 5,
      });
    }

    // 3) Engagement: AI talk OR slang
    const hasTalk = reco?.top_area === "ai_talk" || reco?.top_area === "scenes";
    if (hasTalk) {
      out.push({
        key: "talk-5min", icon: MessageCircle, tone: "from-emerald-500 to-teal-500",
        label: t("和 AI 聊 5 分钟"),
        detail: t("延续你最近的口语节奏,练 5 分钟就够"),
        to: "/talk", cta: t("开口"), done: false, xp: 15, coins: 5,
      });
    } else {
      out.push({
        key: "slang-today", icon: Zap, tone: "from-amber-500 to-rose-500",
        label: t("今日一句俚语"),
        detail: todaySlang ? `"${todaySlang.phrase}" · ${t(todaySlang.meaning_cn)}` : t("看看今天的流行表达"),
        to: "/slang", cta: t("去看"), done: false, xp: 10, coins: 3,
      });
    }

    return out.slice(0, 3);
  }, [signedIn, reco, progress.completedLessons, next.title, next.to, todaySlang, t]);

  // Apply done-state from server
  const tasks: Task[] = useMemo(
    () => rawTasks.map((task) => ({ ...task, done: doneKeys.has(task.key) })),
    [rawTasks, doneKeys]
  );

  const completedCount = tasks.filter((task) => task.done).length;
  const totalCount = tasks.length;
  const allDone = signedIn && totalCount > 0 && completedCount >= totalCount;

  // Celebrate once when all done
  useEffect(() => {
    if (allDone && !celebrated) {
      setCelebrated(true);
      toast.success(t("🎉 今日 3 件小事全部完成,出门走走吧!"), { duration: 4500 });
    }
  }, [allDone, celebrated, t]);

  const markDone = useCallback(async (task: Task) => {
    if (!signedIn || task.done) return;
    // Optimistic
    setDoneKeys((prev) => {
      const nx = new Set(prev);
      nx.add(task.key);
      return nx;
    });
    try {
      const { data, error } = await supabase.rpc("complete_daily_task", {
        _task_key: task.key,
        _xp: task.xp,
        _coins: task.coins,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const xp = (row?.xp_awarded as number) ?? 0;
      const coins = (row?.coins_awarded as number) ?? 0;
      if (xp > 0 || coins > 0) {
        toast.success(`+${xp} XP${coins > 0 ? ` · +${coins} 🪙` : ""}`);
      }
    } catch {
      // Revert on failure
      setDoneKeys((prev) => {
        const nx = new Set(prev);
        nx.delete(task.key);
        return nx;
      });
    }
  }, [signedIn]);

  const toggle = () => setCollapsed((prev) => !prev);

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const showWelcome = signedIn && streak === 0 && !studiedToday;

  return (
    <section
      aria-label={t("今日任务")}
      className="relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm md:p-5"
    >
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/8 blur-3xl" />

      {showWelcome && (
        <div className="relative mb-4 flex items-center gap-3 rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:border-amber-500/30 dark:from-amber-950/40 dark:to-orange-950/40">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              <T>欢迎加入</T>
            </div>
            <div className="mt-0.5 text-sm font-extrabold leading-tight md:text-base">
              <T>完成第一节课，点亮你的第一颗 ⭐</T>
            </div>
          </div>
          <Link
            to={next.to}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/30 transition hover:scale-105 active:scale-95"
          >
            <T>开始第一课</T> <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

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
            {signedIn && totalCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-primary">
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-base font-bold leading-tight md:text-lg">
            {allDone
              ? <T>🎉 今日目标达成!</T>
              : (studiedToday ? <T>今天已经开练了 👏</T> : <T>今天先做这 3 件小事</T>)}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {collapsed
              ? <T>点击展开今日任务</T>
              : (allDone
                ? <T>明天的任务已经在等你了</T>
                : <T>每件 5 分钟即可,点完成解锁奖励</T>)}
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

      {/* Progress bar */}
      {signedIn && totalCount > 0 && !collapsed && (
        <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div
        id="today-task-list"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          collapsed ? "grid-rows-[0fr] opacity-0" : "mt-4 grid-rows-[1fr] opacity-100"
        }`}
        aria-hidden={collapsed}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="relative space-y-2">
            {tasks.map((task, i) => {
              const Icon = task.icon;
              return (
                <li
                  key={task.key}
                  className="animate-in fade-in slide-in-from-top-1 duration-300"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div
                    className={`group flex items-center gap-3 rounded-2xl border p-3 transition ${
                      task.done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-secondary/60"
                    }`}
                  >
                    <div className={`relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${task.tone} text-white shadow-md`}>
                      <Icon className="size-5" />
                      {task.done && (
                        <CheckCircle2 className="absolute -right-1 -top-1 size-5 rounded-full bg-background text-emerald-500" />
                      )}
                    </div>
                    <Link to={task.to} className="min-w-0 flex-1">
                      <div className={`text-sm font-bold leading-tight ${task.done ? "text-muted-foreground line-through" : ""}`}>
                        {task.label}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">{task.detail}</div>
                      {!task.done && signedIn && (task.xp > 0 || task.coins > 0) && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">
                          {task.xp > 0 && <span className="inline-flex items-center gap-0.5"><Award className="size-3" />+{task.xp} XP</span>}
                          {task.coins > 0 && <span>+{task.coins} 🪙</span>}
                        </div>
                      )}
                    </Link>
                    {signedIn && !task.done ? (
                      <button
                        type="button"
                        onClick={() => markDone(task)}
                        className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                        aria-label={t("标记完成")}
                      >
                        <T>完成</T>
                      </button>
                    ) : task.done ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> <T>已完成</T>
                      </span>
                    ) : (
                      <Link
                        to={task.to}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5"
                      >
                        {task.cta} <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {allDone && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/40 dark:to-teal-950/40">
              <Trophy className="size-8 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 text-sm">
                <div className="font-extrabold text-emerald-800 dark:text-emerald-200">
                  <T>太棒了!今天 3 件小事全部完成</T>
                </div>
                <div className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  <T>连胜已保住,明天继续 ⚡</T>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
