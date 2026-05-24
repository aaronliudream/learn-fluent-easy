import { useNavigate, useParams } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";
import { findUnit } from "@/lib/gaokaoHub/courseData";
import { getUnitState } from "@/lib/gaokaoHub/storage";
import GaokaoHubStagePlay from "./GaokaoHubStagePlay";

export default function GaokaoHubStage() {
  const { semId, unitId, stageIdx: stageIdxStr } = useParams<{
    semId: string;
    unitId: string;
    stageIdx: string;
  }>();
  const { grade, state } = useGaokaoHub();
  const nav = useNavigate();
  const stageIdx = Number(stageIdxStr);
  const unit = unitId ? findUnit(unitId) : null;
  const base = `/gaokao/hub/${grade}`;

  if (!unitId || !semId || !Number.isFinite(stageIdx) || !unit) {
    return <div className="p-6 text-center">关卡未找到</div>;
  }

  return (
    <GaokaoHubStagePlay
      unitId={unitId}
      stageIdx={stageIdx}
      onBack={() => nav(`${base}/semester/${semId}/unit/${unitId}`)}
      onComplete={(needAiTest) => {
        const stage = unit.stages[stageIdx];
        nav(`${base}/semester/${semId}/unit/${unitId}`, {
          state: { justCompleted: stageIdx, needAiTest, stageTitle: stage?.title },
        });
      }}
    />
  );
}
