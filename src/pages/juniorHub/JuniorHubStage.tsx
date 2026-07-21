import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { findUnit } from "@/lib/juniorHub/courseData";
import { getUnitState } from "@/lib/juniorHub/storage";
import JuniorHubStagePlay from "./JuniorHubStagePlay";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";

export default function JuniorHubStage() {
  const { semId, unitId, stageIdx: stageIdxStr } = useParams<{
    semId: string;
    unitId: string;
    stageIdx: string;
  }>();
  const { grade, state } = useJuniorHub();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);
  const stageIdx = Number(stageIdxStr);
  const unit = unitId ? findUnit(unitId) : null;
  const base = `/junior/hub/${grade}`;

  if (!unitId || !semId || !Number.isFinite(stageIdx) || !unit) {
    return <div className="p-6 text-center">关卡未找到</div>;
  }

  return (
    <JuniorHubStagePlay
      unitId={unitId}
      stageIdx={stageIdx}
      onBack={() => nav(withJuniorPublisher(`${base}/semester/${semId}/unit/${unitId}`, pub))}
      onComplete={(needAiTest) => {
        const stage = unit.stages[stageIdx];
        nav(withJuniorPublisher(`${base}/semester/${semId}/unit/${unitId}`, pub), {
          state: { justCompleted: stageIdx, needAiTest, stageTitle: stage?.title },
        });
      }}
    />
  );
}
