import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Bug, Lightbulb, Heart, FileText, Star, User, UserX, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  user_id: string | null;
  category: string;
  rating: number | null;
  message: string;
  email: string | null;
  page_url: string | null;
  status: string;
  moderation_result: any;
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

type FunnelEvent = {
  event_name: string;
  step: string | null;
  session_id: string | null;
  user_id: string | null;
  metadata: any;
  created_at: string;
};

const ICON: Record<string, any> = { bug: Bug, suggestion: Lightbulb, praise: Heart, other: FileText };

export default function AdminFeedback() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "blocked" | "resolved">("all");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"feedback" | "emails" | "funnel">("feedback");
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [funnel, setFunnel] = useState<FunnelEvent[]>([]);
  const [funnelDays, setFunnelDays] = useState<7 | 30>(7);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setAuthed(!!u?.user);
      if (!u?.user) {setLoading(false);return;}
      const { data: roles } = await supabase.
      from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!roles);
      if (!roles) {setLoading(false);return;}
      const { data } = await supabase.
      from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []) as any);
      const { data: em } = await supabase.
      from("email_send_log").
      select("message_id, template_name, recipient_email, status, error_message, created_at").
      not("message_id", "is", null).
      order("created_at", { ascending: false }).
      limit(500);
      // Dedupe by message_id (keep latest status)
      const seen = new Set<string>();
      const dedup: EmailLog[] = [];
      for (const r of em as EmailLog[] ?? []) {
        if (seen.has(r.message_id)) continue;
        seen.add(r.message_id);
        dedup.push(r);
      }
      setEmails(dedup);
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data: fe } = await supabase.
      from("funnel_events").
      select("event_name, step, session_id, user_id, metadata, created_at").
      gte("created_at", since).
      order("created_at", { ascending: false }).
      limit(5000);
      setFunnel((fe ?? []) as any);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main className="mx-auto max-w-4xl p-6"><Loader2 className="size-5 animate-spin" /> <T>加载中…</T></main>;
  if (!authed) return <main className="mx-auto max-w-4xl p-6"><p><T>请先登录。</T></p></main>;
  if (!isAdmin) return <main className="mx-auto max-w-4xl p-6"><p><T>仅管理员可访问此页面。</T></p></main>;

  const filtered = rows.filter((r) => filter === "all" ? true : r.status === filter);
  const counts = { all: rows.length, new: rows.filter((r) => r.status === "new").length, blocked: rows.filter((r) => r.status === "blocked").length, resolved: rows.filter((r) => r.status === "resolved").length };

  async function setStatus(id: string, status: string) {
    await supabase.from("feedback").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回首页</T>
      </Link>
      <h1 className="text-2xl font-extrabold"><T>📨 反馈与邮件后台</T></h1>
      <p className="mt-1 text-xs text-muted-foreground"><T>用户反馈（最近 200 条）· 邮件投递日志（最近 500 封）</T></p>

      <div className="mt-4 inline-flex rounded-xl border bg-card p-1">
        <button
          onClick={() => setTab("feedback")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
          tab === "feedback" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`
          }>
          
          <MessageSquare className="size-4" /> <T>用户反馈 (</T>{rows.length})
        </button>
        <button
          onClick={() => setTab("emails")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
          tab === "emails" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`
          }>
          
          <Mail className="size-4" /> <T>邮件日志 (</T>{emails.length})
        </button>
        <button
          onClick={() => setTab("funnel")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
          tab === "funnel" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`
          }>
          
          <TrendingUp className="size-4" /> <T>转化漏斗</T>
        </button>
      </div>

      {tab === "feedback" ?
      <>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "new", "blocked", "resolved"] as const).map((f) =>
          <button key={f} onClick={() => setFilter(f)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
          filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`
          }>
            {f === "all" ? "全部" : f === "new" ? "新" : f === "blocked" ? "已拦截" : "已处理"} ({counts[f]})
          </button>
          )}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground"><T>暂无反馈</T></div>}
        {filtered.map((r) => {
            const Icon = ICON[r.category] || FileText;
            return (
              <div key={r.id} className={`rounded-2xl border-2 p-4 ${r.status === "blocked" ? "border-rose-300 bg-rose-50/50" : "border-border bg-card"}`}>
              <div className="mb-2 flex items-center gap-2 text-xs">
                <Icon className="size-4" />
                <span className="font-bold">{r.category}</span>
                {r.rating ? <span className="inline-flex items-center gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3 fill-amber-400 text-amber-400" />)}</span> : null}
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  r.status === "blocked" ? "bg-rose-200 text-rose-800" :
                  r.status === "resolved" ? "bg-emerald-200 text-emerald-800" :
                  "bg-amber-200 text-amber-800"}`
                  }>{r.status}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{r.message}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-bold">
                  {r.user_id ? <><User className="size-3" /> <T>已登录用户</T></> : <><UserX className="size-3" /> <T>匿名访客</T></>}
                </span>
                {r.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {r.email}</span>}
                {r.user_id && !r.email && <span className="text-amber-700"><T>（无邮箱，无法回复）</T></span>}
                {r.page_url && <span className="truncate max-w-[240px]">📄 {r.page_url}</span>}
                <span>🕐 {new Date(r.created_at).toLocaleString()}</span>
                {r.moderation_result?.reason && <span title={JSON.stringify(r.moderation_result)}>🤖 {r.moderation_result.reason}</span>}
              </div>
              {r.status !== "resolved" &&
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setStatus(r.id, "resolved")} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600"><T>标记已处理</T></button>
                  {r.status !== "blocked" && <button onClick={() => setStatus(r.id, "blocked")} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-bold text-white hover:bg-rose-600"><T>拦截</T></button>}
                </div>
                }
            </div>);

          })}
      </div>
      </> :
      tab === "emails" ?
      <section className="mt-4 overflow-hidden rounded-2xl border bg-card">
          {emails.length === 0 ?
        <div className="p-10 text-center text-sm text-muted-foreground"><T>还没有邮件记录</T></div> :

        <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3"><T>时间</T></th>
                  <th className="px-4 py-3"><T>模板</T></th>
                  <th className="px-4 py-3"><T>收件人</T></th>
                  <th className="px-4 py-3"><T>状态</T></th>
                  <th className="px-4 py-3"><T>错误</T></th>
                </tr>
              </thead>
              <tbody>
                {emails.map((e) => {
              const color =
              e.status === "sent" ? "bg-emerald-100 text-emerald-700" :
              e.status === "pending" ? "bg-amber-100 text-amber-700" :
              e.status === "suppressed" ? "bg-yellow-100 text-yellow-700" :
              "bg-rose-100 text-rose-700";
              return (
                <tr key={e.message_id} className="border-t align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">{e.template_name}</td>
                      <td className="px-4 py-3 text-xs">{e.recipient_email}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{e.status}</span></td>
                      <td className="px-4 py-3 text-xs text-rose-600">{e.error_message ?? ""}</td>
                    </tr>);

            })}
              </tbody>
            </table>
        }
        </section> :

      <FunnelPanel funnel={funnel} days={funnelDays} setDays={setFunnelDays} />
      }
    </main>);

}

function FunnelPanel({ funnel, days, setDays }: {funnel: FunnelEvent[];days: 7 | 30;setDays: (d: 7 | 30) => void;}) {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  const inWin = funnel.filter((e) => new Date(e.created_at).getTime() >= cutoff);

  const placementStarted = new Set(inWin.filter((e) => e.event_name === "placement" && e.step === "started").map((e) => e.session_id || ""));
  const placementCompleted = new Set(inWin.filter((e) => e.event_name === "placement" && e.step === "completed").map((e) => e.session_id || ""));
  const signedUp = new Set(inWin.filter((e) => e.event_name === "signup" && e.step === "completed").map((e) => e.session_id || ""));

  // Cross-step conversion: completed AND started in same session
  const completedFromStart = [...placementCompleted].filter((s) => placementStarted.has(s)).length;
  const signedFromCompleted = [...signedUp].filter((s) => placementCompleted.has(s)).length;

  const startCount = placementStarted.size;
  const completeCount = placementCompleted.size;
  const signupCount = signedUp.size;

  const completionRate = startCount > 0 ? Math.round(completedFromStart / startCount * 100) : 0;
  const signupRate = completeCount > 0 ? Math.round(signedFromCompleted / completeCount * 100) : 0;

  // CEFR distribution from completed placements
  const cefrCounts: Record<string, number> = {};
  for (const e of inWin) {
    if (e.event_name === "placement" && e.step === "completed") {
      const c = e.metadata?.cefr;
      if (c) cefrCounts[c] = (cefrCounts[c] || 0) + 1;
    }
  }
  const cefrSorted = Object.entries(cefrCounts).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section className="mt-4 space-y-4">
      <div className="inline-flex rounded-xl border bg-card p-1">
        {([7, 30] as const).map((d) =>
        <button key={d} onClick={() => setDays(d)}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <T>最近</T> {d} <T>天</T>
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="开始诊断" value={startCount} sub="独立 session" tone="blue" />
        <StatCard label="完成诊断" value={completeCount} sub={`${completionRate}% 完成率`} tone="violet" />
        <StatCard label="注册" value={signupCount} sub={`诊断后 ${signupRate}% 注册`} tone="emerald" />
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold"><T>漏斗</T></h3>
        <FunnelBar label="开始诊断" count={startCount} max={Math.max(startCount, 1)} color="bg-blue-500" />
        <FunnelBar label="完成诊断" count={completedFromStart} max={Math.max(startCount, 1)} color="bg-violet-500" />
        <FunnelBar label="完成 → 注册" count={signedFromCompleted} max={Math.max(startCount, 1)} color="bg-emerald-500" />
      </div>

      {cefrSorted.length > 0 &&
      <div className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold"><T>完成者 CEFR 分布</T></h3>
          <div className="space-y-1.5">
            {cefrSorted.map(([cefr, n]) =>
          <FunnelBar key={cefr} label={cefr} count={n} max={Math.max(...cefrSorted.map(([, v]) => v))} color="bg-amber-500" />
          )}
          </div>
        </div>
      }

      {inWin.length === 0 &&
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground"><T>该时间段还没有埋点数据</T></div>
      }
    </section>);

}

function StatCard({ label, value, sub, tone }: {label: string;value: number;sub: string;tone: "blue" | "violet" | "emerald";}) {
  const toneCls = tone === "blue" ? "text-blue-600" : tone === "violet" ? "text-violet-600" : "text-emerald-600";
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold ${toneCls}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>);

}

function FunnelBar({ label, count, max, color }: {label: string;count: number;max: number;color: string;}) {
  const pct = max > 0 ? Math.max(2, Math.round(count / max * 100)) : 0;
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold">{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>);

}