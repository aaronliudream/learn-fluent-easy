import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { claimGuestCardAttempts } from "@/lib/cardGuest";
import { awardCoins } from "@/lib/coins";
import { toast } from "sonner";

/**
 * Listens for SIGNED_IN events. When a user just authenticated, attach any
 * pending guest card-quiz attempts to their account and grant a one-time
 * "claim bonus" so the coins they earned as a guest survive the sign-up.
 *
 * Mounted once at the App root.
 */
export const GuestCardClaimer = () => {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      // Defer to avoid running inside the auth callback synchronously.
      setTimeout(async () => {
        try {
          const claimed = await claimGuestCardAttempts();
          if (claimed > 0) {
            const r = await awardCoins(10, "card_attempts_claim");
            const got = r?.awarded ?? 0;
            toast.success(
              `🎁 已认领 ${claimed} 次答题成绩${got > 0 ? ` · +${got} 金币到账` : ""}`,
              { duration: 4000 },
            );
          }
        } catch (e) {
          console.warn("[GuestCardClaimer] failed", e);
        }
      }, 0);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);
  return null;
};