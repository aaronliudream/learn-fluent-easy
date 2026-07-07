import { T, useT } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, AlertTriangle, RefreshCw, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProvisionedStudents } from "@/components/teacher/ProvisionedStudents";

/**
 * Single-class detail page.
 *
 * Header     join-code chip + 4 KPI tiles
 * Tabs       👥 学生 (roster)
 *            🎯 班级薄弱点
 *            📊 整体能力
 *            ⚙️ 班级设置
 *
 * Data       RPCs added in 20260521120000_teacher_classes.sql:
 *              - get_class_students(class_id)
 *              - get_class_weakness(class_id, limit)
 *            Plus a direct read of classes (RLS allows teacher).
 */

type ClassRow = {
  id: string;
  name: string;
  stage: "primary" | "junior" | "senior" | "mixed";
  join_code: string;
  description: string | null;
  archived_at: string | null;
  created_at: string;
};
type Student = {
  member_id: string;
  display_name: string | null;
  role: "student" | "parent";
  joined_at: string;
  weekly_minutes: number;
  active_days_last_7: number;
  unresolved_weak_count: number;
  last_active_at: string | null;
};
type WeaknessRow = {
  module: string;
  source_label: string;
  affected_students: number;
  total_wrong_count: number;
};

const STAGE_META = {
  primary: { label: "小学",       gradient: "from-sky-500 to-cyan-500"      },
  junior:  { label: "初中",       gradient: "from-violet-500 to-indigo-500" },
  senior:  { label: "高中",       gradient: "from-rose-500 to-orange-500"   },
  mixed:   { label: "混合年级",    gradient: "from-fuchsia-500 to-pink-500"  },
} as const;

const MODULE_LABEL: Record<string, string> = {
  vocab: "单词", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读", lesson: "课程",
};

export default function TeacherClass() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cls, setCls] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [weakness, setWeakness] = useState<WeaknessRow[]>([]);
  const [sort, setSort] = useState<"recent" | "mastery" | "weak">("recent");
  const [query, setQuery] = useState("");
  const [restoring, setRestoring] = useState(false);

  async function restoreClass() {
    if (!id) return;
    setRestoring(true);
    // restore_class 后端硬校验归属 + 班级上限；满则返回中文异常，直接透传给用户。
    const { error } = await supabase.rpc("restore_class", { _class_id: id });
    setRestoring(false);
    if (error) toast.error(error.message);
    else { toast.success(t("已恢复为活跃班")); loadAll(); }
  }

  async function loadAll() {
    if (!id) return;
    setLoading(true);

    // 取班级走列表页同款 RPC get_my_teacher_classes（SECURITY DEFINER + auth.uid()），
    // 从中挑出当前班级 → 与列表页口径完全一致，绕开直查 classes 的会话/RLS 问题。
    const { data: myClasses } = await supabase.rpc("get_my_teacher_classes");
    const rpcRow = (Array.isArray(myClasses) ? myClasses : []).find(
      (c: { id: string }) => c.id === id,
    ) as (ClassRow & Record<string, unknown>) | undefined;

    const [stuR, wkR] = await Promise.all([
      supabase.rpc("get_class_students", { _class_id: id }),
      supabase.rpc("get_class_weakness", { _class_id: id, _limit: 10 }),
    ]);

    // 映射成 ClassRow（RPC 不返回 description，置 null，渲染未用到）。
    const resolved: ClassRow | null = rpcRow
      ? {
          id: rpcRow.id,
          name: rpcRow.name,
          stage: rpcRow.stage,
          join_code: rpcRow.join_code,
          description: null,
          archived_at: rpcRow.archived_at,
          created_at: rpcRow.created_at,
        }
      : null;
    setCls(resolved);
    if (!stuR.error) setStudents((stuR.data ?? []) as Student[]);
    if (!wkR.error) setWeakness((wkR.data ?? []) as WeaknessRow[]);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, [id]);

  /* ── Derived ─────────────────────────────────────────── */
  const activeStudents = useMemo(
    () => students.filter((s) => s.role === "student"),
    [students]
  );
  const activeWeek = activeStudents.filter((s) => s.weekly_minutes > 0).length;
  const weekMinutes = activeStudents.reduce((s, x) => s + x.weekly_minutes, 0);
  const weakStudents = activeStudents.filter((s) => s.unresolved_weak_count >= 3).length;
  const avgWeekMins = activeStudents.length > 0 ? Math.round(weekMinutes / activeStudents.length) : 0;

  const filteredSorted = useMemo(() => {
    let rows = activeStudents.filter((s) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (s.display_name ?? "").toLowerCase().includes(q);
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "recent") {
        const ta = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
        const tb = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
        return tb - ta;
      }
      if (sort === "mastery") return b.weekly_minutes - a.weekly_minutes;
      return b.unresolved_weak_count - a.unresolved_weak_count;
    });
    return rows;
  }, [activeStudents, query, sort]);

  /* ── Loading / 404 gates ─────────────────────────────── */
  if (loading && !cls) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }
  if (!cls) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-center">
        <PageHeader title="班级未找到" back="/teacher" />
        <p className="mt-6 text-sm text-muted-foreground"><T>这个班级不存在，或你不是它的老师。</T></p>
        <Button className="mt-4" onClick={() => navigate("/teacher")}><T>返回老师中心</T></Button>
      </main>
    );
  }

  const meta = STAGE_META[cls.stage];
  const isArchived = !!cls.archived_at;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <PageHeader title={`🏫 ${cls.name}`} subtitle={`${meta.label} · 班级详情`} back="/teacher" />

      {/* ── HEADER — name + join code chip ─────────────── */}
      <section
        className={`relative mt-5 overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-tile bg-gradient-to-br ${meta.gradient}`}>
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-85 flex flex-wrap items-center gap-2">
              <T>班级详情</T>
              {isArchived && (
                <>
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-normal normal-case">
                    🗄 <T>已归档 · 只读</T>
                  </span>
                  <button
                    type="button"
                    onClick={restoreClass}
                    disabled={restoring}
                    className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold tracking-normal normal-case text-fuchsia-700 transition hover:bg-white disabled:opacity-60">
                    {restoring
                      ? <Loader2 className="size-3 animate-spin" />
                      : <ArchiveRestore className="size-3" />}
                    <T>恢复为活跃班</T>
                  </button>
                </>
              )}
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">🏫 <T>{cls.name}</T></div>
            <div className="mt-2 text-sm opacity-90 flex flex-wrap items-center gap-3">
              <span><b className="tabular-nums">{activeStudents.length}</b> <T>名学生</T></span>
              <span className="opacity-60">·</span>
              <span><b className="tabular-nums">{avgWeekMins}</b> <T>分/人/周 平均</T></span>
              {weakStudents > 0 && <>
                <span className="opacity-60">·</span>
                <span className="font-bold">⚠️ {weakStudents} <T>个需要关注</T></span>
              </>}
            </div>
          </div>
          <JoinCodeChip code={cls.join_code} />
        </div>
      </section>

      {/* ── 4 KPI tiles ────────────────────────────────── */}
      <section className="mt-5 grid gap-3 grid-cols-2 md:grid-cols-4">
        <Kpi label="本周活跃" value={`${activeWeek} / ${activeStudents.length}`}
             sub={activeStudents.length > 0 ? `${Math.round(activeWeek / activeStudents.length * 100)}% 活跃率` : "—"}
             tone="emerald" />
        <Kpi label="本周总学习" value={fmtHM(weekMinutes)} sub="累计学习时长" tone="emerald" />
        <Kpi label="平均周时长" value={`${avgWeekMins} 分钟`} sub="每位学生" />
        <Kpi label="需关注学生" value={weakStudents}
             sub={weakStudents > 0 ? "≥ 3 未解决错题" : "暂无"}
             tone={weakStudents > 0 ? "amber" : "ok"} />
      </section>

      {/* ── TABS ───────────────────────────────────────── */}
      <Tabs defaultValue="roster" className="mt-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="roster"><T>👥 学生</T> ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="weakness"><T>🎯 班级薄弱点</T></TabsTrigger>
          <TabsTrigger value="skills"><T>📊 整体能力</T></TabsTrigger>
          <TabsTrigger value="settings"><T>⚙️ 班级设置</T></TabsTrigger>
        </TabsList>

        {/* ───────── ROSTER ───────── */}
        <TabsContent value="roster" className="mt-5">
          {/* 代建学生账号（没有邮箱的学生，老师代建登录 ID + 密码）*/}
          <ProvisionedStudents classId={cls.id} readOnly={isArchived} />
          <div className="rounded-3xl border-2 border-border bg-card shadow-tile overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-muted/40">
              <div className="text-sm font-extrabold"><T>👥 学生名单</T></div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("🔍 搜索学生")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 w-40 text-xs" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-xs">
                  <option value="recent">排序：最近活跃</option>
                  <option value="mastery">排序：本周时长</option>
                  <option value="weak">排序：薄弱点数量</option>
                </select>
              </div>
            </div>
            {activeStudents.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                <T>还没有学生加入。把邀请码</T>
                <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{cls.join_code}</code>
                <T>分享给学生即可。</T>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-4"><T>学生</T></th>
                    <th className="text-right py-2"><T>本周时长</T></th>
                    <th className="text-right py-2"><T>活跃天</T></th>
                    <th className="text-right py-2"><T>薄弱</T></th>
                    <th className="text-right py-2 px-4"><T>最近活跃</T></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSorted.map((s) => <StudentRow key={s.member_id} s={s} classId={cls.id} />)}
                </tbody>
              </table>
            )}
            {filteredSorted.length > 0 && (
              <div className="px-5 py-3 text-xs text-muted-foreground border-t border-border bg-muted/30">
                <T>显示</T> {filteredSorted.length} / {activeStudents.length}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ───────── WEAKNESS ───────── */}
        <TabsContent value="weakness" className="mt-5">
          <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold"><T>🎯 班级共同薄弱点</T></h3>
              <span className="text-xs text-muted-foreground"><T>按错的人数排序 · Top 10</T></span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              <T>这些题目被多名学生错过 — 可以考虑在课堂上重点讲解。</T>
            </p>
            {weakness.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <div className="text-2xl">✨</div>
                <div className="mt-1 text-sm font-semibold"><T>暂无共同薄弱点</T></div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  <T>学生做更多题后，这里会出现班级层面的难点统计</T>
                </div>
              </div>
            ) : (
              <ol className="space-y-2">
                {weakness.map((w, i) => (
                  <li key={`${w.module}:${w.source_label}:${i}`}
                      className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/60 p-3 dark:border-orange-500/30 dark:bg-orange-500/10">
                    <span className="grid size-7 place-items-center rounded-lg bg-orange-200 text-orange-800 font-extrabold tabular-nums dark:bg-orange-500/30 dark:text-orange-100">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">
                        <span className="mr-2 inline-block rounded bg-rose-100 px-1.5 text-[10px] text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                          <T>{MODULE_LABEL[w.module] ?? w.module}</T>
                        </span>
                        <span className="truncate">{w.source_label}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                        {w.affected_students} <T>名学生错过 · 累计错</T> {w.total_wrong_count} <T>次</T>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        {/* ───────── SKILLS (placeholder for richer rollup) ───────── */}
        <TabsContent value="skills" className="mt-5">
          <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
            <h3 className="text-base font-extrabold mb-3"><T>📊 班级整体能力</T></h3>
            <p className="text-sm text-muted-foreground">
              <T>班级层面的能力雷达将在下一阶段开放（聚合每个学生的 mastery_with_proportions）。当前可在「学生」名单中点击单个学生查看个人成长报告。</T>
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Mini label="平均周时长" v={`${avgWeekMins} 分钟`} />
              <Mini label="活跃率"   v={activeStudents.length > 0 ? `${Math.round(activeWeek / activeStudents.length * 100)}%` : "—"} />
              <Mini label="错题总数" v={String(activeStudents.reduce((s, x) => s + x.unresolved_weak_count, 0))} />
              <Mini label="入班学生" v={String(activeStudents.length)} />
            </div>
          </div>
        </TabsContent>

        {/* ───────── SETTINGS ───────── */}
        <TabsContent value="settings" className="mt-5">
          <ClassSettings cls={cls} onChange={loadAll} readOnly={isArchived} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

/* ──────────────────────────────────────────────────────── */
function JoinCodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); }
    catch { /* no-op */ }
    setCopied(true);
    toast.success("已复制邀请码");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 min-w-[220px]">
      <div className="text-[10px] opacity-85 uppercase tracking-wider"><T>邀请码 · 学生输入即加入</T></div>
      <div className="mt-1 text-2xl font-extrabold tracking-widest tabular-nums font-mono">{code}</div>
      <button
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline opacity-90 hover:opacity-100">
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? <T>已复制</T> : <T>复制 · 分享</T>}
      </button>
    </div>
  );
}

function Kpi({ label, value, sub, tone = "ok" }:
  { label: string; value: number | string; sub?: string; tone?: "ok" | "emerald" | "amber" }) {
  const toneClass =
    tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
    tone === "amber"   ? "text-amber-600 dark:text-amber-400"     : "";
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="text-xs text-muted-foreground"><T>{label}</T></div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{value}</div>
      {sub && <div className={`text-[11px] font-bold mt-0.5 ${toneClass}`}><T>{sub}</T></div>}
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider"><T>{label}</T></div>
      <div className="text-lg font-extrabold tabular-nums mt-0.5">{v}</div>
    </div>
  );
}

function StudentRow({ s, classId }: { s: Student; classId: string }) {
  const initial = (s.display_name ?? "").charAt(0) || "?";
  const statusEmoji =
    s.weekly_minutes === 0 && s.unresolved_weak_count >= 5 ? "🔴" :
    s.unresolved_weak_count >= 5                            ? "⚠️" :
    s.weekly_minutes >= 60                                  ? "🌟" : "✓";
  const masteryTone =
    s.unresolved_weak_count >= 8 ? "text-rose-600 dark:text-rose-400" :
    s.unresolved_weak_count >= 3 ? "text-amber-600 dark:text-amber-400" :
                                   "text-emerald-600 dark:text-emerald-400";
  return (
    <tr className="border-t border-border hover:bg-muted/30 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {initial}
          </span>
          <Link
            to={`/teacher/class/${classId}/student/${s.member_id}`}
            state={{ name: s.display_name || "" }}
            className="font-semibold text-primary hover:underline">
            {s.display_name || "未命名"}
          </Link>
          <span>{statusEmoji}</span>
        </div>
      </td>
      <td className="text-right tabular-nums">{fmtHM(s.weekly_minutes)}</td>
      <td className="text-right tabular-nums">{s.active_days_last_7} / 7</td>
      <td className={`text-right tabular-nums font-bold ${masteryTone}`}>{s.unresolved_weak_count}</td>
      <td className="text-right text-[11px] text-muted-foreground px-4 tabular-nums">
        {s.last_active_at ? relTime(s.last_active_at) : "—"}
      </td>
    </tr>
  );
}

function ClassSettings({ cls, onChange, readOnly = false }: { cls: ClassRow; onChange: () => void; readOnly?: boolean }) {
  const t = useT();
  const [name, setName] = useState(cls.name);
  const [savingName, setSavingName] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [trashing, setTrashing] = useState(false);

  async function saveName() {
    if (name.trim() === cls.name || !name.trim()) return;
    setSavingName(true);
    const { error } = await supabase.from("classes").update({ name: name.trim() }).eq("id", cls.id);
    setSavingName(false);
    if (error) toast.error(error.message); else { toast.success("已保存"); onChange(); }
  }

  async function regenerateCode() {
    if (!confirm(t("确认重新生成邀请码？旧码立即失效。"))) return;
    setRegenBusy(true);
    const { data, error } = await supabase.rpc("gen_class_join_code");
    if (!error && data) {
      const { error: e2 } = await supabase.from("classes").update({ join_code: data as string }).eq("id", cls.id);
      if (e2) toast.error(e2.message); else { toast.success("邀请码已更新"); onChange(); }
    }
    setRegenBusy(false);
  }

  async function archive() {
    if (!confirm(t("确认归档此班级？学生仍可访问，但你不再看到此班级。"))) return;
    setArchiving(true);
    const { error } = await supabase.from("classes").update({ archived_at: new Date().toISOString() }).eq("id", cls.id);
    setArchiving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("已归档");
      window.location.href = "/teacher";
    }
  }

  async function trash() {
    if (!confirm(t("确认把此班级移入回收站？可在老师中心「回收站」里恢复，或输入班名彻底删除。"))) return;
    setTrashing(true);
    // trash_class 归属校验 teacher_id=auth.uid();仅软删(置 deleted_at),可恢复
    const { error } = await supabase.rpc("trash_class", { _class_id: cls.id });
    setTrashing(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("已移入回收站"));
      window.location.href = "/teacher";
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
        <h3 className="text-base font-extrabold mb-2"><T>✏️ 班级信息</T></h3>
        <div className="space-y-3">
          <div>
            <Label><T>班级名称</T></Label>
            <div className="mt-1 flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} disabled={readOnly} />
              {!readOnly && (
                <Button onClick={saveName} disabled={savingName || name.trim() === cls.name}>
                  {savingName ? <Loader2 className="size-4 animate-spin" /> : <T>保存</T>}
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label><T>学段</T></Label>
            <div className="mt-1 inline-block rounded-md bg-muted px-3 py-1.5 text-sm">
              {STAGE_META[cls.stage].label}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
        <h3 className="text-base font-extrabold mb-2"><T>🔑 邀请码</T></h3>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-muted px-3 py-2 font-mono text-lg tracking-widest">{cls.join_code}</code>
          {!readOnly && (
            <Button variant="outline" onClick={regenerateCode} disabled={regenBusy}>
              {regenBusy ? <Loader2 className="mr-1 size-4 animate-spin" /> : <RefreshCw className="mr-1 size-4" />}
              <T>重新生成</T>
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground"><T>重新生成后，旧邀请码立即失效，已加入的学生不受影响。</T></p>
      </div>

      {readOnly ? (
        <div className="rounded-3xl border-2 border-border bg-muted/30 p-5">
          <h3 className="text-base font-extrabold mb-2 text-muted-foreground"><T>🗄 已归档班级</T></h3>
          <p className="text-sm text-muted-foreground"><T>此班级已归档，仅供只读查看。学生仍能继续学习，其学习数据实时可查；如需恢复或修改，请从数据库操作。</T></p>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/40 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <h3 className="text-base font-extrabold mb-2 text-rose-700 dark:text-rose-300"><T>🗑 归档班级</T></h3>
          <p className="text-sm text-muted-foreground"><T>归档后学生仍能继续学习，但你不会在老师中心看到此班级。可以稍后从数据库手动恢复。</T></p>
          <Button variant="destructive" onClick={archive} disabled={archiving} className="mt-3">
            {archiving ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Archive className="mr-1 size-4" />}
            <T>归档此班级</T>
          </Button>
        </div>
      )}

      {/* 删除到回收站(与归档是两条独立的线;活跃/归档班都可删)*/}
      <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/40 p-5 dark:border-rose-500/40 dark:bg-rose-500/10">
        <h3 className="text-base font-extrabold mb-2 text-rose-700 dark:text-rose-300"><T>🗑 删除班级</T></h3>
        <p className="text-sm text-muted-foreground">
          <T>移入回收站（可恢复）。在老师中心「回收站」里可恢复，或手打班名彻底删除。彻底删除只清除班级与入班关系，学生账号本身不受影响、仍可登录并再加入别的班。</T>
        </p>
        <Button variant="destructive" onClick={trash} disabled={trashing} className="mt-3">
          {trashing ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Trash2 className="mr-1 size-4" />}
          <T>移入回收站</T>
        </Button>
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────── */
function fmtHM(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (Number.isNaN(diff) || diff < 0) return "—";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "刚刚" : `${mins} 分前`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "昨天";
  if (days < 7)   return `${days} 天前`;
  return `${Math.round(days / 7)} 周前`;
}
