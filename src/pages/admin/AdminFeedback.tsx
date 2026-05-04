import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, MessageSquare, Mail, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Feedback = {
  id: string;
  category: string | null;
  rating: number | null;
  message: string;
  email: string | null;
  page_url: string | null;
  status: string | null;
  created_at: string;
};

type EmailLog = {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

const AdminFeedback = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [tab, setTab] = useState<"feedback" | "emails">("feedback");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [fb, em] = await Promise.all([
      supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(200),
      supabase
        .from("email_send_log")
        .select("message_id, template_name, recipient_email, status, error_message, created_at")
        .not("message_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (fb.error) toast.error(fb.error.message);
    if (em.error) toast.error(em.error.message);
    setFeedback((fb.data as Feedback[]) ?? []);
    // Dedupe email log by message_id (keep latest)
    const seen = new Set<string>();
    const dedup: EmailLog[] = [];
    for (const row of (em.data as EmailLog[]) ?? []) {
      if (seen.has(row.message_id)) continue;
      seen.add(row.message_id);
      dedup.push(row);
    }
    setEmails(dedup);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        setAuthChecked(true);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      const admin = !!roles?.some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) await load();
    })();
  }, []);

  if (!authChecked) {
    return (
      <main className="grid min-h-screen place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 py-20 text-center">
        <Shield className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-extrabold">仅限管理员</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          这个页面只有管理员账号可以访问。请使用管理员账号登录。
        </p>
        <Button asChild className="mt-6"><Link to="/">返回首页</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回首页
      </Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">ADMIN</div>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">📨 反馈与邮件后台</h1>
          <p className="mt-1 text-xs text-muted-foreground">用户反馈 · 邮件投递日志</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> 刷新
        </Button>
      </div>

      <div className="mb-4 inline-flex rounded-xl border bg-card p-1">
        <button
          onClick={() => setTab("feedback")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
            tab === "feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="size-4" /> 用户反馈 ({feedback.length})
        </button>
        <button
          onClick={() => setTab("emails")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
            tab === "emails" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="size-4" /> 邮件日志 ({emails.length})
        </button>
      </div>

      {tab === "feedback" ? (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-tile">
          {feedback.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">还没有反馈</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">分类</th>
                  <th className="px-4 py-3">评分</th>
                  <th className="px-4 py-3">内容</th>
                  <th className="px-4 py-3">联系</th>
                  <th className="px-4 py-3">页面</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map(f => (
                  <tr key={f.id} className="border-t align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">{f.category ?? "-"}</td>
                    <td className="px-4 py-3 text-xs">{f.rating != null ? "⭐".repeat(f.rating) : "-"}</td>
                    <td className="px-4 py-3 text-sm">{f.message}</td>
                    <td className="px-4 py-3 text-xs">{f.email ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{f.page_url ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-tile">
          {emails.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">还没有邮件</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">模板</th>
                  <th className="px-4 py-3">收件人</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">错误</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(e => {
                  const color =
                    e.status === "sent" ? "bg-emerald-100 text-emerald-700"
                    : e.status === "pending" ? "bg-amber-100 text-amber-700"
                    : e.status === "suppressed" ? "bg-yellow-100 text-yellow-700"
                    : "bg-rose-100 text-rose-700";
                  return (
                    <tr key={e.message_id} className="border-t align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs">{e.template_name}</td>
                      <td className="px-4 py-3 text-xs">{e.recipient_email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-rose-600">{e.error_message ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
};

export default AdminFeedback;