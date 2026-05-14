import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DashboardSummary = {
  dimensions: Record<string, { score: number; max: number; mastery_pct: number }>;
  kp_stats: { total: number; mastered: number; this_week_new: number };
  attempt_stats: { total_attempts: number; correct_rate: number; last_30d_total: number };
  error_distribution: Record<string, number>;
  days_remaining: Record<string, number>;
  profile: {
    display_name?: string | null;
    target_score?: number | null;
    current_year_band?: number | null;
    gaokao_year?: number | null;
  };
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary | null>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return null;
      const { data, error } = await supabase.rpc("get_user_dashboard_summary", {
        p_user_id: u.user.id,
      });
      if (error) throw error;
      return data as DashboardSummary;
    },
    staleTime: 5 * 60 * 1000,
  });
}