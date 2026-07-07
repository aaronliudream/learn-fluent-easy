import { T, useT } from "@/i18n/T";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Users, AlertTriangle, TrendingUp, GraduationCap, Sparkles, ArchiveRestore, GripVertical, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TeacherCards from "@/pages/TeacherCards";

/**
 * Teacher hub — entry point for the multi-student oversight feature.
 *
 *   Tab 1  🏫 我的班级       — list of classes I teach + class cards
 *   Tab 2  📇 我的卡片       — re-uses the existing TeacherCards page
 *   Tab 3  📋 作业 (Phase D) — placeholder
 *   Tab 4  ⚙️ 设置          — minimal settings stub
 *
 * Schema: classes, class_members (added in migration 20260521120000_teacher_classes.sql).
 * RPCs:   get_my_teacher_classes(), create_class(name, stage, description).
 */

type ClassRow = {
  id: string;
  name: string;
  stage: "primary" | "junior" | "senior" | "mixed";
  join_code: string;
  archived_at: string | null;
  created_at: string;
  student_count: number;
  active_this_week: number;
  weak_student_count: number;
  last_activity_at: string | null;
};

// 回收站行(get_my_trashed_classes 返回,列比 ClassRow 少)
type TrashedRow = {
  id: string;
  name: string;
  stage: "primary" | "junior" | "senior" | "mixed";
  join_code: string;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  student_count: number;
};

// 每位老师活跃班上限（后端 enforce_class_limit 触发器 + create_class/restore_class RPC 同步为此值）。
// 前端只做友好提示，硬保证在后端。以后改上限：这里 + 两个 RPC 一起改。
const MAX_CLASSES = 10;

const STAGE_META: Record<ClassRow["stage"], { label: string; gradient: string }> = {
  primary: { label: "小学 / Primary",  gradient: "from-sky-500 to-cyan-500" },
  junior:  { label: "初中 / Junior",   gradient: "from-violet-500 to-indigo-500" },
  senior:  { label: "高中 / Senior",   gradient: "from-rose-500 to-orange-500" },
  mixed:   { label: "混合 / Mixed",    gradient: "from-fuchsia-500 to-pink-500" },
};

export default function Teacher() {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [trashed, setTrashed] = useState<TrashedRow[]>([]);
  const [creating, setCreating] = useState(false);

  async function reload() {
    setLoading(true);
    const [{ data, error }, { data: td }] = await Promise.all([
      supabase.rpc("get_my_teacher_classes"),
      supabase.rpc("get_my_trashed_classes"),
    ]);
    if (!error && data) setClasses(data as ClassRow[]);
    setTrashed((td ?? []) as TrashedRow[]);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      await reload();
    })();
  }, []);

  // 拖拽排序传感器：桌面鼠标(移 6px 才拖，轻点仍进班)；手机触摸(长按 200ms 才拖，
  // 之前滑动照常滚页面)。手柄本身 touch-none，与页面滚动不打架。
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  /* ── Auth gate ───────────────────────────────────────── */
  if (authed === false) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 text-center">
        <PageHeader title="👨‍🏫 老师中心" subtitle="管理班级与学生" back="/" />
        <p className="mt-6 text-sm text-muted-foreground"><T>登录后查看你的班级</T></p>
        <Button className="mt-4" onClick={() => navigate("/auth?redirect=/teacher")}><T>登录</T></Button>
      </main>
    );
  }

  /* ── Derived stats for hero ─────────────────────────── */
  const activeClasses = classes.filter((c) => !c.archived_at);
  const archivedClasses = classes.filter((c) => c.archived_at);
  const totalStudents = activeClasses.reduce((s, c) => s + c.student_count, 0);
  const totalActive   = activeClasses.reduce((s, c) => s + c.active_this_week, 0);
  const totalWeak     = activeClasses.reduce((s, c) => s + c.weak_student_count, 0);
  const avgActive     = totalStudents > 0
    ? Math.round((totalActive / totalStudents) * 100)
    : 0;

  // 拖完：本地乐观重排 → 调 reorder_classes 落库 → 失败则 reload 回滚。
  async function handleReorder(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = activeClasses.findIndex((c) => c.id === active.id);
    const newIndex = activeClasses.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newActive = arrayMove(activeClasses, oldIndex, newIndex);
    setClasses([...newActive, ...archivedClasses]);           // 乐观：活跃区重排，归档区不动
    const { error } = await supabase.rpc("reorder_classes", { _ids: newActive.map((c) => c.id) });
    if (error) { toast.error(error.message); reload(); }      // 回滚到服务端真相
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <PageHeader title="👨‍🏫 老师中心" subtitle="管理班级、关注学生、推送讲解" back="/" />

      {/* ── HERO — class-portfolio overview ─────────────── */}
      <section
        className="relative mt-5 overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-[0_18px_40px_-14px_rgba(237,63,140,0.45)]"
        style={{ backgroundImage: "linear-gradient(135deg,#7B3FF1 0%,#ED3F8C 55%,#F47C45 100%)" }}>
        <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/15 blur-xl" aria-hidden />
        <div className="pointer-events-none absolute right-8 top-6 size-24 rounded-full bg-white/25" aria-hidden />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-85">老师中心</div>
            <div className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">
              👨‍🏫 <T>欢迎回来！</T>
            </div>
            <div className="mt-1 text-sm opacity-90">
              {activeClasses.length > 0
                ? <><T>你正在带</T> <b className="tabular-nums">{activeClasses.length}</b> <T>个班级 · 共</T> <b className="tabular-nums">{totalStudents}</b> <T>名学生</T></>
                : <T>还没有班级，点击「新建班级」开始</T>}
            </div>
          </div>
          <CreateClassButton count={activeClasses.length} onCreated={(c) => { setCreating(false); reload(); navigate(`/teacher/class/${c.id}`); }} open={creating} onOpenChange={setCreating} />
        </div>

        <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <HeroStat emoji="🏫" value={activeClasses.length}  label="班级" />
          <HeroStat emoji="👥" value={totalStudents}         label="学生" />
          <HeroStat emoji="📈" value={`${avgActive}%`}        label="本周活跃率" />
          <HeroStat emoji="⚠️" value={totalWeak}              label="需关注学生" tone={totalWeak > 0 ? "alert" : "ok"} />
        </div>
      </section>

      {/* ── TABS ───────────────────────────────────────── */}
      <Tabs defaultValue="classes" className="mt-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="classes"><T>🏫 我的班级</T></TabsTrigger>
          <TabsTrigger value="cards"><T>📇 我的卡片</T></TabsTrigger>
          <TabsTrigger value="assignments"><T>📋 作业</T></TabsTrigger>
          <TabsTrigger value="settings"><T>⚙️ 设置</T></TabsTrigger>
        </TabsList>

        {/* ───────── CLASSES ───────── */}
        <TabsContent value="classes" className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
            </div>
          ) : activeClasses.length === 0 ? (
            <EmptyClasses onCreate={() => setCreating(true)} />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
              <SortableContext items={activeClasses.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeClasses.map((c) => <ClassCard key={c.id} c={c} />)}
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="grid place-items-center gap-2 rounded-3xl border-2 border-dashed border-border bg-card p-6 text-center transition hover:border-primary hover:bg-muted/40">
                    <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
                      <Plus className="size-6 text-primary" />
                    </div>
                    <div className="text-sm font-extrabold"><T>新建班级</T></div>
                    <div className="text-xs text-muted-foreground">
                      <T>生成 8 位邀请码，学生输入即可加入</T>
                    </div>
                  </button>
                </div>
              </SortableContext>
            </DndContext>
          )}

          {archivedClasses.length > 0 && (
            <ArchivedClasses list={archivedClasses} activeCount={activeClasses.length} onChange={reload} />
          )}

          {trashed.length > 0 && <TrashedClasses list={trashed} onChange={reload} />}
        </TabsContent>

        {/* ───────── CARDS — re-uses the existing TeacherCards page ───────── */}
        <TabsContent value="cards" className="mt-5">
          <div className="rounded-3xl border-2 border-border bg-card p-1 md:p-3">
            <TeacherCards />
          </div>
        </TabsContent>

        {/* ───────── ASSIGNMENTS (Phase D placeholder) ───────── */}
        <TabsContent value="assignments" className="mt-5">
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
            <div className="text-5xl">📋</div>
            <div className="mt-2 text-lg font-extrabold"><T>作业功能 · 即将开放</T></div>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              <T>很快可以向班级推送知识卡 / 阅读 / 听力作业，并跟踪完成情况。本阶段先开放班级管理与学生总览。</T>
            </p>
          </div>
        </TabsContent>

        {/* ───────── SETTINGS ───────── */}
        <TabsContent value="settings" className="mt-5">
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
              <h3 className="text-base font-extrabold mb-2"><T>📧 邮件通知</T></h3>
              <p className="text-sm text-muted-foreground">
                <T>每周班级进度摘要邮件 · 学生加入提醒 · 错题集中告警（即将开放）</T>
              </p>
            </div>
            <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
              <h3 className="text-base font-extrabold mb-2"><T>📤 导出报告</T></h3>
              <p className="text-sm text-muted-foreground">
                <T>从单个班级页面可导出 PDF 报告。整老师维度的统一报告即将开放。</T>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

/* ──────────────────────────────────────────────────────── */
function HeroStat({ emoji, value, label, tone = "ok" }:
  { emoji: string; value: number | string; label: string; tone?: "ok" | "alert" }) {
  return (
    <div className={`rounded-xl bg-white/15 backdrop-blur px-3 py-3 ${tone === "alert" ? "ring-1 ring-rose-200/50" : ""}`}>
      <div className="text-2xl mb-1 leading-none">{emoji}</div>
      <div className="text-2xl font-extrabold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] opacity-85 uppercase tracking-wider mt-1"><T>{label}</T></div>
    </div>
  );
}

function ClassCard({ c }: { c: ClassRow }) {
  const t = useT();
  const meta = STAGE_META[c.stage];
  const lastActive = c.last_activity_at ? relTime(c.last_activity_at) : "—";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? "shadow-2xl" : ""}`}>
      {/* 拖动手柄：只有它带 dnd listeners + touch-none；轻点卡片其余部分仍进班 */}
      <button
        type="button"
        aria-label={t("拖动排序")}
        {...attributes}
        {...listeners}
        onClick={(e) => e.preventDefault()}
        className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-lg bg-muted/80 text-muted-foreground touch-none cursor-grab active:cursor-grabbing hover:bg-muted">
        <GripVertical className="size-4" />
      </button>
      <Link
        to={`/teacher/class/${c.id}`}
        className="group block rounded-3xl border-2 border-border bg-card shadow-tile hover:-translate-y-0.5 transition overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${meta.gradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 pr-8">
            <h3 className="font-extrabold text-base leading-tight"><T>{c.name}</T></h3>
            <span className="font-mono text-[10px] tabular-nums rounded bg-muted px-1.5 py-0.5 shrink-0">{c.join_code}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground"><T>{meta.label}</T></div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat n={c.student_count}      label="学生" />
            <Stat n={c.active_this_week}   label="本周活跃" tone="text-emerald-600 dark:text-emerald-400" />
            <Stat n={c.weak_student_count} label="需关注"  tone={c.weak_student_count > 0 ? "text-rose-600 dark:text-rose-400" : ""} />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">⏱ <T>最近活跃</T>: {lastActive}</span>
            <span className="text-primary font-bold group-hover:translate-x-0.5 transition"><T>进入</T> →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function ArchivedClasses({ list, activeCount, onChange }: { list: ClassRow[]; activeCount: number; onChange: () => void }) {
  const t = useT();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const atLimit = activeCount >= MAX_CLASSES;
  const limitMsg = t(`活跃班已满 ${MAX_CLASSES} 个，请先归档一个再恢复此班`);

  async function restore(c: ClassRow) {
    if (atLimit) { toast.error(limitMsg); return; }
    setRestoringId(c.id);
    // 后端 restore_class 会硬校验归属 + 班级上限，前端拦截只是提前给友好提示
    const { error } = await supabase.rpc("restore_class", { _class_id: c.id });
    setRestoringId(null);
    if (error) toast.error(error.message);
    else { toast.success(t("已恢复为活跃班")); onChange(); }
  }

  return (
    <details className="mt-6 rounded-2xl border border-border bg-muted/30">
      <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-bold text-muted-foreground flex items-center gap-2">
        <span>🗄</span>
        <span><T>已归档班级</T> · {list.length}</span>
        <span className="ml-auto text-[11px] font-normal"><T>只读存档 · 可恢复</T> ▾</span>
      </summary>
      <ul className="px-3 pb-3 space-y-2">
        {list.map((c) => {
          const meta = STAGE_META[c.stage];
          return (
            <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <Link to={`/teacher/class/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1 transition hover:opacity-80">
                <span className="text-lg shrink-0">🗄</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate"><T>{c.name}</T></div>
                  <div className="text-[11px] text-muted-foreground">
                    <T>{meta.label}</T> · <T>归档于</T> {c.archived_at ? relTime(c.archived_at) : "—"} · {c.student_count} <T>名学生</T>
                  </div>
                </div>
              </Link>
              <Button
                variant="outline" size="sm" className="shrink-0"
                onClick={() => restore(c)}
                disabled={restoringId === c.id || atLimit}
                title={atLimit ? limitMsg : undefined}>
                {restoringId === c.id
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <><ArchiveRestore className="mr-1 size-3.5" /> <T>恢复</T></>}
              </Button>
            </li>
          );
        })}
      </ul>
      {atLimit && (
        <p className="px-4 pb-3 text-[11px] text-amber-600 dark:text-amber-400">
          ⚠️ {t(`活跃班已满 ${MAX_CLASSES} 个，需先归档一个才能恢复这里的班级。`)}
        </p>
      )}
    </details>
  );
}

function TrashedClasses({ list, onChange }: { list: TrashedRow[]; onChange: () => void }) {
  const t = useT();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<TrashedRow | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [purging, setPurging] = useState(false);

  const nameMatches = !!purgeTarget && confirmName.trim() === purgeTarget.name;

  async function restore(c: TrashedRow) {
    setBusyId(c.id);
    // 归属 + 10 班上限硬校验在 restore_class_from_trash 里;满则返回中文异常
    const { error } = await supabase.rpc("restore_class_from_trash", { _class_id: c.id });
    setBusyId(null);
    if (error) toast.error(error.message);
    else { toast.success(t("已从回收站恢复")); onChange(); }
  }

  async function confirmPurge() {
    if (!purgeTarget || !nameMatches) return;
    setPurging(true);
    const { error } = await supabase.rpc("purge_class", { _class_id: purgeTarget.id });
    setPurging(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("已彻底删除"));
    setPurgeTarget(null);
    setConfirmName("");
    onChange();
  }

  function closeDialog() { setPurgeTarget(null); setConfirmName(""); }

  return (
    <details className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-500/10">
      <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
        <span>🗑</span>
        <span><T>回收站</T> · {list.length}</span>
        <span className="ml-auto text-[11px] font-normal"><T>可恢复 · 或彻底删除</T> ▾</span>
      </summary>
      <ul className="px-3 pb-3 space-y-2">
        {list.map((c) => {
          const meta = STAGE_META[c.stage];
          return (
            <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <span className="text-lg shrink-0">🗑</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate"><T>{c.name}</T></div>
                <div className="text-[11px] text-muted-foreground">
                  <T>{meta.label}</T> · <T>删除于</T> {c.deleted_at ? relTime(c.deleted_at) : "—"} · {c.student_count} <T>名学生</T>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0"
                onClick={() => restore(c)} disabled={busyId === c.id}>
                {busyId === c.id
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <><RotateCcw className="mr-1 size-3.5" /> <T>恢复</T></>}
              </Button>
              <Button variant="ghost" size="sm"
                className="shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                onClick={() => { setPurgeTarget(c); setConfirmName(""); }}>
                <Trash2 className="mr-1 size-3.5" /> <T>彻底删除</T>
              </Button>
            </li>
          );
        })}
      </ul>

      {/* 彻底删除：必须手打班名才能删,最防误删 */}
      <Dialog open={!!purgeTarget} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🗑 <T>彻底删除班级</T></DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <T>此操作不可逆：将永久删除该班级及所有学生的入班关系。学生账号本身不受影响，仍可登录、可再加入别的班。</T>
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
              <T>请输入班级名称</T> <b>{purgeTarget?.name}</b> <T>以确认：</T>
            </div>
            <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
              placeholder={purgeTarget?.name} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && nameMatches && !purging) confirmPurge(); }} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} disabled={purging}><T>取消</T></Button>
            <Button variant="destructive" onClick={confirmPurge} disabled={purging || !nameMatches}>
              {purging && <Loader2 className="mr-1 size-4 animate-spin" />}
              <T>彻底删除</T>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </details>
  );
}

function Stat({ n, label, tone = "" }: { n: number; label: string; tone?: string }) {
  return (
    <div>
      <div className={`text-lg font-extrabold tabular-nums ${tone}`}>{n.toLocaleString()}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider"><T>{label}</T></div>
    </div>
  );
}

function EmptyClasses({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-pink-50 p-10 text-center dark:from-violet-500/10 dark:to-pink-500/10">
      <div className="text-5xl">🏫</div>
      <div className="mt-2 text-xl font-extrabold"><T>还没有班级</T></div>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        <T>创建第一个班级，系统会自动生成 8 位邀请码，学生在自己的设置里输入即可加入。</T>
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="mr-1 size-4" /> <T>新建班级</T>
      </Button>
    </div>
  );
}

/* ── Create-class modal ───────────────────────────────── */
function CreateClassButton({
  open, onOpenChange, onCreated, count,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (cls: { id: string }) => void;
  count: number;
}) {
  const t = useT();
  const atLimit = count >= MAX_CLASSES;
  const [name, setName] = useState("");
  const [stage, setStage] = useState<"primary" | "junior" | "senior" | "mixed">("mixed");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!name.trim()) { setErr("请输入班级名称"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("create_class", {
      _name: name.trim(),
      _stage: stage,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setName("");
    setStage("mixed");
    onCreated(data as { id: string });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          disabled={atLimit}
          title={atLimit ? t(`班级数已达上限 ${MAX_CLASSES} 个，请先归档一个再新建`) : undefined}
          className="rounded-full bg-white/95 text-foreground text-sm font-bold px-4 py-2 hover:bg-white inline-flex items-center gap-1.5 disabled:opacity-60 disabled:hover:bg-white/95">
          <Plus className="size-4" /> <T>新建班级</T>
          <span className="text-[11px] font-normal opacity-70 tabular-nums">{count} / {MAX_CLASSES}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><T>🏫 新建班级</T></DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="class-name"><T>班级名称</T></Label>
            <Input
              id="class-name"
              placeholder="例如：高三(1)班 · 高考冲刺"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80} />
          </div>
          <div>
            <Label><T>学段</T></Label>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {(["primary", "junior", "senior", "mixed"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStage(s)}
                  className={`rounded-lg border-2 py-1.5 text-xs font-bold transition ${
                    stage === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40"
                  }`}>
                  <T>{STAGE_META[s].label.split(" / ")[0]}</T>
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground"><T>跨年级班可选「混合」</T></p>
          </div>
          {err && <p className="text-xs text-rose-600 dark:text-rose-400"><T>{err}</T></p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}><T>取消</T></Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-1 size-4 animate-spin" />}
            <T>创建班级</T>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── helpers ──────────────────────────────────────────── */
function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (Number.isNaN(diff) || diff < 0) return "—";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "刚刚" : `${mins} 分钟前`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "昨天";
  if (days < 7)   return `${days} 天前`;
  return `${Math.round(days / 7)} 周前`;
}
