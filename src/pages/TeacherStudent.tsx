import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Clock, ChevronDown, ChevronRight, Pencil } from "lucide-react";

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
type MistakeItem = {
  no: number | null;
  user_answer: string | null;
  correct_answer?: string | null;
  options?: Record<string, string | null>;
  explanation?: string | null;
};
type Mistake = {
  id: string;
  kind: "plain" | "cloze" | "reading";
  module: string;
  title: string | null;
  question: string | null;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  snapshot: unknown;
  items: MistakeItem[] | null;
  wrong_count: number;
  is_complete: boolean;
  last_wrong_at: string;
};
type ReviewItem = {
  no: number | null;
  stem?: string | null;
  options?: Record<string, string | null> | null;
  correct_answer?: string | null;
  user_answer?: string | null;
  is_correct?: boolean | null;
  wrong?: boolean;
  explanation?: string | null;
};
type PassageReview = {
  source: "reading" | "cloze";
  missing?: boolean;
  limited?: boolean;
  has_full_passage?: boolean;
  has_user_answers?: boolean;
  title?: string | null;
  body?: string | null;
  total?: number | null;
  wrong_count?: number;
  items?: ReviewItem[] | null;
};

const MODULE_META: Record<string, { label: string; emoji: string; tone: string }> = {
  primary:  { label: "小学",   emoji: "🎒", tone: "from-sky-500 to-cyan-500" },
  junior:   { label: "初中",   emoji: "📗", tone: "from-violet-500 to-indigo-500" },
  senior:   { label: "高中",   emoji: "📕", tone: "from-rose-500 to-orange-500" },
  american: { label: "新概念", emoji: "📘", tone: "from-fuchsia-500 to-pink-500" },
};
const MODULE_ORDER = ["primary", "junior", "senior", "american"];
// 错题分组标题:完形/阅读用中文,其余用板块名或原 module 值
const MISTAKE_GROUP_LABEL: Record<string, string> = {
  cloze: "完形填空", reading: "阅读理解",
  gaokao_grammar: "语法", card_quiz: "知识卡", listening: "听力",
  primary_lesson: "课程", primary_chat_quiz: "口语问答", ai_talk_target: "AI 对话",
};
const mistakeGroupLabel = (m: string) => MISTAKE_GROUP_LABEL[m] ?? MODULE_META[m]?.label ?? m;

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
  const st = (loc.state as { name?: string; displayName?: string; realName?: string; noteName?: string } | null);
  const originName = st?.displayName ?? st?.name ?? "";   // 账号原名(灰括号用)
  const realName = st?.realName ?? "";

  const [noteName, setNoteName] = useState(st?.noteName ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteVal, setNoteVal] = useState(st?.noteName ?? "");
  const [savingNote, setSavingNote] = useState(false);
  // 有效名 = 备注 > 代建真名 > 账号原名
  const effectiveName = noteName || realName || originName || "学生";
  const hasAlias = !!originName && effectiveName !== originName;

  async function saveNote() {
    if (!studentId) return;
    setSavingNote(true);
    const { error } = await rpc("set_student_note", { _student_id: studentId, _note_name: noteVal.trim() || null });
    setSavingNote(false);
    if (error) { toast.error(String((error as { message?: string })?.message ?? "保存失败")); return; }
    setNoteName(noteVal.trim());
    toast.success(noteVal.trim() ? t("备注已保存") : t("已清除备注"));
    setNoteOpen(false);
  }

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);
  // 懒加载的错题明细:module → rows
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Mistake[]>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  // 整篇下钻(第②层):按 `${source}:${passageId}` 缓存
  const [reviewOpen, setReviewOpen] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, PassageReview | null>>({});
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);

  // 仅完形:阅读整篇本轮不做(内容重灌换 id → 无可靠整篇),不调本 RPC
  async function togglePassage(source: "cloze", passageId: string) {
    const key = `${source}:${passageId}`;
    if (reviewOpen === key) { setReviewOpen(null); return; }
    setReviewOpen(key);
    if (reviews[key] === undefined) {
      setReviewLoading(key);
      const { data } = await rpc("get_teacher_student_passage_review", {
        _student_id: studentId, _source: source, _passage_id: passageId,
      });
      setReviews((r) => ({ ...r, [key]: (data ?? null) as PassageReview | null }));
      setReviewLoading(null);
    }
  }

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
        title={`👤 ${effectiveName}`}
        subtitle="学习进度只读视图"
        back={`/teacher/class/${classId}`} />

      {/* 备注名条:有效名(原名) + 铅笔改备注 */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-semibold">{effectiveName}</span>
        {hasAlias && <span className="text-xs text-muted-foreground">({originName})</span>}
        <button
          type="button"
          onClick={() => { setNoteVal(noteName); setNoteOpen(true); }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-primary hover:border-primary transition"
          aria-label={t("备注名")}>
          <Pencil className="size-3.5" /> <T>{noteName ? "改备注" : "加备注"}</T>
        </button>
      </div>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ <T>备注名</T></DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ts-note" className="text-xs"><T>只有你看得到，不改学生账号</T></Label>
            <Input id="ts-note" value={noteVal} maxLength={40}
              onChange={(e) => setNoteVal(e.target.value)} placeholder={originName || t("如：李明")} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && !savingNote) saveNote(); }} />
            <p className="text-[11px] text-muted-foreground">
              <T>账号原名</T> <span className="font-mono">{originName || "—"}</span>
              <T>。留空则清除备注，回退原名。</T>
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteOpen(false)} disabled={savingNote}><T>取消</T></Button>
            <Button onClick={saveNote} disabled={savingNote}>
              {savingNote ? <Loader2 className="size-4 animate-spin" /> : <T>保存</T>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {/* american 有真语料总量 → 掌握度 + 完成度 两个指标(含义不同);
                      primary/junior/senior 无语料总量 → 只留掌握度(避免与"练过里掌握率"重复) */}
                  <div className={`mt-3 grid gap-2 text-sm ${m.module === "american" ? "grid-cols-2" : "grid-cols-1"}`}>
                    <div>
                      <div className="text-[11px] text-muted-foreground"><T>掌握度</T></div>
                      <div className="text-xl font-extrabold tabular-nums">{m.mastery_pct}%</div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.module === "american"
                          ? <><T>已掌握</T> {m.mastered_count} · <T>薄弱</T> {m.weak_count}<T>(按已练项)</T></>
                          : <><T>已掌握</T> {m.mastered_count} / <T>已学</T> {m.scope_total} · <T>薄弱</T> {m.weak_count}</>}
                      </div>
                    </div>
                    {m.module === "american" && (
                      <div>
                        <div className="text-[11px] text-muted-foreground"><T>完成度</T></div>
                        <div className="text-xl font-extrabold tabular-nums">{m.completion_pct}%</div>
                        <div className="text-[11px] text-muted-foreground">
                          <T>已完成</T> {m.touched}/{m.scope_total} <T>课</T>
                        </div>
                      </div>
                    )}
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
                    <span className="font-bold"><T>{mistakeGroupLabel(c.module)}</T></span>
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
                            <li key={`${mk.kind}-${mk.id}`} className="rounded-xl border border-border bg-background p-3">
                              {mk.kind === "plain" ? (
                                <>
                                  <div className="text-sm font-semibold">
                                    {mk.question || <span className="italic text-muted-foreground"><T>（无题目快照）</T></span>}
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                    <span className="text-rose-600 dark:text-rose-400"><T>你的答案</T>:{mk.user_answer ?? "—"}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400"><T>正确</T>:{mk.correct_answer ?? "—"}</span>
                                    {mk.title && <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{mk.title}</span>}
                                    <span className="text-muted-foreground"><T>错</T> {mk.wrong_count} <T>次</T></span>
                                  </div>
                                  {mk.explanation && (
                                    <details className="mt-1.5">
                                      <summary className="cursor-pointer text-[11px] text-primary"><T>解析</T></summary>
                                      <div className="mt-1 text-xs text-muted-foreground">{mk.explanation}</div>
                                    </details>
                                  )}
                                </>
                              ) : mk.kind === "cloze" ? (
                                <>
                                  {/* 完形:按篇。点"查看整篇"→ get_teacher_student_passage_review 读 snapshot 错空 */}
                                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                    <span>{mk.title || t("完形一篇")}</span>
                                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                      <T>错</T> {mk.wrong_count} <T>空</T>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => togglePassage("cloze", mk.id)}
                                      className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] font-normal text-primary hover:bg-muted/50">
                                      📖 <T>查看整篇</T> {reviewOpen === `cloze:${mk.id}` ? "▴" : "▾"}
                                    </button>
                                  </div>
                                  {reviewOpen === `cloze:${mk.id}` && (
                                    <div className="mt-2">
                                      {reviewLoading === `cloze:${mk.id}` ? (
                                        <div className="flex items-center py-2 text-xs text-muted-foreground">
                                          <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
                                        </div>
                                      ) : reviews[`cloze:${mk.id}`]?.missing ? (
                                        <div className="text-xs text-muted-foreground"><T>原题已删除,无法显示整篇。</T></div>
                                      ) : reviews[`cloze:${mk.id}`] ? (
                                        <PassageReviewPanel rv={reviews[`cloze:${mk.id}`]!} />
                                      ) : (
                                        <div className="text-xs text-muted-foreground"><T>无法加载整篇。</T></div>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* 阅读:整篇快照与内容表对不上(内容重灌换 id / 题序错位),不 join、不拼错。
                                      仅保留第①层按篇聚合 + 可得的学生作答,整篇老实标注"暂不可用"。 */}
                                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                    <span>{mk.title || t("阅读一篇")}</span>
                                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                      <T>错</T> {mk.wrong_count} <T>题</T>
                                    </span>
                                  </div>
                                  {mk.items && mk.items.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-xs">
                                      {mk.items.map((it, idx) => (
                                        <li key={idx} className="flex flex-wrap items-center gap-x-3 rounded-lg border border-border px-2 py-1">
                                          <span className="font-semibold"><T>第</T> {it.no ?? idx + 1} <T>题</T></span>
                                          <span className="text-rose-600 dark:text-rose-400">
                                            <T>学生作答</T>:{it.user_answer ?? <span className="italic"><T>未记录</T></span>}
                                          </span>
                                          {it.correct_answer != null && (
                                            <span className="text-emerald-600 dark:text-emerald-400"><T>正确</T>:{it.correct_answer}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] italic text-muted-foreground">
                                    📖 <T>整篇原文暂不可用(该题型完整快照待补)</T>
                                  </div>
                                </>
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

// 整篇下钻面板:阅读=全文+全部题+作答标红/正确标绿;完形=错空列表(无全文,老实标注)
function PassageReviewPanel({ rv }: { rv: PassageReview }) {
  const unit = rv.source === "cloze" ? "空" : "题";
  const items = rv.items ?? [];
  return (
    <div className="space-y-3">
      {rv.limited && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ <T>完形仅记录做错的空,没有整篇原文与做对的空的快照(待后续改写入补全)。以下为该生做错的空:</T>
        </div>
      )}
      {rv.body && (
        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
          {rv.body}
        </div>
      )}
      <ol className="space-y-2">
        {items.map((it, idx) => {
          const opts = it.options
            ? Object.entries(it.options).filter(([, v]) => v != null).sort(([a], [b]) => a.localeCompare(b))
            : [];
          return (
            <li key={idx} className="rounded-lg border border-border p-2 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span><T>第</T> {it.no ?? idx + 1} <T>{unit}</T></span>
                {it.wrong
                  ? <span className="text-rose-600 dark:text-rose-400">🔴 <T>错</T></span>
                  : it.is_correct ? <span className="text-emerald-600 dark:text-emerald-400">✅</span> : null}
              </div>
              {it.stem && <div className="mt-1">{it.stem}</div>}
              {opts.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {opts.map(([L, txt]) => {
                    const isCorrect = it.correct_answer === L;
                    const isPicked = it.user_answer === L;
                    const cls = isCorrect
                      ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                      : (isPicked && it.wrong) ? "text-rose-600 dark:text-rose-400 line-through"
                      : "text-muted-foreground";
                    return (
                      <li key={L} className={cls}>
                        {L}. {txt}
                        {isCorrect && <span className="ml-1">✓</span>}
                        {isPicked && !isCorrect && <span className="ml-1"><T>(学生选)</T></span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400"><T>正确</T>:{it.correct_answer ?? "—"}</span>
                <span className="text-muted-foreground">
                  <T>学生作答</T>:{it.user_answer ?? <span className="italic"><T>未记录</T></span>}
                </span>
              </div>
              {it.explanation && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-primary"><T>解析</T></summary>
                  <div className="mt-1 text-muted-foreground">{it.explanation}</div>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
