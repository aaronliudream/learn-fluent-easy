import { T, useT } from "@/i18n/T";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, Loader2, LogOut, Plus } from "lucide-react";

/**
 * 学生 / 家长在 Account 页面看到的「我加入的班级」入口。
 *
 *   1. 输入老师给的 8 位邀请码（例如 ABCD-EFGH）→ join_class_by_code RPC
 *   2. 列出自己已加入的班级（通过 RLS 直接 SELECT class_members + classes）
 *   3. 每个班级可一键退出 → leave_class RPC（软删 removed_at）
 *
 * 完全依赖 20260521120000_teacher_classes.sql 这次 migration 提供的
 * RPC 与 RLS 策略。
 */

const STAGE_LABEL: Record<string, string> = {
  primary: "小学", junior: "初中", senior: "高中", mixed: "混合年级",
};
const STAGE_COLOR: Record<string, string> = {
  primary: "from-sky-500 to-cyan-500",
  junior:  "from-violet-500 to-indigo-500",
  senior:  "from-rose-500 to-orange-500",
  mixed:   "from-fuchsia-500 to-pink-500",
};

type Membership = {
  class_id: string;
  role: "student" | "parent";
  joined_at: string;
  class_name: string;
  class_stage: string;
  class_join_code: string;
};

export function MyClassesSection() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState<string | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<Membership | null>(null);

  async function reload() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) { setMemberships([]); setLoading(false); return; }

    // RLS lets a member SELECT their own class_members rows, and SELECT
    // the classes those rows reference. One query does both via PostgREST
    // relationship embedding.
    const { data, error } = await supabase
      .from("class_members")
      .select("class_id, role, joined_at, classes!inner(name, stage, join_code, archived_at)")
      .eq("member_id", uid)
      .is("removed_at", null)
      .order("joined_at", { ascending: false });

    if (error) {
      console.warn("classes load error", error);
      setMemberships([]); setLoading(false); return;
    }
    type Row = {
      class_id: string;
      role: "student" | "parent";
      joined_at: string;
      classes: { name: string; stage: string; join_code: string; archived_at: string | null } | null;
    };
    const rows = (data ?? []) as unknown as Row[];
    const list: Membership[] = rows
      .filter((r) => r.classes && !r.classes.archived_at)
      .map((r) => ({
        class_id: r.class_id,
        role: r.role,
        joined_at: r.joined_at,
        class_name: r.classes!.name,
        class_stage: r.classes!.stage,
        class_join_code: r.classes!.join_code,
      }));
    setMemberships(list);
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  /* ── Join via code ──────────────────────────────────── */
  function normalizeCode(input: string): string {
    // Strip whitespace, force uppercase, add dash after 4 chars if missing
    let v = input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
    if (v.length === 8 && !v.includes("-")) v = v.slice(0, 4) + "-" + v.slice(4);
    return v;
  }

  async function joinNow() {
    setJoinErr(null);
    const normalized = normalizeCode(code);
    if (!normalized || normalized.length < 8) {
      setJoinErr("请输入完整的 8 位邀请码（例如 ABCD-EFGH）");
      return;
    }
    setJoining(true);
    const { data, error } = await supabase.rpc("join_class_by_code", {
      _code: normalized,
      _role: "student",
    });
    setJoining(false);
    if (error) {
      const msg = mapJoinError(error.message);
      setJoinErr(msg);
      toast.error(msg);
      return;
    }
    setCode("");
    const cls = data as { name?: string } | null;
    toast.success(`已加入「${cls?.name ?? "班级"}」`);
    reload();
  }

  /* ── Leave class ────────────────────────────────────── */
  async function confirmLeave() {
    if (!leaveTarget) return;
    const { error } = await supabase.rpc("leave_class", { _class_id: leaveTarget.class_id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`已退出「${leaveTarget.class_name}」`);
      reload();
    }
    setLeaveTarget(null);
  }

  /* ── Render ─────────────────────────────────────────── */
  return (
    <section className="mb-6 rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-primary" />
        <h3 className="text-base font-bold"><T>我加入的班级</T></h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <T>找老师要 8 位邀请码（例如 ABCD-EFGH），输入即可加入班级。老师可看到你的学习进度。</T>
      </p>

      {/* JOIN INPUT */}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="class-code" className="text-xs"><T>输入邀请码</T></Label>
          <Input
            id="class-code"
            value={code}
            onChange={(e) => { setCode(e.target.value); setJoinErr(null); }}
            placeholder="ABCD-EFGH"
            className="mt-1 font-mono tracking-widest uppercase"
            maxLength={9}
            onKeyDown={(e) => { if (e.key === "Enter") joinNow(); }}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false} />
        </div>
        <Button onClick={joinNow} disabled={joining || !code.trim()}>
          {joining ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="mr-1 size-4" /> <T>加入</T></>}
        </Button>
      </div>
      {joinErr && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{joinErr}</p>}

      {/* MY CLASSES LIST */}
      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <T>已加入的班级</T> {memberships.length > 0 && `(${memberships.length})`}
        </div>

        {loading ? (
          <div className="flex items-center text-xs text-muted-foreground py-3">
            <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
          </div>
        ) : memberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
            <div className="text-2xl">📚</div>
            <div className="mt-1 text-sm font-semibold"><T>还没加入任何班级</T></div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              <T>加入老师创建的班级后，老师可以看到你的进度并推送讲解</T>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {memberships.map((m) => (
              <li
                key={m.class_id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${STAGE_COLOR[m.class_stage] ?? STAGE_COLOR.mixed} text-white shadow shrink-0`}>
                  <Users className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{m.class_name}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <span><T>{STAGE_LABEL[m.class_stage] ?? m.class_stage}</T></span>
                    <span>·</span>
                    <span><T>{m.role === "parent" ? "家长身份" : "学生身份"}</T></span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{m.class_join_code}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeaveTarget(m)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0">
                  <LogOut className="mr-1 size-3.5" /> <T>退出</T>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* LEAVE CONFIRM */}
      <AlertDialog open={!!leaveTarget} onOpenChange={(v) => !v && setLeaveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><T>确认退出班级</T></AlertDialogTitle>
            <AlertDialogDescription>
              <T>退出后，老师将无法再看到你的学习进度。你随时可以用邀请码重新加入。</T>
              {leaveTarget && <><br/><br/><b>「{leaveTarget.class_name}」</b></>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><T>取消</T></AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-rose-600 hover:bg-rose-700">
              <T>确认退出</T>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/** Translate raw Postgres / RPC errors to user-friendly Chinese. */
function mapJoinError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("not found"))                return "邀请码错误，找老师确认一下";
  if (m.includes("you are the teacher"))      return "你是这个班级的老师，不能加入自己的班级";
  if (m.includes("invalid code"))             return "邀请码格式不对，应该是 8 位字母数字（例如 ABCD-EFGH）";
  if (m.includes("not authenticated"))        return "请先登录";
  return raw;
}
