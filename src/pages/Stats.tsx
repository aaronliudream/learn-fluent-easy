import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { BookCheck, Clock, Flame, Target, Cloud, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getStreak, loadProgress, type GuestProgress } from "@/lib/guestProgress";
import { T, useT } from "@/i18n/T";

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className="rounded-2xl bg-card p-5 shadow-card md:p-6">
    <div className={`mb-3 grid size-12 place-items-center rounded-2xl ${color}`}>
      {icon}
    </div>
    <div className="text-3xl font-extrabold tracking-tight md:text-4xl">{value}</div>
    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
  </div>
);

const Stats = () => {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [p, setP] = useState<GuestProgress>(() => loadProgress());

  useEffect(() => {
    setP(loadProgress());
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  const streak = getStreak(p);
  const accuracy = p.quizTotal > 0 ? Math.round((p.quizCorrect / p.quizTotal) * 100) : 0;
  const firstSeen = new Date(p.firstSeenAt);
  const daysSinceStart = Math.max(
    1,
    Math.ceil((Date.now() - p.firstSeenAt) / (1000 * 60 * 60 * 24)),
  );

  const hasAny =
    p.completedLessons.length > 0 || p.studyMinutes > 0 || p.quizTotal > 0;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={t("我的学习数据")} subtitle={t("追踪你的学习成果")} back />

      <div className="mb-6">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/weekly-report"><Mail className="size-4" /> <T>每周学习报告</T></Link>
        </Button>
      </div>

      {!hasAny ? (
        <div className="rounded-3xl bg-card p-10 text-center shadow-card">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BookCheck className="size-8" />
          </div>
          <h3 className="text-lg font-bold"><T>还没有学习记录</T></h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <T>开始一节课程后，这里会显示你的学习数据</T>
          </p>
          <Button asChild className="mt-5">
            <Link to="/">
              <ArrowLeft className="size-4" /> <T>去选择课程</T>
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BookCheck className="size-6" />}
              value={p.completedLessons.length}
              label={t("完成课程数")}
              color="bg-emerald-500/15 text-emerald-600"
            />
            <StatCard
              icon={<Clock className="size-6" />}
              value={p.studyMinutes}
              label={t("累计学习分钟")}
              color="bg-sky-500/15 text-sky-600"
            />
            <StatCard
              icon={<Target className="size-6" />}
              value={`${accuracy}%`}
              label={t(`答题正确率（${p.quizTotal} 题）`)}
              color="bg-fuchsia-500/15 text-fuchsia-600"
            />
            <StatCard
              icon={<Flame className="size-6" />}
              value={streak}
              label={t("连续学习天数 🔥")}
              color="bg-orange-500/15 text-orange-600"
            />
          </section>

          <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
            <h3 className="text-lg font-bold"><T>学习历程</T></h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground"><T>首次学习</T></div>
                <div className="mt-1 font-semibold">
                  {firstSeen.toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground"><T>坚持天数</T></div>
                <div className="mt-1 font-semibold">{t(`${daysSinceStart} 天`)}</div>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground"><T>活跃天数</T></div>
                <div className="mt-1 font-semibold">{t(`${p.daysActive.length} 天`)}</div>
              </div>
            </div>
          </section>

          {!user && (
            <Link
              to="/auth"
              className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition hover:bg-primary/10"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Cloud className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold"><T>这些数据只保存在当前浏览器</T></div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  <T>登录后永久保留，并在手机、电脑等设备间同步</T>
                </div>
              </div>
              <div className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <T>立即登录保存</T>
              </div>
            </Link>
          )}
        </>
      )}
    </main>
  );
};

export default Stats;