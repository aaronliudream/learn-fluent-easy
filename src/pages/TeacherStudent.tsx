import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, ChevronDown, ChevronRight } from "lucide-react";

/**
 * 教师端 · 学生详情只读页 /teacher/class/:id/student/:studentId
 * 全部数据来自带成员归属校验的 SECURITY DEFINER RPC:
 *   get_student_module_progress / get_student_mistake_counts / get_student_mistakes
 * 非本班学生 → RPC 返回空 → 显示空态。纯只读,不改学生任何数据。
 */

type ModuleRow = {
  module: string;
  mastery_pct: number;
  mastered_count: number;
  weak_count: number;
  touched: number;
  scope_total: number;
  completion_pct: number;
  minutes_7d: number;
  minutes_total: number;
  last_active_at: string | null;
  current_lesson: string | null;
};
type CountRow = { module: string; unresolved_count: number };
type Mistake = {
  id: string; module: string; question: string;
  user_answer: string | null; correct_answer: string | null;
  explanation: string | null; source_label: string | null;
  snapshot: unknown; wrong_count: number; last_wrong_at: string;
};

const MODULE_META: Record<string, { label: string; emoji: string; tone: string }> = {
  primary:  { label: "小学",   emoji: "🎒", tone: "from-sky-500 to-cyan-500" },
  junior:   { label: "初中",   emoji: "📗", tone: "from-violet-500 to-indigo-500" },
  senior:   { label: "高中",   emoji: "📕", tone: "from-rose-500 to-orange-500" },
  american: { label: "新概念", emoji: "📘", tone: "from-fuchsia-500 to-pink-500" },
};
const MODULE_ORDER = ["primary", "junior", "senior", "american"];
const moduleLabel = (m: string) => MODULE_META[m]?.label ?? m;

const rpc = supabase.rpc.bind(supabase) as (
  fn: string, args?: Record<string, unknown>,
) => Promise<{ data: unknown; error: unknown }>;

function fmtHM(min: number): string {
  if (!min) return "0′";
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h${m ? ` ${m}′` : ""}` : `${m}′`;
}
function relTime(iso: string | null): string {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "今天";
  if (d === 1) return "昨天";
  return `${d} 天前`;
}

export default function TeacherStudent() {
  const { id: classId, studentId } = useParams<{ id: string; studentId: string }>();
  const t = useT();
  const navigate = useNavigate();
  const loc = useLocation();
  const passedName = (loc.state as { name?: string } | null)?.name || "";

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);
  // 懒加载的错题明细:module → rows
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Mistake[]>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [mp, mc] = await Promise.all([
        rpc("get_student_module_progress", { _student_id: studentId }),
        rpc("get_student_mistake_counts", { _student_id: studentId }),
      ]);
      if (cancelled) return;
      setModules(((mp.data ?? []) as ModuleRow[]));
      setCounts(((mc.data ?? []) as CountRow[]));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  async function toggleModule(m: string) {
    if (expanded === m) { setExpanded(null); return; }
    setExpanded(m);
    if (!details[m]) {
      setDetailLoading(m);
      const { data } = await rpc("get_student_mistakes", { _student_id: studentId, _module: m });
      setDetails((d) => ({ ...d, [m]: (data ?? []) as Mistake[] }));
      setDetailLoading(null);
    }
  }

  const summary = useMemo(() => {
    const min7 = modules.reduce((a, m) => a + (m.minutes_7d || 0), 0);
    const minTot = modules.reduce((a, m) => a + (m.minutes_total || 0), 0);
    const last = modules.reduce<string | null>((a, m) => {
      if (!m.last_active_at) return a;
      return !a || new Date(m.last_active_at) > new Date(a) ? m.last_active_at : a;
    }, null);
    return { min7, minTot, last };
  }, [modules]);

  const countByModule = useMemo(
    () => Object.fromEntries(counts.map((c) => [c.module, c.unresolved_count])),
    [counts],
  );

  const orderedModules = useMemo(() => {
    const byKey = new Map(modules.map((m) => [m.module, m]));
    return MODULE_ORDER.map((k) => byKey.get(k)).filter(Boolean) as ModuleRow[];
  }, [modules]);

  const hasData = modules.length > 0;

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  if (!hasData) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 text-center">
        <PageHeader title="学生详情" back={`/teacher/class/${classId}`} />
        <p className="mt-6 text-sm text-muted-foreground"><T>无权查看,或该学生不在你的班级里。</T></p>
        <Button className="mt-4" onClick={() => navigate(`/teacher/class/${classId}`)}><T>返回班级</T></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <PageHeader
        title={`👤 ${passedName || "学生"}`}
        subtitle="学习进度只读视图"
        back={`/teacher/class/${classId}`} />

      {/* 顶部时长汇总 */}
      <section className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Clock className="size-4 text-emerald-600" />
          <span className="text-muted-foreground"><T>本周</T></span>
          <b className="tabular-nums">{fmtHM(summary.min7)}</b>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground"><T>累计</T></span>
          <b className="tabular-nums">{fmtHM(summary.minTot)}</b>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground"><T>最近活跃</T></span>
          <b>{relTime(summary.last)}</b>
        </div>
      </section>

      {/* 四板块 2×2 卡 */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {orderedModules.map((m) => {
          const meta = MODULE_META[m.module];
          const untouched = m.mastery_pct === 0 && m.touched === 0 && !m.last_active_at && m.minutes_total === 0;
          return (
            <div key={m.module}
              className={`rounded-2xl border-2 p-4 shadow-sm ${untouched ? "border-border bg-muted/30 opacity-70" : "border-border bg-card"}`}>
              <div className="flex items-center gap-2">
                <span className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br ${meta?.tone ?? "from-slate-400 to-slate-600"} text-white text-lg`}>
                  {meta?.emoji ?? "📚"}
                </span>
                <div className="font-extrabold">{meta?.label ?? m.module}</div>
                {untouched && <span className="ml-auto text-[11px] text-muted-foreground"><T>未开始</T></span>}
              </div>
              {!untouched && (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-[11px] text-muted-foreground"><T>掌握度</T></div>
                      <div className="text-xl font-extrabold tabular-nums">{m.mastery_pct}%</div>
                      <div className="text-[11px] text-muted-foreground">
                        <T>掌握</T> {m.mastered_count} · <T>薄弱</T> {m.weak_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground"><T>完成度</T></div>
                      <div className="text-xl font-extrabold tabular-nums">{m.completion_pct}%</div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.module === "american"
                          ? <><T>已完成</T> {m.touched}/{m.scope_total} <T>课</T></>
                          : <>{m.touched}/{m.scope_total}</>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                    <span><T>本周</T> {fmtHM(m.minutes_7d)}</span>
                    <span><T>最近</T> {relTime(m.last_active_at)}</span>
                    {m.current_lesson && <span className="font-semibold text-foreground">📍 {m.current_lesson}</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* 错题按板块分组下钻 */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-extrabold"><T>🎯 错题(按板块)</T></h2>
        {counts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            <T>暂无未解决的错题 ✅</T>
          </div>
        ) : (
          <div className="space-y-2">
            {counts.map((c) => {
              const open = expanded === c.module;
              const rows = details[c.module] ?? [];
              return (
                <div key={c.module} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleModule(c.module)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40">
                    {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    <span className="font-bold"><T>{moduleLabel(c.module)}</T></span>
                    <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      {c.unresolved_count}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-border px-4 py-3">
                      {detailLoading === c.module ? (
                        <div className="flex items-center py-3 text-xs text-muted-foreground">
                          <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
                        </div>
                      ) : rows.length === 0 ? (
                        <div className="py-2 text-xs text-muted-foreground"><T>没有明细</T></div>
                      ) : (
                        <ul className="space-y-3">
                          {rows.map((mk) => (
                            <li key={mk.id} className="rounded-xl border border-border bg-background p-3">
                              <div className="text-sm font-semibold">{mk.question}</div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="text-rose-600 dark:text-rose-400">
                                  <T>你的答案</T>:{mk.user_answer ?? "—"}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  <T>正确</T>:{mk.correct_answer ?? "—"}
                                </span>
                                {mk.source_label && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{mk.source_label}</span>
                                )}
                                <span className="text-muted-foreground"><T>错</T> {mk.wrong_count} <T>次</T></span>
                              </div>
                              {mk.explanation && (
                                <details className="mt-1.5">
                                  <summary className="cursor-pointer text-[11px] text-primary"><T>解析</T></summary>
                                  <div className="mt-1 text-xs text-muted-foreground">{mk.explanation}</div>
                                </details>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
