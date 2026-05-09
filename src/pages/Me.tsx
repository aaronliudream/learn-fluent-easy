import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { PageHeader } from "@/components/PageHeader";
import {
  BarChart3, BookMarked, Bookmark, Heart, Trophy, Users, Settings, Crown,
  LogIn, LogOut, GraduationCap, Sparkles, ClipboardList, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tile = { to: string; label: string; sub: string; icon: React.ComponentType<{ className?: string }>; tone: string };

const TILES: Tile[] = [
  { to: "/dashboard",          label: "学习中心",     sub: "总进度 · 各模块掌握度",   icon: BarChart3,    tone: "from-emerald-500 to-teal-500" },
  { to: "/dashboard/grammar",  label: "语法掌握全景", sub: "按考点查看强弱",          icon: GraduationCap,tone: "from-violet-500 to-fuchsia-500" },
  { to: "/review",             label: "复习与错题",   sub: "FSRS 智能安排今日复习",   icon: Target,       tone: "from-orange-500 to-rose-500" },
  { to: "/mistakes",           label: "我的错题本",   sub: "回看做错的题",            icon: ClipboardList,tone: "from-amber-500 to-orange-500" },
  { to: "/saved",              label: "收藏的句子",   sub: "随时复习好用的表达",      icon: Bookmark,     tone: "from-sky-500 to-indigo-500" },
  { to: "/stats",              label: "详细数据",     sub: "学习时长、连胜、勋章",    icon: Trophy,       tone: "from-yellow-500 to-amber-500" },
  { to: "/leaderboard",        label: "排行榜",       sub: "和大家一起竞争",          icon: Users,        tone: "from-pink-500 to-rose-500" },
  { to: "/pets",               label: "我的宠物",     sub: "陪你一起学英语",          icon: Heart,        tone: "from-rose-500 to-pink-500" },
  { to: "/account",            label: "账号设置",     sub: "邮箱、隐私、数据导出",    icon: Settings,     tone: "from-slate-600 to-slate-800" },
  { to: "/pricing",            label: "升级会员",     sub: "解锁无限对话与高级模型",  icon: Crown,        tone: "from-indigo-600 to-purple-600" },
];

export default function Me() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string | null; avatar_url?: string | null } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data ?? null);
    })();
  }, [user]);

  const name = profile?.display_name || user?.email?.split("@")[0] || "学习者";
  const initial = (name[0] || "?").toUpperCase();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8 pb-32 md:px-8 md:py-12">
      <PageHeader title="👤 我的" subtitle="一个入口，统管你的学习" back="/" />

      {/* Identity card */}
      <section className="mt-5 flex items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-extrabold text-white shadow-md">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="size-full rounded-2xl object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold">{user ? name : "未登录"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {user ? user.email : "登录后同步进度，享更多 AI 答疑额度"}
          </div>
        </div>
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
            className="rounded-full"
          >
            <LogOut className="mr-1.5 size-4" /> 退出
          </Button>
        ) : (
          <Button asChild size="sm" className="rounded-full">
            <Link to="/auth"><LogIn className="mr-1.5 size-4" /> 登录</Link>
          </Button>
        )}
      </section>

      {/* Quick AI assistant hint */}
      <section className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <div className="flex-1 text-sm">
          <span className="font-bold">小月 AI 助手</span>
          <span className="ml-2 text-muted-foreground">在任何学习页右下角即可呼出，随时答疑解惑。</span>
        </div>
      </section>

      {/* Tiles */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.tone} text-white shadow-sm`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{t.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{t.sub}</div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}