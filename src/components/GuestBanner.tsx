import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Yellow warning banner shown at the top of practice pages when the user
 * is not signed in. v7 spec · option B: guests learn freely but their
 * answer attempts are NOT persisted to unified_mastery.
 */
export function GuestBanner({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setSignedIn(!!session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (signedIn !== false) return null;

  return (
    <div
      className={
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40 " +
        className
      }
    >
      <div className="min-w-0 text-sm">
        <div className="font-semibold text-amber-900 dark:text-amber-200">
          ⚠️ 你正在未登录状态学习
        </div>
        <div className="text-xs text-amber-800/80 dark:text-amber-300/80">
          答题进度不会保存,登录后即可同步学习数据
        </div>
      </div>
      <button
        onClick={() => navigate("/auth")}
        className="shrink-0 text-sm font-bold text-amber-700 hover:underline dark:text-amber-300"
      >
        免费注册保存进度 →
      </button>
    </div>
  );
}

export default GuestBanner;