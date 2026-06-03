import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";
import { dbGradesForFilter } from "@/lib/juniorClassroomSync";

/**
 * 课堂同步「节完成」进度 — 口径(Aaron 确认):
 *   总节 = stage_tests(segment='junior', grade) 总数
 *   已完成 = stage_test_attempts(passed=true) 去重 test_id 数
 *   percent = 已完成 / 总节
 *
 * 注意:stage_tests.grade 用的是 1/2/3,而过滤器/词库年级是 7/8/9 —
 * 与 juniorClassroomSync 中 STAGE_GRADE_BY_DB 映射保持一致。
 */
const STAGE_GRADE_BY_DB: Record<number, number> = { 7: 1, 8: 2, 9: 3 };

export type JuniorStageProgress = {
  completed: number;
  total: number;
  percent: number;
  loading: boolean;
};

const EMPTY: JuniorStageProgress = { completed: 0, total: 0, percent: 0, loading: true };

async function fetchJuniorStageProgress(
  gradeKey: JuniorGradeKey,
): Promise<Omit<JuniorStageProgress, "loading">> {
  const stageGrades = dbGradesForFilter(gradeKey).map((g) => STAGE_GRADE_BY_DB[g]);

  const { data: tests } = await supabase
    .from("stage_tests")
    .select("id")
    .eq("segment", "junior")
    .in("grade", stageGrades);
  const ids = (tests ?? []).map((t) => t.id);
  const total = ids.length;
  if (!total) return { completed: 0, total: 0, percent: 0 };

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { completed: 0, total, percent: 0 };

  const { data: passed } = await supabase
    .from("stage_test_attempts")
    .select("test_id")
    .eq("user_id", userId)
    .eq("passed", true)
    .in("test_id", ids);

  const completed = new Set((passed ?? []).map((p) => p.test_id)).size;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

export function useJuniorStageProgress(gradeKey: JuniorGradeKey): JuniorStageProgress {
  const [state, setState] = useState<JuniorStageProgress>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetchJuniorStageProgress(gradeKey)
      .then((p) => {
        if (!cancelled) setState({ ...p, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ completed: 0, total: 0, percent: 0, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [gradeKey]);

  return state;
}
