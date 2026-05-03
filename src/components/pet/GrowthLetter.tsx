import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, X } from "lucide-react";

/**
 * 周日"宠物成长信"（#10）
 * 不显示金币 / 不引导购买，只回顾本周一起学了什么。
 * 触发时机：周日 + 一周内未读过 → 自动弹出。
 */
type Letter = {
  active_days: number;
  quiz_correct: number;
  minutes_active: number;
  weak_module: string | null;
  pet_name: string | null;
  pet_level: number | null;
  patience_score: number | null;
};

const LS_KEY = "pet_letter_week";

function thisWeekKey() {
  const d = new Date();
  const day = d.getUTCDay();
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export default function GrowthLetter() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Letter | null>(null);

  useEffect(() => {
    const day = new Date().getDay(); // 0 = Sunday
    if (day !== 0) return;
    try {
      if (localStorage.getItem(LS_KEY) === thisWeekKey()) return;
    } catch {}
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const { data: rows } = await supabase.rpc("weekly_growth_letter");
      const row: any = Array.isArray(rows) ? rows[0] : rows;
      if (!row) return;
      setData(row as Letter);
      setOpen(true);
    })();
  }, []);

  if (!open || !data) return null;
  const name = data.pet_name || "你的小伙伴";
  const close = () => {
    try { localStorage.setItem(LS_KEY, thisWeekKey()); } catch {}
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 p-6 shadow-2xl dark:from-amber-950/40 dark:via-rose-950/30 dark:to-purple-950/30">
        <button onClick={close} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-black/5">
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500">
          <Mail className="size-4" /> 来自 {name} 的信
        </div>
        <h2 className="mt-2 text-2xl font-extrabold">这一周，我们一起做到了 ✨</h2>
        <div className="mt-4 space-y-2.5 text-sm leading-relaxed">
          <p>嘿！这周我们一起学习了 <b>{data.active_days} 天</b>，</p>
          <p>累计专注 <b>{data.minutes_active} 分钟</b>，答对 <b>{data.quiz_correct} 道题</b>。</p>
          {data.weak_module && (
            <p>我注意到 <b>{data.weak_module}</b> 这块你有点纠结，下周我们慢慢来 🌱</p>
          )}
          {(data.patience_score ?? 0) > 0 && (
            <p>而且你这周的耐心值 <b>+{data.patience_score}</b> —— 你愿意等待，比拿到东西更可贵。</p>
          )}
          <p className="pt-2 text-muted-foreground">下周也想和你一起继续，慢慢的，没关系 💛</p>
        </div>
        <button onClick={close}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-400 to-purple-500 py-2.5 text-sm font-extrabold text-white shadow">
          收下这封信 💌
        </button>
      </div>
    </div>
  );
}