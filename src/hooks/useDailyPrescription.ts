import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PrescriptionTask = {
  type: "learn" | "breakthrough" | "consolidate" | "review";
  kp_id: string;
  kp_title: string;
  skill_area?: string;
  est_minutes: number;
  est_coins: number;
  mastery_before: number;
  mastery_after_estimated: number;
  why_this: string;
};

export type DailyPrescription = {
  id?: string;
  user_id?: string;
  year_band: number;
  prescription_date: string;
  tasks: PrescriptionTask[];
  weak_top3: Array<{ kp_id: string; kp_title: string; mastery?: number; skill_area?: string }>;
  weekly_focus: Array<{ kp_id: string; kp_title: string; skill_area?: string }>;
  guidance?: string;
};

async function invokePrescription(force: boolean): Promise<DailyPrescription | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase.functions.invoke("generate-daily-prescription", {
    body: { force_regenerate: force },
  });
  if (error) throw error;
  return data as DailyPrescription;
}

export function useDailyPrescription() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setHasSession(!!s);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  return useQuery<DailyPrescription | null>({
    queryKey: ["daily-prescription"],
    queryFn: () => invokePrescription(false),
    staleTime: 30 * 60 * 1000,
    enabled: hasSession === true,
    retry: 1,
  });
}

export function useRegeneratePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokePrescription(true),
    onSuccess: (data) => {
      qc.setQueryData(["daily-prescription"], data);
    },
  });
}