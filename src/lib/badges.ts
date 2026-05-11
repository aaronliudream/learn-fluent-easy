import { supabase } from "@/integrations/supabase/client";
import { BADGES, type Badge } from "@/data/badges";

export type EarnedBadge = { badge_id: string; earned_at: string };

export async function fetchEarnedBadges(): Promise<EarnedBadge[]> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return [];
  const { data } = await supabase
    .from("primary_badges_earned")
    .select("badge_id, earned_at")
    .eq("user_id", uid)
    .order("earned_at", { ascending: true });
  return (data ?? []) as EarnedBadge[];
}

/** Awards a badge if not yet earned. Returns the Badge if newly granted. */
export async function earnBadge(badgeId: string): Promise<Badge | null> {
  const def = BADGES.find((b) => b.id === badgeId);
  if (!def) return null;
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;
  // Check existing
  const { data: existing } = await supabase
    .from("primary_badges_earned")
    .select("badge_id")
    .eq("user_id", uid)
    .eq("badge_id", badgeId)
    .maybeSingle();
  if (existing) return null;
  const { error } = await supabase
    .from("primary_badges_earned")
    .insert({ user_id: uid, badge_id: badgeId });
  if (error) return null;
  return def;
}