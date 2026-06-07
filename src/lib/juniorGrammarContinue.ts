import { supabase } from "@/integrations/supabase/client";
import type { ContinuePick } from "@/hooks/useMasteryOverview";
import { loadJuniorGrammarMasteryAll, type JuniorGrammarMastery } from "@/lib/juniorGrammarFsrs";
import {
  hasLabContent,
  juniorGrammarPlayPath,
  pickTodayAdventure,
  type JuniorPointNav,
} from "@/lib/juniorGrammarNav";
import { countPendingRevengeMistakes } from "@/lib/juniorGrammarRevenge";
import { pointHasKp } from "@/lib/juniorKnowledgePoint";

type Pt = JuniorPointNav & { category_id?: string | null };

function recommendWeakest(pts: Pt[], mastery: Record<string, JuniorGrammarMastery>) {
  const catIds = [...new Set(pts.map((p) => p.category_id).filter(Boolean))] as string[];
  for (const catId of catIds) {
    const catPts = pts.filter((p) => p.category_id === catId);
    const rich = catPts.filter((p) => hasLabContent(p));
    const candidates = rich.length > 0 ? rich : catPts;
    const sorted = [...candidates].sort((a, b) => {
      const la = mastery[a.id]?.mastery_level ?? 0;
      const lb = mastery[b.id]?.mastery_level ?? 0;
      return la - lb;
    });
    if (sorted.length > 0) return { point: sorted[0] };
  }
  return null;
}

/** Smart continue target for junior grammar (revenge → due adventure → new adventure). */
export async function fetchJuniorGrammarContinue(): Promise<ContinuePick> {
  const pending = countPendingRevengeMistakes();
  if (pending > 0) {
    return {
      module: "grammar",
      kind: "due",
      to: "/junior/grammar/revenge",
      title: `⚔️ 语法错题复仇 · ${pending} 题`,
      subtitle: "专攻闯关错题，改对清空弱点",
    };
  }

  const [{ data: points }, masteryRows] = await Promise.all([
    supabase
      .from("junior_grammar_points")
      .select("id,title,content_depth,grade,sort_order,category_id")
      .order("sort_order"),
    loadJuniorGrammarMasteryAll(),
  ]);

  const pts = (points ?? []) as Pt[];
  const mastery: Record<string, JuniorGrammarMastery> = {};
  for (const r of masteryRows) mastery[r.item_id] = r;

  const rec = recommendWeakest(pts, mastery);
  const target = pickTodayAdventure(pts, mastery, rec ? { point: rec.point } : null);

  if (target) {
    const ms = mastery[target.id];
    const isDue = !!(ms?.due_at && new Date(ms.due_at).getTime() <= Date.now());
    const targetHasKp = await pointHasKp(target.id);
    return {
      module: "grammar",
      kind: isDue ? "due" : "new",
      to: juniorGrammarPlayPath(target.id, target, { hasKp: targetHasKp }),
      title: isDue ? `🎮 语法复习 · ${target.title}` : `🎮 今日语法冒险 · ${target.title}`,
      subtitle: isDue ? "到期考点 · 闯关巩固" : "约 8 分钟 · 钩子 → Boss",
    };
  }

  return {
    module: "grammar",
    kind: "new",
    to: "/junior/grammar",
    title: "🎮 语法冒险",
    subtitle: "每天一关 · 闯关赚 XP",
  };
}

/** Sync: revenge only (for instant UI before async resolves). */
export function juniorGrammarContinueSyncHint(): ContinuePick | null {
  const pending = countPendingRevengeMistakes();
  if (pending <= 0) return null;
  return {
    module: "grammar",
    kind: "due",
    to: "/junior/grammar/revenge",
    title: `⚔️ 语法错题复仇 · ${pending} 题`,
    subtitle: "专攻闯关错题，改对清空弱点",
  };
}
