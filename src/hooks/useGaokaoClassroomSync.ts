import { useEffect, useState } from "react";
import type { GaokaoGradeKey } from "@/components/gaokao/GaokaoGradeFilter";
import {
  fetchGaokaoClassroomSyncProgress,
  type GaokaoClassroomSyncProgress,
} from "@/lib/gaokaoClassroomSync";

const EMPTY: GaokaoClassroomSyncProgress = {
  mastered: 0,
  total: 0,
  percent: 0,
  unitCount: 0,
  unitsCompleted: 0,
};

export function useGaokaoClassroomSync(gradeKey: GaokaoGradeKey) {
  const [progress, setProgress] = useState<GaokaoClassroomSyncProgress>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = fetchGaokaoClassroomSyncProgress(gradeKey);
    setProgress(p);
    setLoading(false);
  }, [gradeKey]);

  return { ...progress, loading };
}
