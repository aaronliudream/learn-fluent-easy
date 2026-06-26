import { useNavigate, useParams } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";
import { JuniorHubProvider } from "@/lib/juniorHub/context";
import type { JuniorHubGrade } from "@/lib/juniorHub/types";
import JuniorHubStagePlay from "@/pages/juniorHub/JuniorHubStagePlay";

// 高中关卡复用 junior 整套(方案B):JuniorHubStagePlay 按 (grade, unit.book, unit.unitKey) 读 junior_* DB。
// gaokao grade 1/2/3 → junior grade 10/11/12(必修=10/选必=11)。
// onComplete 同步写 gaokao 持久化(单元页小圆圈/进度),junior 那套写自己的掌握度/进度(方案B)。
export default function GaokaoHubStage() {
  const { semId, unitId, stageIdx: stageIdxStr } = useParams<{
    semId: string;
    unitId: string;
    stageIdx: string;
  }>();
  const { grade, completeStage } = useGaokaoHub();
  const nav = useNavigate();
  const stageIdx = Number(stageIdxStr);
  const base = `/gaokao/hub/${grade}`;
  const juniorGrade = (grade + 9) as JuniorHubGrade;

  if (!unitId || !semId || !Number.isFinite(stageIdx)) {
    return <div className="p-6 text-center">关卡未找到</div>;
  }

  return (
    <JuniorHubProvider grade={juniorGrade}>
      <JuniorHubStagePlay
        unitId={unitId}
        stageIdx={stageIdx}
        onBack={() => nav(`${base}/semester/${semId}/unit/${unitId}`)}
        onComplete={(needAiTest) => {
          completeStage(unitId, stageIdx); // 同步 gaokao 持久化(单元页进度/小圆圈)
          nav(`${base}/semester/${semId}/unit/${unitId}`, {
            state: { justCompleted: stageIdx, needAiTest },
          });
        }}
      />
    </JuniorHubProvider>
  );
}
