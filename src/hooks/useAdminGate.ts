import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Returns auth + admin role gate for internal admin pages. */
export function useAdminGate() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        setAuthed(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setAuthed(true);
      setEmail(u.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roles);
      setLoading(false);
    })();
  }, []);

  return { loading, authed, isAdmin, email };
}
