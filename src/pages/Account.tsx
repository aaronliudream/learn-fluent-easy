import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Shield, FileText, LogIn, BookMarked, Sparkles, Mail, MessageSquare, GraduationCap, Loader2 } from "lucide-react";
import { T, useT } from "@/i18n/T";
import { MyClassesSection } from "@/components/student/MyClassesSection";

const Account = () => {
  const navigate = useNavigate();
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  // Guest upgrade
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePw, setUpgradePw] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [enablingTeacher, setEnablingTeacher] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null),
    );
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  // Load roles + guest status whenever the user changes.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data);
    })();
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "teacher" as never)
        .maybeSingle();
      if (!cancelled) setIsTeacher(!!data);
    })();
    // Load guest status
    (async () => {
      const { data } = await supabase.from("profiles").select("is_guest, username").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      setIsGuest(!!data?.is_guest);
      setUsername((data?.username as string) ?? "");
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) return;
    if (!upgradeEmail.includes("@")) { toast.error(t("请输入有效邮箱")); return; }
    if (upgradePw.length < 6) { toast.error(t("密码至少 6 位")); return; }
    setUpgrading(true);
    try {
      const { error: e1 } = await supabase.auth.updateUser({ email: upgradeEmail, password: upgradePw });
      if (e1) throw e1;
      const { error: e2 } = await supabase.rpc("upgrade_guest_to_full", { _real_email: upgradeEmail });
      if (e2) throw e2;
      setIsGuest(false);
      toast.success(t("升级成功！现在可以用邮箱登录了 🎉"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleEnableTeacher = async () => {
    if (!user) return;
    setEnablingTeacher(true);
    try {
      // 新建 RPC，types.ts 未重生成，故 rpc 名做 string 转义。
      const rpc = supabase.rpc.bind(supabase) as (fn: string) => Promise<{ error: unknown }>;
      const { error } = await rpc("enable_teacher_role");
      if (error) throw error as Error;
      setIsTeacher(true);
      toast.success(t("已开通教师功能 🎓"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnablingTeacher(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirmText !== "DELETE") {
      toast.error(t("请输入 DELETE 以确认"));
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const { error } = await supabase.functions.invoke("delete-account", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success(t("账户已删除"));
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(t("删除失败：") + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={t("账户与隐私")} subtitle={t("管理你的账户、数据与隐私设置")} back />

      {/* Account info */}
      <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <T>账户信息</T>
        </h3>
        {user ? (
          <div className="space-y-1 text-sm">
            {username && (
              <div>
                <span className="text-muted-foreground"><T>昵称：</T></span>
                <b>{username}</b>
                {isGuest && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"><T>访客账号</T></span>}
              </div>
            )}
            <div>
              <span className="text-muted-foreground"><T>显示名：</T></span>
              {user.user_metadata?.display_name || "—"}
            </div>
            <div>
              <span className="text-muted-foreground"><T>邮箱：</T></span>
              {isGuest ? <span className="text-muted-foreground italic"><T>未绑定（仅本地占位）</T></span> : user.email}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground"><T>未登录 · 仅可导出本机数据</T></p>
            <Button asChild size="sm">
              <Link to="/auth"><LogIn className="size-4" /> <T>登录</T></Link>
            </Button>
          </div>
        )}
      </section>

      {/* Guest upgrade card */}
      {user && isGuest && (
        <section className="mb-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h3 className="text-base font-extrabold"><T>升级为完整账号</T></h3>
          </div>
          <p className="mt-1 text-sm text-amber-900/80">
            <T>绑定邮箱后可在多设备同步、找回 PIN、接收每周学习报告。原昵称和所有进度都会保留。</T>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="up-email"><Mail className="mr-1 inline size-3.5" /> <T>邮箱</T></Label>
              <Input id="up-email" type="email" value={upgradeEmail} onChange={(e) => setUpgradeEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="up-pw"><T>新密码（至少 6 位）</T></Label>
              <Input id="up-pw" type="password" minLength={6} value={upgradePw} onChange={(e) => setUpgradePw(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleUpgrade} disabled={upgrading} className="mt-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white">
            <Sparkles className="size-4" /> <T>立即绑定邮箱</T>
          </Button>
        </section>
      )}

      {/* Admin shortcut */}
      {user && isAdmin && (
        <section className="mb-6 rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-purple-600" />
                <h3 className="text-base font-extrabold"><T>管理后台</T></h3>
              </div>
              <p className="mt-1 text-sm text-purple-900/70">
                <T>查看与处理用户反馈（仅管理员可见）</T>
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Link to="/admin/feedback"><MessageSquare className="size-4" /> <T>反馈管理</T></Link>
            </Button>
          </div>
        </section>
      )}

      {/* Teacher — self-service opt-in / enter teacher hub (signed-in users) */}
      {user && (
        <section className="mb-6 rounded-2xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-orange-50 p-6 shadow-card dark:border-fuchsia-500/30 dark:from-fuchsia-500/10 dark:to-orange-500/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-fuchsia-600" />
                <h3 className="text-base font-extrabold"><T>教师功能</T></h3>
              </div>
              <p className="mt-1 text-sm text-fuchsia-900/70 dark:text-fuchsia-100/70">
                {isTeacher
                  ? <T>创建班级、发邀请码、关注学生学习进度。你的学习功能完全不变。</T>
                  : <T>你是老师？开通后可创建班级、发邀请码给学生，在后台看他们的学习进度。开通不影响你自己的学习。</T>}
              </p>
            </div>
            {isTeacher ? (
              <Button asChild className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white">
                <Link to="/teacher"><GraduationCap className="size-4" /> <T>进入教师后台</T></Link>
              </Button>
            ) : (
              <Button
                onClick={handleEnableTeacher}
                disabled={enablingTeacher}
                className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white">
                {enablingTeacher
                  ? <Loader2 className="size-4 animate-spin" />
                  : <><GraduationCap className="size-4" /> <T>开通教师功能</T></>}
              </Button>
            )}
          </div>
        </section>
      )}

      {/* My classes — join by code + list memberships (only for signed-in users) */}
      {user && <MyClassesSection />}

      {/* My learning shortcuts */}
      {user && (
        <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
          <h3 className="text-base font-bold"><T>我的学习</T></h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/mistakes">
                <BookMarked className="size-4" /> <T>错题本</T>
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Legal */}
      <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="text-base font-bold"><T>隐私与协议</T></h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link to="/privacy"><Shield className="size-4" /> <T>隐私政策</T></Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/terms"><FileText className="size-4" /> <T>服务条款</T></Link>
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      {user && (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="text-base font-bold text-destructive"><T>危险区域</T></h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <T>删除账户后，你的所有学习记录、俚语掌握度和账号信息将被永久删除，无法恢复。</T>
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4">
                <Trash2 className="size-4" /> <T>删除我的账户</T>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle><T>确认永久删除账户？</T></AlertDialogTitle>
                <AlertDialogDescription>
                  <T>此操作不可撤销。我们将立即删除你的账号、所有学习进度、俚语掌握度记录和生成的课程。</T>
                  {" "}<T>请在下方输入</T> <strong>DELETE</strong> <T>以确认。</T>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor="confirm"><T>输入 DELETE 确认</T></Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}><T>取消</T></AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={loading || confirmText !== "DELETE"}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <T>永久删除</T>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      )}
    </main>
  );
};

export default Account;