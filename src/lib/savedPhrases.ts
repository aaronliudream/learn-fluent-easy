import { supabase } from "@/integrations/supabase/client";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

export type SavedPhrase = {
  id: string;
  phrase: string;
  normalized: string;
  context_text: string | null;
  source: string | null;
  created_at: string;
};

/**
 * Add a phrase to the current user's saved list. Throws if not signed in.
 */
export async function addSavedPhrase(args: {
  phrase: string;
  contextText?: string;
  source?: string;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const phrase = args.phrase.trim();
  if (!phrase) return;
  const normalized = normalize(phrase);
  if (!normalized) return;
  const { error } = await supabase.from("saved_phrases").upsert(
    {
      user_id: user.id,
      phrase,
      normalized,
      context_text: args.contextText ?? null,
      source: args.source ?? null,
    },
    { onConflict: "user_id,normalized" },
  );
  if (error) throw error;
}

export async function removeSavedPhrase(normalizedKey: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { error } = await supabase
    .from("saved_phrases")
    .delete()
    .eq("user_id", user.id)
    .eq("normalized", normalizedKey);
  if (error) throw error;
}

export async function listSavedPhrases(): Promise<SavedPhrase[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("saved_phrases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[saved] list error", error);
    return [];
  }
  return (data || []) as SavedPhrase[];
}

export async function isSaved(phrase: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;
  const normalized = normalize(phrase);
  const { data, error } = await supabase
    .from("saved_phrases")
    .select("id")
    .eq("user_id", user.id)
    .eq("normalized", normalized)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export const normalizePhrase = normalize;