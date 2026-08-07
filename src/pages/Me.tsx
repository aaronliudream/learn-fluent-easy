import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PageHeader } from "@/components/PageHeader";
import {
  BarChart3, Heart, Settings,
  LogIn, LogOut, ClipboardList, GraduationCap } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { useIsTeacher } from "@/hooks/useIsTeacher";

type Tile = {to: string;label: string;sub: string;icon: React.ComponentType<{className?: string;}>;tone: string;};

// 注:语法掌握全景(/dashboard/grammar)、详细数据(/stats)、排行榜(/leaderboard)、
// 升级会员(/pricing)四个入口按需求隐藏(页面/路由保留,以后可能再启用)。
const TILES: Tile[] = [
{ to: "/dashboard", label: "学习中心", sub: "总进度 · 各模块掌握度", icon: BarChart3, tone: "from-emerald-500 to-teal-500" },
{ to: "/mistakes", label: "我的错题本", sub: "回看做错的题 · 重做掌握", icon: ClipboardList, tone: "from-amber-500 to-orange-500" },
{ to: "/account", label: "账号设置", sub: "邮箱、隐私、数据导出", icon: Settings, tone: "from-slate-600 to-slate-800" }];


export default function Me() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{display_name?: string | null;} | null>(null);
  const { isTeacher } = useIsTeacher(); // 仅老师显示"教师中心"卡片(调 is_teacher() RPC)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {setProfile(null);return;}
    (async () => {
      const { data } = await supabase.
      from("profiles").
      select("display_name").
      eq("user_id", user.id).
      maybeSingle();
      setProfile(data ?? null);
    })();
  }, [user]);

  const name = profile?.display_name || user?.email?.split("@")[0] || "学习者";
  const initial = (name[0] || "?").toUpperCase();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8 pb-32 md:px-8 md:py-12">
      <PageHeader title="👤 我的" subtitle="一个入口，统管你的学习" homeButton />

      {/* Identity card */}
      <section className="mt-5 flex items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-extrabold text-white shadow-md">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold">{user ? name : "未登录"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {user ? user.email : "登录后同步进度，享更多 AI 答疑额度"}
          </div>
        </div>
        {user ?
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {await supabase.auth.signOut();navigate("/");}}
          className="rounded-full">
          
            <LogOut className="mr-1.5 size-4" /> <T>退出</T>
          </Button> :

        <Button asChild size="sm" className="rounded-full">
            <Link to="/auth"><LogIn className="mr-1.5 size-4" /> <T>登录</T></Link>
          </Button>
        }
      </section>

      {/* 小月横幅已删除(2026-08-05):浮动呼出球 2026-07-05 就已下线(见 App.tsx),
          这条"右下角即可呼出"是死文案,点了也没有入口。 */}

      {/* Tiles */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 教师中心 —— 仅当 is_teacher() 为真时显示;普通用户主页保持干净 */}
        {isTeacher && (
          <Link
            to="/teacher"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">

            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold"><T>教师中心</T></div>
              <div className="truncate text-[11px] text-muted-foreground"><T>管理班级 · 关注学生进度</T></div>
            </div>
          </Link>
        )}
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.tone} text-white shadow-sm`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold"><T>{t.label}</T></div>
                <div className="truncate text-[11px] text-muted-foreground">{t.sub}</div>
              </div>
            </Link>);

        })}
      </section>
    </main>);

}