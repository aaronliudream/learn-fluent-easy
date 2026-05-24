import { useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit } from "@/lib/primaryHub/courseData";
import { getUnitState } from "@/lib/primaryHub/storage";
import PrimaryHubStagePlay from "./PrimaryHubStagePlay";

export default function PrimaryHubStage() {
  const { semId, unitId, stageIdx: stageIdxStr } = useParams<{
    semId: string;
    unitId: string;
    stageIdx: string;
  }>();
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();
  const stageIdx = Number(stageIdxStr);
  const unit = unitId ? findUnit(unitId) : null;
  const base = `/primary/hub/${grade}`;

  if (!unitId || !semId || !Number.isFinite(stageIdx) || !unit) {
    return <div className="p-6 text-center">关卡未找到</div>;
  }

  return (
    <PrimaryHubStagePlay
      unitId={unitId}
      semId={semId}
      stageIdx={stageIdx}
      onBack={() => nav(`${base}/semester/${semId}/unit/${unitId}`)}
      onComplete={(needAiTest) => {
        const us = getUnitState(state, unitId);
        const stage = unit.stages[stageIdx];
        nav(`${base}/semester/${semId}/unit/${unitId}`, {
          state: { justCompleted: stageIdx, needAiTest, stageTitle: stage?.title },
        });
      }}
    />
  );
}
