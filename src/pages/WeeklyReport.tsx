import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { BookCheck, Clock, Target, Flame, Sparkles, Mail, MailX, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { loadProgress, getStreak } from "@/lib/guestProgress";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";

type ServerStats = {
  lessonsCompleted: number;
  vocabLearned: number;
  studyMinutes: number;
  quizCorrect: number;
  quizTotal: number;
  streak: number;
  weekRange: string;
};

const Stat = ({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) => (
  <div className="rounded-2xl bg-card p-5 shadow-card">
    <div className={`mb-3 grid size-12 place-items-center rounded-2xl ${color}`}>{icon}</div>
    <div className="text-3xl font-extrabold tracking-tight">{value}</div>
    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
  </div>
);

const WeeklyReport = () => {
  const t = useT();
  const { lang } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [server, setServer] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const local = loadProgress();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) return;
      // Load profile preference
      const { data: prof } = await supabase
        .from("profiles")
        .select("weekly_report_enabled, email, preferred_language")
        .eq("user_id", u.id)
        .maybeSingle();
      if (prof) {
        setEmailEnabled((prof as any).weekly_report_enabled ?? true);
      }
      // Save email + language to profile if missing
      const updates: Record<string, unknown> = {};
      if (!(prof as any)?.email && u.email) updates.email = u.email;
      if (!(prof as any)?.preferred_language && lang) updates.preferred_language = lang;
      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates as never).eq("user_id", u.id);
      }
      // Aggregate server stats
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("weekly-report?mode=me", { method: "GET" } as never);
        if (!error && data) setServer(data as ServerStats);
      } catch (e) {
        console.warn("weekly-report fetch failed", e);
      } finally {
        setLoading(false);
      }
    });
  }, [lang]);

  const toggleEmail = async (next: boolean) => {
    if (!user) return;
    setEmailEnabled(next);
    const { error } = await supabase
      .from("profiles")
      .update({ weekly_report_enabled: next, preferred_language: lang } as never)
      .eq("user_id", user.id);
    if (error) {
      toast.error(t("更新失败"));
      setEmailEnabled(!next);
    } else {
      toast.success(next ? t("已开启每周邮件") : t("已关闭每周邮件"));
    }
  };

  // Use server stats when available; otherwise fall back to local lifetime totals
  const lessonsCompleted = server?.lessonsCompleted ?? local.completedLessons.length;
  const vocabLearned = server?.vocabLearned ?? 0;
  const studyMinutes = server?.studyMinutes ?? local.studyMinutes;
  const quizTotal = server?.quizTotal ?? local.quizTotal;
  const quizCorrect = server?.quizCorrect ?? local.quizCorrect;
  const accuracy = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;
  const streak = server?.streak ?? getStreak(local);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={t("学习报告")} subtitle={server?.weekRange || t("本周进度")} back />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<BookCheck className="size-6" />} value={lessonsCompleted} label={t("完成课程")} color="bg-emerald-500/15 text-emerald-600" />
        <Stat icon={<Sparkles className="size-6" />} value={vocabLearned} label={t("新学词汇")} color="bg-violet-500/15 text-violet-600" />
        <Stat icon={<Clock className="size-6" />} value={studyMinutes} label={t("学习分钟")} color="bg-sky-500/15 text-sky-600" />
        <Stat icon={<Target className="size-6" />} value={quizTotal > 0 ? `${accuracy}%` : "—"} label={t("答题正确率")} color="bg-fuchsia-500/15 text-fuchsia-600" />
      </section>

      {streak > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-orange-500/10 p-4 text-orange-700">
          <Flame className="size-5" />
          <span className="font-semibold">{t(`连续学习 ${streak} 天`)}</span>
        </div>
      )}

      {!user ? (
        <Link
          to="/auth"
          className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition hover:bg-primary/10"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Cloud className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold"><T>登录后接收每周学习邮件</T></div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              <T>每周自动收到本周学习总结与下周建议</T>
            </div>
          </div>
          <div className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <T>立即登录</T>
          </div>
        </Link>
      ) : (
        <section className="mt-6 flex items-center justify-between rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            {emailEnabled ? <Mail className="size-5 text-primary" /> : <MailX className="size-5 text-muted-foreground" />}
            <div>
              <div className="font-semibold"><T>每周学习邮件</T></div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <Switch checked={emailEnabled} onCheckedChange={toggleEmail} />
        </section>
      )}

      {loading && <div className="mt-4 text-center text-sm text-muted-foreground"><T>正在加载本周数据…</T></div>}

      <div className="mt-6">
        <Button asChild variant="outline"><Link to="/stats"><T>查看完整统计</T></Link></Button>
      </div>
    </main>
  );
};

export default WeeklyReport;