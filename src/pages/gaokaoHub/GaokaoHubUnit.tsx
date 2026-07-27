import { useEffect, useState } from "react";
import { useNavigate, useParams, type NavigateFunction } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";
import { findUnit, unitLabel } from "@/lib/gaokaoHub/courseData";
import { getUnitProgress } from "@/lib/gaokaoHub/progress";
import { getUnitState } from "@/lib/gaokaoHub/storage";
import { useUnitVocab } from "@/lib/juniorHub/useUnitVocab";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { loadUnitVocabProgress, pctOf, type UnitOverall } from "@/lib/juniorHub/unitOverallProgress";
import { useUnitMastery } from "@/hooks/useUnitMastery";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";
import { withPublisher, type Publisher } from "@/lib/gaokaoHub/publisher";
import type { GrammarProgress } from "@/lib/juniorGrammarQuestionMastery";
import type { UnitDef, UnitState } from "@/lib/gaokaoHub/types";

/** 关卡行右侧两个小圆圈:完成度(绿)+ 掌握度(琥珀)。total<=0 不显示。与初中 hub 同款。 */
function StageRings({ done, mastered, total }: { done: number; mastered: number; total: number }) {
  if (total <= 0) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <MasteryRing value={done / total} size={38} stroke={5} colorClass="stroke-emerald-500">
        <span className="text-[10px] font-extrabold tabular-nums text-emerald-600">{pctOf(done, total)}</span>
      </MasteryRing>
      <MasteryRing value={mastered / total} size={38} stroke={5} colorClass="stroke-amber-500">
        <span className="text-[10px] font-extrabold tabular-nums text-amber-600">{pctOf(mastered, total)}</span>
      </MasteryRing>
    </div>
  );
}

/**
 * 关卡列表(unit 确定才挂载 → 可安全用 hook)。核心词汇关 / 语法专项关右侧挂两环
 * (完成度 / 掌握度),与初中 8 年级同源同口径(senior 走 junior_* 表,grade=gaokao+9)。
 */
function StageList({
  unit,
  grade,
  publisher,
  us,
  base,
  semId,
  unitId,
  nav,
}: {
  unit: UnitDef;
  grade: number; // junior 口径 grade(=gaokao grade + 9)
  publisher: Publisher;
  us: UnitState | null;
  base: string;
  semId: string;
  unitId: string;
  nav: NavigateFunction;
}) {
  const words = useUnitVocab(unit, grade, publisher);
  const wp = (p: string) => withPublisher(p, publisher);
  const [vocabProg, setVocabProg] = useState<UnitOverall | null>(null);
  const [grammarProg, setGrammarProg] = useState<GrammarProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!words) return;
      const ids = words.map((w) => w.id).filter((x): x is string => !!x);
      const v = await loadUnitVocabProgress(ids);
      if (!cancelled) setVocabProg(v);
    })();
    return () => {
      cancelled = true;
    };
  }, [words]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const codes = unit.grammarCodes ?? [];
      if (!codes.length) return;
      const g = await loadProgressForCodes(codes, publisher);
      if (!cancelled) setGrammarProg(g);
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2 px-4 py-4">
      {unit.stages.map((stage, i) => {
        const done = us?.completedStages.includes(i) ?? false;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => nav(wp(`${base}/semester/${semId}/unit/${unitId}/stage/${i}`))}
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
            {stage.type === "vocab" && vocabProg && (
              // 绿环=完成度=点开看过的词数(loadUnitVocabProgress.done,按 word_id 数行,跨 context 安全),橙环=答对2次掌握。
              <StageRings done={vocabProg.done} mastered={vocabProg.mastered} total={vocabProg.total} />
            )}
            {stage.type === "grammar" && grammarProg && (
              <StageRings done={grammarProg.done} mastered={grammarProg.mastered} total={grammarProg.total} />
            )}
            <span className="text-[#888780]">›</span>
          </button>
        );
      })}
    </div>
  );
}

export default function GaokaoHubUnit() {
  const { semId, unitId } = useParams<{ semId: string; unitId: string }>();
  const { grade, publisher, state } = useGaokaoHub();
  const nav = useNavigate();
  const unit = unitId ? findUnit(unitId, publisher) : null;
  const us = unitId ? getUnitState(state, unitId) : null;
  const p = unitId ? getUnitProgress(state, unitId) : { percent: 0, completed: 0, total: 0 };
  const base = `/gaokao/hub/${grade}`;
  // ⚠️ 必须在 early-return 之前调用(hook 顺序)。unit 为 null 时内部短路。
  const unitMastery = useUnitMastery(unit, grade + 9, publisher);

  if (!unit || !unitId || !semId) {
    return <div className="p-6 text-center">单元未找到</div>;
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={() => nav(withPublisher(`${base}/semester/${semId}`, publisher))} className="text-xl">
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
          {/* 掌握度与完成度并列 —— 完成度只数「走完几关」,阅读/完形/听力做过 1 篇就打 ✓。 */}
          {unitMastery && (
            <div>
              <div className="text-lg font-bold">{unitMastery.pct}%</div>
              <div className="text-xs opacity-90">掌握度·词汇+语法</div>
            </div>
          )}
        </div>
      </div>
      <StageList unit={unit} grade={grade + 9} publisher={publisher} us={us} base={base} semId={semId} unitId={unitId} nav={nav} />
    </>
  );
}
