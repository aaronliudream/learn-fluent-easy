/**
 * useActiveCohort — 5-step cohort-locked vocab mastery.
 *
 * Reads / starts / resumes / graduates the user's active gaokao vocab cohort.
 * Backed by the `gaokao_user_active_cohort` table + `start_new_cohort` /
 * `resume_cohort` RPCs. All mutations invalidate the related query keys so
 * `VocabMasteryPath`, today's review, and dormant lists never go stale.
 */
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CohortStatus = "active" | "dormant" | "graduated";

export interface CohortRow {
  id: string;
  user_id: string;
  cohort_word_ids: string[];
  status: CohortStatus;
  sequence_no: number;
  theme_tag: string | null;
  started_at: string;
  last_active_at: string;
  graduated_at: string | null;
  created_at: string;
}

const KEY_ACTIVE = (uid: string | undefined) => ["cohort", "active", uid] as const;
const KEY_LIST = (uid: string | undefined) => ["cohort", "list", uid] as const;

/** Invalidate every query that depends on cohort / mastery / FSRS due state. */
export function useInvalidateCohortRelated() {
  const qc = useQueryClient();
  return useCallback(
    async (uid: string | undefined) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEY_ACTIVE(uid) }),
        qc.invalidateQueries({ queryKey: KEY_LIST(uid) }),
        qc.invalidateQueries({ queryKey: ["mastery", uid] }),
        qc.invalidateQueries({ queryKey: ["fsrs", "due", uid] }),
      ]);
    },
    [qc],
  );
}

async function getUid(): Promise<string | undefined> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export function useActiveCohort() {
  const qc = useQueryClient();
  const invalidate = useInvalidateCohortRelated();

  const activeQuery = useQuery({
    queryKey: ["cohort", "active", "self"],
    queryFn: async (): Promise<CohortRow | null> => {
      const uid = await getUid();
      if (!uid) return null;
      const { data, error } = await supabase
        .from("gaokao_user_active_cohort")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return (data as CohortRow | null) ?? null;
    },
    staleTime: 30_000,
  });

  const dormantList = useQuery({
    queryKey: ["cohort", "list", "self"],
    queryFn: async (): Promise<CohortRow[]> => {
      const uid = await getUid();
      if (!uid) return [];
      const { data, error } = await supabase
        .from("gaokao_user_active_cohort")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "dormant")
        .order("last_active_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CohortRow[];
    },
    staleTime: 60_000,
  });

  const start = useMutation({
    mutationFn: async (opts: { wordIds: string[]; themeTag?: string | null }) => {
      const uid = await getUid();
      if (!uid) throw new Error("not_authenticated");
      const { data, error } = await supabase.rpc("start_new_cohort", {
        p_word_ids: opts.wordIds,
        p_theme_tag: opts.themeTag ?? null,
      });
      if (error) throw error;
      await invalidate(uid);
      // also refresh the keyless variants used above
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] }),
        qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] }),
      ]);
      return data as CohortRow;
    },
  });

  const resume = useMutation({
    mutationFn: async (cohortId: string) => {
      const uid = await getUid();
      if (!uid) throw new Error("not_authenticated");
      const { data, error } = await supabase.rpc("resume_cohort", { p_cohort_id: cohortId });
      if (error) throw error;
      await invalidate(uid);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] }),
        qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] }),
      ]);
      return data as CohortRow;
    },
  });

  const graduate = useMutation({
    mutationFn: async (cohortId: string) => {
      const uid = await getUid();
      if (!uid) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("gaokao_user_active_cohort")
        .update({ status: "graduated", graduated_at: new Date().toISOString() })
        .eq("id", cohortId)
        .eq("user_id", uid);
      if (error) throw error;
      await invalidate(uid);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["cohort", "active", "self"] }),
        qc.invalidateQueries({ queryKey: ["cohort", "list", "self"] }),
      ]);
    },
  });

  return {
    active: activeQuery.data ?? null,
    activeLoading: activeQuery.isLoading,
    dormant: dormantList.data ?? [],
    start,
    resume,
    graduate,
    refetch: activeQuery.refetch,
  };
}