import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { T } from "@/i18n/T";

type PC = { id: string; destination_cn: string; destination_emoji: string; message_cn: string; trip_start: string; trip_end: string; read_at: string | null };

/**
 * #19 宠物月度旅行明信片 — 每月一次强制"宠物出门"3 天，
 * 期间不催学，鼓励休息；目的：刻意打断打卡焦虑、培养"放下也是学习"。
 */
export default function MonthlyPostcard() {
  const [pc, setPc] = useState<PC | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("get_or_create_monthly_postcard");
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setPc(row as PC);
    })();
  }, []);
  if (!pc) return null;
  const onTrip = new Date(pc.trip_end) >= new Date();
  const markRead = async () => {
    if (pc.read_at) return;
    await (supabase as any).from("pet_postcards").update({ read_at: new Date().toISOString() }).eq("id", pc.id);
    setPc({ ...pc, read_at: new Date().toISOString() });
  };
  return (
    <div onClick={markRead} className="cursor-pointer rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 shadow-tile dark:border-amber-900/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          📮 <T>本月明信片</T> {!pc.read_at && <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">NEW</span>}
        </div>
        {onTrip && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200"><T>出游中</T> · <T>至</T> {pc.trip_end.slice(5)}</span>}
      </div>
      <div className="mt-2 flex items-start gap-3">
        <div className="text-5xl">{pc.destination_emoji}</div>
        <div className="flex-1">
          <div className="text-base font-extrabold"><T>来自</T> <T>{pc.destination_cn}</T> <T>的问候</T></div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80"><T>{pc.message_cn}</T></p>
          {onTrip && <p className="mt-2 text-[11px] italic text-amber-700 dark:text-amber-300"><T>休息也是学习的一部分 · 这几天不必赶进度</T></p>}
        </div>
      </div>
    </div>
  );
}