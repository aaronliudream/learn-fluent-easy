import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Target, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { T, useT } from "@/i18n/T";

export default function FamilyGoalSettings() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState(15);
  const [weekly, setWeekly] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id ?? null;
      setUid(id);
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("daily_goal_minutes, weekly_report_enabled")
        .eq("user_id", id)
        .maybeSingle();
      if (data) {
        setGoal((data as any).daily_goal_minutes ?? 15);
        setWeekly((data as any).weekly_report_enabled ?? true);
      }
      setLoading(false);
    })();
  }, []);

  async function save(next: { daily_goal_minutes?: number; weekly_report_enabled?: boolean }) {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(next).eq("user_id", uid);
    setSaving(false);
    if (error) toast.error(t("保存失败：") + error.message);
    else toast.success(t("已保存 ✓"));
  }

  if (loading) {
    return <div className="rounded-3xl border-2 border-border bg-card p-4 text-sm text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" /><T>加载设置…</T></div>;
  }
  if (!uid) return null;

  const presets = [10, 15, 20, 30, 45, 60];

  return (
    <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-extrabold">
        <Target className="size-4 text-emerald-500" /> <T>学习目标 & 提醒</T>
        {saving && <Loader2 className="ml-1 size-3 animate-spin text-muted-foreground" />}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground"><T>每日学习目标</T></span>
          <span className="font-extrabold text-foreground">{goal} <T>分钟 / 天</T></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(m => (
            <button
              key={m}
              onClick={() => { setGoal(m); save({ daily_goal_minutes: m }); }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                goal === m
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {m} <T>分</T>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          <T>科学建议：青少年 15–30 分钟/天，间隔重复效果最佳（基于 SRS 记忆曲线）</T>
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-secondary/40 p-3">
        <span className="flex items-center gap-2 text-xs">
          <Mail className="size-4 text-blue-500" />
          <span>
            <div className="font-bold text-foreground"><T>每周学习报告邮件</T></div>
            <div className="text-[10px] text-muted-foreground"><T>每周日发送一次学习数据汇总</T></div>
          </span>
        </span>
        <input
          type="checkbox"
          checked={weekly}
          onChange={(e) => { setWeekly(e.target.checked); save({ weekly_report_enabled: e.target.checked }); }}
          className="size-5 cursor-pointer accent-emerald-500"
        />
      </label>
    </section>
  );
}
