import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Bug, Lightbulb, Heart, FileText, Star } from "lucide-react";
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

const ICON: Record<string, any> = { bug: Bug, suggestion: Lightbulb, praise: Heart, other: FileText };

export default function AdminFeedback() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "blocked" | "resolved">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setAuthed(!!u?.user);
      if (!u?.user) { setLoading(false); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!roles);
      if (!roles) { setLoading(false); return; }
      const { data } = await supabase
        .from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main className="mx-auto max-w-4xl p-6"><Loader2 className="size-5 animate-spin" /> 加载中…</main>;
  if (!authed) return <main className="mx-auto max-w-4xl p-6"><p>请先登录。</p></main>;
  if (!isAdmin) return <main className="mx-auto max-w-4xl p-6"><p>仅管理员可访问此页面。</p></main>;

  const filtered = rows.filter(r => filter === "all" ? true : r.status === filter);
  const counts = { all: rows.length, new: rows.filter(r => r.status === "new").length, blocked: rows.filter(r => r.status === "blocked").length, resolved: rows.filter(r => r.status === "resolved").length };

  async function setStatus(id: string, status: string) {
    await supabase.from("feedback").update({ status }).eq("id", id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:py-10">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回首页
      </Link>
      <h1 className="text-2xl font-extrabold">📨 用户反馈管理</h1>
      <p className="mt-1 text-xs text-muted-foreground">显示最近 200 条反馈</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all","new","blocked","resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}>
            {f === "all" ? "全部" : f === "new" ? "新" : f === "blocked" ? "已拦截" : "已处理"} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">暂无反馈</div>}
        {filtered.map(r => {
          const Icon = ICON[r.category] || FileText;
          return (
            <div key={r.id} className={`rounded-2xl border-2 p-4 ${r.status === "blocked" ? "border-rose-300 bg-rose-50/50" : "border-border bg-card"}`}>
              <div className="mb-2 flex items-center gap-2 text-xs">
                <Icon className="size-4" />
                <span className="font-bold">{r.category}</span>
                {r.rating ? <span className="inline-flex items-center gap-0.5">{Array.from({length: r.rating}).map((_,i) => <Star key={i} className="size-3 fill-amber-400 text-amber-400" />)}</span> : null}
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  r.status === "blocked" ? "bg-rose-200 text-rose-800"
                  : r.status === "resolved" ? "bg-emerald-200 text-emerald-800"
                  : "bg-amber-200 text-amber-800"
                }`}>{r.status}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{r.message}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {r.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {r.email}</span>}
                {r.page_url && <span className="truncate max-w-[240px]">📄 {r.page_url}</span>}
                <span>🕐 {new Date(r.created_at).toLocaleString()}</span>
                {r.moderation_result?.reason && <span title={JSON.stringify(r.moderation_result)}>🤖 {r.moderation_result.reason}</span>}
              </div>
              {r.status !== "resolved" && (
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setStatus(r.id, "resolved")} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600">标记已处理</button>
                  {r.status !== "blocked" && <button onClick={() => setStatus(r.id, "blocked")} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-bold text-white hover:bg-rose-600">拦截</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}