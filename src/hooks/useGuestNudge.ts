import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useT } from "@/i18n/T";

/**
 * Lightweight nudge to invite guest users to sign in.
 * - Skipped if user is already logged in.
 * - Each trigger key shown at most once per browser session.
 */
export function useGuestNudge() {
  const navigate = useNavigate();
  const t = useT();
  const loggedInRef = useRef<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loggedInRef.current = !!session;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      loggedInRef.current = !!session;
    });
    return () => subscription.unsubscribe();
  }, []);

  return useCallback(
    (key: string, message: string, description?: string) => {
      if (loggedInRef.current) return;
      const sk = `nudge:${key}`;
      if (sessionStorage.getItem(sk)) return;
      sessionStorage.setItem(sk, "1");
      toast(message, {
        description:
          description ?? t("登录后可保存学习进度，并在手机、电脑等设备间同步。"),
        duration: 7000,
        action: {
          label: t("立即登录"),
          onClick: () => navigate("/auth"),
        },
      });
    },
    [navigate, t],
  );
}