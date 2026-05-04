import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { T, useT } from "@/i18n/T";

const OPTIONS = [
  { v: 1,  label: "1 小时",  hint: "适合 13+ 岁，奖励近实时" },
  { v: 24, label: "24 小时", hint: "默认 · 培养基础耐心" },
  { v: 72, label: "72 小时", hint: "适合 6-9 岁，强化延迟满足" },
];

export default function DelaySettings() {
  const t = useT();
  const [hours, setHours] = useState<number>(24);
  const [cap, setCap] = useState<number>(50);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("parent_delay_settings").select("delay_hours,daily_seed_cap").maybeSingle();
      if (data) {
        setHours(data.delay_hours);
        setCap(data.daily_seed_cap);
      }
    })();
  }, []);

  const save = async (h: number, c: number) => {
    setSaving(true);
    const { error } = await supabase.rpc("set_parent_delay_hours", { _hours: h, _cap: c });
    setSaving(false);
    if (error) { toast.error(t("保存失败：") + error.message); return; }
    setHours(h); setCap(c);
    toast.success(t("已更新延迟系数"));
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h3 className="text-base font-extrabold">⏳ <T>学习延迟系数</T></h3>
      <p className="mt-1 text-xs text-muted-foreground">
        <T>孩子答对获得的"种子"要等多久才能在商店使用。年龄越小，建议设得越长 —— 这是培养延迟满足能力的关键设计。</T>
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map(o => (
          <button key={o.v} disabled={saving} onClick={() => save(o.v, cap)}
            className={"rounded-xl border-2 p-3 text-left transition " +
              (hours === o.v ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30" : "border-border hover:border-purple-300")}>
            <div className="text-sm font-extrabold"><T>{o.label}</T></div>
            <div className="mt-0.5 text-[11px] text-muted-foreground"><T>{o.hint}</T></div>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <label className="text-xs font-bold"><T>每日种子上限</T>：{cap} <T>颗</T></label>
        <input type="range" min={20} max={150} step={10} value={cap}
          onChange={(e)=>setCap(Number(e.target.value))}
          onMouseUp={()=>save(hours, cap)} onTouchEnd={()=>save(hours, cap)}
          className="mt-1 w-full" />
        <div className="text-[11px] text-muted-foreground"><T>超出当日上限的种子会进入"明日储蓄罐"，明天才能消化。</T></div>
      </div>
    </section>
  );
}
