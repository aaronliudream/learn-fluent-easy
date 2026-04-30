import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight hook that exposes the current Supabase auth user
 * (or null for guests). Used for client-side gating like trial limits.
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, ready, isAuthed: !!user };
}

/**
 * Trial gating limit:
 * - Guests: only the very first lesson of a level is open (1).
 * - Signed-in (email-registered) users: first 10 lessons of every level.
 */
export function useUnlockLimit() {
  const { isAuthed } = useAuthUser();
  return isAuthed ? 10 : 1;
}