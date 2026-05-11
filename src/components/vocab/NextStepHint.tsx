import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Crown, Target } from "lucide-react";
import {
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
  type QuizKind } from
"@/lib/masteryScore";

/**
 * 结算页的"下一步"提示条：
 *  - 显示当前批次已 👑 大师 / 待 👑 的词数
 *  - 智能挑出最弱的题型 (form/meaning/use)，给出具体下一步建议
 */

const KIND_GROUP: Record<QuizKind, "form" | "meaning" | "use"> = {
  spell: "form",
  listen: "form",
  en2cn: "meaning",
  cn2en: "meaning",
  en2en: "meaning",
  en2word: "meaning",
  syn: "meaning",
  cloze: "use",
  pos: "use"
};
const FAMILY_RECOMMEND = {
  form: { mode: "dict", label: "🔊 去听写挑战 强化「形」", emoji: "🔊" },
  meaning: { mode: "classic", label: "🎯 去智能选义 强化「义」", emoji: "🎯" },
  use: { mode: "quest", label: "✍️ 去单词任务 强化「用」", emoji: "✍️" }
} as const;

export default function NextStepHint({
  vocabIds,
  onPickMode



}: {vocabIds: string[];onPickMode: (mode: string) => void;}) {
  const [mastered, setMastered] = useState(0);
  const [weakest, setWeakest] = useState<"form" | "meaning" | "use" | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user || vocabIds.length === 0) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase.
      from("gaokao_user_mastery").
      select("mastery_matrix, reached_master_at").
      eq("user_id", u.user.id).
      eq("item_type", "vocab").
      in("item_id", vocabIds.slice(0, 1000));
      let m = 0;
      const fam = { form: 0, meaning: 0, use: 0 };
      const max = { form: 0, meaning: 0, use: 0 };
      (data ?? []).forEach((r: any) => {
        const matrix = (r.mastery_matrix ?? {}) as MasteryMatrix;
        const score = computeMasteryScore(matrix);
        if (levelFromScore(score, !!r.reached_master_at) === 4) m += 1;
        (Object.keys(KIND_GROUP) as QuizKind[]).forEach((k) => {
          fam[KIND_GROUP[k]] += matrix[k] ?? 0;
          max[KIND_GROUP[k]] += 4;
        });
      });
      setMastered(m);
      // pick weakest family by ratio
      const ratios = (["form", "meaning", "use"] as const).map((f) => ({
        f,
        r: max[f] === 0 ? 0 : fam[f] / max[f]
      }));
      ratios.sort((a, b) => a.r - b.r);
      setWeakest(ratios[0].f);
      setLoaded(true);
    })();
  }, [vocabIds.join(",")]);

  if (!loaded) return null;
  const remaining = Math.max(0, vocabIds.length - mastered);
  const rec = weakest ? FAMILY_RECOMMEND[weakest] : null;

  return (
    <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-rose-50 to-fuchsia-50 p-3 text-left dark:from-amber-950/30 dark:via-rose-950/20 dark:to-fuchsia-950/20 dark:border-amber-700/40">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <Target className="size-3.5" /> <T>你的下一步</T>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1 font-extrabold text-fuchsia-600 dark:text-fuchsia-400">
          <Crown className="size-4" /> {mastered} / {vocabIds.length}
        </span>
        <span className="text-muted-foreground">
          <T>距离全部 👑 还差</T> <span className="font-extrabold text-foreground">{remaining}</span> <T>词</T>
        </span>
      </div>
      {rec && remaining > 0 &&
      <button
        onClick={() => onPickMode(rec.mode)}
        className="mt-2 inline-flex w-full items-center justify-between gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-rose-600">
        
          <span>{rec.label}</span>
          <ArrowRight className="size-4" />
        </button>
      }
      {remaining === 0 && vocabIds.length > 0 &&
      <div className="mt-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
          <T>🎉 当前批次已全部彻底掌握！</T>
        </div>
      }
    </div>);

}