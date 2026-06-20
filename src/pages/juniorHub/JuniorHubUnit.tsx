import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { findUnit } from "@/lib/juniorHub/courseData";
import { getUnitProgress } from "@/lib/juniorHub/progress";
import { getUnitState } from "@/lib/juniorHub/storage";
import { useUnitVocab } from "@/lib/juniorHub/useUnitVocab";
import { supabase } from "@/integrations/supabase/client";
import type { UnitDef, UnitState } from "@/lib/juniorHub/types";

const GROUP = 12; // 每组词数(与三关一致)

/**
 * 单元显示名(纯展示层):按课本真实结构,从 unitKey 推导单元号——
 * SU1→"Starter Unit 1"、U1→"Unit 1"。不用连续的 num(否则 Starter 占位会让真 Unit1 显示成 Unit4)。
 * 仅用于显示;unitKey/book/DB unit 值不变(数据键一致绑定)。
 */
export function unitLabel(unit: { unitKey: string }): string {
  const n = (unit.unitKey || "").match(/(\d+)/)?.[1] ?? "";
  return /^su/i.test(unit.unitKey || "") ? `Starter Unit ${n}` : `Unit ${n}`;
}

/**
 * 关卡列表(子组件,unit 已确定才挂载 → 可安全用 hook)。
 * 三关显示"组进度"中间态:
 *  - 核心词汇关(vocab):读 vocabGroup(纯浏览进度,localStorage/云)。
 *  - 听音辨词(listenWord)/词义配对(match):查 junior_word_mastery 算掌握词数 → 组。
 * 其余关保持原 ✓/序号。游客/无数据 → 不显组进度(等于现状)。
 */
function StageList({
  unit,
  grade,
  us,
  base,
  semId,
  unitId,
}: {
  unit: UnitDef;
  grade: number;
  us: UnitState | null;
  base: string;
  semId: string;
  unitId: string;
}) {
  const nav = useNavigate();
  const words = useUnitVocab(unit, grade);
  const [mastered, setMastered] = useState<{ listen: number; match: number } | null>(null);

  const totalWords = words?.length ?? 0;
  const totalGroups = Math.max(1, Math.ceil(totalWords / GROUP));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!words) return;
      const ids = words.map((w) => w.id).filter((x): x is string => !!x);
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user || ids.length === 0) {
        setMastered({ listen: 0, match: 0 });
        return;
      }
      let listen = 0;
      let match = 0;
      for (let i = 0; i < ids.length; i += 200) {
        const slice = ids.slice(i, i + 200);
        const { data, error } = await supabase
          .from("junior_word_mastery")
          .select("word_id,listen_correct,match_consec")
          .eq("user_id", user.id)
          .in("word_id", slice);
        if (cancelled) return;
        if (error) break;
        for (const r of (data ?? []) as Record<string, unknown>[]) {
          if (Number(r.listen_correct ?? 0) >= 2) listen++;
          if (Number(r.match_consec ?? 0) >= 2) match++;
        }
      }
      if (!cancelled) setMastered({ listen, match });
    })();
    return () => {
      cancelled = true;
    };
  }, [words]);

  // 每关的"组进度"标签:返回 "3/6 组" 或 null(无进度/不适用)
  const groupLabel = (stageType: string): string | null => {
    if (totalWords === 0) return null;
    let done: number | null = null;
    if (stageType === "vocab") {
      if (us?.vocabGroup == null) return null;
      done = Math.min(totalGroups, us.vocabGroup + 1);
    } else if (stageType === "listenWord") {
      if (!mastered) return null;
      done = Math.min(totalGroups, Math.ceil(mastered.listen / GROUP));
    } else if (stageType === "match") {
      if (!mastered) return null;
      done = Math.min(totalGroups, Math.ceil(mastered.match / GROUP));
    }
    if (done == null) return null;
    return `${done}/${totalGroups} 组`;
  };

  return (
    <div className="space-y-2 px-4 py-4">
      {unit.stages.map((stage, i) => {
        const done = us?.completedStages.includes(i) ?? false;
        const gl = groupLabel(stage.type);
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => nav(`${base}/semester/${semId}/unit/${unitId}/stage/${i}`)}
            className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm ${
              done ? "border-[#C9E0A8]" : "border-[#FF6B35]/40"
            }`}
          >
            <div className="grid size-10 place-items-center rounded-xl bg-[#FFF8F0] text-sm font-bold">
              {done ? "✓" : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">
                {stage.icon} {stage.title}
              </div>
              <div className="text-xs text-[#888780]">
                {stage.subtitle} · {stage.time}
              </div>
            </div>
            {gl && (
              <span className="shrink-0 rounded-full bg-[#FFF1E8] px-2 py-0.5 text-xs font-bold text-[#FF6B35]">
                {gl}
              </span>
            )}
            <span className="text-[#888780]">›</span>
          </button>
        );
      })}
    </div>
  );
}

export default function JuniorHubUnit() {
  const { semId, unitId } = useParams<{ semId: string; unitId: string }>();
  const { grade, state } = useJuniorHub();
  const nav = useNavigate();
  const unit = unitId ? findUnit(unitId) : null;
  const us = unitId ? getUnitState(state, unitId) : null;
  const p = unitId ? getUnitProgress(state, unitId) : { percent: 0, completed: 0, total: 0 };
  const base = `/junior/hub/${grade}`;

  if (!unit || !unitId || !semId) {
    return <div className="p-6 text-center">单元未找到</div>;
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={() => nav(`${base}/semester/${semId}`)} className="text-xl">
          ←
        </button>
        <div className="text-lg font-bold">
          {unitLabel(unit)} {unit.title}
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 py-5 text-white">
        <div className="text-xs opacity-90">
          {unitLabel(unit)} · {unit.cn}
        </div>
        <div className="text-2xl font-bold">
          {unit.emoji} {unit.title}
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/30">
          <div className="h-full bg-white" style={{ width: `${p.percent}%` }} />
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-lg font-bold">
              {p.completed}/{p.total}
            </div>
            <div className="text-xs opacity-90">已完成关卡</div>
          </div>
          <div>
            <div className="text-lg font-bold">{us?.stars ?? 0}</div>
            <div className="text-xs opacity-90">⭐ 星星</div>
          </div>
          <div>
            <div className="text-lg font-bold">{p.percent}%</div>
            <div className="text-xs opacity-90">完成度</div>
          </div>
        </div>
      </div>
      <StageList unit={unit} grade={grade} us={us} base={base} semId={semId} unitId={unitId} />
    </>
  );
}
