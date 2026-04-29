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
import { Download, Trash2, Shield, FileText, LogIn } from "lucide-react";
import { loadProgress } from "@/lib/guestProgress";
import { T, useT } from "@/i18n/T";

const Account = () => {
  const navigate = useNavigate();
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null),
    );
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const localProgress = loadProgress();
      let cloud: Record<string, unknown> = {};
      if (user) {
        const [profile, mastery, lessons] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id),
          supabase.from("slang_mastery").select("*").eq("user_id", user.id),
          supabase.from("generated_lessons").select("*").eq("user_id", user.id),
        ]);
        cloud = {
          profile: profile.data ?? [],
          slang_mastery: mastery.data ?? [],
          generated_lessons: lessons.data ?? [],
        };
      }
      const payload = {
        exported_at: new Date().toISOString(),
        account: user
          ? { id: user.id, email: user.email, metadata: user.user_metadata }
          : null,
        local_progress: localProgress,
        cloud_data: cloud,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("数据已导出"));
    } catch (e) {
      toast.error(t("导出失败：") + (e as Error).message);
    } finally {
      setLoading(false);
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
      <PageHeader title={t("账户与隐私")} subtitle={t("管理你的账户、数据与隐私设置")} back="/" />

      {/* Account info */}
      <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <T>账户信息</T>
        </h3>
        {user ? (
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground"><T>昵称：</T></span>
              {user.user_metadata?.display_name || "—"}
            </div>
            <div>
              <span className="text-muted-foreground"><T>邮箱：</T></span>
              {user.email}
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

      {/* Export */}
      <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="text-base font-bold"><T>导出我的数据</T></h3>
        <p className="mt-1 text-sm text-muted-foreground">
          <T>下载一份你的所有学习数据（JSON 格式），包括账户信息、学习进度和俚语掌握度。</T>
        </p>
        <Button onClick={handleExport} disabled={loading} className="mt-4">
          <Download className="size-4" /> <T>导出 JSON</T>
        </Button>
      </section>

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