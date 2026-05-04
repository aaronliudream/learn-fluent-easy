import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked, Star, CheckCircle2, Trash2, ChevronDown, ChevronUp, Filter, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TutorChat from "@/components/tutor/TutorChat";

type Mistake = {
  id: string;
  module: string;
  item_id: string;
  parent_label: string | null;
  user_answer: string | null;
  correct_answer: string | null;
  snapshot: any;
  wrong_count: number;
  last_wrong_at: string;
  is_resolved: boolean;
  is_starred: boolean;
};

const MODULE_LABEL: Record<string, { label: string; color: string }> = {
  cloze: { label: "完形填空", color: "from-violet-500 to-purple-600" },
  grammar: { label: "语法", color: "from-blue-500 to-indigo-600" },
  reading: { label: "阅读", color: "from-emerald-500 to-teal-600" },
};

export default function GaokaoMistakes() {
  const [list, setList] = useState<Mistake[]>([]);
  const [filter, setFilter] = useState<"all" | "cloze" | "grammar" | "reading">("all");
  const [showResolved, setShowResolved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorFor, setTutorFor] = useState<Mistake | null>(null);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    let q = supabase.from("gaokao_user_mistakes").select("*").eq("user_id", user.id).order("last_wrong_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("module", filter);
    if (!showResolved) q = q.eq("is_resolved", false);
    const { data } = await q;
    setList((data || []) as Mistake[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter, showResolved]);

  async function toggleStar(m: Mistake) {
    await supabase.from("gaokao_user_mistakes").update({ is_starred: !m.is_starred }).eq("id", m.id);
    setList((prev) => prev.map((x) => x.id === m.id ? { ...x, is_starred: !m.is_starred } : x));
  }
  async function markResolved(m: Mistake) {
    await supabase.from("gaokao_user_mistakes").update({ is_resolved: true }).eq("id", m.id);
    toast.success("已标记掌握");
    setList((prev) => prev.filter((x) => x.id !== m.id));
  }
  async function remove(m: Mistake) {
    if (!confirm("确定删除这道错题？")) return;
    await supabase.from("gaokao_user_mistakes").delete().eq("id", m.id);
    setList((prev) => prev.filter((x) => x.id !== m.id));
  }

  const counts = list.reduce((acc, m) => { acc[m.module] = (acc[m.module] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/gaokao" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </BackLink>
      <PageHeader title="我的错题本" subtitle="刻意练习薄弱点 · 自动收录所有错题" hideReviewBanner />

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "cloze", "grammar", "reading"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              filter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {k === "all" ? "全部" : MODULE_LABEL[k]?.label || k}
            {k !== "all" && counts[k] ? <span className="ml-1 opacity-70">{counts[k]}</span> : null}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="size-3.5" />
          含已掌握
        </label>
      </div>

      {loading ? (
        <div className="grid gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <BookMarked className="mb-3 size-10 text-muted-foreground/50" />
          <p className="font-semibold">暂无错题</p>
          <p className="mt-1 text-sm text-muted-foreground">开始刷题，错的题会自动来这里</p>
          <Link to="/gaokao/cloze" className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">去做完形填空</Link>
        </div>
      ) : (
        <div className="grid gap-2">
          {list.map((m) => {
            const meta = MODULE_LABEL[m.module] || { label: m.module, color: "from-slate-500 to-slate-600" };
            const isOpen = expanded === m.id;
            const snap = m.snapshot || {};
            return (
              <div key={m.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <button onClick={() => setExpanded(isOpen ? null : m.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left">
                  <div className={`mt-0.5 size-2 shrink-0 rounded-full bg-gradient-to-br ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">{meta.label}</span>
                      {m.wrong_count > 1 && <span className="text-rose-500">×{m.wrong_count}</span>}
                      <span className="ml-auto">{new Date(m.last_wrong_at).toLocaleDateString()}</span>
                    </div>
                    <div className="truncate text-sm font-medium">{m.parent_label || "未命名题目"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      你答 <span className="font-semibold text-rose-600">{m.user_answer || "—"}</span>
                      <span className="mx-1.5">·</span>
                      正确 <span className="font-semibold text-emerald-600">{m.correct_answer}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-border/50 bg-muted/20 px-4 py-3 text-sm">
                    {snap.option_a && (
                      <div className="grid gap-1.5">
                        {(["a", "b", "c", "d"] as const).map((L) => {
                          const opt = snap[`option_${L}`];
                          if (!opt) return null;
                          const isCorrect = L.toUpperCase() === m.correct_answer;
                          const isUserPick = L.toUpperCase() === m.user_answer;
                          const expl = snap[`explanation_${L}`];
                          return (
                            <div key={L} className={cn("rounded-lg border px-2.5 py-1.5 text-xs",
                              isCorrect ? "border-emerald-500/40 bg-emerald-500/10" :
                              isUserPick ? "border-rose-500/40 bg-rose-500/10" :
                              "border-border bg-background"
                            )}>
                              <div className="font-semibold">{L.toUpperCase()}. {opt} {isCorrect && "✓"}</div>
                              {expl && <div className="mt-0.5 text-muted-foreground">{expl}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {snap.general_explanation && (
                      <div className="rounded-lg bg-background px-3 py-2 text-xs leading-relaxed">
                        <div className="mb-0.5 font-semibold text-amber-600">解析</div>
                        {snap.general_explanation}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => toggleStar(m)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted">
                        <Star className={cn("size-3.5", m.is_starred && "fill-amber-400 text-amber-400")} />
                        {m.is_starred ? "已星标" : "星标"}
                      </button>
                      <button onClick={() => markResolved(m)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 hover:bg-emerald-500/15">
                        <CheckCircle2 className="size-3.5" /> 已掌握
                      </button>
                      <button onClick={() => remove(m)} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted">
                        <Trash2 className="size-3.5" /> 删除
                      </button>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => setTutorFor(m)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        <MessageCircleQuestion className="size-3.5" /> 问小月 / Ask Luna
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tutorFor && (
        <TutorChat
          context="gaokao_mistakes"
          questionRef={tutorFor.id}
          questionSnapshot={{
            module: tutorFor.module,
            label: tutorFor.parent_label,
            user_answer: tutorFor.user_answer,
            correct_answer: tutorFor.correct_answer,
            snapshot: tutorFor.snapshot,
          }}
          open={!!tutorFor}
          onClose={() => setTutorFor(null)}
        />
      )}
    </main>
  );
}
