import { useEffect, useState } from "react";
import type { JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";
import {
  fetchJuniorClassroomSyncProgress,
  type ClassroomSyncProgress,
} from "@/lib/juniorClassroomSync";

const EMPTY: ClassroomSyncProgress = {
  mastered: 0,
  total: 0,
  percent: 0,
  breakdown: {
    vocab: { mastered: 0, total: 0 },
    grammar: { mastered: 0, total: 0 },
    reading: { mastered: 0, total: 0 },
    listening: { mastered: 0, total: 0 },
    writing: { mastered: 0, total: 0 },
    stageTests: { mastered: 0, total: 0 },
  },
};

export function useJuniorClassroomSync(gradeKey: JuniorGradeKey, dbPublisher?: string) {
  const [progress, setProgress] = useState<ClassroomSyncProgress>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJuniorClassroomSyncProgress(gradeKey, dbPublisher)
      .then((p) => {
        if (!cancelled) setProgress(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gradeKey, dbPublisher]);

  return { ...progress, loading };
}
