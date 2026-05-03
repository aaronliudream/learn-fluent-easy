/**
 * 错题反思能量 — 延迟满足设计 #13
 * 学生必须用 3 句话写出"我以为 / 正确是 / 为什么错"才能获得 2 颗种子能量。
 * 教学依据：metacognitive reflection > passive review。
 * 同一题每天只能领一次（后端 RPC 控制）。
 */
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ReflectionEnergy({
  itemId,
  module,
  word,
  correctAnswer,
}: {
  itemId: string;
  module?: string;
  word?: string;
  correctAnswer?: string;
}) {
  const [iThought, setIThought] = useState("");
  const [why, setWhy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { awarded: number; reason: string }>(null);

  async function submit() {
    if (iThought.trim().length < 2) {
      toast("先写下"我以为是什么"，哪怕一个词也行～");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("claim_reflection_energy", {
        _item_id: itemId,
        _module: module ?? null,
        _word: word ?? null,
        _i_thought: iThought.trim(),
        _correct_was: (correctAnswer ?? "").trim() || "—",
        _why_wrong: why.trim() || null,
      });
      if (error) throw error;
      const row: any = Array.isArray(data) ? data[0] : data;
      setDone({ awarded: row?.awarded ?? 0, reason: row?.reason ?? "" });
      if (row?.reason === "ok") {
        toast(`🌱 +${row.awarded} 反思种子（明天到账）`, { duration: 2200 });
      } else if (row?.reason === "already_today") {
        toast("今天已经反思过这道题啦，明天再来 ✨", { duration: 1800 });
      }
    } catch (e) {
      toast("提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  if (done && done.reason === "ok") {
    return (
      <div className="mt-3 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
        <div className="font-bold text-emerald-700 dark:text-emerald-300">
          🌱 反思已记录，宠物正在消化…明天到账 +{done.awarded}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          研究表明：写下"我以为/真相/原因"比重做 5 次更牢固。
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-fuchsia-500/30 bg-fuchsia-500/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
        <Sparkles className="size-4" /> 反思一下，领 2 颗种子 🌱
      </div>
      <div className="space-y-2 text-sm">
        <label className="block">
          <span className="text-xs text-muted-foreground">我以为答案是…</span>
          <input
            value={iThought}
            onChange={(e) => setIThought(e.target.value)}
            maxLength={80}
            placeholder="例如：我以为是 affect"
            className="mt-1 w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">为什么会错？（可选）</span>
          <input
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            maxLength={120}
            placeholder="例如：把名词和动词搞混了"
            className="mt-1 w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {submitting ? <Loader2 className="size-3.5 animate-spin" /> : "🌱"} 领取反思能量
        </button>
        <div className="text-[11px] text-muted-foreground">
          每道题每天只能反思一次。明天 24h 后到账。
        </div>
      </div>
    </div>
  );
}