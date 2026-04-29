import { ChevronRight, GraduationCap, LogIn, LogOut, Sparkles, Cloud, BarChart3, Award, Clock, TrendingUp, Zap, UserCog, Lock, Clapperboard, Briefcase } from "lucide-react";
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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);
  const [slangCount, setSlangCount] = useState<number>(IDIOMS.length);

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
            <div className="text-sm font-extrabold md:text-base">美国流行俚语 · {slangCount} 条</div>
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

      {/* Scene Dialogues entry */}
      <Link
        to="/scenes"
        className="group relative mb-8 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 p-4 text-white shadow-tile transition-transform hover:-translate-y-0.5"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-xl" />
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Clapperboard className="size-5" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-sm font-extrabold md:text-base">🎬 场景对话 · {SCENE_DIALOGUES.length} 组</div>
          <div className="mt-0.5 truncate text-xs opacity-90">14 个生活场景 · 1900 句地道表达</div>
        </div>
        <ChevronRight className="relative size-5 opacity-80 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Workplace English entry */}
      <Link
        to="/workplace"
        className="group relative mb-8 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-amber-600 p-4 text-white shadow-tile transition-transform hover:-translate-y-0.5"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-xl" />
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Briefcase className="size-5" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="text-sm font-extrabold md:text-base">💼 职场英语 · {WORK_CATEGORIES.length} 个场景</div>
          <div className="mt-0.5 truncate text-xs opacity-90">湾区职场真实对话 · 高频表达 · 每月更新</div>
        </div>
        <ChevronRight className="relative size-5 opacity-80 transition-transform group-hover:translate-x-1" />
      </Link>


      {/* Section label */}
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">学习路径 · Levels</h2>
        <span className="text-xs text-muted-foreground">{LEVELS.length} 级 · A1 → C2</span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEVELS.map((lv) => {
          const cardClass = `group relative flex items-center justify-between overflow-hidden rounded-2xl ${lv.gradient} px-5 py-5 text-white shadow-tile transition-transform`;
          const inner = (
            <>
              <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-xl" />
              <span className="pointer-events-none absolute -bottom-16 right-20 size-28 rounded-full bg-white/10 blur-lg" />
              <div className="relative flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  {lv.locked ? <Lock className="size-6" /> : <GraduationCap className="size-6" />}
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-wider md:text-xl">{lv.name}</div>
                  <div className="mt-0.5 text-xs font-medium opacity-90">
                    {lv.locked ? "内容更新中…" : `${lv.unitsCount} 单元`}
                  </div>
                </div>
              </div>
              {lv.locked ? (
                <span className="relative inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                  <Lock className="size-3" /> 即将推出
                </span>
              ) : (
                <ChevronRight className="relative size-5 opacity-80 transition-transform group-hover:translate-x-1" />
              )}
            </>
          );
          if (lv.locked) {
            return (
              <button
                key={lv.id}
                type="button"
                onClick={() => toast("该级别内容正在更新中，敬请期待 ✨")}
                aria-disabled="true"
                className={`${cardClass} cursor-not-allowed text-left opacity-70 grayscale-[0.2]`}
              >
                {inner}
              </button>
            );
          }
          return (
            <Link
              key={lv.id}
              to={`/level/${lv.id}`}
              className={`${cardClass} hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_hsl(250_50%_30%/0.45)]`}
            >
              {inner}
            </Link>
          );
        })}
      </section>
    </main>
  );
};

export default Index;
