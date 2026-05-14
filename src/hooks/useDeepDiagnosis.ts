import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosisStats {
  has_enough_data: boolean;
  min_required: number;
  current_attempts: number;
  portrait_30d: {
    total_attempts: number;
    total_time_minutes: number;
    correct_rate: number;
    correct_rate_delta: number;
    mastered_count: number;
    total_kp: number;
    rank_pct: number;
    cohort_size: number;
  };
  error_breakdown: Record<string, { count: number; pct: number; recommendation: string }>;
  error_total_wrong: number;
  weak_kps: Array<{
    kp_id: string;
    skill_area: string | null;
    kp_title: string | null;
    mastery_pct: number;
    exam_frequency: string | null;
    recent_wrong: number;
  }>;
  time_analysis: Array<{
    skill_area: string;
    avg_time: number;
    baseline_time: number;
    delta_seconds: number;
    count: number;
  }>;
  weakness_personality: any[];
  days_to_gaokao: number | null;
}

export interface DiagnosisNarrative {
  has_ai_narrative?: boolean;
  opening_narration: { headline: string; subtitle: string };
  specific_situations: Array<{
    title: string;
    detail: string;
    confidence: number;
    actionable_hint: string;
  }>;
  seven_day_plan: Array<{
    day_range: string;
    task_title: string;
    detail: string;
    est_minutes_per_day: number;
    est_points_gain: string;
  }>;
  ai_error?: number;
}

export type DiagnosisData = DiagnosisStats & { narrative: DiagnosisNarrative | null };

export function useDeepDiagnosis() {
  return useQuery<DiagnosisData | null>({
    queryKey: ["deep-diagnosis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: stats, error: e1 } = await supabase.rpc("get_deep_diagnosis", {
        p_user_id: user.id,
      });
      if (e1) throw e1;
      const s = stats as unknown as DiagnosisStats;

      if (!s?.has_enough_data) {
        return { ...s, narrative: null };
      }

      const { data: narrative, error: e2 } = await supabase.functions.invoke(
        "generate-diagnosis-narrative",
        { body: { stats: s } },
      );
      if (e2) console.error("Narrative generation failed:", e2);

      return { ...s, narrative: (narrative as DiagnosisNarrative) ?? null };
    },
    staleTime: 60 * 60 * 1000,
  });
}