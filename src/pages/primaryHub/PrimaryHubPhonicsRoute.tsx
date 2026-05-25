import { Navigate, useNavigate, useParams } from "react-router-dom";
import { findUnit, isUnitPublished } from "@/lib/primaryHub/courseData";
import { getPhonicsForUnit } from "@/lib/primaryHub/phonicsRegistry";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import PrimaryHubPhonics from "./PrimaryHubPhonics";

export default function PrimaryHubPhonicsRoute() {
  const { semId, unitId, stageIdx: stageIdxStr } = useParams<{
    semId: string;
    unitId: string;
    stageIdx: string;
  }>();
  const { grade } = usePrimaryHub();
  const nav = useNavigate();
  const stageIdx = Number(stageIdxStr);
  const unit = unitId ? findUnit(unitId) : null;
  const config = unitId ? getPhonicsForUnit(unitId) : null;
  const base = `/primary/hub/${grade}`;

  if (unit && !isUnitPublished(unit)) {
    return <Navigate to={`${base}/semester/${semId ?? "grade4_volume2"}`} replace />;
  }

  if (!unitId || !semId || !Number.isFinite(stageIdx) || !config) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">拼读练习暂未开放</p>
        <button
          type="button"
          className="text-[#FF6B35] underline"
          onClick={() => nav(`${base}/semester/${semId ?? "grade4_volume2"}`)}
        >
          返回课程
        </button>
      </div>
    );
  }

  return (
    <PrimaryHubPhonics
      config={config}
      semId={semId}
      unitId={unitId}
      stageIdx={stageIdx}
      onBack={() => nav(`${base}/semester/${semId}/unit/${unitId}/stage/${stageIdx}`)}
    />
  );
}
