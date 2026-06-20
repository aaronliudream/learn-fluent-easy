import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Loader2 } from "lucide-react";
import UnitGrammarGroupWalk, { type WalkGroup } from "@/components/grammar/UnitGrammarGroupWalk";
import { loadUnitGrammar, type GUnit } from "@/lib/juniorGrammarUnits";
import { T } from "@/i18n/T";

/**
 * 语法页 L3:从某语法点进入 → 走「整单元分组」(组=语法点),从点击的那一组开始。
 * 进入即显示「第 N/共 X 组」。判分/掌握度沿用既有口径(在 UnitGrammarGroupWalk 内)。
 */
export default function JuniorGrammarPointTest() {
  const { pointId } = useParams<{ pointId: string }>();
  const [unit, setUnit] = useState<GUnit | null>(null);
  const [startIdx, setStartIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const units = await loadUnitGrammar();
      if (cancelled) return;
      const u = units.find((x) => x.points.some((p) => p.id === pointId)) ?? null;
      setUnit(u);
      setStartIdx(u ? Math.max(0, u.points.findIndex((p) => p.id === pointId)) : 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pointId]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  if (!unit) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <BackLink to="/junior/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回单元列表</T>
        </BackLink>
        <p className="text-sm text-muted-foreground"><T>未找到该语法点</T></p>
      </main>
    );
  }

  const groups: WalkGroup[] = unit.points.map((p) => ({ pointId: p.id, title: p.title }));
  return (
    <UnitGrammarGroupWalk
      groups={groups}
      startIndex={startIdx}
      backTo={`/junior/grammar/unit/${unit.volume}/${unit.unit}`}
      unitLabel={`${unit.label} 语法`}
    />
  );
}
