import { ChevronRight, GraduationCap, LogIn, LogOut, Sparkles, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { getStreak, loadProgress, touchActive } from "@/lib/guestProgress";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const streak = getStreak(progress);

  useEffect(() => {
    touchActive();
    setProgress(loadProgress());
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
  };

  const hasProgress = progress.completedLessons.length > 0 || progress.studyMinutes > 0;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-4 flex justify-end">
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

      {/* Guest progress sunk-cost banner */}
      {!user && hasProgress && (
        <Link
          to="/auth"
          className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition hover:bg-primary/10"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">
              你已完成 {progress.completedLessons.length} 节课
              {progress.studyMinutes > 0 && ` · 学习 ${progress.studyMinutes} 分钟`}
              {streak >= 2 && ` · 🔥 连续 ${streak} 天`}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              登录后这些进度永久保留，3 秒同步到手机
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Cloud className="size-4" /> 立即保存
          </div>
        </Link>
      )}

      <section className="grid gap-5 md:grid-cols-2 md:gap-6">
        {LEVELS.map((lv) => (
          <Link
            key={lv.id}
            to={`/level/${lv.id}`}
            className={`group relative flex items-center justify-between overflow-hidden rounded-2xl ${lv.gradient} px-6 py-7 text-white shadow-tile transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_hsl(250_50%_30%/0.45)]`}
          >
            {/* Decorative bubbles */}
            <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-xl" />
            <span className="pointer-events-none absolute -bottom-16 right-20 size-28 rounded-full bg-white/10 blur-lg" />

            <div className="relative flex items-center gap-5">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="size-7" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-wider md:text-2xl">{lv.name}</div>
                <div className="mt-1 text-sm font-medium opacity-90">{lv.unitsCount} 单元</div>
              </div>
            </div>

            <ChevronRight className="relative size-6 opacity-80 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
    </main>
  );
};

export default Index;
