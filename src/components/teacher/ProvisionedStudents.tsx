import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { T, useT } from "@/i18n/T";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserPlus, Loader2, KeyRound, Copy, Check, LogOut, GraduationCap, Pencil } from "lucide-react";

/**
 * 老师代建学生账号（Phase 1.5）—— 挂在班级详情页 roster tab。
 * 全部走 edge function teacher-provision-student（唯一能碰 auth 的地方）。
 * 密码明文只在 create/reset 的一次性弹窗里显示，前端不保存、不打日志。
 */

type Row = {
  student_user_id: string;
  login_id: string;
  real_name: string | null;
  created_at: string;
};

// 一次性凭据（创建/重置后展示，关闭即丢弃）
type Credential = { title: string; loginId: string; password: string } | null;

async function invokeProvision(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("teacher-provision-student", { body: payload });
  if (error) {
    // edge function 非 2xx 时 error 带响应体；尽力取出中文错误
    let msg = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const b = await ctx.json();
        if (b?.error) msg = b.error;
      }
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (data ?? {}) as Record<string, unknown>;
}

export function ProvisionedStudents({ classId, readOnly = false, onChanged }: { classId: string; readOnly?: boolean; onChanged?: () => void }) {
  const t = useT();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [realName, setRealName] = useState("");
  const [creating, setCreating] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [cred, setCred] = useState<Credential>(null);
  const [copied, setCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Row | null>(null);
  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    // RLS ps_teacher_all(created_by = auth.uid()) 已保证只返回本人代建的；再按 class 过滤。
    // ⚠ 移出学生是软删 class_members(removed_at),不动 provisioned_students.class_id，
    //   故必须再按"在册成员"过滤，否则移出的学生会一直残留在此列表(需 F5 才走)。
    const [membersR, provR] = await Promise.all([
      supabase.from("class_members").select("member_id").eq("class_id", classId).is("removed_at", null),
      supabase
        .from("provisioned_students")
        .select("student_user_id, login_id, real_name, created_at")
        .eq("class_id", classId)
        .order("created_at", { ascending: false }),
    ]);
    if (provR.error) { console.warn("provisioned load error", provR.error.message); setRows([]); setLoading(false); return; }
    const activeIds = new Set((membersR.data ?? []).map((m) => m.member_id as string));
    setRows(((provR.data ?? []) as Row[]).filter((r) => activeIds.has(r.student_user_id)));
    setLoading(false);
  }, [classId]);

  useEffect(() => { reload(); }, [reload]);

  async function addStudent() {
    setCreating(true);
    try {
      const r = await invokeProvision({ action: "create_student", class_id: classId, real_name: realName.trim() || null });
      setRealName("");
      setCred({ title: "学生账号已创建", loginId: String(r.login_id ?? ""), password: String(r.initial_password ?? "") });
      reload();
      onChanged?.();  // 新建学生 → 学生名单一并刷新
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function resetPassword(row: Row) {
    setResettingId(row.student_user_id);
    try {
      const r = await invokeProvision({ action: "reset_password", student_user_id: row.student_user_id });
      setCred({ title: "新密码已生成", loginId: String(r.login_id ?? row.login_id), password: String(r.new_password ?? "") });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setResettingId(null);
    }
  }

  function openEdit(row: Row) {
    setEditTarget(row);
    setEditName(row.real_name ?? "");
  }

  async function saveName() {
    if (!editTarget) return;
    setSavingName(true);
    try {
      await invokeProvision({
        action: "update_real_name",
        student_user_id: editTarget.student_user_id,
        real_name: editName.trim() || null,
      });
      toast.success(t("已更新姓名"));
      setEditTarget(null);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingName(false);
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    try {
      await invokeProvision({ action: "remove_student", student_user_id: removeTarget.student_user_id });
      toast.success(`已移出「${removeTarget.real_name || removeTarget.login_id}」`);
      reload();       // 已代建列表:排除刚移出的
      onChanged?.();  // 学生名单(父组件 roster)一并刷新
    } catch (e) {
      toast.error((e as Error).message);
    }
    setRemoveTarget(null);
  }

  function copyCred() {
    if (!cred) return;
    const text = `登录ID：${cred.loginId}\n密码：${cred.password}`;
    navigator.clipboard?.writeText(text).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 1800); },
      () => toast.error(t("复制失败，请手动抄写")),
    );
  }

  return (
    <section className="mb-5 rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-orange-50 p-5 shadow-tile dark:border-fuchsia-500/30 dark:from-fuchsia-500/10 dark:to-orange-500/10">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-fuchsia-600" />
        <h3 className="text-sm font-extrabold"><T>代建学生账号</T></h3>
      </div>
      <p className="mt-1 text-xs text-fuchsia-900/70 dark:text-fuchsia-100/70">
        {readOnly
          ? <T>此班级已归档，为只读存档。以下代建学生名单仅供查看，无法添加、改名、重置密码或移出。</T>
          : <T>没有邮箱的学生：填真实姓名即可创建账号，系统生成登录ID+密码，抄给学生用它登录。密码只显示一次。</T>}
      </p>

      {/* 添加 */}
      {!readOnly && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="rn" className="text-xs"><T>学生真实姓名（可选，仅你可见）</T></Label>
            <Input id="rn" value={realName} onChange={(e) => setRealName(e.target.value)}
              placeholder={t("如：张三")} className="mt-1"
              onKeyDown={(e) => { if (e.key === "Enter" && !creating) addStudent(); }} />
          </div>
          <Button onClick={addStudent} disabled={creating} className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white">
            {creating ? <Loader2 className="size-4 animate-spin" /> : <><UserPlus className="mr-1 size-4" /> <T>添加学生</T></>}
          </Button>
        </div>
      )}

      {/* 名单 */}
      <div className="mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <T>已代建学生</T> {rows.length > 0 && `(${rows.length})`}
        </div>
        {loading ? (
          <div className="flex items-center text-xs text-muted-foreground py-3">
            <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            <T>还没有代建学生。点上方「添加学生」创建。</T>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.student_user_id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{r.real_name || <span className="text-muted-foreground italic"><T>（未填姓名）</T></span>}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono tabular-nums">{r.login_id}</span>
                    <span>·</span>
                    <span><T>创建于</T> {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {!readOnly && <>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)} className="shrink-0">
                    <Pencil className="mr-1 size-3.5" /> <T>改名</T>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => resetPassword(r)} disabled={resettingId === r.student_user_id} className="shrink-0">
                    {resettingId === r.student_user_id ? <Loader2 className="size-3.5 animate-spin" /> : <><KeyRound className="mr-1 size-3.5" /> <T>重置密码</T></>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(r)}
                    className="shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <LogOut className="mr-1 size-3.5" /> <T>移出</T>
                  </Button>
                </>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 一次性凭据弹窗 */}
      <Dialog open={!!cred} onOpenChange={(v) => { if (!v) { setCred(null); setCopied(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎓 <T>{cred?.title ?? ""}</T></DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
            <div className="text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground"><T>登录ID</T></span>
                <span className="font-mono text-lg font-extrabold tracking-widest">{cred?.loginId}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground"><T>密码</T></span>
                <span className="font-mono text-lg font-extrabold tracking-widest">{cred?.password}</span>
              </div>
            </div>
          </div>
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            ⚠️ <T>密码仅显示这一次，请立刻抄下来交给学生。忘记只能重置为新密码，系统不保存原密码。</T>
          </p>
          <DialogFooter>
            <Button onClick={copyCred} variant="outline">
              {copied ? <><Check className="mr-1 size-4" /> <T>已复制</T></> : <><Copy className="mr-1 size-4" /> <T>复制登录ID+密码</T></>}
            </Button>
            <Button onClick={() => { setCred(null); setCopied(false); }}><T>我已抄好，关闭</T></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 改名 / 补填姓名 */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ <T>修改真实姓名</T></DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-rn" className="text-xs"><T>真实姓名（仅你可见）</T></Label>
            <Input id="edit-rn" value={editName} onChange={(e) => setEditName(e.target.value)}
              placeholder={t("如：张三")} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && !savingName) saveName(); }} />
            <p className="text-[11px] text-muted-foreground">
              <T>登录ID</T> <span className="font-mono">{editTarget?.login_id}</span>
              <T>。留空则清除姓名。</T>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={savingName}><T>取消</T></Button>
            <Button onClick={saveName} disabled={savingName}>
              {savingName ? <Loader2 className="size-4 animate-spin" /> : <T>保存</T>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移出确认 */}
      <AlertDialog open={!!removeTarget} onOpenChange={(v) => !v && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><T>确认移出该学生？</T></AlertDialogTitle>
            <AlertDialogDescription>
              <T>移出后该学生不再属于本班，你将看不到其学习进度。账号本身保留，可重新加入。</T>
              {removeTarget && <><br/><br/><b>{removeTarget.real_name || removeTarget.login_id}</b></>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><T>取消</T></AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-rose-600 hover:bg-rose-700"><T>确认移出</T></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
