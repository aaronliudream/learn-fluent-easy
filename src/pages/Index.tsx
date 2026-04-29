import { ChevronRight, GraduationCap, LogIn, LogOut, Sparkles, Cloud, BarChart3, Award, Clock, TrendingUp, Zap, BookOpen, ArrowRight, Layers, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { getStreak, loadProgress, touchActive } from "@/lib/guestProgress";
import {
  findNextLesson,
  getLastMastered,
  getLastVisited,
  isUnfinished,
  type LessonRef,
  RESUME_DIALOG_KEY,
} from "@/lib/mastery";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);
  const navigate = useNavigate();
  const [resumeOpen, setResumeOpen] = useState(false);
  const [unfinished, setUnfinished] = useState<LessonRef | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonRef | null>(null);

  useEffect(() => {
    touchActive();
    setProgress(loadProgress());
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // App-open suggestion: offer to resume an unfinished lesson, jump to the
  // next lesson, or let the user browse freely.
  useEffect(() => {
    if (sessionStorage.getItem(RESUME_DIALOG_KEY)) return;
    const visited = getLastVisited();
    const lastMastered = getLastMastered();
    const unfinishedRef = visited && isUnfinished(visited) ? visited : null;
    const nextRef = lastMastered
      ? findNextLesson(lastMastered.levelId, lastMastered.unitId, lastMastered.lessonId)
      : visited
        ? findNextLesson(visited.levelId, visited.unitId, visited.lessonId)
        : null;
    if (!unfinishedRef && !nextRef) return;
    sessionStorage.setItem(RESUME_DIALOG_KEY, "1");
    setUnfinished(unfinishedRef);
    setNextLesson(nextRef);
    const t = setTimeout(() => setResumeOpen(true), 500);
    return () => clearTimeout(t);
  }, []);

  const goTo = (ref: LessonRef) => {
    setResumeOpen(false);
    navigate(`/level/${ref.levelId}/unit/${ref.unitId}/lesson/${ref.lessonId}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
  };

  const hasProgress = progress.completedLessons.length > 0 || progress.studyMinutes > 0;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-4 flex justify-end">
        <Button asChild variant="ghost" size="sm" className="mr-2">
          <Link to="/stats">
            <BarChart3 className="size-4" /> 我的数据
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mr-2">
          <Link to="/account">
            <UserCog className="size-4" /> 账户
          </Link>
        </Button>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.display_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> 退出
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">
              <LogIn className="size-4" /> 登录 / 注册
            </Link>
          </Button>
        )}
      </div>

      <PageHeader title="选择学习级别" subtitle="选择适合你的级别，开始学习之旅" />

      <AlertDialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>👋 欢迎回来！接下来想做什么？</AlertDialogTitle>
            <AlertDialogDescription>
              你可以继续上次未完成的学习，开始下一课，或者自由浏览全部课程。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            {unfinished && (
              <button
                type="button"
                onClick={() => goTo(unfinished)}
                className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left transition hover:bg-primary/10"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <BookOpen className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">继续上次的学习</div>
                  <div className="truncate text-xs text-muted-foreground">{unfinished.title}</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </button>
            )}
            {nextLesson && (
              <button
                type="button"
                onClick={() => goTo(nextLesson)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-accent"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                  <ArrowRight className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">学习下一课</div>
                  <div className="truncate text-xs text-muted-foreground">{nextLesson.title}</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setResumeOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-accent"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
                <Layers className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">自由浏览课程</div>
                <div className="truncate text-xs text-muted-foreground">从下方选择任意级别 / 单元</div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>稍后再说</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hero: Placement test (primary) */}
      <Link
        to="/placement"
        className="group relative mb-4 flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl bg-grad-title p-5 text-white shadow-tile transition-transform hover:-translate-y-0.5"
      >
        <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-xl" />
        <span className="pointer-events-none absolute -bottom-12 right-32 size-24 rounded-full bg-white/10 blur-lg" />
        <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Award className="size-7" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            <TrendingUp className="size-3" /> 自适应 · 参照 CEFR
          </div>
          <div className="text-lg font-extrabold md:text-xl">不知道从哪里开始？做个水平测试</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs opacity-90">
            <span className="inline-flex items-center gap-1"><Clock className="size-3" /> 约 25 分钟</span>
            <span>· 听 / 说 / 读 / 写</span>
            <span>· A1–C1 评级</span>
          </div>
        </div>
        <ChevronRight className="relative size-6 opacity-80 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Secondary row: Slang + (optional) Progress */}
      <div className={`mb-8 grid gap-4 ${!user && hasProgress ? "md:grid-cols-2" : ""}`}>
        <Link
          to="/slang"
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 p-4 text-white shadow-tile transition-transform hover:-translate-y-0.5"
        >
          <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-xl" />
          <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="size-5" />
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="text-sm font-extrabold md:text-base">美国流行俚语 · 346 条</div>
            <div className="mt-0.5 truncate text-xs opacity-90">TikTok / Z 世代 / 社交媒体 · 每条带例句</div>
          </div>
          <ChevronRight className="relative size-5 opacity-80 transition-transform group-hover:translate-x-1" />
        </Link>

        {!user && hasProgress && (
          <Link
            to="/auth"
            className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition hover:bg-primary/10"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">
                已学 {progress.completedLessons.length} 节
                {progress.studyMinutes > 0 && ` · ${progress.studyMinutes} 分钟`}
                {streak >= 2 && ` · 🔥${streak}天`}
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">登录保存进度，3 秒同步到手机</div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              <Cloud className="size-3.5" /> 保存
            </div>
          </Link>
        )}
      </div>

      {/* Section label */}
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">学习路径 · Levels</h2>
        <span className="text-xs text-muted-foreground">{LEVELS.length} 级 · A1 → C2</span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEVELS.map((lv) => (
          <Link
            key={lv.id}
            to={`/level/${lv.id}`}
            className={`group relative flex items-center justify-between overflow-hidden rounded-2xl ${lv.gradient} px-5 py-5 text-white shadow-tile transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_hsl(250_50%_30%/0.45)]`}
          >
            {/* Decorative bubbles */}
            <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-xl" />
            <span className="pointer-events-none absolute -bottom-16 right-20 size-28 rounded-full bg-white/10 blur-lg" />

            <div className="relative flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-wider md:text-xl">{lv.name}</div>
                <div className="mt-0.5 text-xs font-medium opacity-90">{lv.unitsCount} 单元</div>
              </div>
            </div>

            <ChevronRight className="relative size-5 opacity-80 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
    </main>
  );
};

export default Index;
